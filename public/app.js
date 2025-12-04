// Chat history
let conversationHistory = [];
let userId = generateUserId();
let userEmail = getUserEmail(); // Get stored email or null
let messageCounter = 0;

// Configure markdown renderer (marked.js)
if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // GitHub Flavored Markdown
    headerIds: false, // Disable header IDs for security
    mangle: false // Don't mangle email addresses
  });
}

// Current selection state
let selectedSeries = null;
let selectedBook = null;
let selectedPart = null;
let selectedChapter = null;

// Load available series on page load
async function loadSeries() {
  try {
    const response = await fetch('/api/series');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const seriesList = document.getElementById('toc-series-list');
    
    if (!seriesList) {
      console.error('Series list element not found');
      return;
    }
    
    seriesList.innerHTML = '';
    
    // Check if data has series array
    if (!data || !data.series || !Array.isArray(data.series)) {
      console.error('Invalid response format:', data);
      seriesList.innerHTML = '<li class="toc-loading">No series found</li>';
      return;
    }
    
    // Add series to TOC
    if (data.series.length === 0) {
      seriesList.innerHTML = '<li class="toc-loading">No series available</li>';
      return;
    }
    
    data.series.forEach(series => {
      const li = document.createElement('li');
      li.className = 'toc-series-item';
      
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'toc-series-link';
      link.textContent = series.name;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        selectSeries(series.name, series.books);
      });
      
      li.appendChild(link);
      seriesList.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load series:', error);
    const seriesList = document.getElementById('toc-series-list');
    if (seriesList) {
      seriesList.innerHTML = `<li class="toc-loading">Failed to load series: ${error.message}</li>`;
    }
  }
}

// Select a series and show its books
function selectSeries(seriesName, books) {
  selectedSeries = seriesName;
  selectedBook = null;
  selectedPart = null;
  selectedChapter = null;
  conversationHistory = [];
  
  // Update active state
  document.querySelectorAll('.toc-series-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent === seriesName) {
      link.classList.add('active');
    }
  });
  
  // Show book section
  const seriesSection = document.getElementById('toc-series-section');
  const bookSection = document.getElementById('toc-book-section');
  const partSection = document.getElementById('toc-part-section');
  const chapterSection = document.getElementById('toc-chapter-section');
  
  seriesSection.style.display = 'none';
  bookSection.style.display = 'block';
  partSection.style.display = 'none';
  chapterSection.style.display = 'none';
  
  // Update breadcrumb with back button
  const breadcrumb = document.getElementById('toc-breadcrumb');
  breadcrumb.innerHTML = `
    <button class="toc-back-button" onclick="goBackToSeries()" aria-label="Back to series">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Back to Series</span>
    </button>
  `;
  
  // Populate books
  const bookList = document.getElementById('toc-book-list');
  bookList.innerHTML = '';
  
  books.forEach(book => {
    const li = document.createElement('li');
    li.className = 'toc-book-item';
    
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'toc-book-link';
    link.textContent = book.title;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      selectBook(seriesName, book.slug, book.title);
    });
    
    li.appendChild(link);
    bookList.appendChild(li);
  });
  
  // Close TOC on mobile after selection
  if (window.innerWidth < 1024) {
    closeTOC();
  }
}

// Select a book and load its parts
async function selectBook(seriesName, bookSlug, bookTitle) {
  selectedBook = bookTitle;
  selectedPart = null;
  selectedChapter = null;
  conversationHistory = [];
  
  // Update active state
  document.querySelectorAll('.toc-book-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent === bookTitle) {
      link.classList.add('active');
    }
  });
  
  // Show part section
  const bookSection = document.getElementById('toc-book-section');
  const partSection = document.getElementById('toc-part-section');
  const chapterSection = document.getElementById('toc-chapter-section');
  
  partSection.style.display = 'block';
  chapterSection.style.display = 'none';
  
  // Update breadcrumb with back button
  const breadcrumb = document.getElementById('toc-breadcrumb-part');
  breadcrumb.innerHTML = `
    <button class="toc-back-button" onclick="goBackToBooks()" aria-label="Back to books">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Back to Books</span>
    </button>
  `;
  
  // Load parts
  const partList = document.getElementById('toc-part-list');
  partList.innerHTML = '<li class="toc-loading">Loading parts...</li>';
  
  try {
    const encodedSeries = encodeURIComponent(seriesName);
    const encodedBook = encodeURIComponent(bookSlug);
    const response = await fetch(`/api/series/${encodedSeries}/books/${encodedBook}/parts`);
    const data = await response.json();
    
    partList.innerHTML = '';
    
    if (data.parts && data.parts.length > 0) {
      data.parts.forEach(part => {
        const li = document.createElement('li');
        li.className = 'toc-part-item';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'toc-part-link';
        link.textContent = part.name;
        link.dataset.partType = part.type || 'part';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          selectPart(seriesName, bookSlug, bookTitle, part.slug, part.name, part.type);
        });
        
        li.appendChild(link);
        partList.appendChild(li);
      });
    } else {
      partList.innerHTML = '<li class="toc-loading">No parts found</li>';
    }
  } catch (error) {
    console.error('Failed to load parts:', error);
    partList.innerHTML = '<li class="toc-loading">Failed to load parts</li>';
  }
  
  // Close TOC on mobile after selection
  if (window.innerWidth < 1024) {
    closeTOC();
  }
}

// Select a part and load its chapters
async function selectPart(seriesName, bookSlug, bookTitle, partSlug, partName, partType) {
  selectedPart = partName;
  selectedChapter = null;
  conversationHistory = [];
  
  // Update active state
  document.querySelectorAll('.toc-part-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent === partName) {
      link.classList.add('active');
    }
  });
  
  // Show chapter section
  const partSection = document.getElementById('toc-part-section');
  const chapterSection = document.getElementById('toc-chapter-section');
  
  chapterSection.style.display = 'block';
  
  // Update breadcrumb with back button
  const breadcrumb = document.getElementById('toc-breadcrumb-chapter');
  breadcrumb.innerHTML = `
    <button class="toc-back-button" onclick="goBackToParts()" aria-label="Back to parts">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Back to Parts</span>
    </button>
  `;
  
  // Load chapters
  const chapterList = document.getElementById('toc-chapter-list');
  chapterList.innerHTML = '<li class="toc-loading">Loading chapters...</li>';
  
  try {
    const encodedSeries = encodeURIComponent(seriesName);
    const encodedBook = encodeURIComponent(bookSlug);
    const encodedPart = encodeURIComponent(partSlug);
    const response = await fetch(`/api/series/${encodedSeries}/books/${encodedBook}/parts/${encodedPart}/chapters`);
    const data = await response.json();
    
    chapterList.innerHTML = '';
    
    // Add standalone chapters (Prologue, Interludes, Epilogue)
    if (data.standalone && data.standalone.length > 0) {
      data.standalone.forEach(ch => {
        const li = document.createElement('li');
        li.className = 'toc-chapter-item';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'toc-chapter-link';
        link.textContent = ch.label;
        link.dataset.chapterNumber = ch.number;
        link.dataset.chapterType = ch.type;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          selectChapter(ch.number);
        });
        
        li.appendChild(link);
        chapterList.appendChild(li);
      });
    }
    
    // Add chapter groups (grouped by 10s)
    if (data.chapterGroups && data.chapterGroups.length > 0) {
      data.chapterGroups.forEach(group => {
        const groupLi = createChapterGroup(group);
        chapterList.appendChild(groupLi);
      });
    }
    
    if (chapterList.children.length === 0) {
      chapterList.innerHTML = '<li class="toc-loading">No chapters found</li>';
    }
  } catch (error) {
    console.error('Failed to load chapters:', error);
    chapterList.innerHTML = '<li class="toc-loading">Failed to load chapters</li>';
  }
  
  // Close TOC on mobile after selection
  if (window.innerWidth < 1024) {
    closeTOC();
  }
}

// Legacy function - kept for backwards compatibility but redirects to new structure
async function selectBookLegacy(bookTitle) {
  selectedBook = bookTitle;
  selectedChapter = null;
  conversationHistory = [];
  
  // Update active state
  document.querySelectorAll('.toc-book-link').forEach(link => {
    link.classList.remove('active');
    if (link.textContent === bookTitle) {
      link.classList.add('active');
    }
  });
  
  // Show chapter section
  const chapterSection = document.getElementById('toc-chapter-section');
  const currentBook = document.getElementById('toc-current-book');
  const chapterList = document.getElementById('toc-chapter-list');
  
  chapterSection.style.display = 'block';
  chapterList.innerHTML = '<li class="toc-loading">Loading chapters...</li>';
  
  // Load chapters
  try {
    const encodedTitle = encodeURIComponent(bookTitle);
    const response = await fetch(`/api/books/${encodedTitle}/chapters`);
    const data = await response.json();
    
    // Build breadcrumb: Series > Book (or just Book if no series)
    let breadcrumbText = bookTitle;
    if (data.series) {
      breadcrumbText = `${data.series} > ${bookTitle}`;
    }
    currentBook.textContent = breadcrumbText;
    
    chapterList.innerHTML = '';
    
    // Add standalone chapters (Prologue, Interludes, Epilogue)
    if (data.standalone && data.standalone.length > 0) {
      data.standalone.forEach(ch => {
        const li = document.createElement('li');
        li.className = 'toc-chapter-item';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'toc-chapter-link';
        link.textContent = ch.label;
        link.dataset.chapterNumber = ch.number;
        link.dataset.chapterType = ch.type;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          selectChapter(ch.number);
        });
        
        li.appendChild(link);
        chapterList.appendChild(li);
      });
    }
    
    // Add parts with their chapter groups (new format)
    if (data.parts && data.parts.length > 0) {
      data.parts.forEach(partData => {
        // Create part container
        const partLi = document.createElement('li');
        partLi.className = 'toc-part-group';
        
        // Part header (clickable to expand/collapse) - only show if part exists
        if (partData.part) {
          const partHeader = document.createElement('div');
          partHeader.className = 'toc-part-header';
          partHeader.innerHTML = `
            <span class="toc-part-toggle">▼</span>
            <span class="toc-part-label">${partData.part}</span>
          `;
          
          // Part content (chapter groups)
          const partContent = document.createElement('ul');
          partContent.className = 'toc-part-chapters';
          partContent.style.display = 'none';
          
          // Add chapter groups within this part
          if (partData.chapterGroups && partData.chapterGroups.length > 0) {
            partData.chapterGroups.forEach(group => {
              const groupLi = createChapterGroup(group);
              partContent.appendChild(groupLi);
            });
          }
          
          // Toggle expand/collapse
          partHeader.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = partContent.style.display !== 'none';
            partContent.style.display = isExpanded ? 'none' : 'block';
            const toggle = partHeader.querySelector('.toc-part-toggle');
            toggle.textContent = isExpanded ? '▼' : '▲';
            partHeader.classList.toggle('expanded', !isExpanded);
          });
          
          partLi.appendChild(partHeader);
          partLi.appendChild(partContent);
        } else {
          // No part - add chapter groups directly
          if (partData.chapterGroups && partData.chapterGroups.length > 0) {
            partData.chapterGroups.forEach(group => {
              const groupLi = createChapterGroup(group);
              partLi.appendChild(groupLi);
            });
          }
        }
        
        chapterList.appendChild(partLi);
      });
    }
    // Fallback: handle old format with chapterGroups at root level
    else if (data.chapterGroups && data.chapterGroups.length > 0) {
      data.chapterGroups.forEach(group => {
        const groupLi = createChapterGroup(group);
        chapterList.appendChild(groupLi);
      });
    }
    
    if (chapterList.children.length === 0) {
      chapterList.innerHTML = '<li class="toc-loading">No chapters found</li>';
    }
  } catch (error) {
    console.error('Failed to load chapters:', error);
    chapterList.innerHTML = '<li class="toc-loading">Failed to load chapters</li>';
  }
  
  // Close TOC on mobile after selection
  if (window.innerWidth < 1024) {
    closeTOC();
  }
}

// Helper function to create a chapter group
function createChapterGroup(group) {
  const groupLi = document.createElement('li');
  groupLi.className = 'toc-chapter-group';
  
  // Group header (clickable to expand/collapse)
  const groupHeader = document.createElement('div');
  groupHeader.className = 'toc-group-header';
  groupHeader.innerHTML = `
    <span class="toc-group-label">${group.label}</span>
    <span class="toc-group-toggle">▼</span>
  `;
  
  // Group content (collapsed by default)
  const groupContent = document.createElement('ul');
  groupContent.className = 'toc-group-chapters';
  groupContent.style.display = 'none';
  
  // Add individual chapters to group
  group.chapters.forEach(ch => {
    const chLi = document.createElement('li');
    chLi.className = 'toc-chapter-item';
    
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'toc-chapter-link';
    link.textContent = ch.label;
    link.dataset.chapterNumber = ch.number;
    link.dataset.chapterType = 'chapter';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      selectChapter(ch.number);
    });
    
    chLi.appendChild(link);
    groupContent.appendChild(chLi);
  });
  
  // Toggle expand/collapse
  groupHeader.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = groupContent.style.display !== 'none';
    groupContent.style.display = isExpanded ? 'none' : 'block';
    const toggle = groupHeader.querySelector('.toc-group-toggle');
    toggle.textContent = isExpanded ? '▼' : '▲';
    groupHeader.classList.toggle('expanded', !isExpanded);
  });
  
  groupLi.appendChild(groupHeader);
  groupLi.appendChild(groupContent);
  return groupLi;
}

// Select a chapter
function selectChapter(chapterNumber) {
  selectedChapter = chapterNumber;
  
  // Load existing chat history for this chapter
  if (selectedBook) {
    loadChatHistory(selectedBook, chapterNumber);
  } else {
    conversationHistory = [];
  }
  
  // Update active state for all chapter links
  document.querySelectorAll('.toc-chapter-link').forEach(link => {
    link.classList.remove('active');
    if (parseInt(link.dataset.chapterNumber) === chapterNumber) {
      link.classList.add('active');
      
      // If this chapter is in a collapsed group, expand the group
      const groupContent = link.closest('.toc-group-chapters');
      if (groupContent && groupContent.style.display === 'none') {
        const groupHeader = groupContent.previousElementSibling;
        if (groupHeader && groupHeader.classList.contains('toc-group-header')) {
          groupContent.style.display = 'block';
          const toggle = groupHeader.querySelector('.toc-group-toggle');
          if (toggle) toggle.textContent = '▲';
          groupHeader.classList.add('expanded');
        }
      }
      
      // If this chapter is in a collapsed part, expand the part
      const partContent = link.closest('.toc-part-chapters');
      if (partContent && partContent.style.display === 'none') {
        const partHeader = partContent.previousElementSibling;
        if (partHeader && partHeader.classList.contains('toc-part-header')) {
          partContent.style.display = 'block';
          const toggle = partHeader.querySelector('.toc-part-toggle');
          if (toggle) toggle.textContent = '▲';
          partHeader.classList.add('expanded');
        }
      }
    }
  });
  
  // Close TOC on mobile after selection
  if (window.innerWidth < 1024) {
    closeTOC();
  }
}

// TOC Toggle Functions
function toggleTOC() {
  const sidebar = document.getElementById('toc-sidebar');
  const overlay = document.getElementById('toc-overlay');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function closeTOC() {
  const sidebar = document.getElementById('toc-sidebar');
  const overlay = document.getElementById('toc-overlay');
  
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

// Initialize TOC toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toc-toggle');
  const closeBtn = document.getElementById('toc-close');
  const overlay = document.getElementById('toc-overlay');
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTOC);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTOC);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeTOC);
  }
  
  // Load books
  loadSeries();
  
  // Initialize history UI
  updateHistoryUI();
  
  // Check for email and show modal if needed
  checkEmailAndShowModal();
  
  // History sidebar controls
  const historyToggle = document.getElementById('history-toggle');
  const historyClose = document.getElementById('history-close');
  const historyOverlay = document.getElementById('history-overlay');
  
  if (historyToggle) {
    historyToggle.addEventListener('click', toggleHistory);
  }
  
  if (historyClose) {
    historyClose.addEventListener('click', closeHistory);
  }
  
  if (historyOverlay) {
    historyOverlay.addEventListener('click', closeHistory);
  }
  
  // Desktop: Auto-open sidebar on load
  if (window.innerWidth >= 1024) {
    // Sidebar is visible by default on desktop
  }
});

// Generate a simple user ID for session tracking
function generateUserId() {
  const stored = localStorage.getItem('docent_user_id');
  if (stored) return stored;

  const newId = 'user_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('docent_user_id', newId);
  return newId;
}

// Get stored email address
function getUserEmail() {
  return localStorage.getItem('rowan_user_email') || null;
}

// Save email address
function saveEmail(event) {
  event.preventDefault();
  const emailInput = document.getElementById('email-input');
  const email = emailInput.value.trim();
  
  if (email && email.includes('@')) {
    localStorage.setItem('rowan_user_email', email);
    userEmail = email;
    
    // Hide modal
    const modal = document.getElementById('email-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    console.log('Email saved:', email);
  }
}

// Show email modal if email not set
function checkEmailAndShowModal() {
  if (!userEmail) {
    const modal = document.getElementById('email-modal');
    if (modal) {
      modal.style.display = 'flex';
      const emailInput = document.getElementById('email-input');
      if (emailInput) {
        emailInput.focus();
      }
    }
  }
}

// Make saveEmail global for form submission
window.saveEmail = saveEmail;

// Chat history storage
const CHAT_HISTORY_KEY = 'rowan_chat_history';

// Back button functions for TOC navigation
window.goBackToSeries = function() {
  const seriesSection = document.getElementById('toc-series-section');
  const bookSection = document.getElementById('toc-book-section');
  const partSection = document.getElementById('toc-part-section');
  const chapterSection = document.getElementById('toc-chapter-section');
  
  seriesSection.style.display = 'block';
  bookSection.style.display = 'none';
  partSection.style.display = 'none';
  chapterSection.style.display = 'none';
  
  selectedSeries = null;
  selectedBook = null;
  selectedPart = null;
  selectedChapter = null;
};

window.goBackToBooks = function() {
  if (!selectedSeries) {
    goBackToSeries();
    return;
  }
  
  // Show book section, hide part and chapter sections
  const seriesSection = document.getElementById('toc-series-section');
  const bookSection = document.getElementById('toc-book-section');
  const partSection = document.getElementById('toc-part-section');
  const chapterSection = document.getElementById('toc-chapter-section');
  
  seriesSection.style.display = 'none';
  bookSection.style.display = 'block';
  partSection.style.display = 'none';
  chapterSection.style.display = 'none';
  
  selectedPart = null;
  selectedChapter = null;
};

window.goBackToParts = function() {
  if (!selectedSeries || !selectedBook) {
    goBackToBooks();
    return;
  }
  
  // Show part section, hide chapter section
  const bookSection = document.getElementById('toc-book-section');
  const partSection = document.getElementById('toc-part-section');
  const chapterSection = document.getElementById('toc-chapter-section');
  
  bookSection.style.display = 'none';
  partSection.style.display = 'block';
  chapterSection.style.display = 'none';
  
  selectedChapter = null;
  
  // Reload parts for the selected book
  const bookSlug = selectedBook.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  selectBook(selectedSeries, bookSlug, selectedBook);
};

// Chat History Functions
function saveChatHistory() {
  if (!selectedBook || selectedChapter === null) return;
  
  const historyKey = `${CHAT_HISTORY_KEY}_${selectedBook}_${selectedChapter}`;
  const historyData = {
    book: selectedBook,
    chapter: selectedChapter,
    series: selectedSeries,
    part: selectedPart,
    messages: conversationHistory,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(historyKey, JSON.stringify(historyData));
  
  // Also save to a master list for easy retrieval
  const masterKey = `${CHAT_HISTORY_KEY}_master`;
  let masterList = JSON.parse(localStorage.getItem(masterKey) || '[]');
  
  // Remove existing entry for this book/chapter
  masterList = masterList.filter(item => 
    !(item.book === selectedBook && item.chapter === selectedChapter)
  );
  
  // Add new entry
  masterList.push({
    book: selectedBook,
    chapter: selectedChapter,
    series: selectedSeries,
    part: selectedPart,
    lastUpdated: new Date().toISOString()
  });
  
  // Sort by last updated (newest first)
  masterList.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  
  localStorage.setItem(masterKey, JSON.stringify(masterList));
  updateHistoryUI();
}

function loadChatHistory(book, chapter) {
  const historyKey = `${CHAT_HISTORY_KEY}_${book}_${chapter}`;
  const stored = localStorage.getItem(historyKey);
  
  if (stored) {
    const historyData = JSON.parse(stored);
    conversationHistory = historyData.messages || [];
    
    // Restore chat UI
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      // Clear existing messages
      chatContainer.innerHTML = '';
      
      // Remove welcome message
      const welcome = chatContainer.querySelector('.welcome-message');
      if (welcome) welcome.remove();
      
      // Restore messages
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          addMessage('user', msg.content);
        } else if (msg.role === 'assistant') {
          addMessage('rowan', msg.content, msg.metadata || null);
        }
      });
    }
  } else {
    conversationHistory = [];
  }
}

function updateHistoryUI() {
  const historyContent = document.getElementById('history-content');
  if (!historyContent) return;
  
  const masterKey = `${CHAT_HISTORY_KEY}_master`;
  const masterList = JSON.parse(localStorage.getItem(masterKey) || '[]');
  
  if (masterList.length === 0) {
    historyContent.innerHTML = '<div class="history-empty">No chat history yet. Start a conversation!</div>';
    return;
  }
  
  // Group by book
  const byBook = {};
  masterList.forEach(item => {
    if (!byBook[item.book]) {
      byBook[item.book] = [];
    }
    byBook[item.book].push(item);
  });
  
  let html = '';
  Object.keys(byBook).sort().forEach(book => {
    const items = byBook[book];
    html += `<div class="history-book-group">
      <h3 class="history-book-title">${book}</h3>
      <ul class="history-chapter-list">`;
    
    items.forEach(item => {
      const date = new Date(item.lastUpdated);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      html += `<li class="history-chapter-item">
        <button class="history-chapter-link" onclick="loadHistoryConversation('${item.book.replace(/'/g, "\\'")}', ${item.chapter})">
          <span class="history-chapter-label">Chapter ${item.chapter}</span>
          <span class="history-chapter-date">${dateStr}</span>
        </button>
      </li>`;
    });
    
    html += `</ul></div>`;
  });
  
  historyContent.innerHTML = html;
}

// Make loadHistoryConversation global for onclick handlers
window.loadHistoryConversation = function(book, chapter) {
  // Update selections
  selectedBook = book;
  selectedChapter = chapter;
  
  // Load the history
  loadChatHistory(book, chapter);
  
  // Close history sidebar
  closeHistory();
  
  // Update active chapter in TOC if visible
  document.querySelectorAll('.toc-chapter-link').forEach(link => {
    link.classList.remove('active');
    if (parseInt(link.dataset.chapterNumber) === chapter) {
      link.classList.add('active');
    }
  });
};

// History sidebar toggle functions
function toggleHistory() {
  const sidebar = document.getElementById('history-sidebar');
  const overlay = document.getElementById('history-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }
}

function closeHistory() {
  const sidebar = document.getElementById('history-sidebar');
  const overlay = document.getElementById('history-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }
}

// Add message to chat UI
/**
 * Start a new chat - clears conversation history and shows welcome message
 */
function startNewChat() {
  // Clear conversation history
  conversationHistory = [];
  
  // Clear chat container
  const chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    chatContainer.innerHTML = '';
    
    // Restore welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.innerHTML = `
      <div class="welcome-icon">
        <svg class="rowan-tree" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <!-- Minimal Rowan tree - single trunk with three branches -->
          <g stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Trunk -->
            <path d="M24 42 L24 20"/>
            <!-- Three main branches in Y shape -->
            <path d="M24 20 L16 12"/>
            <path d="M24 20 L32 12"/>
            <path d="M24 20 L24 12"/>
          </g>
          <!-- Three berries at branch tips -->
          <circle cx="16" cy="12" r="2" fill="currentColor"/>
          <circle cx="24" cy="12" r="2" fill="currentColor"/>
          <circle cx="32" cy="12" r="2" fill="currentColor"/>
        </svg>
      </div>
      <h2>Welcome to Rowan</h2>
      <p>I'm your companion for navigating complex fantasy worlds.</p>
      <p>Select your book and chapter from the table of contents, then ask me anything about what you've read so far. I'll help you understand the story without spoiling what's ahead.</p>
    `;
    chatContainer.appendChild(welcomeMessage);
  }
  
  // Clear message input
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.value = '';
  }
  
  console.log('Started new chat');
}

// Make function globally accessible for onclick handler
window.startNewChat = startNewChat;

function addMessage(sender, content, metadata = null) {
  const chatContainer = document.getElementById('chat-container');

  // Remove welcome message on first interaction
  const welcome = chatContainer.querySelector('.welcome-message');
  if (welcome) {
    welcome.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  // Generate unique ID for Rowan messages (for feedback tracking)
  const messageId = sender === 'rowan' ? `msg_${++messageCounter}_${Date.now()}` : null;
  if (messageId) {
    messageDiv.dataset.messageId = messageId;
    messageDiv.dataset.content = content;
    if (metadata) {
      messageDiv.dataset.metadata = JSON.stringify(metadata);
    }
  }

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = sender === 'user' ? 'You' : 'Rowan';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  // Render markdown for Rowan's messages, plain text for user messages
  if (sender === 'rowan' && typeof marked !== 'undefined') {
    // Use marked.js to render markdown to HTML
    messageContent.innerHTML = marked.parse(content);
  } else {
    // For user messages, use plain text for security
    messageContent.textContent = content;
  }

  messageDiv.appendChild(header);
  messageDiv.appendChild(messageContent);

    // Add feedback UI for Rowan messages
    if (sender === 'rowan' && messageId) {
      const feedbackDiv = createFeedbackUI(messageId);
      messageDiv.appendChild(feedbackDiv);
    }

  chatContainer.appendChild(messageDiv);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Create feedback UI for a message
function createFeedbackUI(messageId) {
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-ui';
  feedbackDiv.id = `feedback-${messageId}`;

  feedbackDiv.innerHTML = `
    <div class="feedback-buttons">
      <button class="feedback-btn thumbs-up" onclick="submitQuickFeedback('${messageId}', 5)" title="Helpful!">
        👍
      </button>
      <button class="feedback-btn thumbs-down" onclick="showDetailedFeedback('${messageId}')" title="Not quite right">
        👎
      </button>
    </div>
    <div class="feedback-detailed" id="detailed-${messageId}" style="display: none;">
      <p class="feedback-prompt">Help me improve! (Optional)</p>
      <div class="feedback-survey">
        <label>
          <input type="checkbox" name="warmth" value="warmth"> Rowan felt too formal/cold
        </label>
        <label>
          <input type="checkbox" name="length" value="length"> Response was too long/short
        </label>
        <label>
          <input type="checkbox" name="spoilers" value="spoilers"> Worried about spoilers
        </label>
        <label>
          <input type="checkbox" name="clarity" value="clarity"> Answer wasn't clear
        </label>
      </div>
      <textarea
        class="feedback-text"
        placeholder="Anything else? (optional)"
        rows="2"
      ></textarea>
      <div class="feedback-actions">
        <button onclick="submitDetailedFeedback('${messageId}')" class="btn-submit">Send Feedback</button>
        <button onclick="cancelFeedback('${messageId}')" class="btn-cancel">Cancel</button>
      </div>
    </div>
    <div class="feedback-thanks" id="thanks-${messageId}" style="display: none;">
      Thanks for your feedback! 💜
    </div>
  `;

  return feedbackDiv;
}

// Show loading indicator
function showLoading() {
  const chatContainer = document.getElementById('chat-container');
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.className = 'message rowan';

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = 'Rowan';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';

  loadingDiv.appendChild(header);
  loadingDiv.appendChild(loading);
  chatContainer.appendChild(loadingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove loading indicator
function removeLoading() {
  const loading = document.getElementById('loading-indicator');
  if (loading) loading.remove();
}

// Send message to Rowan
async function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  const message = messageInput.value.trim();

  // Validation
  if (!selectedSeries || !selectedBook || !selectedPart) {
    alert('Please select a series, book, and part from the table of contents first!');
    toggleTOC(); // Open TOC on mobile
    return;
  }

  if (selectedChapter === null || selectedChapter === undefined) {
    alert('Please select a chapter from the table of contents first!');
    toggleTOC(); // Open TOC on mobile
    return;
  }

  if (!message) {
    alert('Please type a question!');
    return;
  }

  // Add user message to UI
  addMessage('user', message);
  messageInput.value = '';

  // Disable input while waiting
  sendButton.disabled = true;
  messageInput.disabled = true;
  showLoading();

  try {
    const response = await fetch('/api/rowan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookTitle: selectedBook,
        chapter: selectedChapter,
        message,
        history: conversationHistory,
        userId,
        userEmail: userEmail || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response');
    }

    const data = await response.json();

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.message, metadata: data.metadata }
    );

    // Save chat history
    saveChatHistory();

    // Remove loading and add Rowan's response with metadata
    removeLoading();
    addMessage('rowan', data.message, data.metadata);

    // Store last question for feedback context
    window.lastQuestion = message;
    window.lastBook = selectedBook;
    window.lastChapter = selectedChapter;

  } catch (error) {
    removeLoading();
    addMessage('rowan', `Sorry, I encountered an error: ${error.message}. Please try again!`);
    console.error('Error:', error);
  } finally {
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// Allow Enter to send (Shift+Enter for new line)
document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

// Feedback functions
async function submitQuickFeedback(messageId, rating) {
  const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
  const answer = messageDiv.dataset.content;
  const metadata = JSON.parse(messageDiv.dataset.metadata || '{}');

  await sendFeedback({
    messageId,
    rating,
    answer,
    promptVersion: metadata.promptVersion
  });

  // Show thanks message
  showThanksMessage(messageId);
}

function showDetailedFeedback(messageId) {
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  const buttonsDiv = document.querySelector(`#feedback-${messageId} .feedback-buttons`);

  buttonsDiv.style.display = 'none';
  detailedDiv.style.display = 'block';
}

async function submitDetailedFeedback(messageId) {
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
  const answer = messageDiv.dataset.content;
  const metadata = JSON.parse(messageDiv.dataset.metadata || '{}');

  // Collect survey responses
  const checkboxes = detailedDiv.querySelectorAll('input[type="checkbox"]:checked');
  const issues = Array.from(checkboxes).map(cb => cb.value);

  const feedbackText = detailedDiv.querySelector('.feedback-text').value;

  let feedbackMessage = '';
  if (issues.length > 0) {
    feedbackMessage = `Issues: ${issues.join(', ')}. `;
  }
  if (feedbackText) {
    feedbackMessage += feedbackText;
  }

  await sendFeedback({
    messageId,
    rating: 2, // Thumbs down = low rating
    feedback: feedbackMessage || 'No specific feedback provided',
    answer,
    promptVersion: metadata.promptVersion
  });

  showThanksMessage(messageId);
}

function cancelFeedback(messageId) {
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  const buttonsDiv = document.querySelector(`#feedback-${messageId} .feedback-buttons`);

  detailedDiv.style.display = 'none';
  buttonsDiv.style.display = 'flex';
}

function showThanksMessage(messageId) {
  const feedbackUI = document.getElementById(`feedback-${messageId}`);
  const thanksDiv = document.getElementById(`thanks-${messageId}`);

  // Hide all other elements
  feedbackUI.querySelector('.feedback-buttons').style.display = 'none';
  const detailedDiv = document.getElementById(`detailed-${messageId}`);
  if (detailedDiv) detailedDiv.style.display = 'none';

  // Show thanks
  thanksDiv.style.display = 'block';
}

async function sendFeedback({ messageId, rating, feedback = '', answer, promptVersion }) {
  try {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        userEmail: userEmail || null,
        bookTitle: window.lastBook || 'unknown',
        chapter: window.lastChapter || 0,
        question: window.lastQuestion || '',
        answer,
        rating,
        feedback,
        promptVersion,
        messageId
      })
    });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
  }
}

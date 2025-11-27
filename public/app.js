// Chat history
let conversationHistory = [];
let userId = generateUserId();

// Generate a simple user ID for session tracking
function generateUserId() {
  const stored = localStorage.getItem('docent_user_id');
  if (stored) return stored;

  const newId = 'user_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('docent_user_id', newId);
  return newId;
}

// Add message to chat UI
function addMessage(sender, content) {
  const chatContainer = document.getElementById('chat-container');

  // Remove welcome message on first interaction
  const welcome = chatContainer.querySelector('.welcome-message');
  if (welcome) {
    welcome.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = sender === 'user' ? 'You' : 'Rowan';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = content;

  messageDiv.appendChild(header);
  messageDiv.appendChild(messageContent);
  chatContainer.appendChild(messageDiv);

  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
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
  const bookSelect = document.getElementById('book-select');
  const chapterInput = document.getElementById('chapter-input');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  const bookTitle = bookSelect.value;
  const chapter = parseInt(chapterInput.value);
  const message = messageInput.value.trim();

  // Validation
  if (!bookTitle) {
    alert('Please select a book first!');
    return;
  }

  if (!chapter || chapter < 1) {
    alert('Please enter a valid chapter number!');
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
        bookTitle,
        chapter,
        message,
        history: conversationHistory,
        userId
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
      { role: 'assistant', content: data.message }
    );

    // Remove loading and add Rowan's response
    removeLoading();
    addMessage('rowan', data.message);

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
document.getElementById('message-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Clear history when book or chapter changes
document.getElementById('book-select').addEventListener('change', () => {
  conversationHistory = [];
});

document.getElementById('chapter-input').addEventListener('change', () => {
  conversationHistory = [];
});

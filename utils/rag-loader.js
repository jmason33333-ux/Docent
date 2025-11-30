const fs = require('fs');
const path = require('path');

/**
 * Determine how many chapters of context are needed based on the user's question
 * @param {string} message - User's question
 * @returns {number} - Number of previous chapters to include
 */
function determineContextNeeded(message) {
  const recapKeywords = [
    'recap', 'remind', 'forgot', 'forget', 'remember', 'refresh',
    'what happened', 'catch up', 'summary', 'summarize',
    'previously', 'earlier', 'before', 'back in'
  ];

  const messageLower = message.toLowerCase();
  const needsExtendedContext = recapKeywords.some(keyword => messageLower.includes(keyword));

  // If asking for recap/summary, load more context; otherwise just current chapter
  return needsExtendedContext ? 3 : 1;
}

/**
 * Load chapter notes for RAG context
 * @param {string} bookTitle - The book title (normalized)
 * @param {number} currentChapter - The chapter the reader is on
 * @param {number} contextWindow - How many previous chapters to include (default: 1)
 * @returns {Object} - { context: string, metadata: { chaptersFound, chaptersMissing, notesAvailable, notesLength } }
 */
function loadChapterContext(bookTitle, currentChapter, contextWindow = 1) {
  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check for Series structure first (e.g., Rhythm of War)
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };
  
  let bookPath = null;
  let isSeriesStructure = false;
  
  // Try Series structure first
  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const seriesBookPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    if (fs.existsSync(seriesBookPath)) {
      bookPath = seriesBookPath;
      isSeriesStructure = true;
    }
  }
  
  // Fallback to legacy structure
  if (!bookPath) {
    bookPath = path.join(__dirname, '..', 'rag', 'books', bookSlug);
    if (!fs.existsSync(bookPath)) {
      console.log(`No notes found for book: ${bookTitle} (${bookSlug})`);
      return { context: '', metadata: { chaptersFound: [], chaptersMissing: [], notesAvailable: false, notesLength: 0, chaptersRequested: [] } };
    }
  }

  const metadata = {
    chaptersFound: [],
    chaptersMissing: [],
    notesAvailable: false,
    notesLength: 0,
    chaptersRequested: []
  };

  // Load the current chapter and a few previous chapters for context
  const chaptersToLoad = [];

  for (let i = Math.max(1, currentChapter - contextWindow); i <= currentChapter; i++) {
    chaptersToLoad.push(i);
  }

  metadata.chaptersRequested = chaptersToLoad;

  let context = '';

  // For Series books, chapters may be in part folders with different naming conventions
  const bookSlugLower = bookSlug.toLowerCase();
  const isRhythmOfWar = bookSlugLower.includes('rhythm-of-war');
  const isDawnshard = bookSlugLower.includes('dawnshard');
  
  for (const chapterNum of chaptersToLoad) {
    let chapterFile = null;
    
    if (isSeriesStructure) {
      if (isRhythmOfWar) {
        // Rhythm of War: Find chapter in part folders (Part X-Name format)
        const PARTS = [
          { number: 1, name: 'Burdens', startChapter: 1, endChapter: 19 },
          { number: 2, name: 'Our Calling', startChapter: 20, endChapter: 43 },
          { number: 3, name: 'Songs of Home', startChapter: 44, endChapter: 72 },
          { number: 4, name: 'A Knowledge', startChapter: 73, endChapter: 97 },
          { number: 5, name: 'Knowing a Home of Songs, Called Our Burden', startChapter: 98, endChapter: 117 }
        ];
        
        const part = PARTS.find(p => chapterNum >= p.startChapter && chapterNum <= p.endChapter);
        if (part) {
          const partDir = path.join(bookPath, 'chapters', `Part ${part.number}-${part.name}`);
          chapterFile = path.join(partDir, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
        }
      } else if (isDawnshard) {
        // Dawnshard: Single Part 1 folder with all chapters
        const partDir = path.join(bookPath, 'chapters', 'Part 1');
        chapterFile = path.join(partDir, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
      } else {
        // Try generic Part X folder structure
        const partDir = path.join(bookPath, 'chapters', 'Part 1');
        const partFile = path.join(partDir, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
        if (fs.existsSync(partFile)) {
          chapterFile = partFile;
        }
      }
    } else {
      // Standard structure: Try chapters/ subdirectory, then root
      const chapterFileNew = path.join(bookPath, 'chapters', `chapter-${String(chapterNum).padStart(2, '0')}.md`);
      const chapterFileOld = path.join(bookPath, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
      
      if (fs.existsSync(chapterFileNew)) {
        chapterFile = chapterFileNew;
      } else if (fs.existsSync(chapterFileOld)) {
        chapterFile = chapterFileOld;
      }
    }

    if (chapterFile && fs.existsSync(chapterFile)) {
      const chapterContent = fs.readFileSync(chapterFile, 'utf-8');
      context += `\n\n--- CHAPTER ${chapterNum} NOTES ---\n${chapterContent}`;
      metadata.chaptersFound.push(chapterNum);
    } else {
      metadata.chaptersMissing.push(chapterNum);
    }
  }
  
  // Load prologue if we're loading chapter 1
  if (chaptersToLoad.includes(1)) {
    const prologuePaths = [
      path.join(bookPath, 'chapters', 'prologue.md'),
      path.join(bookPath, 'prologue.md')
    ];
    
    for (const prologuePath of prologuePaths) {
      if (fs.existsSync(prologuePath)) {
        const prologueContent = fs.readFileSync(prologuePath, 'utf-8');
        context = `--- PROLOGUE NOTES ---\n${prologueContent}` + context;
        metadata.chaptersFound.unshift('Prologue');
        break;
      }
    }
  }

  // Load relevant interludes if they exist
  // Part 1 interludes (I-1, I-2, I-3) come after Part 1, so include them when:
  // - User is on chapter 10+ (after Part 1)
  // - Or when loading extended context (recap questions)
  const shouldIncludeInterludes = currentChapter >= 10 || contextWindow > 1;
  
  if (shouldIncludeInterludes) {
    const interludesDir = path.join(bookPath, 'chapters');
    if (fs.existsSync(interludesDir)) {
      // Look for Part 1 interlude files (interlude-i-1.md, interlude-i-2.md, interlude-i-3.md)
      const interludeFiles = [
        'interlude-i-1.md',
        'interlude-i-2.md',
        'interlude-i-3.md'
      ];

      for (const interludeFile of interludeFiles) {
        const interludePath = path.join(interludesDir, interludeFile);
        if (fs.existsSync(interludePath)) {
          const interludeContent = fs.readFileSync(interludePath, 'utf-8');
          const interludeName = interludeFile.replace('.md', '').replace('interlude-', 'Interlude ').toUpperCase();
          context += `\n\n--- ${interludeName} NOTES ---\n${interludeContent}`;
          metadata.chaptersFound.push(interludeName);
        }
      }
    }
  }

  metadata.notesAvailable = context.length > 0;
  metadata.notesLength = context.length;

  return { context, metadata };
}

/**
 * Normalize book title to directory name
 * "Words of Radiance" -> "words-of-radiance"
 */
function normalizeBookTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Load knowledge snapshot for a given chapter
 * @param {string} bookTitle - The book title (normalized)
 * @param {number} currentChapter - The chapter the reader is on
 * @returns {Object} - { context: string, metadata: { snapshotAvailable, snapshotChapter, snapshotLength } }
 */
function loadKnowledgeSnapshot(bookTitle, currentChapter) {
  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check for Series structure first (e.g., Rhythm of War, Dawnshard)
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };
  
  let snapshotsDir = null;
  
  // Try Series structure first
  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const seriesBookPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    const seriesSnapshotsDir = path.join(seriesBookPath, 'knowledge-snapshots');
    if (fs.existsSync(seriesSnapshotsDir)) {
      snapshotsDir = seriesSnapshotsDir;
    }
  }
  
  // Fallback to legacy structure
  if (!snapshotsDir) {
    const bookPath = path.join(__dirname, '..', 'rag', 'books', bookSlug);
    snapshotsDir = path.join(bookPath, 'knowledge-snapshots');
  }

  const metadata = {
    snapshotAvailable: false,
    snapshotChapter: null,
    snapshotLength: 0
  };

  if (!fs.existsSync(snapshotsDir)) {
    return { context: '', metadata };
  }

  // Find the most recent snapshot that covers up to or before currentChapter
  // Snapshots are named: through-chapter-XX.md
  let bestSnapshot = null;
  let bestChapter = 0;

  try {
    const snapshotFiles = fs.readdirSync(snapshotsDir)
      .filter(file => file.startsWith('through-chapter-') && file.endsWith('.md'))
      .map(file => {
        const match = file.match(/through-chapter-(\d+)\.md/);
        if (match) {
          return {
            file,
            chapter: parseInt(match[1], 10)
          };
        }
        return null;
      })
      .filter(item => item !== null);

    // Find the snapshot that covers the most chapters up to currentChapter
    for (const snapshot of snapshotFiles) {
      if (snapshot.chapter <= currentChapter && snapshot.chapter > bestChapter) {
        bestChapter = snapshot.chapter;
        bestSnapshot = snapshot;
      }
    }

    if (bestSnapshot) {
      const snapshotPath = path.join(snapshotsDir, bestSnapshot.file);
      const snapshotContent = fs.readFileSync(snapshotPath, 'utf-8');
      
      metadata.snapshotAvailable = true;
      metadata.snapshotChapter = bestChapter;
      metadata.snapshotLength = snapshotContent.length;

      return {
        context: snapshotContent,
        metadata
      };
    }
  } catch (error) {
    console.error(`Error loading knowledge snapshot: ${error.message}`);
  }

  return { context: '', metadata };
}

/**
 * Load book summary (spoiler-free overview)
 * @param {string} bookTitle - The book title (normalized)
 * @returns {Object} - { context: string, metadata: { summaryAvailable, summaryLength } }
 */
function loadBookSummary(bookTitle) {
  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check for Series structure first
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };
  
  let summaryPath = null;
  
  // Try Series structure first
  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const seriesBookPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    const seriesSummaryPath = path.join(seriesBookPath, 'book-summary.md');
    if (fs.existsSync(seriesSummaryPath)) {
      summaryPath = seriesSummaryPath;
    }
  }
  
  // Fallback to legacy structure
  if (!summaryPath) {
    const bookPath = path.join(__dirname, '..', 'rag', 'books', bookSlug);
    summaryPath = path.join(bookPath, 'book-summary.md');
  }
  
  const metadata = {
    summaryAvailable: false,
    summaryLength: 0
  };
  
  if (!fs.existsSync(summaryPath)) {
    return { context: '', metadata };
  }
  
  try {
    const summaryContent = fs.readFileSync(summaryPath, 'utf-8');
    metadata.summaryAvailable = true;
    metadata.summaryLength = summaryContent.length;
    
    return {
      context: summaryContent,
      metadata
    };
  } catch (error) {
    console.error(`Error loading book summary: ${error.message}`);
    return { context: '', metadata };
  }
}

/**
 * Determine if snapshot should be used based on query category
 * @param {string} queryCategory - The primary query category
 * @returns {boolean} - Whether snapshot is appropriate for this query type
 */
function shouldUseSnapshot(queryCategory) {
  // Use snapshots for queries that benefit from comprehensive context
  const snapshotCategories = [
    'recap',
    'character',
    'plot',
    'worldbuilding',
    'relationship',
    'theme'
  ];

  return snapshotCategories.includes(queryCategory);
}

/**
 * Determine if book summary should be used based on query and context
 * @param {string} queryCategory - The primary query category
 * @param {number} currentChapter - Current chapter the reader is on
 * @param {number} historyLength - Length of conversation history
 * @returns {boolean} - Whether book summary is appropriate
 */
function shouldUseBookSummary(queryCategory, currentChapter, historyLength) {
  // Use book summary for:
  // 1. First interaction (no history)
  // 2. Early chapters (chapter 1-3) with general/setting questions
  // 3. Questions about book premise, themes, setting
  // 4. "What is this book about?" type questions
  
  const isFirstInteraction = historyLength === 0;
  const isEarlyChapter = currentChapter <= 3;
  const summaryCategories = ['general', 'worldbuilding', 'theme', 'location'];
  
  return isFirstInteraction || 
         (isEarlyChapter && summaryCategories.includes(queryCategory));
}

/**
 * Get list of available series with nested books
 */
function getAvailableSeries() {
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');

  if (!fs.existsSync(seriesPath)) {
    return [];
  }

  const seriesDirs = fs.readdirSync(seriesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const series = [];

  seriesDirs.forEach(seriesName => {
    const seriesDir = path.join(seriesPath, seriesName);
    const booksDir = path.join(seriesDir, 'books');

    if (!fs.existsSync(booksDir)) {
      return;
    }

    const bookDirs = fs.readdirSync(booksDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const books = bookDirs.map(bookSlug => {
      // Convert slug to readable title
      const bookTitle = bookSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        slug: bookSlug,
        title: bookTitle
      };
    });

    if (books.length > 0) {
      series.push({
        name: seriesName,
        books
      });
    }
  });

  return series;
}

/**
 * Get list of available books (legacy - flattens all books from all series)
 */
function getAvailableBooks() {
  const series = getAvailableSeries();
  const allBooks = [];

  series.forEach(s => {
    s.books.forEach(book => {
      allBooks.push(book.title);
    });
  });

  return allBooks;
}

/**
 * Get series for a book
 */
function getSeriesForBook(bookTitle) {
  const bookSlug = normalizeBookTitle(bookTitle);
  
  const seriesMap = {
    // Stormlight Archive
    'words-of-radiance': 'The Stormlight Archive',
    'rhythm-of-war': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'the-rhythm-of-war': 'The Stormlight Archive',
    
    // The Hierarchy
    'the-strength-of-the-few': 'The Hierarchy',
    
    // Wheel of Time
    'the-eye-of-the-world': 'The Wheel of Time',
    'the-great-hunt': 'The Wheel of Time',
    'the-dragon-reborn': 'The Wheel of Time',
    'the-shadow-rising': 'The Wheel of Time',
    'the-fires-of-heaven': 'The Wheel of Time',
    'lord-of-chaos': 'The Wheel of Time',
    'a-crown-of-swords': 'The Wheel of Time',
    'the-path-of-daggers': 'The Wheel of Time',
    'winters-heart': 'The Wheel of Time',
    'crossroads-of-twilight': 'The Wheel of Time',
    'knife-of-dreams': 'The Wheel of Time',
    'the-gathering-storm': 'The Wheel of Time',
    'towers-of-midnight': 'The Wheel of Time',
    'a-memory-of-light': 'The Wheel of Time',
    
    // Lord of the Rings
    'the-fellowship-of-the-ring': 'The Lord of the Rings',
    'the-two-towers': 'The Lord of the Rings',
    'the-return-of-the-king': 'The Lord of the Rings',
    'the-hobbit': 'The Lord of the Rings',
    'the-silmarillion': 'The Lord of the Rings'
  };
  
  return seriesMap[bookSlug] || null;
}

/**
 * Extract Part information from chapter metadata
 */
function extractPartFromChapter(chapterPath) {
  try {
    const content = fs.readFileSync(chapterPath, 'utf-8');
    const partMatch = content.match(/- \*\*Part:\*\* (.+)/);
    if (partMatch) {
      return partMatch[1].trim();
    }
  } catch (error) {
    // If we can't read the file, return null
  }
  return null;
}

module.exports = {
  loadChapterContext,
  loadKnowledgeSnapshot,
  loadBookSummary,
  shouldUseSnapshot,
  shouldUseBookSummary,
  determineContextNeeded,
  normalizeBookTitle,
  getAvailableBooks,
  getAvailableSeries,
  getSeriesForBook,
  extractPartFromChapter
};

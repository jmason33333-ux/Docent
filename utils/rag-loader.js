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
 * @returns {string} - Combined context from relevant chapters
 */
function loadChapterContext(bookTitle, currentChapter, contextWindow = 1) {
  const bookSlug = normalizeBookTitle(bookTitle);
  const bookPath = path.join(__dirname, '..', 'rag', 'books', bookSlug);

  if (!fs.existsSync(bookPath)) {
    console.log(`No notes found for book: ${bookTitle} (${bookSlug})`);
    return '';
  }

  // Load the current chapter and a few previous chapters for context
  const chaptersToLoad = [];

  for (let i = Math.max(1, currentChapter - contextWindow); i <= currentChapter; i++) {
    chaptersToLoad.push(i);
  }

  let context = '';

  for (const chapterNum of chaptersToLoad) {
    const chapterFile = path.join(bookPath, `chapter-${String(chapterNum).padStart(2, '0')}.md`);

    if (fs.existsSync(chapterFile)) {
      const chapterContent = fs.readFileSync(chapterFile, 'utf-8');
      context += `\n\n--- CHAPTER ${chapterNum} NOTES ---\n${chapterContent}`;
    }
  }

  return context;
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
 * Get list of available books
 */
function getAvailableBooks() {
  const booksPath = path.join(__dirname, '..', 'rag', 'books');

  if (!fs.existsSync(booksPath)) {
    return [];
  }

  const bookDirs = fs.readdirSync(booksPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Map directory names back to readable titles
  const bookMap = {
    'words-of-radiance': 'Words of Radiance',
    'rhythm-of-war': 'Rhythm of War',
    'the-strength-of-the-few': 'The Strength of the Few'
  };

  return bookDirs.map(slug => bookMap[slug] || slug);
}

module.exports = {
  loadChapterContext,
  determineContextNeeded,
  normalizeBookTitle,
  getAvailableBooks
};

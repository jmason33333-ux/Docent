require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { chatWithRowan } = require('./utils/openai-client');
const { logConversation, logFeedback, initializeSheets } = require('./utils/logger');
const { getAvailableBooks, getAvailableSeries, normalizeBookTitle, getSeriesForBook, extractPartFromChapter } = require('./utils/rag-loader');
const fs = require('fs');
const { getPromptMetadata } = require('./rowan-prompt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
// On Vercel, __dirname points to the serverless function directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Initialize Google Sheets logging
initializeSheets();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Docent/Rowan API' });
});

// Get available series (with books nested)
app.get('/api/series', (req, res) => {
  try {
    console.log('[API] /api/series - Fetching series...');
    const series = getAvailableSeries();
    console.log('[API] /api/series - Found', series.length, 'series');
    res.json({ series });
  } catch (error) {
    console.error('[API] Error fetching series:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch series',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get available books (legacy endpoint for backwards compatibility)
app.get('/api/books', (req, res) => {
  const books = getAvailableBooks();
  res.json({ books });
});

// Get parts for a book (new structure: Series/books/book/chapters/Part X/)
// Returns ordered list: Prologue, Part 1, Interlude 1, Part 2, Interlude 2, ..., Epilogue
app.get('/api/series/:seriesName/books/:bookSlug/parts', (req, res) => {
  try {
    const { seriesName, bookSlug } = req.params;
    const bookPath = path.join(__dirname, 'rag', 'Series', seriesName, 'books', bookSlug);
    const chaptersDir = path.join(bookPath, 'chapters');
    
    const items = [];
    
    if (fs.existsSync(chaptersDir)) {
      const dirItems = fs.readdirSync(chaptersDir, { withFileTypes: true });
      
      // Check for Prologue
      const prologueFile = path.join(chaptersDir, 'prologue.md');
      if (fs.existsSync(prologueFile)) {
        items.push({
          type: 'prologue',
          name: 'Prologue',
          slug: 'prologue',
          order: 0
        });
      }
      
      // Collect parts and interludes
      const parts = [];
      const interludes = [];
      
      dirItems.forEach(item => {
          if (item.isDirectory()) {
          if (item.name.startsWith('Part ')) {
            // Extract part name (e.g., "Part 1-Burdens" -> "Part 1: Burdens")
            const partName = item.name.replace(/-/g, ': ').replace(/(\d+):/, '$1:');
            const partNum = parseInt(item.name.match(/Part (\d+)/)?.[1] || '999');
            parts.push({
              type: 'part',
              name: partName,
              slug: item.name,
              order: partNum * 2 - 1 // Parts: Part 1 = 1, Part 2 = 3, Part 3 = 5, ...
            });
          } else if (item.name.startsWith('interlude')) {
            // Extract interlude number (e.g., "interlude-1" -> 1)
            const interludeNum = parseInt(item.name.match(/interlude[_-]?(\d+)/i)?.[1] || '0');
            interludes.push({
              type: 'interlude',
              name: `Interlude ${interludeNum}`,
              slug: item.name,
              order: interludeNum * 2 // Interludes: Interlude 1 = 2 (after Part 1), Interlude 2 = 4 (after Part 2), ...
            });
          }
        }
      });
      
      // Sort parts and interludes
      parts.sort((a, b) => a.order - b.order);
      interludes.sort((a, b) => a.order - b.order);
      
      // Merge parts and interludes in order
      const allItems = [...parts, ...interludes];
      allItems.sort((a, b) => a.order - b.order);
      
      items.push(...allItems);
      
      // Check for Epilogue
      const epilogueFile = path.join(chaptersDir, 'epilogue.md');
      if (fs.existsSync(epilogueFile)) {
        items.push({
          type: 'epilogue',
          name: 'Epilogue',
          slug: 'epilogue',
          order: 9999
        });
      }
    }
    
    res.json({ series: seriesName, book: bookSlug, parts: items });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
});

// Get chapters for a part/interlude/prologue/epilogue (new structure)
app.get('/api/series/:seriesName/books/:bookSlug/parts/:partSlug/chapters', (req, res) => {
  try {
    const { seriesName, bookSlug, partSlug } = req.params;
    const chaptersDir = path.join(__dirname, 'rag', 'Series', seriesName, 'books', bookSlug, 'chapters');
    
    const standalone = [];
    const numberedChapters = [];
    
    // Handle Prologue
    if (partSlug === 'prologue') {
      const prologueFile = path.join(chaptersDir, 'prologue.md');
      if (fs.existsSync(prologueFile)) {
        standalone.push({ number: 0, label: 'Prologue', type: 'prologue', file: 'prologue.md' });
      }
    }
    // Handle Epilogue
    else if (partSlug === 'epilogue') {
      const epilogueFile = path.join(chaptersDir, 'epilogue.md');
      if (fs.existsSync(epilogueFile)) {
        standalone.push({ number: 9999, label: 'Epilogue', type: 'epilogue', file: 'epilogue.md' });
      }
    }
    // Handle Interludes (directory structure)
    else if (partSlug.startsWith('interlude')) {
      const interludeDir = path.join(chaptersDir, partSlug);
      if (fs.existsSync(interludeDir) && fs.statSync(interludeDir).isDirectory()) {
        const files = fs.readdirSync(interludeDir);
        files.forEach(file => {
          if (file.match(/^interlude/i) && file.endsWith('.md')) {
            // Extract interlude label from filename
            // Examples: "interlude-i-1.md" -> "I-1", "interlude-i-2.md" -> "I-2"
            // Remove "interlude" prefix (with dash/underscore) and ".md" suffix
            let label = file.replace(/^interlude[_-]+/i, '').replace(/\.md$/, '');
            
            // Convert to uppercase (e.g., "i-1" -> "I-1")
            label = label.toUpperCase();
            
            const num = parseInt(file.match(/\d+/)?.[0] || '0');
            standalone.push({ 
              number: 5000 + num,
              label: `Interlude ${label}`, 
              type: 'interlude', 
              file 
            });
          }
        });
        standalone.sort((a, b) => {
          // Sort by the number in the filename
          const aNum = parseInt(a.file.match(/\d+/)?.[0] || '0');
          const bNum = parseInt(b.file.match(/\d+/)?.[0] || '0');
          return aNum - bNum;
        });
      }
    }
    // Handle Parts (directory with chapters)
    else {
      const partPath = path.join(chaptersDir, partSlug);
      if (fs.existsSync(partPath)) {
        const files = fs.readdirSync(partPath);
        
        files.forEach(file => {
          // Numbered chapters
          const match = file.match(/chapter-(\d+)\.md/);
          if (match) {
            const num = parseInt(match[1], 10);
            numberedChapters.push({ number: num, label: `Chapter ${num}`, type: 'chapter', file });
          }
        });
        
        numberedChapters.sort((a, b) => a.number - b.number);
      }
    }
    
    // Group numbered chapters by 10s
    const chapterGroups = [];
    for (let i = 0; i < numberedChapters.length; i += 10) {
      const group = numberedChapters.slice(i, i + 10);
      const start = group[0].number;
      const end = group[group.length - 1].number;
      chapterGroups.push({
        type: 'group',
        start,
        end,
        label: `Chapters ${start}-${end}`,
        chapters: group.map(ch => ({ number: ch.number, label: ch.label, type: ch.type }))
      });
    }
    
    res.json({ 
      series: seriesName,
      book: bookSlug,
      part: partSlug,
      standalone: standalone.map(ch => ({ number: ch.number, label: ch.label, type: ch.type })),
      chapterGroups
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get chapter count for a book (legacy endpoint - supports both old and new structure)
app.get('/api/books/:bookTitle/chapters', (req, res) => {
  try {
    const { bookTitle } = req.params;
    const bookSlug = normalizeBookTitle(bookTitle);
    
    // Try new structure first
    const seriesPath = path.join(__dirname, 'rag', 'Series');
    let bookPath = null;
    let seriesName = null;
    
    if (fs.existsSync(seriesPath)) {
      const seriesDirs = fs.readdirSync(seriesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const series of seriesDirs) {
        const potentialBookPath = path.join(seriesPath, series, 'books', bookSlug);
        if (fs.existsSync(potentialBookPath)) {
          bookPath = potentialBookPath;
          seriesName = series;
          break;
        }
      }
    }
    
    // Fallback to old structure
    if (!bookPath) {
      bookPath = path.join(__dirname, 'rag', 'books', bookSlug);
    }
    
    const chaptersDir = path.join(bookPath, 'chapters');
    
    const series = getSeriesForBook(bookTitle);
    const standalone = []; // Prologue, Epilogue, Interludes
    const chaptersByPart = {}; // { "Part 1: Burdens": [chapters...], "Part 2: Our Calling": [chapters...] }
    
    if (fs.existsSync(chaptersDir)) {
      const files = fs.readdirSync(chaptersDir);
      
      files.forEach(file => {
        const filePath = path.join(chaptersDir, file);
        
        // Prologue
        if (file === 'prologue.md') {
          standalone.push({ number: 0, label: 'Prologue', type: 'prologue', file, part: null });
        }
        // Epilogue
        else if (file === 'epilogue.md') {
          standalone.push({ number: 9999, label: 'Epilogue', type: 'epilogue', file, part: null });
        }
        // Interludes (e.g., interlude-1.md, interlude-part1.md)
        else if (file.match(/^interlude/i)) {
          const match = file.match(/interlude[_-]?(\d+)/i);
          const num = match ? parseInt(match[1], 10) : 0;
          const label = file.replace(/^interlude[_-]?/i, '').replace(/\.md$/, '');
          // Try to get part from interlude file
          const part = extractPartFromChapter(filePath);
          standalone.push({ 
            number: 5000 + num, // Place between chapters and epilogue
            label: `Interlude ${label.charAt(0).toUpperCase() + label.slice(1)}`, 
            type: 'interlude', 
            file,
            part
          });
        }
        // Numbered chapters
        else {
          const match = file.match(/chapter-(\d+)\.md/);
          if (match) {
            const num = parseInt(match[1], 10);
            const part = extractPartFromChapter(filePath);
            const chapter = { 
              number: num, 
              label: `Chapter ${num}`, 
              type: 'chapter', 
              file,
              part
            };
            
            // Group by part (or "No Part" if no part found)
            const partKey = part || 'No Part';
            if (!chaptersByPart[partKey]) {
              chaptersByPart[partKey] = [];
            }
            chaptersByPart[partKey].push(chapter);
          }
        }
      });
      
      // Sort standalone by number
      standalone.sort((a, b) => a.number - b.number);
      
      // Sort chapters within each part
      Object.keys(chaptersByPart).forEach(partKey => {
        chaptersByPart[partKey].sort((a, b) => a.number - b.number);
      });
    }
    
    // Build parts structure with grouped chapters
    const parts = [];
    
    // Sort parts: "No Part" first, then numbered parts
    const sortedPartKeys = Object.keys(chaptersByPart).sort((a, b) => {
      if (a === 'No Part') return -1;
      if (b === 'No Part') return 1;
      // Extract part number for sorting (e.g., "Part 1: Burdens" -> 1)
      const aNum = parseInt(a.match(/Part (\d+)/)?.[1] || '999');
      const bNum = parseInt(b.match(/Part (\d+)/)?.[1] || '999');
      return aNum - bNum;
    });
    
    sortedPartKeys.forEach(partKey => {
      const chapters = chaptersByPart[partKey];
      
      // Group chapters within this part by 10s
    const chapterGroups = [];
      for (let i = 0; i < chapters.length; i += 10) {
        const group = chapters.slice(i, i + 10);
      const start = group[0].number;
      const end = group[group.length - 1].number;
      chapterGroups.push({
        type: 'group',
        start,
        end,
        label: `Chapters ${start}-${end}`,
          chapters: group.map(ch => ({ number: ch.number, label: ch.label, type: ch.type }))
        });
      }
      
      parts.push({
        part: partKey === 'No Part' ? null : partKey,
        chapterGroups
      });
    });
    
    res.json({ 
      series,
      bookTitle,
      standalone: standalone.map(ch => ({ number: ch.number, label: ch.label, type: ch.type, part: ch.part })),
      parts
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get current prompt metadata
app.get('/api/prompt-info', (req, res) => {
  const metadata = getPromptMetadata();
  res.json(metadata);
});

// Main chat endpoint
app.post('/api/rowan', async (req, res) => {
  try {
    const { bookTitle, chapter, message, history = [], userId = 'anonymous' } = req.body;

    // Validate input
    if (!bookTitle || !chapter || !message) {
      return res.status(400).json({
        error: 'Missing required fields: bookTitle, chapter, and message are required'
      });
    }

    if (typeof chapter !== 'number' || chapter < 0) {
      return res.status(400).json({
        error: 'Chapter must be a non-negative number (0 for prologue)'
      });
    }

    console.log(`[${new Date().toISOString()}] ${userId} asked about ${bookTitle} Ch${chapter}`);

    // Get Rowan's response (now returns object with response + metadata)
    const result = await chatWithRowan({
      bookTitle,
      chapter,
      message,
      history
    });

    // Log the conversation with metadata (async, non-blocking)
    logConversation({
      userId,
      book: bookTitle,
      chapter,
      question: message,
      answer: result.response,
      metadata: result.metadata
    }).catch(err => console.error('Logging error:', err));

    // Return response
    res.json({
      message: result.response,
      book: bookTitle,
      chapter,
      metadata: result.metadata // Include metadata for client-side analytics if needed
    });

  } catch (error) {
    console.error('Error in /api/rowan:', error);
    res.status(500).json({
      error: 'Failed to get response from Rowan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Feedback endpoint - for collecting user feedback on Rowan's responses
app.post('/api/feedback', async (req, res) => {
  try {
    const {
      userId = 'anonymous',
      bookTitle,
      chapter,
      question,
      answer,
      rating,
      feedback,
      promptVersion,
      messageId
    } = req.body;

    console.log(`[FEEDBACK] User ${userId} gave ${rating}/5 for response`);

    // Log feedback (async, non-blocking)
    logFeedback({
      userId,
      bookTitle,
      chapter,
      question,
      answer,
      rating,
      feedback,
      promptVersion,
      messageId
    }).catch(err => console.error('Feedback logging error:', err));

    res.json({ success: true, message: 'Feedback received' });

  } catch (error) {
    console.error('Error in /api/feedback:', error);
    res.status(500).json({
      error: 'Failed to submit feedback'
    });
  }
});

// Serve the frontend (catch-all route - must be last)
// Only serve index.html for non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Skip static file requests (they should be handled by express.static)
  if (req.path.match(/\.(css|js|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌟 Docent server running on http://localhost:${PORT}`);
  console.log(`📚 Rowan is ready to help readers!\n`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { chatWithRowan } = require('./utils/openai-client');
const { logConversation, initializeSheets } = require('./utils/logger');
const { getAvailableBooks } = require('./utils/rag-loader');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Google Sheets logging
initializeSheets();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Docent/Rowan API' });
});

// Get available books
app.get('/api/books', (req, res) => {
  const books = getAvailableBooks();
  res.json({ books });
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

    if (typeof chapter !== 'number' || chapter < 1) {
      return res.status(400).json({
        error: 'Chapter must be a positive number'
      });
    }

    console.log(`[${new Date().toISOString()}] ${userId} asked about ${bookTitle} Ch${chapter}`);

    // Get Rowan's response
    const answer = await chatWithRowan({
      bookTitle,
      chapter,
      message,
      history
    });

    // Log the conversation (async, non-blocking)
    logConversation({
      userId,
      book: bookTitle,
      chapter,
      question: message,
      answer
    }).catch(err => console.error('Logging error:', err));

    // Return response
    res.json({
      message: answer,
      book: bookTitle,
      chapter
    });

  } catch (error) {
    console.error('Error in /api/rowan:', error);
    res.status(500).json({
      error: 'Failed to get response from Rowan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌟 Docent server running on http://localhost:${PORT}`);
  console.log(`📚 Rowan is ready to help readers!\n`);
});

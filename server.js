require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { chatWithRowan } = require('./utils/openai-client');
const { logConversation, logFeedback, initializeSheets } = require('./utils/logger');
const { getAvailableBooks } = require('./utils/rag-loader');
const { getPromptMetadata } = require('./rowan-prompt');

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

    if (typeof chapter !== 'number' || chapter < 1) {
      return res.status(400).json({
        error: 'Chapter must be a positive number'
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

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌟 Docent server running on http://localhost:${PORT}`);
  console.log(`📚 Rowan is ready to help readers!\n`);
});

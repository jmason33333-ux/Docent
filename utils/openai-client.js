const OpenAI = require('openai');
const { ROWAN_SYSTEM_PROMPT } = require('../rowan-prompt');
const { loadChapterContext, determineContextNeeded } = require('./rag-loader');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cost optimization: Limit conversation history to prevent token bloat
const MAX_HISTORY_MESSAGES = 10; // Last 5 exchanges (user + assistant)

/**
 * Chat with Rowan
 * @param {Object} params
 * @param {string} params.bookTitle - The book being read
 * @param {number} params.chapter - Current chapter
 * @param {string} params.message - User's question
 * @param {Array} params.history - Previous conversation history
 * @returns {Promise<string>} - Rowan's response
 */
async function chatWithRowan({ bookTitle, chapter, message, history = [] }) {
  try {
    // Smart context detection: Only load multiple chapters when needed
    const contextWindow = determineContextNeeded(message);
    const chapterContext = loadChapterContext(bookTitle, chapter, contextWindow);

    console.log(`[RAG] Loading ${contextWindow} chapter(s) of context`);

    // Build the system message with context
    const systemMessage = {
      role: 'system',
      content: ROWAN_SYSTEM_PROMPT
    };

    // Add book/chapter context as a system message
    const contextMessage = {
      role: 'system',
      content: `The reader is currently reading "${bookTitle}" and has read up to Chapter ${chapter}.

DO NOT SPOIL ANYTHING BEYOND CHAPTER ${chapter}.

Here are your reference notes for this book up to this point:
${chapterContext || 'No detailed notes available yet - use your general knowledge of the book, but be cautious about spoilers.'}
`
    };

    // Limit conversation history to reduce token usage
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    // Build conversation history
    const messages = [
      systemMessage,
      contextMessage,
      ...recentHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI with cost-optimized model
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 15x cheaper than GPT-4 Turbo, still excellent for this use case
      messages: messages,
      temperature: 0.7,
      max_tokens: 800 // Keep responses concise
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from Rowan');
  }
}

module.exports = { chatWithRowan };

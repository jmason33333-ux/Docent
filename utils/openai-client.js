const OpenAI = require('openai');
const { getRowanPrompt, getPromptMetadata } = require('../rowan-prompt');
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
 * @returns {Promise<{response: string, metadata: object}>} - Rowan's response and metadata
 */
async function chatWithRowan({ bookTitle, chapter, message, history = [] }) {
  try {
    // Smart context detection: Only load multiple chapters when needed
    const contextWindow = determineContextNeeded(message);
    const chapterContext = loadChapterContext(bookTitle, chapter, contextWindow);

    // Smart prompt selection: Use short or full version based on query complexity
    const rowanPrompt = getRowanPrompt(message, history);
    const promptMetadata = getPromptMetadata();

    console.log(`[RAG] Loading ${contextWindow} chapter(s) of context`);
    console.log(`[PROMPT] Using ${rowanPrompt.length < 500 ? 'SHORT' : 'FULL'} prompt (v${promptMetadata.activeVersion})`);

    // Build the system message with context
    const systemMessage = {
      role: 'system',
      content: rowanPrompt
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

    const response = completion.choices[0].message.content;

    // Return response with metadata for logging
    return {
      response,
      metadata: {
        promptVersion: promptMetadata.activeVersion,
        promptType: rowanPrompt.length < 500 ? 'short' : 'full',
        contextWindow: contextWindow,
        tokensUsed: completion.usage?.total_tokens || 0
      }
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from Rowan');
  }
}

module.exports = { chatWithRowan };

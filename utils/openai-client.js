const OpenAI = require('openai');
const { getRowanPrompt, getPromptMetadata } = require('../rowan-prompt');
const { loadChapterContext, loadKnowledgeSnapshot, loadBookSummary, shouldUseSnapshot, shouldUseBookSummary, determineContextNeeded } = require('./rag-loader');
const { categorizeQuery } = require('./query-categorizer');

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
    // Categorize the query
    const queryCategory = categorizeQuery(message);
    
    // Smart context selection: Prioritize book summary for first interactions and early chapters
    let context = '';
    let ragMetadata = {
      notesAvailable: false,
      notesProvided: false,
      notesLength: 0,
      chaptersFound: [],
      chaptersMissing: [],
      chaptersRequested: []
    };
    let contextSource = 'none';
    let snapshotMetadata = {};
    let bookSummaryMetadata = {};

    // Check if book summary should be included (first interaction or early chapter questions)
    const useBookSummary = shouldUseBookSummary(queryCategory.primaryCategory, chapter, history.length);
    
    if (useBookSummary) {
      const { context: summaryContext, metadata: summaryMeta } = loadBookSummary(bookTitle);
      
      if (summaryMeta.summaryAvailable) {
        context = summaryContext;
        ragMetadata = {
          notesAvailable: true,
          notesProvided: true,
          notesLength: summaryMeta.summaryLength,
          chaptersFound: ['book-summary'],
          chaptersMissing: [],
          chaptersRequested: []
        };
        bookSummaryMetadata = summaryMeta;
        contextSource = 'book_summary';
        
        console.log(`[RAG] Using book summary for ${queryCategory.primaryCategory} query (first interaction or early chapter)`);
      }
    }

    // Then add snapshot or chapter notes based on query type
    if (shouldUseSnapshot(queryCategory.primaryCategory)) {
      // Try to load knowledge snapshot first
      const { context: snapshotContext, metadata: snapshotMeta } = loadKnowledgeSnapshot(bookTitle, chapter);
      
      if (snapshotMeta.snapshotAvailable) {
        // Append to book summary if it was loaded, otherwise replace
        if (contextSource === 'book_summary') {
          context += `\n\n--- KNOWLEDGE SNAPSHOT ---\n${snapshotContext}`;
          ragMetadata.chaptersFound.push(`snapshot-${snapshotMeta.snapshotChapter}`);
          ragMetadata.notesLength += snapshotMeta.snapshotLength;
        } else {
        context = snapshotContext;
        ragMetadata = {
          notesAvailable: true,
          notesProvided: true,
          notesLength: snapshotMeta.snapshotLength,
          chaptersFound: [`snapshot-${snapshotMeta.snapshotChapter}`],
          chaptersMissing: [],
          chaptersRequested: []
        };
        }
        snapshotMetadata = snapshotMeta;
        contextSource = contextSource === 'book_summary' ? 'book_summary+snapshot' : 'snapshot';
        
        console.log(`[RAG] Using knowledge snapshot (through Ch ${snapshotMeta.snapshotChapter}) for ${queryCategory.primaryCategory} query`);
      } else {
        // Fallback to individual chapters if snapshot not available
        const contextWindow = determineContextNeeded(message);
        const chapterResult = loadChapterContext(bookTitle, chapter, contextWindow);
        
        if (contextSource === 'book_summary') {
          // Append chapter notes to book summary
          context += chapterResult.context;
          ragMetadata.chaptersFound.push(...chapterResult.metadata.chaptersFound);
          ragMetadata.chaptersMissing.push(...chapterResult.metadata.chaptersMissing);
          ragMetadata.notesLength += chapterResult.metadata.notesLength;
          contextSource = 'book_summary+chapters';
        } else {
        context = chapterResult.context;
          // Merge chapterResult.metadata into ragMetadata to preserve all fields
          ragMetadata = {
            notesAvailable: chapterResult.metadata.notesAvailable || false,
            notesProvided: false, // Will be calculated later
            notesLength: chapterResult.metadata.notesLength || 0,
            chaptersFound: chapterResult.metadata.chaptersFound || [],
            chaptersMissing: chapterResult.metadata.chaptersMissing || [],
            chaptersRequested: chapterResult.metadata.chaptersRequested || []
          };
        contextSource = 'individual_chapters';
        }
        
        console.log(`[RAG] Snapshot not available, loading ${contextWindow} chapter(s) of context`);
      }
    } else {
      // Use individual chapters for specific chapter questions
      const contextWindow = determineContextNeeded(message);
      const chapterResult = loadChapterContext(bookTitle, chapter, contextWindow);
      
      if (contextSource === 'book_summary') {
        // Append chapter notes to book summary
        context += chapterResult.context;
        ragMetadata.chaptersFound.push(...(chapterResult.metadata.chaptersFound || []));
        ragMetadata.chaptersMissing.push(...(chapterResult.metadata.chaptersMissing || []));
        ragMetadata.notesLength += (chapterResult.metadata.notesLength || 0);
        ragMetadata.notesAvailable = ragMetadata.notesAvailable || (chapterResult.metadata.notesAvailable || false);
        contextSource = 'book_summary+chapters';
      } else {
      context = chapterResult.context;
        // Merge chapterResult.metadata into ragMetadata to preserve all fields
        ragMetadata = {
          notesAvailable: chapterResult.metadata.notesAvailable || false,
          notesProvided: false, // Will be calculated later
          notesLength: chapterResult.metadata.notesLength || 0,
          chaptersFound: chapterResult.metadata.chaptersFound || [],
          chaptersMissing: chapterResult.metadata.chaptersMissing || [],
          chaptersRequested: chapterResult.metadata.chaptersRequested || []
        };
      contextSource = 'individual_chapters';
      }
      
      console.log(`[RAG] Loading ${contextWindow} chapter(s) of context for ${queryCategory.primaryCategory} query`);
    }

    // Smart prompt selection: Use short or full version based on query complexity
    const rowanPrompt = getRowanPrompt(message, history);
    const promptMetadata = getPromptMetadata();

    console.log(`[RAG] Context source: ${contextSource}`);
    console.log(`[RAG] Notes available: ${ragMetadata.notesAvailable ? 'YES' : 'NO'} (${ragMetadata.chaptersFound.length} found, ${ragMetadata.chaptersMissing.length} missing)`);
    console.log(`[PROMPT] Using ${rowanPrompt.length < 500 ? 'SHORT' : 'FULL'} prompt (v${promptMetadata.activeVersion})`);

    // Build the system message with context
    const systemMessage = {
      role: 'system',
      content: rowanPrompt
    };

    // Ensure ragMetadata has all required fields with proper defaults
    ragMetadata.notesAvailable = ragMetadata.notesAvailable !== undefined ? ragMetadata.notesAvailable : false;
    ragMetadata.chaptersFound = ragMetadata.chaptersFound || [];
    ragMetadata.chaptersMissing = ragMetadata.chaptersMissing || [];
    ragMetadata.notesLength = ragMetadata.notesLength || 0;

    // Determine if notes were provided
    const notesProvided = ragMetadata.notesAvailable && context.length > 0;
    
    // Update ragMetadata with notesProvided status
    ragMetadata.notesProvided = notesProvided;
    const notesContext = notesProvided 
      ? context 
      : 'No detailed notes available yet - use your general knowledge of the book, but be cautious about spoilers.';

    // Build context description based on what's loaded
    let contextType = '';
    let contextCoverage = '';
    let contextInstructions = '';
    
    if (contextSource === 'book_summary') {
      contextType = 'Book Summary (spoiler-free)';
      contextCoverage = 'general overview, themes, setting, and character introductions';
      contextInstructions = 'This is a spoiler-free book summary - use it for questions about the book\'s premise, themes, setting, and what readers should know before starting. This contains NO plot spoilers and is perfect for first-time readers or questions about the book\'s overall setup.';
    } else if (contextSource === 'book_summary+snapshot') {
      contextType = 'Book Summary + Knowledge Snapshot';
      contextCoverage = `Book overview + snapshot covering Chapters ${snapshotMetadata.snapshotChapter ? `up to Chapter ${snapshotMetadata.snapshotChapter}` : 'up to your current chapter'}`;
      contextInstructions = 'You have both the spoiler-free book summary AND a Knowledge Snapshot. Use the summary for general context, and the snapshot for detailed character arcs, plot threads, world-building, relationships, and themes up to the current chapter.';
    } else if (contextSource === 'book_summary+chapters') {
      contextType = 'Book Summary + Chapter Notes';
      contextCoverage = `Book overview + notes for chapters ${ragMetadata.chaptersFound.filter(c => typeof c === 'number').join(', ')}`;
      contextInstructions = 'You have both the spoiler-free book summary AND detailed chapter notes. Use the summary for general context, and the chapter notes for specific details, plot beats, character appearances, and chapter-specific information.';
    } else if (contextSource === 'snapshot') {
      contextType = 'Knowledge Snapshot';
      contextCoverage = `covering Chapters ${snapshotMetadata.snapshotChapter ? `up to Chapter ${snapshotMetadata.snapshotChapter}` : 'up to your current chapter'}`;
      contextInstructions = 'This is a Knowledge Snapshot - use it for comprehensive answers about characters, plot threads, world-building, relationships, and themes. It contains cumulative information perfect for recap questions and character/plot analysis.';
    } else {
      contextType = 'Chapter Notes';
      contextCoverage = `for chapters ${ragMetadata.chaptersFound.length > 0 ? ragMetadata.chaptersFound.filter(c => typeof c === 'number').join(', ') : chapter}`;
      contextInstructions = 'These are detailed Chapter Notes - use them for specific chapter details, plot beats, character appearances, world-building reveals, and chapter-specific questions.';
    }
    
    const contextMessage = {
      role: 'system',
      content: `The reader is currently reading "${bookTitle}" and has read up to Chapter ${chapter}.

⚠️ CRITICAL: DO NOT SPOIL ANYTHING BEYOND CHAPTER ${chapter}.

📚 REFERENCE MATERIAL PROVIDED:
You are being provided with ${contextType} ${contextCoverage}. This is your PRIMARY source of information - use it extensively and cite it explicitly in your responses.

${contextInstructions}

${notesContext}
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

    // Analyze if notes were likely used in the response
    // This is a heuristic: check if response seems to reference specific details that would come from notes
    const notesLikelyUsed = analyzeNotesUsage(response, context, ragMetadata);

    // Return response with metadata for logging
    return {
      response,
      metadata: {
        promptVersion: promptMetadata.activeVersion,
        promptType: rowanPrompt.length < 500 ? 'short' : 'full',
        contextWindow: contextSource === 'snapshot' ? 'snapshot' : (ragMetadata.chaptersRequested?.length || 1),
        tokensUsed: completion.usage?.total_tokens || 0,
        // Query categorization
        queryCategory: queryCategory.primaryCategory,
        querySubcategory: queryCategory.secondaryCategory,
        queryKeyTerms: queryCategory.keyTerms,
        // RAG tracking - ensure all fields are properly set with explicit boolean values
        notesAvailable: Boolean(ragMetadata.notesAvailable),
        notesProvided: Boolean(notesProvided),
        notesLength: Number(ragMetadata.notesLength) || 0,
        chaptersFound: Array.isArray(ragMetadata.chaptersFound) && ragMetadata.chaptersFound.length > 0 
          ? ragMetadata.chaptersFound.map(c => typeof c === 'number' ? c : String(c)).join(',') 
          : '',
        chaptersMissing: Array.isArray(ragMetadata.chaptersMissing) && ragMetadata.chaptersMissing.length > 0 
          ? ragMetadata.chaptersMissing.map(c => typeof c === 'number' ? c : String(c)).join(',') 
          : '',
        notesLikelyUsed: Boolean(notesLikelyUsed),
        notesRelevance: determineNotesRelevance(notesProvided, notesLikelyUsed, ragMetadata),
        // Snapshot tracking
        contextSource: contextSource || 'none',
        snapshotUsed: Boolean(contextSource && (contextSource.includes('snapshot'))),
        snapshotChapter: snapshotMetadata.snapshotChapter ? String(snapshotMetadata.snapshotChapter) : ''
      }
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from Rowan');
  }
}

/**
 * Analyze if notes were likely used in the response
 * Heuristic: Check if response contains specific details that suggest notes were referenced
 */
function analyzeNotesUsage(response, chapterContext, ragMetadata) {
  if (!ragMetadata.notesAvailable || !chapterContext) {
    return false;
  }

  // If notes are very short, they might not be useful
  if (ragMetadata.notesLength < 200) {
    return false;
  }

  // Extract key terms from notes that wouldn't typically be in general knowledge
  // This is a simple heuristic - could be improved
  const notesLower = chapterContext.toLowerCase();
  const responseLower = response.toLowerCase();
  
  // Check for specific character names, locations, or plot points that appear in notes
  // Look for patterns that suggest the response is drawing from detailed notes
  const hasSpecificDetails = response.length > 100 && 
    (responseLower.includes('chapter') || 
     responseLower.includes('scene') ||
     responseLower.match(/\b(chapter|scene|moment|event)\s+\d+/i));
  
  // If response is very generic/short, notes probably weren't used
  const isGeneric = response.length < 150 || 
    responseLower.match(/^(i|i'm|i don't|sorry|unfortunately)/i);
  
  return hasSpecificDetails && !isGeneric;
}

/**
 * Determine notes relevance status
 */
function determineNotesRelevance(notesProvided, notesLikelyUsed, ragMetadata) {
  if (!notesProvided) {
    return 'no_notes_available';
  }
  
  if (ragMetadata.chaptersMissing.length > 0 && ragMetadata.chaptersFound.length === 0) {
    return 'notes_missing';
  }
  
  if (notesLikelyUsed) {
    return 'notes_used';
  }
  
  // Notes were provided but don't seem to have been used
  // This could mean: notes weren't relevant, or response was generic
  return 'notes_not_relevant';
}

module.exports = { chatWithRowan };

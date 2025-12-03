const OpenAI = require('openai');
const { getRowanPrompt, getPromptMetadata } = require('../rowan-prompt');
const { loadChapterContext, loadKnowledgeSnapshot, loadBookSummary, shouldUseSnapshot, shouldUseBookSummary, determineContextNeeded } = require('./rag-loader');
const { categorizeQuery } = require('./query-categorizer');

// Validate API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  ERROR: OPENAI_API_KEY environment variable is not set!');
  console.error('   Please add it to your Vercel project: Settings → Environment Variables');
  console.error('   Get your key at: https://platform.openai.com/api-keys');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-key' // Will fail with clear error if not set
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
    // Pass queryCategory to ensure character/location questions use FULL prompt
    const rowanPrompt = getRowanPrompt(message, history, queryCategory);
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
      contextInstructions = 'You have both the spoiler-free book summary AND a Knowledge Snapshot.\n\n⚠️ CRITICAL INSTRUCTION: First check if the snapshot contains "Rowan\'s If Asked Notes" sections that address the reader\'s question. If found, use those pre-written Q&As as your FOUNDATION, then expand with additional context from character arcs, plot threads, world-building, relationships, and themes.';
    } else if (contextSource === 'book_summary+chapters') {
      contextType = 'Book Summary + Chapter Notes';
      contextCoverage = `Book overview + notes for chapters ${ragMetadata.chaptersFound.filter(c => typeof c === 'number').join(', ')}`;
      contextInstructions = 'You have both the spoiler-free book summary AND detailed chapter notes.\n\n⚠️ CRITICAL INSTRUCTION: ALWAYS check the chapter notes for "Rowan\'s If Asked Notes" sections FIRST. If you find a pre-written Q&A that matches the reader\'s question, use it as your FOUNDATION and expand from there with context from Key Beats, Characters, Magic/Mechanics, and Themes sections. NEVER contradict the "If Asked" answers.';
    } else if (contextSource === 'snapshot') {
      contextType = 'Knowledge Snapshot';
      contextCoverage = `covering Chapters ${snapshotMetadata.snapshotChapter ? `up to Chapter ${snapshotMetadata.snapshotChapter}` : 'up to your current chapter'}`;
      contextInstructions = 'This is a Knowledge Snapshot containing cumulative information.\n\n⚠️ CRITICAL INSTRUCTION: First check if the snapshot contains "Rowan\'s If Asked Notes" sections that address the reader\'s question. If found, use those pre-written Q&As as your FOUNDATION, then expand with additional context from characters, plot threads, world-building, relationships, and themes. This is perfect for recap questions and character/plot analysis.';
    } else {
      contextType = 'Chapter Notes';
      contextCoverage = `for chapters ${ragMetadata.chaptersFound.length > 0 ? ragMetadata.chaptersFound.filter(c => typeof c === 'number').join(', ') : chapter}`;
      
      const isCharacterOrLocationQuestion = ['character', 'location', 'relationship'].includes(queryCategory.primaryCategory);
      
      if (isCharacterOrLocationQuestion && ragMetadata.chaptersFound.length > 3) {
        contextInstructions = 'These are detailed Chapter Notes covering multiple chapters.\n\n🎯 CRITICAL FOR CHARACTER/LOCATION QUESTIONS: You have context from multiple chapters - use ALL of them to provide comprehensive understanding.\n\n⚠️ PRIORITY: ALWAYS check for "Rowan\'s If Asked Notes" sections FIRST as your FOUNDATION.\n\n💡 DEPTH EXPECTATION: Reference multiple chapters to show the character/location\'s full journey, development, and key moments. Sound conversational and comprehensive.\n\n📋 RESPONSE STRUCTURE (MANDATORY): Use FULL 6-section format for comprehensive answers. MUST end with "Want to Know More?" section.\n\n🎨 TONE: Warm, conversational, like explaining a friend\'s backstory. Avoid clinical language.';
      } else {
        contextInstructions = 'These are detailed Chapter Notes with multiple sections.\n\n⚠️ CRITICAL INSTRUCTION: ALWAYS check for "Rowan\'s If Asked Notes" sections FIRST. These contain pre-written Q&As that should form the FOUNDATION of your answer. Use them verbatim as your starting point, then expand with additional context from:\n- Key Beats (chronological events)\n- Characters in This Chapter (who appears and what they do)\n- Magic/Mechanics (world-building explanations)\n- Themes (deeper meanings)\n- Confusion Points (flagged difficulties)\n\n📋 RESPONSE STRUCTURE (MANDATORY):\n- For SHORT prompts: MUST use 3-section format (Direct Answer + Brief Context + Want to Know More?)\n- For FULL prompts & worldbuilding/magic/lore questions: MUST use 6-section format (Short Version + What You\'ve Seen + How to Think About It + Why It Matters + What\'s Still Unknown + Want to Know More?)\n- "Want to Know More?" is REQUIRED - offer 2-3 specific, actionable options\n\n🎨 TONE: Warm, conversational language. Avoid clinical/academic phrasing. Show empathy.\n\nNEVER contradict the "If Asked" answers - they are authoritative.';
      }
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

    // Create context summary for logging (truncated for Google Sheets)
    const contextSummary = {
      source: contextSource,
      type: contextType,
      coverage: contextCoverage,
      notesLength: ragMetadata.notesLength,
      chaptersFound: ragMetadata.chaptersFound.join(', ') || 'none',
      chaptersMissing: ragMetadata.chaptersMissing.join(', ') || 'none',
      preview: context ? context.substring(0, 1000) + (context.length > 1000 ? '...' : '') : 'no context'
    };

    // Log full context being sent to LLM
    console.log('\n========================================');
    console.log('[CONTEXT] Full context being sent to LLM:');
    console.log('========================================');
    console.log('\n[SYSTEM PROMPT] (length: ' + rowanPrompt.length + ' chars)');
    console.log('Type:', rowanPrompt.length < 500 ? 'SHORT' : 'FULL');
    console.log('Version:', promptMetadata.activeVersion);
    
    console.log('\n[CONTEXT MESSAGE] (length: ' + contextMessage.content.length + ' chars)');
    console.log('Context Source:', contextSource);
    console.log('Context Type:', contextType);
    console.log('Context Coverage:', contextCoverage);
    console.log('Notes Length:', ragMetadata.notesLength, 'chars');
    console.log('Chapters Found:', ragMetadata.chaptersFound.join(', ') || 'none');
    console.log('Chapters Missing:', ragMetadata.chaptersMissing.join(', ') || 'none');
    
    // Show preview of actual context content (first 500 chars and last 200 chars)
    if (context && context.length > 0) {
      const contextPreview = context.length > 700 
        ? context.substring(0, 500) + '\n\n[... ' + (context.length - 700) + ' chars truncated ...]\n\n' + context.substring(context.length - 200)
        : context;
      console.log('\n[CONTEXT CONTENT PREVIEW]');
      console.log('---');
      console.log(contextPreview);
      console.log('---');
    }
    
    console.log('\n[CONVERSATION HISTORY]');
    console.log('History messages:', recentHistory.length);
    if (recentHistory.length > 0) {
      recentHistory.forEach((msg, idx) => {
        console.log(`  [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      });
    }
    
    console.log('\n[USER MESSAGE]');
    console.log(message);
    console.log('\n[ALL MESSAGES COUNT]', messages.length);
    console.log('========================================\n');

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
        snapshotChapter: snapshotMetadata.snapshotChapter ? String(snapshotMetadata.snapshotChapter) : '',
        // Context summary for logging
        contextSummary: JSON.stringify(contextSummary)
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

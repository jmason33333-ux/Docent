const OpenAI = require('openai');
const { getRowanPrompt, getPromptMetadata } = require('../rowan-prompt');
const { loadChapterContext, loadChapterContextByNumbers, loadKnowledgeSnapshot, loadBookSummary, shouldUseSnapshot, shouldUseBookSummary, determineContextNeeded } = require('./rag-loader');
const { categorizeQuery, extractChapterMention } = require('./query-categorizer');
const { determineSmartContext } = require('./character-context-loader');

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

    // Check if query asks about specific chapter(s)
    const chapterMention = extractChapterMention(message);

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

    // PRIORITY 1: If query asks about specific chapter(s), load those directly
    // This takes precedence over snapshot logic for queries like "recap chapter 24"
    if (chapterMention.isSpecificChapterQuery && chapterMention.chapters.length > 0) {
      // Filter to only chapters the user has read (spoiler protection)
      const safeChapters = chapterMention.chapters.filter(ch => ch <= chapter);
      const spoilerChapters = chapterMention.chapters.filter(ch => ch > chapter);

      // Note if user asked about future chapters (for LLM instruction)
      if (spoilerChapters.length > 0) {
        ragMetadata.spoilerChaptersRequested = spoilerChapters;
        console.log(`[RAG] User asked about future chapters (${spoilerChapters.join(', ')}) - will not load these`);
      }

      if (safeChapters.length > 0) {
        const chapterResult = loadChapterContextByNumbers(bookTitle, safeChapters);

        if (chapterResult.metadata.chaptersFound.length > 0) {
          context = chapterResult.context;
          ragMetadata = {
            ...ragMetadata, // Preserve spoilerChaptersRequested
            notesAvailable: true,
            notesProvided: true,
            notesLength: chapterResult.metadata.notesLength,
            chaptersFound: chapterResult.metadata.chaptersFound,
            chaptersMissing: chapterResult.metadata.chaptersMissing,
            chaptersRequested: safeChapters
          };
          contextSource = 'specific_chapters';

          console.log(`[RAG] Specific chapter query detected. Loading chapters: ${safeChapters.join(', ')}`);
          console.log(`[RAG] Chapters found: ${chapterResult.metadata.chaptersFound.join(', ')}`);
        }
      }
    }

    // PRIORITY 2: Book summary for first interactions or early chapters
    // (Only if we haven't already loaded specific chapters)
    if (contextSource === 'none') {
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
    }

    // PRIORITY 3: Snapshot + gap chapters for general queries (character, plot, theme, etc.)
    // (Only if we haven't already loaded specific chapters)
    if (contextSource === 'none' || contextSource === 'book_summary') {
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

        // GAP-FILLING: If snapshot doesn't cover up to current chapter, load gap chapters
        // This ensures users asking about chapters between snapshot and current chapter get relevant notes
        const snapshotChapter = snapshotMeta.snapshotChapter;
        if (snapshotChapter < chapter) {
          // Load chapters from (snapshot + 1) to current chapter
          const gapChapters = [];
          for (let i = snapshotChapter + 1; i <= chapter; i++) {
            gapChapters.push(i);
          }

          if (gapChapters.length > 0) {
            const gapResult = loadChapterContextByNumbers(bookTitle, gapChapters);

            if (gapResult.metadata.chaptersFound.length > 0) {
              context += `\n\n--- CHAPTER NOTES (Chapters ${snapshotChapter + 1}-${chapter}) ---\n${gapResult.context}`;
              ragMetadata.chaptersFound.push(...gapResult.metadata.chaptersFound);
              ragMetadata.chaptersMissing.push(...gapResult.metadata.chaptersMissing);
              ragMetadata.notesLength += gapResult.metadata.notesLength;
              contextSource = contextSource.includes('snapshot') ? contextSource + '+gap_chapters' : 'snapshot+gap_chapters';

              console.log(`[RAG] Gap-filling: Loaded chapters ${gapResult.metadata.chaptersFound.join(', ')} to supplement snapshot`);
            }
          }
        }
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
      // Try smart context loading first for character/location questions
      const isCharacterOrLocationQuestion = ['character', 'location', 'relationship'].includes(queryCategory.primaryCategory);
      let chapterResult;
      
      if (isCharacterOrLocationQuestion) {
        // Use smart context discovery to find relevant chapters
        const smartContext = determineSmartContext(bookTitle, chapter, message, queryCategory.primaryCategory);
        
        if (smartContext.chaptersToLoad && smartContext.chaptersToLoad.length > 0) {
          // Use smart context: load specific chapters found
          chapterResult = loadChapterContextByNumbers(bookTitle, smartContext.chaptersToLoad);
          console.log(`[RAG] Smart context for ${queryCategory.primaryCategory}: ${smartContext.reason}`);
          console.log(`[RAG] Loading chapters: ${smartContext.chaptersToLoad.join(', ')}`);
        } else {
          // Fallback to standard sequential loading
          const contextWindow = determineContextNeeded(message);
          chapterResult = loadChapterContext(bookTitle, chapter, contextWindow);
          console.log(`[RAG] Smart context returned no chapters, using sequential loading (${contextWindow} chapters)`);
        }
      } else {
        // For non-character/location questions, use standard sequential loading
        const contextWindow = determineContextNeeded(message);
        chapterResult = loadChapterContext(bookTitle, chapter, contextWindow);
      }
      
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
      
      console.log(`[RAG] Context loaded for ${queryCategory.primaryCategory} query`);
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
    
    if (contextSource === 'specific_chapters') {
      // User asked about specific chapter(s) - provide direct, focused context
      const requestedChapters = ragMetadata.chaptersFound.filter(c => typeof c === 'number');
      const chapterList = requestedChapters.join(', ');

      if (requestedChapters.length === 1) {
        contextType = 'Chapter Notes';
        contextCoverage = `detailed notes for Chapter ${requestedChapters[0]}`;
        contextInstructions = `You have the COMPLETE notes for Chapter ${requestedChapters[0]}. This includes Quick Summary, Key Beats, Characters, Locations, Themes, and more.\n\n✅ USE THESE NOTES to answer the reader's question directly and thoroughly.\n\nCheck for "Rowan's If Asked Notes" section first - if it addresses their question, use it as your foundation.\n\nBe specific - cite scenes, characters, and events from this chapter.`;
      } else {
        contextType = 'Chapter Notes';
        contextCoverage = `detailed notes for Chapters ${chapterList}`;
        contextInstructions = `You have COMPLETE notes for Chapters ${chapterList}. Each chapter includes Quick Summary, Key Beats, Characters, Locations, Themes, and more.\n\n✅ USE THESE NOTES to answer the reader's question directly and thoroughly.\n\nCheck for "Rowan's If Asked Notes" sections first - if they address the question, use them as your foundation.\n\nBe specific - cite scenes, characters, and events from these chapters.`;
      }

      // Handle case where user asked about future chapters
      if (ragMetadata.spoilerChaptersRequested && ragMetadata.spoilerChaptersRequested.length > 0) {
        contextInstructions += `\n\n⚠️ NOTE: The reader asked about Chapter(s) ${ragMetadata.spoilerChaptersRequested.join(', ')} but they are only on Chapter ${chapter}. Do NOT provide information from those future chapters. You can mention that you'll be happy to discuss them once they reach that point.`;
      }
    } else if (contextSource === 'book_summary') {
      contextType = 'Book Summary (spoiler-free)';
      contextCoverage = 'general overview, themes, setting, and character introductions';
      contextInstructions = 'This is a spoiler-free book summary - use it for questions about the book\'s premise, themes, setting, and what readers should know before starting. This contains NO plot spoilers and is perfect for first-time readers or questions about the book\'s overall setup.';
    } else if (contextSource === 'book_summary+snapshot' || contextSource.startsWith('book_summary+snapshot')) {
      // Handle book_summary+snapshot and book_summary+snapshot+gap_chapters
      const hasGapChapters = contextSource.includes('gap_chapters');
      const gapChapterNumbers = ragMetadata.chaptersFound.filter(c => typeof c === 'number');

      if (hasGapChapters && gapChapterNumbers.length > 0) {
        contextType = 'Book Summary + Knowledge Snapshot + Chapter Notes';
        contextCoverage = `Book overview + snapshot (Chapters 1-${snapshotMetadata.snapshotChapter}) + detailed notes for Chapters ${gapChapterNumbers.join(', ')}`;
      } else {
        contextType = 'Book Summary + Knowledge Snapshot';
        contextCoverage = `Book overview + snapshot covering Chapters ${snapshotMetadata.snapshotChapter ? `up to Chapter ${snapshotMetadata.snapshotChapter}` : 'up to your current chapter'}`;
      }
      contextInstructions = `You have the spoiler-free book summary AND ${hasGapChapters ? 'a Knowledge Snapshot PLUS detailed Chapter Notes' : 'a Knowledge Snapshot'}.\n\n⚠️ CRITICAL INSTRUCTION: You have notes covering UP TO AND INCLUDING Chapter ${chapter}. First check if the notes contain "Rowan's If Asked Notes" sections that address the reader's question. If found, use those pre-written Q&As as your FOUNDATION, then expand with additional context from character arcs, plot threads, world-building, relationships, and themes.`;
    } else if (contextSource === 'book_summary+chapters') {
      contextType = 'Book Summary + Chapter Notes';
      contextCoverage = `Book overview + notes for chapters ${ragMetadata.chaptersFound.filter(c => typeof c === 'number').join(', ')}`;
      contextInstructions = 'You have both the spoiler-free book summary AND detailed chapter notes.\n\n⚠️ CRITICAL INSTRUCTION: ALWAYS check the chapter notes for "Rowan\'s If Asked Notes" sections FIRST. If you find a pre-written Q&A that matches the reader\'s question, use it as your FOUNDATION and expand from there with context from Key Beats, Characters, Magic/Mechanics, and Themes sections. NEVER contradict the "If Asked" answers.';
    } else if (contextSource === 'snapshot' || contextSource.includes('snapshot')) {
      // Handle both pure snapshot and snapshot+gap_chapters scenarios
      const hasGapChapters = contextSource.includes('gap_chapters');
      const gapChapterNumbers = ragMetadata.chaptersFound.filter(c => typeof c === 'number');

      if (hasGapChapters && gapChapterNumbers.length > 0) {
        contextType = 'Knowledge Snapshot + Chapter Notes';
        contextCoverage = `covering Chapters 1-${snapshotMetadata.snapshotChapter} (snapshot) PLUS detailed notes for Chapters ${gapChapterNumbers.join(', ')}`;
      } else {
        contextType = 'Knowledge Snapshot';
        contextCoverage = `covering Chapters ${snapshotMetadata.snapshotChapter ? `up to Chapter ${snapshotMetadata.snapshotChapter}` : 'up to your current chapter'}`;
      }

      const isFullPrompt = rowanPrompt.length > 500;
      if (isFullPrompt) {
        contextInstructions = `This context includes ${hasGapChapters ? 'BOTH a Knowledge Snapshot AND detailed Chapter Notes' : 'a Knowledge Snapshot containing cumulative information'}.\n\n⚠️ CRITICAL INSTRUCTION: You have notes covering UP TO AND INCLUDING Chapter ${chapter}. First check if the notes contain "Rowan's If Asked Notes" sections that address the reader's question. If found, use those pre-written Q&As as your FOUNDATION, then expand with additional context from characters, plot threads, world-building, relationships, and themes.\n\n🎯 RESPONSE STRUCTURE IS MANDATORY - YOU MUST USE THIS EXACT FORMAT:\n\n**1. Short Version** (1-2 sentences - the essential answer immediately)\n**2. What You\'ve Seen** (Cite specific chapters and scenes)\n**3. How to Think About It** (Provide a mental model or analogy)\n**4. Why It Matters** (Connect to story themes and character arcs)\n**5. What\'s Still Unknown** (Acknowledge mysteries without spoiling)\n**6. Want to Know More?** (MUST end with this - offer 2-3 specific, actionable options)\n\n⚠️ YOU MUST USE THESE EXACT SECTION HEADERS with **bold** markdown.`;
      } else {
        contextInstructions = `This context includes ${hasGapChapters ? 'BOTH a Knowledge Snapshot AND detailed Chapter Notes' : 'a Knowledge Snapshot containing cumulative information'}.\n\n⚠️ CRITICAL INSTRUCTION: You have notes covering UP TO AND INCLUDING Chapter ${chapter}. First check if the notes contain "Rowan's If Asked Notes" sections that address the reader's question. If found, use those pre-written Q&As as your FOUNDATION, then expand with additional context from characters, plot threads, world-building, relationships, and themes. This is perfect for recap questions and character/plot analysis.`;
      }

      // Handle case where user asked about future chapters but we fell back to snapshot
      if (ragMetadata.spoilerChaptersRequested && ragMetadata.spoilerChaptersRequested.length > 0) {
        contextInstructions += `\n\n⚠️ IMPORTANT: The reader asked about Chapter(s) ${ragMetadata.spoilerChaptersRequested.join(', ')} but they are only on Chapter ${chapter}. Politely explain that you can't discuss those chapters yet to avoid spoilers, but offer to help with what they've read so far.`;
      }
    } else {
      contextType = 'Chapter Notes';
      contextCoverage = `for chapters ${ragMetadata.chaptersFound.length > 0 ? ragMetadata.chaptersFound.filter(c => typeof c === 'number').join(', ') : chapter}`;
      
      const isCharacterOrLocationQuestion = ['character', 'location', 'relationship'].includes(queryCategory.primaryCategory);
      const isFullPrompt = rowanPrompt.length > 500;
      
      // For FULL prompts, ALWAYS enforce 6-section structure
      if (isFullPrompt) {
        contextInstructions = 'These are detailed Chapter Notes with multiple sections.\n\n⚠️ CRITICAL INSTRUCTION: ALWAYS check for "Rowan\'s If Asked Notes" sections FIRST. These contain pre-written Q&As that should form the FOUNDATION of your answer. Use them verbatim as your starting point, then expand with additional context from:\n- Key Beats (chronological events)\n- Characters in This Chapter (who appears and what they do)\n- Magic/Mechanics (world-building explanations)\n- Themes (deeper meanings)\n- Confusion Points (flagged difficulties)\n\n🎯 RESPONSE STRUCTURE IS MANDATORY - YOU MUST USE THIS EXACT FORMAT:\n\n**1. Short Version** (1-2 sentences - the essential answer immediately)\n**2. What You\'ve Seen** (Cite specific chapters and scenes - "In Chapter X, when..."; Reference multiple chapters if available)\n**3. How to Think About It** (Provide a mental model, analogy, or way to understand this)\n**4. Why It Matters** (Connect to character motivations, plot stakes, or story themes)\n**5. What\'s Still Unknown** (Acknowledge mysteries or unanswered questions without spoiling)\n**6. Want to Know More?** (MUST end with this section - offer 2-3 specific, actionable options like "I can walk through the Chapter X scene where...")\n\n⚠️ YOU MUST USE THESE EXACT SECTION HEADERS with **bold** markdown. Do NOT deviate from this structure.\n\n🎨 TONE: Warm, conversational language. Avoid clinical/academic phrasing. Show empathy.\n\nNEVER contradict the "If Asked" answers - they are authoritative.';
      } else if (isCharacterOrLocationQuestion && ragMetadata.chaptersFound.length > 3) {
        contextInstructions = 'These are detailed Chapter Notes covering multiple chapters.\n\n🎯 CRITICAL FOR CHARACTER/LOCATION QUESTIONS: You have context from multiple chapters - use ALL of them to provide comprehensive understanding.\n\n⚠️ PRIORITY: ALWAYS check for "Rowan\'s If Asked Notes" sections FIRST as your FOUNDATION.\n\n💡 DEPTH EXPECTATION: Reference multiple chapters to show the character/location\'s full journey, development, and key moments. Sound conversational and comprehensive.\n\n📋 RESPONSE STRUCTURE (MANDATORY): Use FULL 6-section format for comprehensive answers. MUST end with "Want to Know More?" section.\n\n🎨 TONE: Warm, conversational, like explaining a friend\'s backstory. Avoid clinical language.';
      } else {
        contextInstructions = 'These are detailed Chapter Notes with multiple sections.\n\n⚠️ CRITICAL INSTRUCTION: ALWAYS check for "Rowan\'s If Asked Notes" sections FIRST. These contain pre-written Q&As that should form the FOUNDATION of your answer. Use them verbatim as your starting point, then expand with additional context from:\n- Key Beats (chronological events)\n- Characters in This Chapter (who appears and what they do)\n- Magic/Mechanics (world-building explanations)\n- Themes (deeper meanings)\n- Confusion Points (flagged difficulties)\n\n📋 RESPONSE STRUCTURE (MANDATORY):\n- For SHORT prompts: MUST use 3-section format (Direct Answer + Brief Context + Want to Know More?)\n- For FULL prompts: MUST use 6-section format (Short Version + What You\'ve Seen + How to Think About It + Why It Matters + What\'s Still Unknown + Want to Know More?)\n- "Want to Know More?" is REQUIRED - offer 2-3 specific, actionable options\n\n🎨 TONE: Warm, conversational language. Avoid clinical/academic phrasing. Show empathy.\n\nNEVER contradict the "If Asked" answers - they are authoritative.';
      }
    }
    
    const contextMessage = {
      role: 'system',
      content: `The reader is currently on Chapter ${chapter} of "${bookTitle}" and has completed reading through Chapter ${chapter} (Chapter ${chapter} is INCLUDED in what they've read).

⚠️ CRITICAL SPOILER RULE: The reader has read Chapters 1 through ${chapter} (inclusive). You CAN freely discuss ANY content from Chapter 1 to Chapter ${chapter}. Do NOT reveal anything from Chapter ${chapter + 1} or later.

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

    // Determine max_tokens based on prompt type
    // FULL prompts need more tokens for structured 6-section responses
    const isFullPrompt = rowanPrompt.length > 500;
    const maxTokens = isFullPrompt ? 1500 : 800; // More tokens for structured responses
    
    // Call OpenAI with cost-optimized model
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 15x cheaper than GPT-4 Turbo, still excellent for this use case
      messages: messages,
      temperature: 0.7,
      max_tokens: maxTokens
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

/**
 * Categorize user queries to understand what types of questions are being asked
 * This helps identify patterns and improve note coverage
 */

/**
 * Categorize a user query
 * @param {string} query - The user's question
 * @returns {Object} - { primaryCategory, secondaryCategory, keywords }
 */
function categorizeQuery(query) {
  const queryLower = query.toLowerCase().trim();
  
  // Primary categories
  const categories = {
    character: {
      keywords: ['who is', 'who are', 'character', 'person', 'who', 'what is', 'tell me about'],
      patterns: [/^who\s+(is|are|was|were)/i, /character/i, /person/i]
    },
    plot: {
      keywords: ['what happened', 'what did', 'what was', 'happen', 'event', 'scene', 'plot'],
      patterns: [/what\s+happened/i, /what\s+did/i, /plot/i, /event/i, /scene/i]
    },
    recap: {
      keywords: ['recap', 'remind', 'forgot', 'forget', 'remember', 'refresh', 'summary', 'summarize', 'catch up'],
      patterns: [/recap/i, /remind/i, /forgot/i, /summary/i, /catch\s+up/i]
    },
    worldbuilding: {
      keywords: ['what is', 'how does', 'explain', 'world', 'magic', 'system', 'mechanic', 'how', 'why', 'meaning'],
      patterns: [/what\s+is\s+(the|a|an)/i, /how\s+does/i, /explain/i, /magic/i, /system/i, /mechanic/i]
    },
    relationship: {
      keywords: ['relationship', 'between', 'and', 'with', 'together', 'interaction'],
      patterns: [/relationship/i, /between/i, /\s+and\s+/i, /interaction/i]
    },
    location: {
      keywords: ['where', 'location', 'place', 'setting'],
      patterns: [/where/i, /location/i, /place/i, /setting/i]
    },
    theme: {
      keywords: ['theme', 'meaning', 'symbolism', 'significance', 'represent', 'symbol'],
      patterns: [/theme/i, /meaning/i, /symbol/i, /significance/i]
    },
    clarification: {
      keywords: ['confused', 'confusing', 'understand', 'unclear', 'unclear', 'don\'t get', 'doesn\'t make sense'],
      patterns: [/confus/i, /don'?t\s+understand/i, /unclear/i, /doesn'?t\s+make\s+sense/i]
    },
    comparison: {
      keywords: ['compare', 'difference', 'different', 'similar', 'same', 'versus', 'vs'],
      patterns: [/compare/i, /difference/i, /different/i, /similar/i, /versus|vs/i]
    },
    foreshadowing: {
      keywords: ['foreshadow', 'hint', 'clue', 'setup', 'payoff', 'important', 'matter'],
      patterns: [/foreshadow/i, /hint/i, /clue/i, /setup/i, /payoff/i]
    }
  };

  // Score each category
  const scores = {};
  
  for (const [category, data] of Object.entries(categories)) {
    let score = 0;
    
    // Check keywords
    for (const keyword of data.keywords) {
      if (queryLower.includes(keyword)) {
        score += 2;
      }
    }
    
    // Check patterns
    for (const pattern of data.patterns) {
      if (pattern.test(query)) {
        score += 3;
      }
    }
    
    scores[category] = score;
  }

  // Find primary category (highest score)
  const primaryCategory = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );

  // If no category scored, default to 'general'
  const finalPrimary = scores[primaryCategory] > 0 ? primaryCategory : 'general';

  // Find secondary category (second highest score, if significant)
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([cat, score]) => cat !== finalPrimary && score > 0);
  
  const secondaryCategory = sortedScores.length > 0 && sortedScores[0][1] >= 2 
    ? sortedScores[0][0] 
    : 'none';

  // Extract key terms
  const keyTerms = extractKeyTerms(query);

  return {
    primaryCategory: finalPrimary,
    secondaryCategory: secondaryCategory,
    confidence: scores[finalPrimary] > 0 ? 'high' : 'low',
    keyTerms: keyTerms.join(', ')
  };
}

/**
 * Extract key terms from query (character names, concepts, etc.)
 */
function extractKeyTerms(query) {
  // Common fantasy terms and character name patterns
  const terms = [];
  const words = query.split(/\s+/);
  
  // Look for capitalized words (likely character names or places)
  const capitalized = words.filter(w => 
    w.length > 2 && 
    w[0] === w[0].toUpperCase() && 
    /^[A-Z]/.test(w) &&
    !['The', 'What', 'Who', 'Where', 'How', 'Why', 'When', 'This', 'That'].includes(w)
  );
  
  terms.push(...capitalized);
  
  // Look for quoted terms
  const quoted = query.match(/"([^"]+)"/g);
  if (quoted) {
    terms.push(...quoted.map(q => q.replace(/"/g, '')));
  }
  
  return [...new Set(terms)].slice(0, 5); // Max 5 terms
}

/**
 * Get category description for display
 */
function getCategoryDescription(category) {
  const descriptions = {
    character: 'Questions about characters',
    plot: 'Questions about plot events',
    recap: 'Requests for summaries/reminders',
    worldbuilding: 'Questions about world/magic/systems',
    relationship: 'Questions about relationships',
    location: 'Questions about places',
    theme: 'Questions about themes/symbolism',
    clarification: 'Confusion/clarification requests',
    comparison: 'Comparison questions',
    foreshadowing: 'Questions about hints/foreshadowing',
    general: 'General questions'
  };
  
  return descriptions[category] || category;
}

module.exports = {
  categorizeQuery,
  getCategoryDescription
};



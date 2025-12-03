const fs = require('fs');
const path = require('path');
const { normalizeBookTitle } = require('./rag-loader');
const { 
  findCharacterChaptersFromIndex, 
  findLocationChaptersFromIndex,
  findFirstAppearance,
  findChaptersTogether
} = require('./chapter-index');

/**
 * Extract character/location names from a query
 * @param {string} query - User's question
 * @returns {Object} - { characters: [], locations: [], events: [] }
 */
function extractEntitiesFromQuery(query) {
  const queryLower = query.toLowerCase();
  const entities = {
    characters: [],
    locations: [],
    events: []
  };

  // Common character names in The Way of Kings
  const characterPatterns = [
    /shallan/gi,
    /kaladin/gi,
    /dalinar/gi,
    /adolin/gi,
    /jasnah/gi,
    /szeth/gi,
    /syl/gi,
    /sadeas/gi,
    /tien/gi,
    /lirin/gi,
    /teft/gi,
    /rock/gi,
    /moash/gi
  ];

  // Extract character names
  characterPatterns.forEach(pattern => {
    const match = query.match(pattern);
    if (match) {
      const name = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
      if (!entities.characters.includes(name)) {
        entities.characters.push(name);
      }
    }
  });

  // Extract locations (common patterns)
  const locationPatterns = [
    /kharbranth/gi,
    /shattered\s+plains/gi,
    /alethkar/gi,
    /kholinar/gi,
    /palanaeum/gi
  ];

  locationPatterns.forEach(pattern => {
    const match = query.match(pattern);
    if (match) {
      const location = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
      if (!entities.locations.includes(location)) {
        entities.locations.push(location);
      }
    }
  });

  // Detect event keywords
  if (queryLower.includes('first meet') || queryLower.includes('first met')) {
    entities.events.push('first_meeting');
  }
  if (queryLower.includes('what happened to') || queryLower.includes('happened to')) {
    entities.events.push('character_event');
  }

  return entities;
}

/**
 * Find chapters where a character appears (using chapter index)
 * PHASE 3: Uses index for fast lookups instead of file searching
 * @param {string} bookTitle - Book title
 * @param {string} characterName - Character name to search for
 * @param {number} currentChapter - Current chapter (don't search beyond)
 * @returns {number[]} - Array of chapter numbers where character appears
 */
function findCharacterChapters(bookTitle, characterName, currentChapter) {
  // Use chapter index for fast lookup
  return findCharacterChaptersFromIndex(bookTitle, characterName, currentChapter);
}

/**
 * Smart context loading for character/location questions
 * Finds and loads relevant chapters, not just sequential ones
 * @param {string} bookTitle - Book title
 * @param {number} currentChapter - Current chapter
 * @param {string} query - User's question
 * @param {string} queryCategory - Query category (character/location/etc.)
 * @returns {Object} - { chaptersToLoad: number[], reason: string }
 */
function determineSmartContext(bookTitle, currentChapter, query, queryCategory) {
  const entities = extractEntitiesFromQuery(query);
  let chaptersToLoad = [];
  let reason = '';

  // For character questions
  if (queryCategory === 'character' && entities.characters.length > 0) {
    const character = entities.characters[0]; // Use first character found
    
    // Check for "first" questions
    const isFirstQuestion = query.toLowerCase().includes('first');
    
    if (isFirstQuestion) {
      // Find all chapters where character appears
      const allChapters = findCharacterChapters(bookTitle, character, currentChapter);
      
      if (allChapters.length > 0) {
        // PHASE 3: Use index to find first appearance
        const firstChapter = findFirstAppearance(bookTitle, character) || Math.min(...allChapters);
        chaptersToLoad.push(firstChapter);
        
        // Add a few early chapters for context
        const earlyChapters = allChapters.filter(ch => ch <= 10 && ch !== firstChapter).slice(0, 2);
        chaptersToLoad.push(...earlyChapters);
        
        // Add recent chapters (last 3)
        for (let i = Math.max(1, currentChapter - 2); i <= currentChapter; i++) {
          if (!chaptersToLoad.includes(i)) {
            chaptersToLoad.push(i);
          }
        }
        
        reason = `Found character "${character}" in chapters: ${allChapters.join(', ')}. Loading first appearance (Ch ${firstChapter}) + early context + recent chapters.`;
      } else {
        // Fallback: Load early chapters (1-5) + current
        chaptersToLoad = [1, 2, 3, 4, 5, currentChapter].filter(ch => ch <= currentChapter);
        reason = `Character not found in chapter search. Loading early chapters (1-5) + current chapter.`;
      }
    } else {
      // Regular character question - find all chapters + recent
      const allChapters = findCharacterChapters(bookTitle, character, currentChapter);
      
      if (allChapters.length > 0) {
        // PHASE 3: Use index to find first appearance
        const firstChapter = findFirstAppearance(bookTitle, character) || Math.min(...allChapters);
        chaptersToLoad.push(firstChapter);
        
        // Load middle chapters (around chapter 5-10 if in range)
        if (currentChapter >= 10) {
          const middleChapters = allChapters.filter(ch => ch >= 5 && ch <= 10 && ch !== firstChapter).slice(0, 2);
          chaptersToLoad.push(...middleChapters);
        }
        
        // Always load recent chapters
        for (let i = Math.max(1, currentChapter - 2); i <= currentChapter; i++) {
          if (!chaptersToLoad.includes(i)) {
            chaptersToLoad.push(i);
          }
        }
        
        reason = `Found character "${character}" in chapters: ${allChapters.join(', ')}. Loading first appearance (Ch ${firstChapter}) + key chapters + recent chapters.`;
      } else {
        // Fallback: Load extended range
        chaptersToLoad = [];
        for (let i = Math.max(1, currentChapter - 9); i <= currentChapter; i++) {
          chaptersToLoad.push(i);
        }
        reason = `Character not found. Loading extended context (last 10 chapters).`;
      }
    }
    
    // Sort chapters
    chaptersToLoad = [...new Set(chaptersToLoad)].sort((a, b) => a - b);
    return { chaptersToLoad, reason };
  }

  // For "where does X first meet Y" questions
  if (entities.events.includes('first_meeting') && entities.characters.length >= 2) {
    const char1 = entities.characters[0];
    const char2 = entities.characters[1];
    
    // PHASE 3: Use index to find chapters where both appear together
    const bothAppear = findChaptersTogether(bookTitle, char1, char2, currentChapter);
    
    if (bothAppear.length > 0) {
      // Load the first chapter where both appear + surrounding context
      const firstTogetherChapter = Math.min(...bothAppear);
      chaptersToLoad.push(firstTogetherChapter);
      
      // Add a couple chapters before and after for context
      if (firstTogetherChapter > 1) chaptersToLoad.push(firstTogetherChapter - 1);
      if (firstTogetherChapter < currentChapter) chaptersToLoad.push(firstTogetherChapter + 1);
      
      // Add recent chapters
      for (let i = Math.max(1, currentChapter - 2); i <= currentChapter; i++) {
        if (!chaptersToLoad.includes(i)) {
          chaptersToLoad.push(i);
        }
      }
      
      reason = `Found "${char1}" and "${char2}" together in chapters: ${bothAppear.join(', ')}. Loading first meeting (Ch ${firstTogetherChapter}) + context.`;
      chaptersToLoad = [...new Set(chaptersToLoad)].sort((a, b) => a - b);
      return { chaptersToLoad, reason };
    } else {
      // Characters might meet but not both have POV - search early chapters
      chaptersToLoad = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(ch => ch <= currentChapter);
      reason = `Characters not found together. Loading early chapters (1-10) to find first meeting.`;
      return { chaptersToLoad, reason };
    }
  }

  // For location questions with "first" or "where"
  if (queryCategory === 'location') {
    const isFirstQuestion = query.toLowerCase().includes('first');
    
    if (isFirstQuestion && entities.locations.length > 0) {
      const location = entities.locations[0];
      
      // PHASE 3: Use index to find first appearance
      const firstChapter = findFirstAppearance(bookTitle, location);
      const locationChapters = findLocationChaptersFromIndex(bookTitle, location, currentChapter);
      
      if (firstChapter) {
        chaptersToLoad.push(firstChapter);
        
        // Add a few early context chapters
        const earlyChapters = locationChapters.filter(ch => ch <= 10 && ch !== firstChapter).slice(0, 2);
        chaptersToLoad.push(...earlyChapters);
        
        // Add recent chapters
        for (let i = Math.max(1, currentChapter - 2); i <= currentChapter; i++) {
          if (!chaptersToLoad.includes(i)) {
            chaptersToLoad.push(i);
          }
        }
        
        reason = `Found location "${location}" first appears in Ch ${firstChapter}. Loading first appearance + context + recent chapters.`;
      } else {
        // Fallback: Load early chapters
        for (let i = 1; i <= Math.min(10, currentChapter); i++) {
          chaptersToLoad.push(i);
        }
        reason = `Location "${location}" not found in index. Loading early chapters (1-10) to find first mention.`;
      }
      
      chaptersToLoad = [...new Set(chaptersToLoad)].sort((a, b) => a - b);
      return { chaptersToLoad, reason };
    }
    
    // Regular location question - use index if available
    if (entities.locations.length > 0) {
      const location = entities.locations[0];
      const locationChapters = findLocationChaptersFromIndex(bookTitle, location, currentChapter);
      
      if (locationChapters.length > 0) {
        const firstCh = Math.min(...locationChapters);
        chaptersToLoad.push(firstCh);
        
        // Add key chapters + recent
        if (currentChapter >= 10) {
          const middleChapters = locationChapters.filter(ch => ch >= 5 && ch <= 10 && ch !== firstCh).slice(0, 2);
          chaptersToLoad.push(...middleChapters);
        }
        
        for (let i = Math.max(1, currentChapter - 2); i <= currentChapter; i++) {
          if (!chaptersToLoad.includes(i)) {
            chaptersToLoad.push(i);
          }
        }
        
        reason = `Found location "${location}" in chapters: ${locationChapters.join(', ')}. Loading key chapters + recent.`;
        chaptersToLoad = [...new Set(chaptersToLoad)].sort((a, b) => a - b);
        return { chaptersToLoad, reason };
      }
    }
    
    // Fallback: Extended context
    chaptersToLoad = [];
    for (let i = Math.max(1, currentChapter - 9); i <= currentChapter; i++) {
      chaptersToLoad.push(i);
    }
    reason = `Location question. Loading extended context (last 10 chapters).`;
    return { chaptersToLoad, reason };
  }

  // Default: return empty (use standard context loading)
  return { chaptersToLoad: [], reason: 'Using standard context loading' };
}

module.exports = {
  extractEntitiesFromQuery,
  findCharacterChapters,
  determineSmartContext
};


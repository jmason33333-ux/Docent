const fs = require('fs');
const path = require('path');

/**
 * Normalize book title to slug format (e.g., "The Way of Kings" -> "the-way-of-kings")
 * Inlined here to avoid circular dependency with rag-loader.js
 */
function normalizeBookTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Chapter Index - Fast lookup of character/location appearances
 * 
 * Index Structure:
 * {
 *   "book-slug": {
 *     "characters": {
 *       "CharacterName": [chapterNumbers], // e.g., "Shallan": [3, 5, 7, 8, ...]
 *       "Kaladin": [1, 2, 4, ...]
 *     },
 *     "locations": {
 *       "LocationName": [chapterNumbers],
 *     },
 *     "pov": {
 *       "CharacterName": [chapterNumbers], // Chapters where character is POV
 *     },
 *     "firstAppearance": {
 *       "CharacterName": chapterNumber,
 *       "LocationName": chapterNumber
 *     },
 *     "relationships": {
 *       "Character1-Character2": [chapterNumbers] // Chapters where both appear
 *     }
 *   }
 * }
 */

const INDEX_FILE = path.join(__dirname, '..', 'rag', 'chapter-index.json');

/**
 * Auto-detect part structure from file system (universal for all books)
 * @param {string} bookPath - Path to book directory
 * @returns {Array} - Array of { partDir, startChapter, endChapter, name }
 */
function detectPartStructure(bookPath) {
  const chaptersDir = path.join(bookPath, 'chapters');
  if (!fs.existsSync(chaptersDir)) {
    return [];
  }

  const parts = [];
  const dirItems = fs.readdirSync(chaptersDir, { withFileTypes: true })
    .filter(item => item.isDirectory() && item.name.startsWith('Part'));

  dirItems.forEach(dir => {
    const partDir = path.join(chaptersDir, dir.name);
    const files = fs.readdirSync(partDir).filter(f => f.match(/^chapter-\d+\.md$/));
    
    if (files.length > 0) {
      const chapterNums = files.map(f => parseInt(f.match(/chapter-(\d+)\.md/)[1])).sort((a, b) => a - b);
      parts.push({
        partDir: dir.name,
        name: dir.name,
        startChapter: Math.min(...chapterNums),
        endChapter: Math.max(...chapterNums),
        chapters: chapterNums
      });
    }
  });

  // Also check for chapters directly in chaptersDir (no part folders)
  const rootFiles = fs.readdirSync(chaptersDir).filter(f => f.match(/^chapter-\d+\.md$/));
  if (rootFiles.length > 0 && parts.length === 0) {
    const chapterNums = rootFiles.map(f => parseInt(f.match(/chapter-(\d+)\.md/)[1])).sort((a, b) => a - b);
    parts.push({
      partDir: '.',
      name: 'All Chapters',
      startChapter: Math.min(...chapterNums),
      endChapter: Math.max(...chapterNums),
      chapters: chapterNums
    });
  }

  return parts.sort((a, b) => a.startChapter - b.startChapter);
}

/**
 * Find chapter file path (universal - works for all books)
 * @param {string} bookPath - Path to book directory
 * @param {number} chapterNum - Chapter number
 * @returns {string|null} - Full path to chapter file, or null if not found
 */
function findChapterFile(bookPath, chapterNum) {
  const chaptersDir = path.join(bookPath, 'chapters');
  
  // Try part folders first
  const parts = detectPartStructure(bookPath);
  for (const part of parts) {
    if (chapterNum >= part.startChapter && chapterNum <= part.endChapter) {
      const filePath = path.join(chaptersDir, part.partDir, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
  }
  
  // Fallback: try directly in chaptersDir
  const directPath = path.join(chaptersDir, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  
  return null;
}

/**
 * Parse chapter note to extract metadata
 * @param {string} content - Chapter note content
 * @param {number} chapterNum - Chapter number
 * @returns {Object} - { pov, majorCharacters, locations, relationships }
 */
function parseChapterMetadata(content, chapterNum) {
  const metadata = {
    pov: [],
    majorCharacters: [],
    locations: [],
    relationships: [],
    firstAppearance: {}
  };

  const contentLower = content.toLowerCase();

  // Extract POV characters
  const povMatch = content.match(/- \*\*POV Character\(s\):\*\* (.+)/i);
  if (povMatch) {
    const povList = povMatch[1].split(',').map(c => c.trim());
    metadata.pov = povList;
  }

  // Extract locations
  const locationMatch = content.match(/- \*\*Location\(s\):\*\* (.+)/i);
  if (locationMatch) {
    const locationList = locationMatch[1].split(',').map(l => l.trim());
    metadata.locations = locationList;
  }

  // Extract major characters from "Characters in This Chapter" section
  // Find section more precisely by looking for the header and then the next ## header (not ###)
  const charactersMatch = content.match(/## Characters in This Chapter[\s\S]*?(?=\n## [^#]|$)/i);
  if (charactersMatch) {
    const charContent = charactersMatch[0];
    
    // Find all character entries (POV, Appear, Mentioned)
    // Pattern matches: - **CharacterName** (with optional suffix like "(POV)" or "(mentioned)")
    const charMatches = charContent.matchAll(/- \*\*([^\*]+?)\*\*/g);
    for (const match of charMatches) {
      let charName = match[1].trim();
      
      // Skip section headers/subheaders like "POV Character(s)", "Characters Who Appear", "Characters Mentioned Only"
      const lowerName = charName.toLowerCase();
      if (lowerName.includes('pov character') || 
          lowerName.includes('characters who appear') || 
          lowerName.includes('characters mentioned only') ||
          lowerName.match(/^(character|characters|faction|factions|group|groups|location|locations)$/i)) {
        continue;
      }
      
      // Remove parenthetical markers like "(POV)", "(mentioned)" but keep the name
      charName = charName.replace(/\s*\([^)]*\)\s*$/, '').trim();
      
      // Skip if empty, too short, or generic term
      if (charName && 
          charName.length > 1 && 
          !metadata.majorCharacters.includes(charName) &&
          !charName.match(/^(POV|mentioned)$/i)) {
        metadata.majorCharacters.push(charName);
      }
    }
  }

  // Extract relationships (characters that appear together)
  if (metadata.majorCharacters.length >= 2) {
    // All pairs of characters in this chapter
    for (let i = 0; i < metadata.majorCharacters.length; i++) {
      for (let j = i + 1; j < metadata.majorCharacters.length; j++) {
        const relKey = `${metadata.majorCharacters[i]}-${metadata.majorCharacters[j]}`;
        metadata.relationships.push(relKey);
      }
    }
  }

  return metadata;
}

/**
 * Build chapter index for a book
 * @param {string} bookTitle - Book title
 * @returns {Object} - Index data for this book
 */
function buildBookIndex(bookTitle) {
  const bookSlug = normalizeBookTitle(bookTitle);
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  
  // Find book path (check Series structure first)
  let bookPath = null;
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };

  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const potentialPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    if (fs.existsSync(potentialPath)) {
      bookPath = potentialPath;
    }
  }

  if (!bookPath) {
    bookPath = path.join(__dirname, '..', 'rag', 'books', bookSlug);
    if (!fs.existsSync(bookPath)) {
      console.log(`[INDEX] Book not found: ${bookTitle} (${bookSlug})`);
      return null;
    }
  }

  const index = {
    characters: {},
    locations: {},
    pov: {},
    firstAppearance: {},
    relationships: {}
  };

  const parts = detectPartStructure(bookPath);
  let allChapterNums = [];

  // Collect all chapter numbers
  parts.forEach(part => {
    allChapterNums.push(...part.chapters);
  });

  // If no parts, try to find chapters directly
  if (allChapterNums.length === 0) {
    const chaptersDir = path.join(bookPath, 'chapters');
    if (fs.existsSync(chaptersDir)) {
      const files = fs.readdirSync(chaptersDir).filter(f => f.match(/^chapter-\d+\.md$/));
      allChapterNums = files.map(f => parseInt(f.match(/chapter-(\d+)\.md/)[1]));
    }
  }

  allChapterNums.sort((a, b) => a - b);

  console.log(`[INDEX] Building index for ${bookTitle}: ${allChapterNums.length} chapters`);

  // Parse each chapter
  for (const chapterNum of allChapterNums) {
    const chapterFile = findChapterFile(bookPath, chapterNum);
    if (!chapterFile || !fs.existsSync(chapterFile)) {
      continue;
    }

    try {
      const content = fs.readFileSync(chapterFile, 'utf-8');
      const metadata = parseChapterMetadata(content, chapterNum);

      // Index POV characters
      metadata.pov.forEach(char => {
        if (!index.pov[char]) index.pov[char] = [];
        index.pov[char].push(chapterNum);
      });

      // Index major characters
      metadata.majorCharacters.forEach(char => {
        if (!index.characters[char]) index.characters[char] = [];
        if (!index.characters[char].includes(chapterNum)) {
          index.characters[char].push(chapterNum);
        }
      });

      // Index locations
      metadata.locations.forEach(loc => {
        if (!index.locations[loc]) index.locations[loc] = [];
        if (!index.locations[loc].includes(chapterNum)) {
          index.locations[loc].push(chapterNum);
        }
      });

      // Track first appearances
      metadata.pov.forEach(char => {
        if (!index.firstAppearance[char]) {
          index.firstAppearance[char] = chapterNum;
        }
      });
      metadata.locations.forEach(loc => {
        if (!index.firstAppearance[loc]) {
          index.firstAppearance[loc] = chapterNum;
        }
      });

      // Index relationships
      metadata.relationships.forEach(rel => {
        if (!index.relationships[rel]) index.relationships[rel] = [];
        if (!index.relationships[rel].includes(chapterNum)) {
          index.relationships[rel].push(chapterNum);
        }
      });

    } catch (error) {
      console.error(`[INDEX] Error parsing chapter ${chapterNum}: ${error.message}`);
    }
  }

  // Sort all chapter arrays
  Object.keys(index.characters).forEach(char => {
    index.characters[char].sort((a, b) => a - b);
  });
  Object.keys(index.locations).forEach(loc => {
    index.locations[loc].sort((a, b) => a - b);
  });
  Object.keys(index.pov).forEach(char => {
    index.pov[char].sort((a, b) => a - b);
  });
  Object.keys(index.relationships).forEach(rel => {
    index.relationships[rel].sort((a, b) => a - b);
  });

  console.log(`[INDEX] Built index: ${Object.keys(index.characters).length} characters, ${Object.keys(index.locations).length} locations`);

  return index;
}

/**
 * Load chapter index (builds if doesn't exist)
 * @returns {Object} - Full index { "book-slug": { ... } }
 */
function loadChapterIndex() {
  if (fs.existsSync(INDEX_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    } catch (error) {
      console.error(`[INDEX] Error loading index: ${error.message}`);
    }
  }

  return {};
}

/**
 * Save chapter index to disk
 * @param {Object} fullIndex - Full index object
 */
function saveChapterIndex(fullIndex) {
  try {
    const indexDir = path.dirname(INDEX_FILE);
    if (!fs.existsSync(indexDir)) {
      fs.mkdirSync(indexDir, { recursive: true });
    }
    fs.writeFileSync(INDEX_FILE, JSON.stringify(fullIndex, null, 2));
    console.log(`[INDEX] Saved index to ${INDEX_FILE}`);
  } catch (error) {
    console.error(`[INDEX] Error saving index: ${error.message}`);
  }
}

/**
 * Build and save index for a book
 * @param {string} bookTitle - Book title
 */
function buildAndSaveIndex(bookTitle) {
  const fullIndex = loadChapterIndex();
  const bookSlug = normalizeBookTitle(bookTitle);
  
  const bookIndex = buildBookIndex(bookTitle);
  if (bookIndex) {
    fullIndex[bookSlug] = bookIndex;
    saveChapterIndex(fullIndex);
  }
}

/**
 * Find chapters where a character appears (using index)
 * @param {string} bookTitle - Book title
 * @param {string} characterName - Character name
 * @param {number} currentChapter - Current chapter (filter results)
 * @returns {number[]} - Array of chapter numbers
 */
function findCharacterChaptersFromIndex(bookTitle, characterName, currentChapter) {
  const fullIndex = loadChapterIndex();
  const bookSlug = normalizeBookTitle(bookTitle);
  
  if (!fullIndex[bookSlug]) {
    // Index doesn't exist - build it
    console.log(`[INDEX] Index not found for ${bookTitle}, building...`);
    buildAndSaveIndex(bookTitle);
    return findCharacterChaptersFromIndex(bookTitle, characterName, currentChapter);
  }

  const bookIndex = fullIndex[bookSlug];
  const characterNameLower = characterName.toLowerCase();
  
  // Try exact match first
  let chapters = bookIndex.characters[characterName] || 
                 bookIndex.pov[characterName] ||
                 [];

  // Try case-insensitive match
  if (chapters.length === 0) {
    const charKey = Object.keys(bookIndex.characters).find(
      c => c.toLowerCase() === characterNameLower
    );
    if (charKey) {
      chapters = bookIndex.characters[charKey];
    }
  }

  // Try POV match (case-insensitive)
  if (chapters.length === 0) {
    const povKey = Object.keys(bookIndex.pov).find(
      c => c.toLowerCase() === characterNameLower
    );
    if (povKey) {
      chapters = bookIndex.pov[povKey];
    }
  }

  // Filter by current chapter
  return chapters.filter(ch => ch <= currentChapter);
}

/**
 * Find chapters where a location appears (using index)
 * @param {string} bookTitle - Book title
 * @param {string} locationName - Location name
 * @param {number} currentChapter - Current chapter (filter results)
 * @returns {number[]} - Array of chapter numbers
 */
function findLocationChaptersFromIndex(bookTitle, locationName, currentChapter) {
  const fullIndex = loadChapterIndex();
  const bookSlug = normalizeBookTitle(bookTitle);
  
  if (!fullIndex[bookSlug]) {
    buildAndSaveIndex(bookTitle);
    return findLocationChaptersFromIndex(bookTitle, locationName, currentChapter);
  }

  const bookIndex = fullIndex[bookSlug];
  const locationNameLower = locationName.toLowerCase();
  
  // Try exact match
  let chapters = bookIndex.locations[locationName] || [];

  // Try case-insensitive match
  if (chapters.length === 0) {
    const locKey = Object.keys(bookIndex.locations).find(
      l => l.toLowerCase() === locationNameLower
    );
    if (locKey) {
      chapters = bookIndex.locations[locKey];
    }
  }

  return chapters.filter(ch => ch <= currentChapter);
}

/**
 * Find first appearance of character/location
 * @param {string} bookTitle - Book title
 * @param {string} entityName - Character or location name
 * @returns {number|null} - First appearance chapter, or null
 */
function findFirstAppearance(bookTitle, entityName) {
  const fullIndex = loadChapterIndex();
  const bookSlug = normalizeBookTitle(bookTitle);
  
  if (!fullIndex[bookSlug]) {
    buildAndSaveIndex(bookTitle);
    return findFirstAppearance(bookTitle, entityName);
  }

  const bookIndex = fullIndex[bookSlug];
  const entityNameLower = entityName.toLowerCase();
  
  // Try exact match
  let firstCh = bookIndex.firstAppearance[entityName];

  // Try case-insensitive match
  if (!firstCh) {
    const key = Object.keys(bookIndex.firstAppearance).find(
      k => k.toLowerCase() === entityNameLower
    );
    if (key) {
      firstCh = bookIndex.firstAppearance[key];
    }
  }

  return firstCh || null;
}

/**
 * Find chapters where two characters appear together
 * @param {string} bookTitle - Book title
 * @param {string} char1 - First character
 * @param {string} char2 - Second character
 * @param {number} currentChapter - Current chapter (filter results)
 * @returns {number[]} - Array of chapter numbers
 */
function findChaptersTogether(bookTitle, char1, char2, currentChapter) {
  const fullIndex = loadChapterIndex();
  const bookSlug = normalizeBookTitle(bookTitle);
  
  if (!fullIndex[bookSlug]) {
    buildAndSaveIndex(bookTitle);
    return findChaptersTogether(bookTitle, char1, char2, currentChapter);
  }

  const bookIndex = fullIndex[bookSlug];
  const char1Lower = char1.toLowerCase();
  const char2Lower = char2.toLowerCase();
  
  // Find relationship key (try both orders)
  const relKeys = Object.keys(bookIndex.relationships);
  const relKey = relKeys.find(key => {
    const [k1, k2] = key.split('-');
    return (k1.toLowerCase() === char1Lower && k2.toLowerCase() === char2Lower) ||
           (k1.toLowerCase() === char2Lower && k2.toLowerCase() === char1Lower);
  });

  if (relKey) {
    return bookIndex.relationships[relKey].filter(ch => ch <= currentChapter);
  }

  // Fallback: find intersection of individual character chapters
  const char1Chapters = findCharacterChaptersFromIndex(bookTitle, char1, currentChapter);
  const char2Chapters = findCharacterChaptersFromIndex(bookTitle, char2, currentChapter);
  return char1Chapters.filter(ch => char2Chapters.includes(ch));
}

module.exports = {
  buildBookIndex,
  buildAndSaveIndex,
  loadChapterIndex,
  saveChapterIndex,
  findCharacterChaptersFromIndex,
  findLocationChaptersFromIndex,
  findFirstAppearance,
  findChaptersTogether,
  detectPartStructure,
  findChapterFile,
  parseChapterMetadata
};


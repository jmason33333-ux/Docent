#!/usr/bin/env node

/**
 * Generate knowledge snapshots for The Way of Kings with part-based structure
 * Usage: node generate-twok-snapshots.js [snapshot-type]
 * 
 * Snapshot types:
 * - part-bound: Generate snapshots bound by part boundaries (~10 chapters per snapshot within parts)
 * - part-level: Generate part-level snapshots with Part > Chapters hierarchy
 * - full-book: Generate full book snapshot with Book > Parts > Chapters hierarchy
 * - interludes: Generate interlude snapshot series with spoiler callouts
 * - all: Generate all snapshot types
 * 
 * Example: node generate-twok-snapshots.js all
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { 
  getKnowledgeSnapshotPrompt,
  getPartLevelSnapshotPrompt, 
  getFullBookSnapshotPrompt, 
  getInterludeSnapshotPrompt 
} = require('./prompts');

const BOOK_TITLE = 'The Way of Kings';
const SERIES_NAME = 'The Stormlight Archive';

// The Way of Kings part structure
const PARTS = [
  { number: 1, name: 'Above Silence', startChapter: 1, endChapter: 11 },
  { number: 2, name: 'The Illuminating Storms', startChapter: 12, endChapter: 28 },
  { number: 3, name: 'Dying', startChapter: 29, endChapter: 51 },
  { number: 4, name: 'Storm\'s Illumination', startChapter: 52, endChapter: 69 },
  { number: 5, name: 'The Silence Above', startChapter: 70, endChapter: 75 }
];

// Interlude structure (interlude sets after each part)
const INTERLUDES = [
  { name: 'I-1', character: 'Ishikk', afterPart: 1, file: 'interlude-i-1.md' },
  { name: 'I-2', character: 'Nan Balat', afterPart: 1, file: 'interlude-i-2.md' },
  { name: 'I-3', character: 'The Glory of Ignorance', afterPart: 1, file: 'interlude-i-3.md' },
  { name: 'I-4', character: 'Rysn', afterPart: 2, file: 'interlude-i-4.md' },
  { name: 'I-5', character: 'Axies the Collector', afterPart: 2, file: 'interlude-i-5.md' },
  { name: 'I-6', character: 'A Work of Art', afterPart: 2, file: 'interlude-i-6.md' },
  { name: 'I-7', character: 'Baxil', afterPart: 3, file: 'interlude-i-7.md' },
  { name: 'I-8', character: 'Geranid', afterPart: 3, file: 'interlude-i-8.md' },
  { name: 'I-9', character: 'Death Wears White', afterPart: 3, file: 'interlude-i-9.md' }
];

// Path to The Way of Kings chapters (assuming the Series structure)
const BOOK_SLUG = 'the-way-of-kings';
const BASE_PATH = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', BOOK_SLUG);
const CHAPTERS_DIR = path.join(BASE_PATH, 'chapters');
const SNAPSHOTS_DIR = path.join(BASE_PATH, 'knowledge-snapshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load chapter notes from part folders
 */
function loadChaptersFromPart(part, startChapter = null, endChapter = null) {
  const partDir = path.join(CHAPTERS_DIR, `Part ${part.number}`);
  const chapterNotes = [];
  
  const startCh = startChapter || part.startChapter;
  const endCh = endChapter || part.endChapter;
  
  // Load prelude and prologue if part is 1 and starting at chapter 1
  if (part.number === 1 && startCh === 1) {
    const preludeFile = path.join(CHAPTERS_DIR, 'prelude.md');
    if (fs.existsSync(preludeFile)) {
      chapterNotes.push({
        type: 'prelude',
        content: fs.readFileSync(preludeFile, 'utf-8')
      });
    }
    
    const prologueFile = path.join(CHAPTERS_DIR, 'prologue.md');
    if (fs.existsSync(prologueFile)) {
      chapterNotes.push({
        type: 'prologue',
        content: fs.readFileSync(prologueFile, 'utf-8')
      });
    }
  }
  
  // Load chapters from part folder
  for (let ch = startCh; ch <= endCh; ch++) {
    const chapterFile = path.join(partDir, `chapter-${String(ch).padStart(2, '0')}.md`);
    if (fs.existsSync(chapterFile)) {
      chapterNotes.push({
        type: 'chapter',
        number: ch,
        content: fs.readFileSync(chapterFile, 'utf-8')
      });
    } else {
      console.warn(`⚠️  Chapter file not found: ${chapterFile}`);
    }
  }
  
  return chapterNotes;
}

/**
 * Load all chapters from all parts
 */
function loadAllChapters() {
  const allChapters = [];
  
  // Load prelude and prologue
  const preludeFile = path.join(CHAPTERS_DIR, 'prelude.md');
  if (fs.existsSync(preludeFile)) {
    allChapters.push({ type: 'prelude', content: fs.readFileSync(preludeFile, 'utf-8') });
  }
  
  const prologueFile = path.join(CHAPTERS_DIR, 'prologue.md');
  if (fs.existsSync(prologueFile)) {
    allChapters.push({ type: 'prologue', content: fs.readFileSync(prologueFile, 'utf-8') });
  }
  
  // Load all chapters from all parts
  for (const part of PARTS) {
    const partChapters = loadChaptersFromPart(part);
    allChapters.push(...partChapters);
  }
  
  return allChapters;
}

/**
 * Load interludes from interlude folders
 */
function loadInterludes() {
  const interludeNotes = [];
  
  // Group interludes by their interlude folder (interlude-1, interlude-2, interlude-3)
  const interludeGroups = [
    { folder: 'interlude-1', indices: [1, 2, 3] },
    { folder: 'interlude-2', indices: [4, 5, 6] },
    { folder: 'interlude-3', indices: [7, 8, 9] }
  ];
  
  for (const group of interludeGroups) {
    for (const idx of group.indices) {
      const interlude = INTERLUDES.find(i => i.name === `I-${idx}`);
      if (interlude) {
        const interludeFile = path.join(CHAPTERS_DIR, group.folder, interlude.file);
        if (fs.existsSync(interludeFile)) {
          interludeNotes.push({
            type: 'interlude',
            name: interlude.name,
            character: interlude.character,
            content: fs.readFileSync(interludeFile, 'utf-8')
          });
        }
      }
    }
  }
  
  return interludeNotes;
}

/**
 * Generate part-bound snapshots (~10 chapters per snapshot, bound within parts)
 */
async function generatePartBoundSnapshots() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Generating Part-Bound Snapshots (~10 chapters each)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const part of PARTS) {
    const partLength = part.endChapter - part.startChapter + 1;
    
    // Calculate ~10 chapter increments within this part
    const snapshotRanges = [];
    let currentStart = part.startChapter;
    
    while (currentStart <= part.endChapter) {
      const currentEnd = Math.min(currentStart + 9, part.endChapter); // ~10 chapters (0-9 offset)
      snapshotRanges.push({ start: currentStart, end: currentEnd });
      currentStart = currentEnd + 1;
    }
    
    console.log(`\n📚 Part ${part.number}: ${part.name} (Chapters ${part.startChapter}-${part.endChapter})`);
    console.log(`   Generating ${snapshotRanges.length} snapshot(s):`);
    
    for (const range of snapshotRanges) {
      console.log(`   - Chapters ${range.start}-${range.end}`);
      
      const chapterNotes = loadChaptersFromPart(part, range.start, range.end);
      
      if (chapterNotes.length === 0) {
        console.log(`   ⚠️  No chapter notes found for Part ${part.number} chapters ${range.start}-${range.end}`);
        continue;
      }
      
      // Determine startChapter for the prompt (for display purposes)
      const actualStartChapter = chapterNotes.find(n => n.type === 'chapter')?.number || range.start;
      
      const prompt = getKnowledgeSnapshotPrompt(
        BOOK_TITLE,
        chapterNotes,
        range.end,
        actualStartChapter
      );
      
      const outputFile = path.join(SNAPSHOTS_DIR, `through-chapter-${String(range.end).padStart(2, '0')}.md`);
      
      // Skip if already exists
      if (fs.existsSync(outputFile)) {
        console.log(`   ✓ Already exists: ${path.basename(outputFile)}`);
        continue;
      }
      
      try {
        console.log(`   🤖 Generating snapshot...`);
        const content = await generateContent(prompt);
        
        fs.writeFileSync(outputFile, content, 'utf-8');
        console.log(`   ✅ Generated: ${path.basename(outputFile)}\n`);
        
        await sleep(2000); // Rate limiting
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }
  }
}

/**
 * Generate part-level snapshots
 */
async function generatePartLevelSnapshots() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Generating Part-Level Snapshots');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const part of PARTS) {
    console.log(`\n📚 Generating snapshot for Part ${part.number}: ${part.name}...`);
    
    const chapterNotes = loadChaptersFromPart(part);
    
    if (chapterNotes.length === 0) {
      console.log(`⚠️  No chapter notes found for Part ${part.number}`);
      continue;
    }
    
    const prompt = getPartLevelSnapshotPrompt(
      BOOK_TITLE,
      part.number,
      part.name,
      part.startChapter,
      part.endChapter,
      chapterNotes
    );
    
    const outputFile = path.join(SNAPSHOTS_DIR, `part-${part.number}-${part.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`);
    
    // Skip if already exists
    if (fs.existsSync(outputFile)) {
      console.log(`✓ Already exists: ${path.basename(outputFile)}\n`);
      continue;
    }
    
    try {
      const content = await generateContent(prompt);
      fs.writeFileSync(outputFile, content, 'utf-8');
      console.log(`✅ Generated: ${path.basename(outputFile)}\n`);
      
      await sleep(2000); // Rate limiting
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

/**
 * Generate full book snapshot
 */
async function generateFullBookSnapshot() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Generating Full Book Snapshot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const allChapters = loadAllChapters();
  
  if (allChapters.length === 0) {
    console.log('⚠️  No chapter notes found');
    return;
  }
  
  console.log(`📚 Loading ${allChapters.length} chapters/notes...\n`);
  
  const prompt = getFullBookSnapshotPrompt(
    BOOK_TITLE,
    SERIES_NAME,
    PARTS,
    allChapters
  );
  
  const outputFile = path.join(SNAPSHOTS_DIR, 'full-book-snapshot.md');
  
  // Skip if already exists
  if (fs.existsSync(outputFile)) {
    console.log(`✓ Already exists: ${path.basename(outputFile)}\n`);
    return;
  }
  
  try {
    console.log('🤖 Generating full book snapshot...');
    const content = await generateContent(prompt);
    fs.writeFileSync(outputFile, content, 'utf-8');
    console.log(`✅ Generated: ${path.basename(outputFile)}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

/**
 * Generate interlude snapshots
 */
async function generateInterludeSnapshots() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Generating Interlude Snapshots');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const interludeNotes = loadInterludes();
  
  if (interludeNotes.length === 0) {
    console.log('⚠️  No interlude notes found');
    return;
  }
  
  console.log(`📚 Generating snapshot for all ${interludeNotes.length} interludes...\n`);
  
  const prompt = getInterludeSnapshotPrompt(
    BOOK_TITLE,
    INTERLUDES,
    interludeNotes
  );
  
  const outputFile = path.join(SNAPSHOTS_DIR, 'interlude-snapshot-series.md');
  
  // Skip if already exists
  if (fs.existsSync(outputFile)) {
    console.log(`✓ Already exists: ${path.basename(outputFile)}\n`);
    return;
  }
  
  try {
    console.log('🤖 Generating interlude snapshot...');
    const content = await generateContent(prompt);
    fs.writeFileSync(outputFile, content, 'utf-8');
    console.log(`✅ Generated: ${path.basename(outputFile)}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }
}

// Ensure snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

// Main execution
const snapshotType = process.argv[2] || 'all';

(async () => {
  try {
    if (snapshotType === 'part-bound' || snapshotType === 'all') {
      await generatePartBoundSnapshots();
    }
    
    if (snapshotType === 'part-level' || snapshotType === 'all') {
      await generatePartLevelSnapshots();
    }
    
    if (snapshotType === 'full-book' || snapshotType === 'all') {
      await generateFullBookSnapshot();
    }
    
    if (snapshotType === 'interludes' || snapshotType === 'all') {
      await generateInterludeSnapshots();
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ All snapshot generation complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();


#!/usr/bin/env node

/**
 * Generate knowledge snapshots for Rhythm of War with part-based structure
 * Usage: node generate-row-snapshots.js [snapshot-type]
 * 
 * Snapshot types:
 * - part-bound: Generate snapshots bound by part boundaries (Part 1: Ch 1-19, Part 2: Ch 20-43, etc.)
 * - part-level: Generate part-level snapshots with Part > Chapters hierarchy
 * - full-book: Generate full book snapshot with Book > Parts > Chapters hierarchy
 * - interludes: Generate interlude snapshot series with spoiler callouts
 * - all: Generate all snapshot types
 * 
 * Example: node generate-row-snapshots.js all
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { 
  getPartLevelSnapshotPrompt, 
  getFullBookSnapshotPrompt, 
  getInterludeSnapshotPrompt 
} = require('./prompts');

const BOOK_TITLE = 'Rhythm of War';
const SERIES_NAME = 'The Stormlight Archive';

// Rhythm of War part structure
const PARTS = [
  { number: 1, name: 'Burdens', startChapter: 1, endChapter: 19 },
  { number: 2, name: 'Our Calling', startChapter: 20, endChapter: 43 },
  { number: 3, name: 'Songs of Home', startChapter: 44, endChapter: 72 },
  { number: 4, name: 'A Knowledge', startChapter: 73, endChapter: 97 },
  { number: 5, name: 'Knowing a Home of Songs, Called Our Burden', startChapter: 98, endChapter: 117 }
];

// Interlude structure (interlude sets after each part)
const INTERLUDES = [
  { name: 'I-1', character: 'Sylphrena', afterPart: 1, file: 'interlude-i-1.md' },
  { name: 'I-2', character: 'Sja-Anat', afterPart: 1, file: 'interlude-i-2.md' },
  { name: 'I-3', character: 'Taravangian', afterPart: 1, file: 'interlude-i-3.md' },
  { name: 'I-4', character: 'Vyre', afterPart: 2, file: 'interlude-i-4.md' },
  { name: 'I-5', character: 'Lift', afterPart: 2, file: 'interlude-i-5.md' },
  { name: 'I-6', character: 'A Boon and a Curse', afterPart: 2, file: 'interlude-i-6.md' },
  { name: 'I-7', character: 'Szeth', afterPart: 3, file: 'interlude-i-7.md' },
  { name: 'I-8', character: 'Chiri-Chiri', afterPart: 3, file: 'interlude-i-8.md' },
  { name: 'I-9', character: 'The Sword', afterPart: 3, file: 'interlude-i-9.md' },
  { name: 'I-10', character: 'Hesina', afterPart: 4, file: 'interlude-i-10.md' },
  { name: 'I-11', character: 'Adin', afterPart: 4, file: 'interlude-i-11.md' },
  { name: 'I-12', character: 'Vulnerable', afterPart: 4, file: 'interlude-i-12.md' }
];

// Path to Rhythm of War chapters (assuming the Series structure)
const BOOK_SLUG = 'rhythm-of-war';
const BASE_PATH = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', BOOK_SLUG);
const CHAPTERS_DIR = path.join(BASE_PATH, 'chapters');
const SNAPSHOTS_DIR = path.join(BASE_PATH, 'knowledge-snapshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load chapter notes from part folders
 */
function loadChaptersFromPart(part) {
  const partDir = path.join(CHAPTERS_DIR, `Part ${part.number}-${part.name}`);
  const chapterNotes = [];
  
  // Load prologue if exists and part is 1
  if (part.number === 1) {
    const prologueFile = path.join(CHAPTERS_DIR, 'prologue.md');
    if (fs.existsSync(prologueFile)) {
      chapterNotes.push({
        type: 'prologue',
        content: fs.readFileSync(prologueFile, 'utf-8')
      });
    }
  }
  
  // Load chapters from part folder
  for (let ch = part.startChapter; ch <= part.endChapter; ch++) {
    const chapterFile = path.join(partDir, `chapter-${String(ch).padStart(2, '0')}.md`);
    if (fs.existsSync(chapterFile)) {
      chapterNotes.push({
        type: 'chapter',
        number: ch,
        content: fs.readFileSync(chapterFile, 'utf-8')
      });
    }
  }
  
  return chapterNotes;
}

/**
 * Load all chapters from all parts
 */
function loadAllChapters() {
  const allNotes = [];
  
  // Load prologue
  const prologueFile = path.join(CHAPTERS_DIR, 'prologue.md');
  if (fs.existsSync(prologueFile)) {
    allNotes.push({
      type: 'prologue',
      content: fs.readFileSync(prologueFile, 'utf-8')
    });
  }
  
  // Load all chapters from all parts
  for (const part of PARTS) {
    const partDir = path.join(CHAPTERS_DIR, `Part ${part.number}-${part.name}`);
    for (let ch = part.startChapter; ch <= part.endChapter; ch++) {
      const chapterFile = path.join(partDir, `chapter-${String(ch).padStart(2, '0')}.md`);
      if (fs.existsSync(chapterFile)) {
        allNotes.push({
          type: 'chapter',
          number: ch,
          content: fs.readFileSync(chapterFile, 'utf-8')
        });
      }
    }
  }
  
  return allNotes;
}

/**
 * Load interlude notes
 */
function loadInterludes() {
  const interludeNotes = [];
  
  for (const interlude of INTERLUDES) {
    // Determine which interlude set folder
    const interludeSetNum = Math.ceil(interlude.afterPart);
    const interludeDir = path.join(CHAPTERS_DIR, `interlude-${interludeSetNum}`);
    const interludeFile = path.join(interludeDir, interlude.file);
    
    if (fs.existsSync(interludeFile)) {
      interludeNotes.push({
        type: 'interlude',
        name: interlude.name,
        character: interlude.character,
        afterPart: interlude.afterPart,
        content: fs.readFileSync(interludeFile, 'utf-8')
      });
    }
  }
  
  return interludeNotes;
}

/**
 * Generate part-bound snapshot (covers chapters in a part)
 */
async function generatePartBoundSnapshot(part) {
  console.log(`\n📚 Generating part-bound snapshot for Part ${part.number}: ${part.name} (Chapters ${part.startChapter}-${part.endChapter})...\n`);
  
  // Ensure directory exists
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
  
  const outputFile = path.join(SNAPSHOTS_DIR, `part-${part.number}-bound-chapters-${part.startChapter}-${part.endChapter}.md`);
  
  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    console.log(`   Skipping... (delete file to regenerate)\n`);
    return;
  }
  
  // Load chapters for this part
  const chapterNotes = loadChaptersFromPart(part);
  
  if (chapterNotes.length === 0) {
    console.log(`⚠️  No chapter notes found for Part ${part.number}. Skipping...\n`);
    return;
  }
  
  console.log(`📖 Loaded ${chapterNotes.length} chapter notes\n`);
  
  // Generate prompt (using part-level snapshot template)
  const prompt = getPartLevelSnapshotPrompt(
    BOOK_TITLE,
    part.number,
    part.name,
    part.startChapter,
    part.endChapter,
    chapterNotes
  );
  
  // Generate content
  let content;
  try {
    console.log('🤖 Generating snapshot with AI... (this may take 60-120 seconds)\n');
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error(`❌ Failed to generate part-bound snapshot for Part ${part.number}:`, error.message);
    throw error;
  }
  
  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Part-bound snapshot saved to: ${outputFile}\n`);
}

/**
 * Generate part-level snapshot (Part > Chapters hierarchy)
 */
async function generatePartLevelSnapshot(part) {
  console.log(`\n📚 Generating part-level snapshot for Part ${part.number}: ${part.name}...\n`);
  
  // Ensure directory exists
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
  
  const outputFile = path.join(SNAPSHOTS_DIR, `part-${part.number}-level-${part.name.toLowerCase().replace(/\s+/g, '-')}.md`);
  
  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    console.log(`   Skipping... (delete file to regenerate)\n`);
    return;
  }
  
  // Load chapters for this part
  const chapterNotes = loadChaptersFromPart(part);
  
  if (chapterNotes.length === 0) {
    console.log(`⚠️  No chapter notes found for Part ${part.number}. Skipping...\n`);
    return;
  }
  
  console.log(`📖 Loaded ${chapterNotes.length} chapter notes\n`);
  
  // Generate prompt
  const prompt = getPartLevelSnapshotPrompt(
    BOOK_TITLE,
    part.number,
    part.name,
    part.startChapter,
    part.endChapter,
    chapterNotes
  );
  
  // Generate content
  let content;
  try {
    console.log('🤖 Generating snapshot with AI... (this may take 60-120 seconds)\n');
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error(`❌ Failed to generate part-level snapshot for Part ${part.number}:`, error.message);
    throw error;
  }
  
  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Part-level snapshot saved to: ${outputFile}\n`);
}

/**
 * Generate full book snapshot (Book > Parts > Chapters hierarchy)
 */
async function generateFullBookSnapshot() {
  console.log(`\n📚 Generating full book snapshot for ${BOOK_TITLE}...\n`);
  
  // Ensure directory exists
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
  
  const outputFile = path.join(SNAPSHOTS_DIR, 'full-book-snapshot.md');
  
  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    console.log(`   Skipping... (delete file to regenerate)\n`);
    return;
  }
  
  // Load all chapters
  const chapterNotes = loadAllChapters();
  
  if (chapterNotes.length === 0) {
    console.log(`⚠️  No chapter notes found. Skipping...\n`);
    return;
  }
  
  console.log(`📖 Loaded ${chapterNotes.length} chapter notes from all parts\n`);
  
  // Generate prompt
  const prompt = getFullBookSnapshotPrompt(
    BOOK_TITLE,
    SERIES_NAME,
    PARTS,
    chapterNotes
  );
  
  // Generate content
  let content;
  try {
    console.log('🤖 Generating full book snapshot with AI... (this may take 2-3 minutes)\n');
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error(`❌ Failed to generate full book snapshot:`, error.message);
    throw error;
  }
  
  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Full book snapshot saved to: ${outputFile}\n`);
}

/**
 * Generate interlude snapshot series
 */
async function generateInterludeSnapshot() {
  console.log(`\n📚 Generating interlude snapshot series for ${BOOK_TITLE}...\n`);
  
  // Ensure directory exists
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
  
  const outputFile = path.join(SNAPSHOTS_DIR, 'interlude-snapshot-series.md');
  
  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    console.log(`   Skipping... (delete file to regenerate)\n`);
    return;
  }
  
  // Load all interludes
  const interludeNotes = loadInterludes();
  
  if (interludeNotes.length === 0) {
    console.log(`⚠️  No interlude notes found. Skipping...\n`);
    return;
  }
  
  console.log(`📖 Loaded ${interludeNotes.length} interlude notes\n`);
  
  // Generate prompt
  const prompt = getInterludeSnapshotPrompt(
    BOOK_TITLE,
    INTERLUDES,
    interludeNotes
  );
  
  // Generate content
  let content;
  try {
    console.log('🤖 Generating interlude snapshot with AI... (this may take 2-3 minutes)\n');
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error(`❌ Failed to generate interlude snapshot:`, error.message);
    throw error;
  }
  
  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Interlude snapshot saved to: ${outputFile}\n`);
}

/**
 * Main function
 */
async function main() {
  const snapshotType = process.argv[2] || 'all';
  
  console.log(`\n🚀 Generating ${BOOK_TITLE} Snapshots`);
  console.log(`📊 Snapshot Type: ${snapshotType}\n`);
  
  try {
    if (snapshotType === 'part-bound' || snapshotType === 'all') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('GENERATING PART-BOUND SNAPSHOTS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      for (const part of PARTS) {
        await generatePartBoundSnapshot(part);
        await sleep(2000); // Rate limiting
      }
    }
    
    if (snapshotType === 'part-level' || snapshotType === 'all') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('GENERATING PART-LEVEL SNAPSHOTS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      for (const part of PARTS) {
        await generatePartLevelSnapshot(part);
        await sleep(2000); // Rate limiting
      }
    }
    
    if (snapshotType === 'full-book' || snapshotType === 'all') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('GENERATING FULL BOOK SNAPSHOT');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await generateFullBookSnapshot();
      await sleep(2000); // Rate limiting
    }
    
    if (snapshotType === 'interludes' || snapshotType === 'all') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('GENERATING INTERLUDE SNAPSHOT SERIES');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await generateInterludeSnapshot();
      await sleep(2000); // Rate limiting
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ All snapshots generated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const snapshotType = process.argv[2];
  
  if (snapshotType && !['part-bound', 'part-level', 'full-book', 'interludes', 'all'].includes(snapshotType)) {
    console.error('Usage: node generate-row-snapshots.js [snapshot-type]');
    console.error('\nSnapshot types:');
    console.error('  part-bound   - Generate snapshots bound by part boundaries');
    console.error('  part-level   - Generate part-level snapshots (Part > Chapters hierarchy)');
    console.error('  full-book    - Generate full book snapshot (Book > Parts > Chapters hierarchy)');
    console.error('  interludes   - Generate interlude snapshot series with spoiler callouts');
    console.error('  all          - Generate all snapshot types (default)');
    process.exit(1);
  }
  
  main()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = {
  generatePartBoundSnapshot,
  generatePartLevelSnapshot,
  generateFullBookSnapshot,
  generateInterludeSnapshot
};


#!/usr/bin/env node

/**
 * Generate full book knowledge snapshot for end-of-book discussions
 * Usage: node generate-full-book-snapshot.js <bookTitle> [seriesName]
 * Example: node generate-full-book-snapshot.js "Dawnshard" "The Stormlight Archive"
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getFullBookSnapshotPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generateFullBookSnapshot(bookTitle, seriesName = '') {
  console.log(`\n📚 Generating full book snapshot for ${bookTitle}...\n`);

  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check if this is a Stormlight Archive book (which uses Series structure)
  const isStormlightBook = ['rhythm of war', 'dawnshard', 'words of radiance', 'oathbringer', 'the way of kings'].some(
    title => bookTitle.toLowerCase().includes(title)
  );
  
  let snapshotsDir, chaptersDir;
  
  if (isStormlightBook) {
    snapshotsDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', bookSlug, 'knowledge-snapshots');
    chaptersDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', bookSlug, 'chapters');
  } else {
    snapshotsDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'knowledge-snapshots');
    chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  }
  
  // Ensure directory exists
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  const outputFile = path.join(snapshotsDir, 'full-book-snapshot.md');

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    console.log(`   Skipping... (delete file to regenerate)\n`);
    return;
  }

  // Load all chapters
  const chapterNotes = [];
  
  // Load prologue if exists
  const prologuePath = path.join(chaptersDir, 'prologue.md');
  if (fs.existsSync(prologuePath)) {
    chapterNotes.push({ type: 'prologue', content: fs.readFileSync(prologuePath, 'utf-8') });
  }
  
  // Load all chapters
  const isRhythmOfWar = bookTitle.toLowerCase().includes('rhythm of war');
  const isDawnshard = bookTitle.toLowerCase().includes('dawnshard');
  
  if (isRhythmOfWar) {
    // Rhythm of War: Load from part folders
    const PARTS = [
      { number: 1, name: 'Burdens', startChapter: 1, endChapter: 19 },
      { number: 2, name: 'Our Calling', startChapter: 20, endChapter: 43 },
      { number: 3, name: 'Songs of Home', startChapter: 44, endChapter: 72 },
      { number: 4, name: 'A Knowledge', startChapter: 73, endChapter: 97 },
      { number: 5, name: 'Knowing a Home of Songs, Called Our Burden', startChapter: 98, endChapter: 117 }
    ];
    
    for (const part of PARTS) {
      for (let ch = part.startChapter; ch <= part.endChapter; ch++) {
        const partDir = path.join(chaptersDir, `Part ${part.number}-${part.name}`);
        const chapterFile = path.join(partDir, `chapter-${String(ch).padStart(2, '0')}.md`);
        if (fs.existsSync(chapterFile)) {
          chapterNotes.push({
            type: 'chapter',
            number: ch,
            content: fs.readFileSync(chapterFile, 'utf-8')
          });
        }
      }
    }
  } else if (isDawnshard) {
    // Dawnshard: Load from Part 1 folder (chapters 1-19)
    for (let ch = 1; ch <= 19; ch++) {
      const partDir = path.join(chaptersDir, 'Part 1');
      const chapterFile = path.join(partDir, `chapter-${String(ch).padStart(2, '0')}.md`);
      if (fs.existsSync(chapterFile)) {
        chapterNotes.push({
          type: 'chapter',
          number: ch,
          content: fs.readFileSync(chapterFile, 'utf-8')
        });
      }
    }
  } else {
    // Standard structure: Load directly from chapters folder
    let chapterNum = 1;
    while (true) {
      const chapterFile = path.join(chaptersDir, `chapter-${String(chapterNum).padStart(2, '0')}.md`);
      if (fs.existsSync(chapterFile)) {
        chapterNotes.push({
          type: 'chapter',
          number: chapterNum,
          content: fs.readFileSync(chapterFile, 'utf-8')
        });
        chapterNum++;
      } else {
        break;
      }
    }
  }
  
  // Load epilogue if exists
  const epiloguePath = path.join(chaptersDir, 'epilogue.md');
  if (fs.existsSync(epiloguePath)) {
    chapterNotes.push({ type: 'epilogue', content: fs.readFileSync(epiloguePath, 'utf-8') });
  }

  if (chapterNotes.length === 0) {
    console.log(`⚠️  No chapter notes found. Skipping...\n`);
    return;
  }

  console.log(`📖 Loaded ${chapterNotes.length} chapter notes\n`);

  // Determine parts structure for the prompt
  let parts = [];
  if (isRhythmOfWar) {
    parts = [
      { number: 1, name: 'Burdens', startChapter: 1, endChapter: 19 },
      { number: 2, name: 'Our Calling', startChapter: 20, endChapter: 43 },
      { number: 3, name: 'Songs of Home', startChapter: 44, endChapter: 72 },
      { number: 4, name: 'A Knowledge of Storms', startChapter: 73, endChapter: 97 },
      { number: 5, name: 'Knowing a Home of Songs, Called Our Burden', startChapter: 98, endChapter: 117 }
    ];
  } else if (isDawnshard) {
    parts = [
      { number: 1, name: 'Part 1', startChapter: 1, endChapter: 19 }
    ];
  } else {
    // Single part - all chapters
    const lastChapter = chapterNotes
      .filter(n => n.type === 'chapter')
      .map(n => n.number)
      .reduce((a, b) => Math.max(a, b), 0);
    parts = [
      { number: 1, name: 'Part 1', startChapter: 1, endChapter: lastChapter }
    ];
  }

  // Generate prompt
  const prompt = getFullBookSnapshotPrompt(bookTitle, seriesName, parts, chapterNotes);

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

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node generate-full-book-snapshot.js <bookTitle> [seriesName]');
    console.error('Example: node generate-full-book-snapshot.js "Dawnshard" "The Stormlight Archive"');
    process.exit(1);
  }

  const bookTitle = args[0];
  const seriesName = args[1] || '';

  generateFullBookSnapshot(bookTitle, seriesName)
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateFullBookSnapshot };


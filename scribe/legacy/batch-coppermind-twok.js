#!/usr/bin/env node

/**
 * Batch process Coppermind summaries for The Way of Kings
 * 
 * Setup:
 * 1. Create a directory: mkdir coppermind-twok
 * 2. Copy each section from Coppermind to a file:
 *    - coppermind-twok/prelude.txt
 *    - coppermind-twok/prologue.txt
 *    - coppermind-twok/chapter-01.txt
 *    - coppermind-twok/chapter-02.txt
 *    - coppermind-twok/interlude-i-1.txt
 *    - coppermind-twok/interlude-i-2.txt
 *    - coppermind-twok/epilogue.txt
 *    - etc.
 * 
 * Usage: node batch-coppermind-twok.js <sectionsDir>
 * Example: node batch-coppermind-twok.js coppermind-twok
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');

const BOOK_TITLE = 'The Way of Kings';

// Part boundaries for TWoK
const PARTS = [
  { name: 'Part 1', start: 1, end: 11 },
  { name: 'Part 2', start: 12, end: 28 },
  { name: 'Part 3', start: 29, end: 51 },
  { name: 'Part 4', start: 52, end: 69 },
  { name: 'Part 5', start: 70, end: 75 }
];

// Interlude groupings
const INTERLUDES = [
  { group: 1, numbers: [1, 2, 3] },
  { group: 2, numbers: [4, 5, 6] },
  { group: 3, numbers: [7, 8, 9] }
];

/**
 * Determine which part a chapter belongs to
 */
function getPartForChapter(chapterNum) {
  for (const part of PARTS) {
    if (chapterNum >= part.start && chapterNum <= part.end) {
      return part.name;
    }
  }
  return null;
}

/**
 * Determine which interlude group an interlude belongs to
 */
function getInterludeGroup(interludeNum) {
  for (const group of INTERLUDES) {
    if (group.numbers.includes(interludeNum)) {
      return group.group;
    }
  }
  return null;
}

/**
 * Parse section info from filename
 */
function parseSectionInfo(filename) {
  const name = path.basename(filename, '.txt').toLowerCase();
  
  if (name === 'prelude') {
    return { 
      type: 'prelude', 
      identifier: 'prelude',
      filename: 'prelude.md',
      dir: null // Root chapters dir
    };
  }
  
  if (name === 'prologue') {
    return { 
      type: 'prologue', 
      identifier: 'prologue',
      filename: 'prologue.md',
      dir: null // Root chapters dir
    };
  }
  
  if (name === 'epilogue') {
    return { 
      type: 'epilogue', 
      identifier: 'epilogue',
      filename: 'epilogue.md',
      dir: null // Root chapters dir
    };
  }
  
  // Interludes: interlude-i-1, interlude-i-2, etc.
  const interludeMatch = name.match(/interlude[_-]?i[_-]?(\d+)/);
  if (interludeMatch) {
    const num = parseInt(interludeMatch[1], 10);
    const group = getInterludeGroup(num);
    return { 
      type: 'interlude', 
      number: num,
      identifier: `Interlude I-${num}`,
      filename: `interlude-i-${String(num).padStart(2, '0')}.md`,
      dir: `interlude-${group}`
    };
  }
  
  // Chapters: chapter-1, chapter-01, 1, etc.
  const chapterMatch = name.match(/chapter[_-]?(\d+)/);
  if (chapterMatch) {
    const num = parseInt(chapterMatch[1], 10);
    const part = getPartForChapter(num);
    return { 
      type: 'chapter', 
      number: num,
      identifier: num,
      filename: `chapter-${String(num).padStart(2, '0')}.md`,
      dir: part
    };
  }
  
  // Try to extract number from filename
  const numMatch = name.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 1 && num <= 75) {
      const part = getPartForChapter(num);
      return { 
        type: 'chapter', 
        number: num,
        identifier: num,
        filename: `chapter-${String(num).padStart(2, '0')}.md`,
        dir: part
      };
    }
  }
  
  return null;
}

/**
 * Transform a single section using the enhanced prompt
 */
async function transformSection(sectionInfo, summaryText) {
  const sectionName = sectionInfo.type === 'chapter' 
    ? `Chapter ${sectionInfo.number}`
    : sectionInfo.identifier;
  
  console.log(`   Generating notes for ${sectionName}...`);
  
  // Use the enhanced getChapterNotesPrompt with coppermindSummary parameter
  const prompt = getChapterNotesPrompt(
    BOOK_TITLE, 
    sectionInfo.identifier, 
    null, // No chapter text
    summaryText // Coppermind summary
  );
  
  try {
    const notes = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
    return notes;
  } catch (error) {
    throw new Error(`Failed to transform ${sectionName}: ${error.message}`);
  }
}

/**
 * Main batch processing function
 */
async function batchProcess(sectionsDir) {
  console.log(`\n📚 Batch processing Coppermind summaries for ${BOOK_TITLE}\n`);
  console.log(`Source directory: ${sectionsDir}\n`);

  if (!fs.existsSync(sectionsDir)) {
    console.error(`❌ Directory not found: ${sectionsDir}`);
    console.error(`\nCreate the directory and add text files with Coppermind summaries.`);
    console.error(`File naming: prelude.txt, prologue.txt, chapter-01.txt, chapter-02.txt, etc.`);
    process.exit(1);
  }

  // Find all .txt files
  const files = fs.readdirSync(sectionsDir)
    .filter(f => f.endsWith('.txt'))
    .map(f => path.join(sectionsDir, f))
    .sort();

  if (files.length === 0) {
    console.error(`❌ No .txt files found in ${sectionsDir}`);
    console.error(`\nAdd text files with Coppermind summaries.`);
    process.exit(1);
  }

  console.log(`✅ Found ${files.length} section files:\n`);
  files.forEach(f => console.log(`   - ${path.basename(f)}`));
  console.log('');

  // Parse and validate all files
  const sections = [];
  for (const file of files) {
    const sectionInfo = parseSectionInfo(file);
    if (!sectionInfo) {
      console.warn(`⚠️  Skipping ${path.basename(file)} - couldn't parse section info`);
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8').trim();
    if (content.length < 50) {
      console.warn(`⚠️  Skipping ${path.basename(file)} - content too short`);
      continue;
    }
    
    sections.push({ file, sectionInfo, content });
  }

  if (sections.length === 0) {
    console.error('❌ No valid sections to process');
    process.exit(1);
  }

  // Sort sections
  sections.sort((a, b) => {
    // Prelude first
    if (a.sectionInfo.type === 'prelude') return -2;
    if (b.sectionInfo.type === 'prelude') return 2;
    
    // Prologue second
    if (a.sectionInfo.type === 'prologue') return -1;
    if (b.sectionInfo.type === 'prologue') return 1;
    
    // Epilogue last
    if (a.sectionInfo.type === 'epilogue') return 1;
    if (b.sectionInfo.type === 'epilogue') return -1;
    
    // Sort chapters by number
    if (a.sectionInfo.type === 'chapter' && b.sectionInfo.type === 'chapter') {
      return a.sectionInfo.number - b.sectionInfo.number;
    }
    
    // Sort interludes by number
    if (a.sectionInfo.type === 'interlude' && b.sectionInfo.type === 'interlude') {
      return a.sectionInfo.number - b.sectionInfo.number;
    }
    
    // Chapters before interludes (within same part range)
    if (a.sectionInfo.type === 'chapter' && b.sectionInfo.type === 'interlude') {
      return -1;
    }
    if (a.sectionInfo.type === 'interlude' && b.sectionInfo.type === 'chapter') {
      return 1;
    }
    
    return 0;
  });

  console.log(`📝 Processing ${sections.length} sections...\n`);

  // Setup output directory structure
  const baseDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', 'the-way-of-kings', 'chapters');
  
  // Ensure base directory exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Process each section
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (let i = 0; i < sections.length; i++) {
    const { file, sectionInfo, content } = sections[i];
    const sectionName = sectionInfo.type === 'chapter' 
      ? `Chapter ${sectionInfo.number}`
      : sectionInfo.identifier;
    
    try {
      console.log(`[${i + 1}/${sections.length}] Processing ${sectionName}...`);
      console.log(`   Source: ${path.basename(file)} (${content.length} chars)`);
      
      const notes = await transformSection(sectionInfo, content);
      
      // Determine output directory
      let outputDir = baseDir;
      if (sectionInfo.dir) {
        outputDir = path.join(baseDir, sectionInfo.dir);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
      }
      
      const outputFile = path.join(outputDir, sectionInfo.filename);
      fs.writeFileSync(outputFile, notes, 'utf-8');
      
      const relativePath = path.relative(process.cwd(), outputFile);
      console.log(`   ✅ Saved to: ${relativePath}`);
      successCount++;
      
      // Rate limiting (2 seconds between requests)
      if (i < sections.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failCount++;
      failed.push(sectionName);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Complete!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`✅ Success: ${successCount} sections`);
  console.log(`❌ Failed: ${failCount} sections`);
  if (failed.length > 0) {
    console.log(`   Failed sections: ${failed.join(', ')}`);
  }
  console.log(`\n📁 Files saved to: ${baseDir}\n`);
  console.log(`💰 Estimated cost: ~$${(successCount * 0.04).toFixed(2)} (using GPT-4o)\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node batch-coppermind-twok.js <sectionsDir>');
    console.error('');
    console.error('Example:');
    console.error('  node batch-coppermind-twok.js coppermind-twok');
    console.error('');
    console.error('Setup:');
    console.error('  1. Create a directory: mkdir coppermind-twok');
    console.error('  2. Copy Coppermind summaries to text files:');
    console.error('     - coppermind-twok/prelude.txt');
    console.error('     - coppermind-twok/prologue.txt');
    console.error('     - coppermind-twok/chapter-01.txt');
    console.error('     - coppermind-twok/chapter-02.txt');
    console.error('     - coppermind-twok/interlude-i-1.txt');
    console.error('     - coppermind-twok/interlude-i-2.txt');
    console.error('     - coppermind-twok/epilogue.txt');
    console.error('  3. Run this script');
    process.exit(1);
  }

  const sectionsDir = args[0];

  batchProcess(sectionsDir)
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { batchProcess };


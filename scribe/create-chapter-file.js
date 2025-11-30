#!/usr/bin/env node

/**
 * Super simple: Just creates an empty file you can paste into
 * Then you can edit it in Cursor and save it
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node create-chapter-file.js <bookTitle> <chapterNumber>');
  console.error('Example: node create-chapter-file.js "Words of Radiance" 1');
  process.exit(1);
}

const bookTitle = args[0];
const chapterNumber = parseInt(args[1], 10);

if (isNaN(chapterNumber) || chapterNumber < 1) {
  console.error('❌ Chapter number must be a positive integer');
  process.exit(1);
}

const outputFile = `chapter-${String(chapterNumber).padStart(2, '0')}.txt`;

// Create empty file with instructions
const instructions = `# Chapter ${chapterNumber} Text
# Paste your chapter text below this line, then save this file
# After saving, run: node scribe/generate-chapter.js "${bookTitle}" ${chapterNumber} --text ${outputFile}

`;

fs.writeFileSync(outputFile, instructions, 'utf-8');

console.log(`\n✅ Created file: ${outputFile}`);
console.log(`\n📝 Next steps:`);
console.log(`1. Open ${outputFile} in Cursor (it should appear in your file explorer)`);
console.log(`2. Delete the instruction lines (lines starting with #)`);
console.log(`3. Paste your chapter text from Apple Books`);
console.log(`4. Save the file (Cmd+S)`);
console.log(`5. Run: node scribe/generate-chapter.js "${bookTitle}" ${chapterNumber} --text ${outputFile}\n`);



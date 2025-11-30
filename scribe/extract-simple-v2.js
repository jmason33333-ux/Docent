#!/usr/bin/env node

/**
 * Simple chapter extraction - improved version with better paste handling
 */

const fs = require('fs');
const readline = require('readline');

async function createChapterFile(bookTitle, chapterNumber) {
  const outputFile = `chapter-${String(chapterNumber).padStart(2, '0')}.txt`;
  
  console.log(`\n📖 Extracting Chapter ${chapterNumber} from ${bookTitle}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('INSTRUCTIONS:');
  console.log('1. Copy your chapter text from Apple Books');
  console.log('2. Paste it below (Cmd+V or right-click → Paste)');
  console.log('3. Press Enter TWICE, then type: DONE');
  console.log('   OR press Ctrl+D (Mac) or Ctrl+Z then Enter (Windows)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Paste your chapter text now:\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  let lines = [];
  let finished = false;

  // Handle each line of input
  rl.on('line', (line) => {
    // Check if user typed "DONE" to finish
    if (line.trim().toUpperCase() === 'DONE') {
      finished = true;
      rl.close();
      return;
    }
    lines.push(line);
  });

  // Handle Ctrl+D or Ctrl+Z
  rl.on('close', () => {
    if (lines.length === 0 && !finished) {
      console.log('\n❌ No text provided. Cancelled.');
      process.exit(1);
    }

    const chapterText = lines.join('\n').trim();
    
    if (chapterText.length < 50) {
      console.log('\n⚠️  Warning: Text seems very short (' + chapterText.length + ' characters).');
      console.log('Did you paste the full chapter?');
      console.log('\nIf you want to try again, run the command again.');
      process.exit(1);
    }

    // Save the file
    fs.writeFileSync(outputFile, chapterText, 'utf-8');
    console.log(`\n✅ Chapter text saved to: ${outputFile}`);
    console.log(`   Length: ${chapterText.length} characters`);
    console.log(`   Lines: ${lines.length}`);
    console.log(`\n✨ Next step: Generate chapter notes with:`);
    console.log(`   node scribe/generate-chapter.js "${bookTitle}" ${chapterNumber} --text ${outputFile}\n`);
    process.exit(0);
  });

  // Show a helpful message after a moment
  setTimeout(() => {
    if (!finished && lines.length === 0) {
      console.log('\n💡 Tip: After pasting, press Enter twice then type "DONE" to finish');
    }
  }, 2000);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node extract-simple-v2.js <bookTitle> <chapterNumber>');
    console.error('Example: node extract-simple-v2.js "Words of Radiance" 1');
    process.exit(1);
  }

  const bookTitle = args[0];
  const chapterNumber = parseInt(args[1], 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  createChapterFile(bookTitle, chapterNumber);
}

module.exports = { createChapterFile };



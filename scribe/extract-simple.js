#!/usr/bin/env node

/**
 * Simple chapter extraction - manual process helper
 * 
 * This script helps you prepare chapter text files when you have ebooks.
 * It doesn't require any special tools - just copy-paste from your ebook reader.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function createChapterFile(bookTitle, chapterNumber) {
  const outputFile = `chapter-${String(chapterNumber).padStart(2, '0')}.txt`;
  
  console.log(`\n📖 Preparing to extract Chapter ${chapterNumber} from ${bookTitle}\n`);
  console.log('Instructions:');
  console.log('1. Open your ebook in your reader (Kindle, Apple Books, etc.)');
  console.log('2. Navigate to Chapter ' + chapterNumber);
  console.log('3. Select all text in the chapter (Cmd+A or Ctrl+A)');
  console.log('4. Copy it (Cmd+C or Ctrl+C)');
  console.log('5. Come back here and paste it\n');
  console.log(`The text will be saved to: ${outputFile}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Paste the chapter text below (press Enter, then paste, then Ctrl+D (Mac) or Ctrl+Z (Windows) to finish):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let lines = [];
  let isCollecting = false;

  rl.on('line', (line) => {
    lines.push(line);
    isCollecting = true;
  });

  rl.on('close', () => {
    if (lines.length === 0) {
      console.log('\n❌ No text provided. Cancelled.');
      process.exit(1);
    }

    const chapterText = lines.join('\n').trim();
    
    if (chapterText.length < 100) {
      console.log('\n⚠️  Warning: Text seems very short. Did you paste the full chapter?');
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl2.question('Continue anyway? (y/n): ', (answer) => {
        rl2.close();
        if (answer.toLowerCase() !== 'y') {
          console.log('❌ Cancelled.');
          process.exit(1);
        }
        saveFile(outputFile, chapterText);
      });
    } else {
      saveFile(outputFile, chapterText);
    }
  });

  function saveFile(filename, text) {
    fs.writeFileSync(filename, text, 'utf-8');
    console.log(`\n✅ Chapter text saved to: ${filename}`);
    console.log(`   Length: ${text.length} characters`);
    console.log(`\n✨ Next step: Generate chapter notes with:`);
    console.log(`   node scribe/generate-chapter.js "${bookTitle}" ${chapterNumber} --text ${filename}\n`);
    process.exit(0);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node extract-simple.js <bookTitle> <chapterNumber>');
    console.error('Example: node extract-simple.js "Words of Radiance" 1');
    console.error('');
    console.error('This will prompt you to paste chapter text from your ebook reader.');
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



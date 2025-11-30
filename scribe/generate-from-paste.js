#!/usr/bin/env node

/**
 * One-step process: Paste chapter text → Generate formatted notes
 * Usage: node generate-from-paste.js <bookTitle> <chapterNumber>
 * Example: node generate-from-paste.js "Words of Radiance" 1
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generateNotesFromPaste(bookTitle, chapterNumber) {
  console.log(`\n📚 Generating chapter notes for ${bookTitle}, Chapter ${chapterNumber}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Paste your chapter text');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open your ebook in Apple Books');
  console.log('2. Navigate to Chapter ' + chapterNumber);
  console.log('3. Select all text (Cmd+A) and copy (Cmd+C)');
  console.log('4. Come back here and paste (Cmd+V)');
  console.log('5. Press Enter, then type: DONE');
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

  // Handle Ctrl+D or when done
  rl.on('close', async () => {
    if (lines.length === 0 && !finished) {
      console.log('\n❌ No text provided. Cancelled.');
      process.exit(1);
    }

    const chapterText = lines.join('\n').trim();
    
    // Clean up Apple Books metadata if present
    const cleanedText = chapterText
      .replace(/Excerpt From:.*?Apple Books\./g, '')
      .replace(/Chapter Title:.*?\n/g, '')
      .trim();
    
    if (cleanedText.length < 100) {
      console.log('\n⚠️  Warning: Text seems very short (' + cleanedText.length + ' characters).');
      console.log('Did you paste the full chapter?');
      process.exit(1);
    }

    console.log(`\n✅ Received chapter text (${cleanedText.length} characters)`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Generating formatted notes with AI...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Normalize book title to directory name
    const bookSlug = normalizeBookTitle(bookTitle);
    const chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
    
    // Ensure directory exists
    if (!fs.existsSync(chaptersDir)) {
      fs.mkdirSync(chaptersDir, { recursive: true });
    }

    const outputFile = path.join(chaptersDir, `chapter-${String(chapterNumber).padStart(2, '0')}.md`);

    // Check if file already exists
    if (fs.existsSync(outputFile)) {
      console.log(`⚠️  File already exists: ${outputFile}`);
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl2.question('Overwrite? (y/n): ', resolve);
      });
      rl2.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Cancelled.');
        process.exit(0);
      }
    }

    // Generate prompt with the chapter text
    const prompt = getChapterNotesPrompt(bookTitle, chapterNumber, cleanedText);
    
    // Generate formatted notes
    let formattedNotes;
    try {
      console.log('🤖 Sending to AI... (this may take 30-60 seconds)\n');
      formattedNotes = await generateContent(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4000
      });
    } catch (error) {
      console.error('❌ Failed to generate chapter notes:', error.message);
      process.exit(1);
    }

    // Save formatted notes
    fs.writeFileSync(outputFile, formattedNotes, 'utf-8');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ DONE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Formatted chapter notes saved to:`);
    console.log(`   ${outputFile}\n`);
    console.log(`📝 The notes are ready to use with Rowan!\n`);
    
    process.exit(0);
  });

  // Show a helpful message after a moment
  setTimeout(() => {
    if (!finished && lines.length === 0) {
      console.log('\n💡 Tip: After pasting, press Enter then type "DONE" to finish');
    }
  }, 2000);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-from-paste.js <bookTitle> <chapterNumber>');
    console.error('Example: node generate-from-paste.js "Words of Radiance" 1');
    console.error('');
    console.error('This will:');
    console.error('  1. Prompt you to paste chapter text');
    console.error('  2. Automatically generate formatted notes');
    console.error('  3. Save them in the correct location');
    process.exit(1);
  }

  const bookTitle = args[0];
  const chapterNumber = parseInt(args[1], 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  generateNotesFromPaste(bookTitle, chapterNumber);
}

module.exports = { generateNotesFromPaste };



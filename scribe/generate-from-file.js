#!/usr/bin/env node

/**
 * Generate formatted notes from an existing chapter text file
 * Usage: node generate-from-file.js <bookTitle> <chapterNumber> [textFile]
 * Example: node generate-from-file.js "Words of Radiance" 1 chapter-01.txt
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generateNotesFromFile(bookTitle, chapterNumber, textFile = null) {
  // If no file specified, try to find it
  if (!textFile) {
    textFile = `chapter-${String(chapterNumber).padStart(2, '0')}.txt`;
  }

  // Check if file exists
  if (!fs.existsSync(textFile)) {
    console.error(`❌ File not found: ${textFile}`);
    console.error(`\nLooking for: ${path.resolve(textFile)}`);
    console.error(`\nMake sure the file exists, or specify the full path.`);
    process.exit(1);
  }

  console.log(`\n📚 Generating chapter notes for ${bookTitle}, Chapter ${chapterNumber}\n`);
  console.log(`📖 Reading from: ${textFile}\n`);

  // Read the chapter text
  let chapterText = fs.readFileSync(textFile, 'utf-8');
  
  // Clean up Apple Books metadata if present
  chapterText = chapterText
    .replace(/Excerpt From:.*?Apple Books\./g, '')
    .replace(/Chapter Title:.*?\n/g, '')
    .trim();
  
  if (chapterText.length < 100) {
    console.error('⚠️  Warning: Text seems very short (' + chapterText.length + ' characters).');
    console.error('The file might not contain the full chapter.');
    process.exit(1);
  }

  console.log(`✅ Loaded chapter text (${chapterText.length} characters)\n`);
  console.log('🤖 Generating formatted notes with AI... (this may take 30-60 seconds)\n');

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
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('Overwrite? (y/n): ', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled.');
      process.exit(0);
    }
  }

  // Generate prompt with the chapter text
  const prompt = getChapterNotesPrompt(bookTitle, chapterNumber, chapterText);
  
  // Generate formatted notes
  let formattedNotes;
  try {
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
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-from-file.js <bookTitle> <chapterNumber> [textFile]');
    console.error('Example: node generate-from-file.js "Words of Radiance" 1');
    console.error('Example: node generate-from-file.js "Words of Radiance" 1 chapter-01.txt');
    console.error('');
    console.error('If textFile is not specified, it will look for chapter-XX.txt in the current directory.');
    process.exit(1);
  }

  const bookTitle = args[0];
  const chapterNumber = parseInt(args[1], 10);
  const textFile = args[2] || null;

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  generateNotesFromFile(bookTitle, chapterNumber, textFile)
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateNotesFromFile };



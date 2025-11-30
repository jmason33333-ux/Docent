#!/usr/bin/env node

/**
 * Generate chapter notes for a specific chapter
 * Usage: node generate-chapter.js <bookTitle> <chapterNumber>
 * Example: node generate-chapter.js "Words of Radiance" 1
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generateChapterNotes(bookTitle, chapterNumber, chapterText = null) {
  console.log(`\n📚 Generating chapter notes for ${bookTitle}, Chapter ${chapterNumber}...\n`);

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
      console.log('❌ Cancelled');
      return;
    }
  }

  // If chapter text is provided, use it; otherwise rely on LLM's training data
  if (chapterText) {
    console.log('📖 Using provided chapter text for accurate notes...\n');
  } else {
    console.log('⚠️  No chapter text provided - using LLM training data knowledge');
    console.log('   (For best accuracy, provide chapter text with --text flag)\n');
  }

  // Generate prompt
  const prompt = getChapterNotesPrompt(bookTitle, chapterNumber, chapterText);
  
  // Generate content
  let content;
  try {
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error('❌ Failed to generate chapter notes:', error.message);
    process.exit(1);
  }

  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Chapter notes saved to: ${outputFile}\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-chapter.js <bookTitle> <chapterNumber> [--text <file>]');
    console.error('Example: node generate-chapter.js "Words of Radiance" 1');
    console.error('Example with text: node generate-chapter.js "Words of Radiance" 1 --text chapter-01.txt');
    process.exit(1);
  }

  const bookTitle = args[0];
  const chapterNumber = parseInt(args[1], 10);
  let chapterText = null;

  // Check for --text flag
  const textFlagIndex = args.indexOf('--text');
  if (textFlagIndex !== -1 && args[textFlagIndex + 1]) {
    const textFile = args[textFlagIndex + 1];
    if (fs.existsSync(textFile)) {
      chapterText = fs.readFileSync(textFile, 'utf-8');
      console.log(`📖 Loading chapter text from: ${textFile}`);
    } else {
      console.error(`❌ Text file not found: ${textFile}`);
      process.exit(1);
    }
  }

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  generateChapterNotes(bookTitle, chapterNumber, chapterText)
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateChapterNotes };


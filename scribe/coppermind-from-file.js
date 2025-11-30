#!/usr/bin/env node

/**
 * Transform Coppermind summary from a text file into Docent chapter notes
 * Usage: node coppermind-from-file.js <bookTitle> <chapterNumber> <textFile>
 * Example: node coppermind-from-file.js "Rhythm of War" 1 coppermind-ch01.txt
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { normalizeBookTitle } = require('../utils/rag-loader');
const { CHAPTER_NOTES_TEMPLATE } = require('./prompts');

async function transformFromFile(bookTitle, chapterNumber, textFile) {
  console.log(`\n📚 Transforming Coppermind summary to Docent notes\n`);
  console.log(`Book: ${bookTitle}`);
  console.log(`Chapter: ${chapterNumber}`);
  console.log(`Source: ${textFile}\n`);

  // Check if file exists
  if (!fs.existsSync(textFile)) {
    console.error(`❌ File not found: ${textFile}`);
    console.error(`\nMake sure the file exists, or create it first.`);
    process.exit(1);
  }

  // Read the Coppermind summary
  let coppermindSummary = fs.readFileSync(textFile, 'utf-8').trim();
  
  if (coppermindSummary.length < 50) {
    console.error('⚠️  Warning: Text seems very short. Did you paste the full summary?');
    process.exit(1);
  }

  console.log(`✅ Loaded summary (${coppermindSummary.length} characters)\n`);
  console.log('🤖 Generating formatted notes with AI... (this may take 30-60 seconds)\n');

  // Create the transformation prompt
  const prompt = `You are transforming a Coppermind wiki summary into detailed chapter notes for Docent, a fantasy reading companion app.

BOOK: ${bookTitle}
CHAPTER: ${chapterNumber}

COPPERMIND SUMMARY:
${coppermindSummary}

TASK: Transform this summary into comprehensive chapter notes using the EXACT template structure below. Fill in all sections based on the summary and your knowledge of the book.

CRITICAL RULES:
1. Only include information from THIS CHAPTER (Chapter ${chapterNumber})
2. Do NOT reference or hint at events from later chapters
3. Be comprehensive - expand on the summary with details, character development, themes
4. Use the EXACT template structure provided
5. Mark callbacks to earlier chapters explicitly (e.g., "Callback to Chapter X")
6. Flag potential confusion points that readers commonly struggle with
7. Include "If Asked" notes for common questions about this chapter
8. Add details about characters, locations, magic/mechanics, themes, and foreshadowing

Use this EXACT template:
${CHAPTER_NOTES_TEMPLATE}

Now generate the complete chapter notes for Chapter ${chapterNumber} of ${bookTitle} based on the Coppermind summary above.`;

  // Normalize book title
  const bookSlug = normalizeBookTitle(bookTitle);
  const chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  
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
  
  if (args.length < 3) {
    console.error('Usage: node coppermind-from-file.js <bookTitle> <chapterNumber> <textFile>');
    console.error('Example: node coppermind-from-file.js "Rhythm of War" 1 coppermind-ch01.txt');
    console.error('');
    console.error('Steps:');
    console.error('  1. Copy Coppermind summary to a text file');
    console.error('  2. Run this command with the file path');
    console.error('  3. Wait for transformation');
    process.exit(1);
  }

  const bookTitle = args[0];
  const chapterNumber = parseInt(args[1], 10);
  const textFile = args[2];

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  transformFromFile(bookTitle, chapterNumber, textFile)
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { transformFromFile };



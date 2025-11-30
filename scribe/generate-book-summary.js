#!/usr/bin/env node

/**
 * Generate book summary (spoiler-free)
 * Usage: node generate-book-summary.js <bookTitle> [seriesName] [bookNumber]
 * Example: node generate-book-summary.js "Words of Radiance" "Stormlight Archive" 2
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getBookSummaryPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generateBookSummary(bookTitle, seriesName = '', bookNumber = '') {
  console.log(`\n📚 Generating book summary for ${bookTitle}...\n`);

  // Normalize book title to directory name
  const bookSlug = normalizeBookTitle(bookTitle);
  const bookDir = path.join(__dirname, '..', 'rag', 'books', bookSlug);
  
  // Ensure directory exists
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }

  const outputFile = path.join(bookDir, 'book-summary.md');

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

  // Generate prompt
  const prompt = getBookSummaryPrompt(bookTitle, seriesName, bookNumber);
  
  // Generate content
  let content;
  try {
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000
    });
  } catch (error) {
    console.error('❌ Failed to generate book summary:', error.message);
    process.exit(1);
  }

  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Book summary saved to: ${outputFile}\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node generate-book-summary.js <bookTitle> [seriesName] [bookNumber]');
    console.error('Example: node generate-book-summary.js "Words of Radiance" "Stormlight Archive" 2');
    process.exit(1);
  }

  const bookTitle = args[0];
  const seriesName = args[1] || '';
  const bookNumber = args[2] || '';

  generateBookSummary(bookTitle, seriesName, bookNumber)
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateBookSummary };



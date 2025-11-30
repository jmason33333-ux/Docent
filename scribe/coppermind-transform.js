#!/usr/bin/env node

/**
 * Transform Coppermind chapter summaries (from copy-paste) into Docent chapter notes
 * Usage: node coppermind-transform.js <bookTitle> <chapterNumber>
 * 
 * This prompts you to paste a Coppermind summary, then transforms it into full chapter notes
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { generateContent } = require('./llm-client');
const { normalizeBookTitle } = require('../utils/rag-loader');
const { CHAPTER_NOTES_TEMPLATE } = require('./prompts');

async function transformCoppermindSummary(bookTitle, chapterNumber) {
  console.log(`\n📚 Transforming Coppermind summary to Docent notes\n`);
  console.log(`Book: ${bookTitle}`);
  console.log(`Chapter: ${chapterNumber}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Paste the Coppermind chapter summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Go to the Coppermind page');
  console.log('2. Find Chapter ' + chapterNumber + ' summary');
  console.log('3. Copy the summary text');
  console.log('4. Paste it below, then type: DONE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  let lines = [];
  let finished = false;

  rl.on('line', (line) => {
    if (line.trim().toUpperCase() === 'DONE') {
      finished = true;
      rl.close();
      return;
    }
    lines.push(line);
  });

  rl.on('close', async () => {
    if (lines.length === 0 && !finished) {
      console.log('\n❌ No text provided. Cancelled.');
      process.exit(1);
    }

    const coppermindSummary = lines.join('\n').trim();
    
    if (coppermindSummary.length < 50) {
      console.log('\n⚠️  Warning: Text seems very short. Did you paste the full summary?');
      process.exit(1);
    }

    console.log(`\n✅ Received summary (${coppermindSummary.length} characters)\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Transforming to Docent chapter notes format...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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
    
    process.exit(0);
  });

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
    console.error('Usage: node coppermind-transform.js <bookTitle> <chapterNumber>');
    console.error('Example: node coppermind-transform.js "Rhythm of War" 1');
    console.error('');
    console.error('This will:');
    console.error('  1. Prompt you to paste a Coppermind chapter summary');
    console.error('  2. Transform it into Docent chapter notes format');
    console.error('  3. Save to the correct location');
    process.exit(1);
  }

  const bookTitle = args[0];
  const chapterNumber = parseInt(args[1], 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  transformCoppermindSummary(bookTitle, chapterNumber);
}

module.exports = { transformCoppermindSummary };



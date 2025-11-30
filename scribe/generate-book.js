#!/usr/bin/env node

/**
 * Main orchestrator script to generate all RAG content for a book
 * Usage: node generate-book.js <bookTitle> <totalChapters> [seriesName] [bookNumber]
 * Example: node generate-book.js "Words of Radiance" 89 "Stormlight Archive" 2
 * 
 * This will generate:
 * - All chapter notes (1 through totalChapters)
 * - Knowledge snapshots (every 10 chapters)
 * - Book summary
 */

const { generateChapterNotes } = require('./generate-chapter');
const { generateKnowledgeSnapshot } = require('./generate-snapshot');
const { generateBookSummary } = require('./generate-book-summary');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAllContent(bookTitle, totalChapters, seriesName = '', bookNumber = '') {
  console.log(`\n🚀 Starting RAG content generation for ${bookTitle}`);
  console.log(`📊 Total chapters: ${totalChapters}`);
  console.log(`📚 Series: ${seriesName || 'N/A'}`);
  console.log(`🔢 Book number: ${bookNumber || 'N/A'}\n`);

  // Step 1: Generate book summary first (spoiler-free)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Generating book summary...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    await generateBookSummary(bookTitle, seriesName, bookNumber);
    await sleep(2000); // Rate limiting
  } catch (error) {
    console.error('❌ Failed to generate book summary:', error.message);
    return;
  }

  // Step 2: Generate all chapter notes
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Generating chapter notes...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (let chapter = 1; chapter <= totalChapters; chapter++) {
    try {
      console.log(`\n[${chapter}/${totalChapters}] Generating Chapter ${chapter}...`);
      await generateChapterNotes(bookTitle, chapter);
      
      // Rate limiting - wait 2 seconds between chapters
      if (chapter < totalChapters) {
        await sleep(2000);
      }
    } catch (error) {
      console.error(`❌ Failed to generate Chapter ${chapter}:`, error.message);
      console.log('⚠️  Continuing with next chapter...\n');
    }
  }

  // Step 3: Generate knowledge snapshots (every 10 chapters)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 3: Generating knowledge snapshots...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const snapshotChapters = [];
  for (let i = 10; i <= totalChapters; i += 10) {
    snapshotChapters.push(i);
  }
  
  // Also add final chapter if not already included
  if (snapshotChapters[snapshotChapters.length - 1] !== totalChapters) {
    snapshotChapters.push(totalChapters);
  }

  for (const chapter of snapshotChapters) {
    try {
      console.log(`\nGenerating snapshot through Chapter ${chapter}...`);
      await generateKnowledgeSnapshot(bookTitle, chapter);
      await sleep(2000); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to generate snapshot for Chapter ${chapter}:`, error.message);
      console.log('⚠️  Continuing with next snapshot...\n');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ RAG content generation complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📁 Generated files:`);
  console.log(`   - Book summary: rag/books/${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/book-summary.md`);
  console.log(`   - Chapter notes: rag/books/${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/chapters/ (${totalChapters} files)`);
  console.log(`   - Knowledge snapshots: rag/books/${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/knowledge-snapshots/ (${snapshotChapters.length} files)\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-book.js <bookTitle> <totalChapters> [seriesName] [bookNumber]');
    console.error('Example: node generate-book.js "Words of Radiance" 89 "Stormlight Archive" 2');
    console.error('\nThis will generate:');
    console.error('  - Book summary (spoiler-free)');
    console.error('  - All chapter notes (1 through totalChapters)');
    console.error('  - Knowledge snapshots (every 10 chapters)');
    process.exit(1);
  }

  const bookTitle = args[0];
  const totalChapters = parseInt(args[1], 10);
  const seriesName = args[2] || '';
  const bookNumber = args[3] || '';

  if (isNaN(totalChapters) || totalChapters < 1) {
    console.error('❌ Total chapters must be a positive integer');
    process.exit(1);
  }

  // Confirm before starting (this is expensive!)
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\n⚠️  WARNING: This will generate ${totalChapters} chapter notes + snapshots.`);
  console.log(`   Estimated cost: ~$${((totalChapters * 0.03) + (Math.ceil(totalChapters / 10) * 0.06)).toFixed(2)} (using GPT-4o)`);
  console.log(`   Estimated time: ~${Math.ceil(totalChapters * 2 / 60)} minutes\n`);

  readline.question('Continue? (y/n): ', async answer => {
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    generateAllContent(bookTitle, totalChapters, seriesName, bookNumber)
      .then(() => {
        console.log('✨ All done!');
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
      });
  });
}

module.exports = { generateAllContent };



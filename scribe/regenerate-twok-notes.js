#!/usr/bin/env node

/**
 * Regenerate all The Way of Kings chapter notes using the enhanced prompt
 * This will regenerate notes to match Rhythm of War quality standards
 * 
 * Usage: node regenerate-twok-notes.js [--dry-run] [--chapters 1,2,3]
 * 
 * Options:
 *   --dry-run    Show what would be regenerated without actually doing it
 *   --chapters   Comma-separated list of chapter numbers to regenerate (e.g., "1,2,61")
 */

const fs = require('fs');
const path = require('path');
const { generateChapterNotes, CHAPTER_DATA, INTERLUDE_DATA } = require('./generate-twok-chapters');

const BOOK_TITLE = 'The Way of Kings';

// All chapters and sections to regenerate
const ALL_SECTIONS = [
  { type: 'prelude', name: 'Prelude' },
  { type: 'prologue', name: 'Prologue' },
  { type: 'chapter', chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75] },
  { type: 'interlude', groups: [
    { group: 1, chapters: [1, 2, 3] },
    { group: 2, chapters: [4, 5, 6] },
    { group: 3, chapters: [7, 8, 9] }
  ]},
  { type: 'epilogue', name: 'Epilogue' }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function regenerateNotes(dryRun = false, specificChapters = null) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Regenerating The Way of Kings Chapter Notes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  let totalCount = 0;
  let toRegenerate = [];
  
  // Build list of sections to regenerate
  for (const section of ALL_SECTIONS) {
    if (section.type === 'prelude') {
      toRegenerate.push({ type: 'prelude', name: section.name });
      totalCount++;
    } else if (section.type === 'prologue') {
      toRegenerate.push({ type: 'prologue', name: section.name });
      totalCount++;
    } else if (section.type === 'epilogue') {
      toRegenerate.push({ type: 'epilogue', name: section.name });
      totalCount++;
    } else if (section.type === 'chapter') {
      for (const ch of section.chapters) {
        if (!specificChapters || specificChapters.includes(ch)) {
          toRegenerate.push({ type: 'chapter', number: ch });
          totalCount++;
        }
      }
    } else if (section.type === 'interlude') {
      for (const group of section.groups) {
        for (const ch of group.chapters) {
          if (!specificChapters || specificChapters.includes(ch)) {
            toRegenerate.push({ type: 'interlude', number: ch, group: group.group });
            totalCount++;
          }
        }
      }
    }
  }
  
  console.log(`📊 Found ${totalCount} sections to regenerate\n`);
  
  if (dryRun) {
    console.log('Sections that would be regenerated:');
    toRegenerate.forEach(item => {
      if (item.type === 'prelude' || item.type === 'prologue' || item.type === 'epilogue') {
        console.log(`  - ${item.name}`);
      } else if (item.type === 'chapter') {
        console.log(`  - Chapter ${item.number}`);
      } else if (item.type === 'interlude') {
        console.log(`  - Interlude I-${item.number} (group ${item.group})`);
      }
    });
    console.log('\n✅ Dry run complete. Remove --dry-run to actually regenerate.');
    return;
  }
  
  console.log('⚠️  This will overwrite existing chapter note files.');
  console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await sleep(5000);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < toRegenerate.length; i++) {
    const item = toRegenerate[i];
    const progress = `[${i + 1}/${totalCount}]`;
    
    try {
      if (item.type === 'prelude') {
        console.log(`\n${progress} Regenerating Prelude...`);
        // Note: Prelude uses a different script, skip for now or handle separately
        console.log('   ⏭️  Skipping Prelude (handled separately)');
      } else if (item.type === 'prologue') {
        console.log(`\n${progress} Regenerating Prologue...`);
        await generateChapterNotes('prologue');
        successCount++;
      } else if (item.type === 'epilogue') {
        console.log(`\n${progress} Regenerating Epilogue...`);
        await generateChapterNotes('epilogue');
        successCount++;
      } else if (item.type === 'chapter') {
        console.log(`\n${progress} Regenerating Chapter ${item.number}...`);
        await generateChapterNotes('chapter', item.number);
        successCount++;
      } else if (item.type === 'interlude') {
        console.log(`\n${progress} Regenerating Interlude I-${item.number}...`);
        await generateChapterNotes('interlude', item.number, item.group);
        successCount++;
      }
      
      // Rate limiting
      if (i < toRegenerate.length - 1) {
        await sleep(2000);
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Regeneration Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Successfully regenerated: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total: ${totalCount}\n`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const chaptersArg = args.find(arg => arg.startsWith('--chapters='));
const specificChapters = chaptersArg 
  ? chaptersArg.split('=')[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
  : null;

if (require.main === module) {
  regenerateNotes(dryRun, specificChapters)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { regenerateNotes };


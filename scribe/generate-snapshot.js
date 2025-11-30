#!/usr/bin/env node

/**
 * Generate knowledge snapshot for chapters up to a certain point
 * Usage: node generate-snapshot.js <bookTitle> <throughChapter>
 * Example: node generate-snapshot.js "Words of Radiance" 10
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getKnowledgeSnapshotPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

async function generateKnowledgeSnapshot(bookTitle, throughChapter) {
  console.log(`\n📚 Generating knowledge snapshot for ${bookTitle} through Chapter ${throughChapter}...\n`);

  // Normalize book title to directory name
  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check if this is a Stormlight Archive book (which uses Series structure)
  const isStormlightBook = ['rhythm of war', 'dawnshard', 'words of radiance', 'oathbringer', 'the way of kings'].some(
    title => bookTitle.toLowerCase().includes(title)
  );
  
  let snapshotsDir, chaptersDir;
  if (isStormlightBook) {
    // Stormlight Archive books use Series structure
    snapshotsDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', bookSlug, 'knowledge-snapshots');
    chaptersDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', bookSlug, 'chapters');
  } else {
    // Other books use standard structure
    snapshotsDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'knowledge-snapshots');
    chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  }
  
  // Ensure directory exists
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  const outputFile = path.join(snapshotsDir, `through-chapter-${String(throughChapter).padStart(2, '0')}.md`);

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

  // Try to load existing chapter notes for better accuracy
  let chapterNotes = [];
  let startChapter = 1; // Default: start from chapter 1
  let partInfo = null;
  
  if (fs.existsSync(chaptersDir)) {
    console.log('📖 Loading existing chapter notes for accuracy...\n');
    
    const isRhythmOfWar = bookTitle.toLowerCase().includes('rhythm of war');
    const isDawnshard = bookTitle.toLowerCase().includes('dawnshard');
    
    if (isRhythmOfWar) {
      // Rhythm of War: chapters are in part folders (Part X-Name format)
      // Determine which part this chapter belongs to and only load chapters from that part
      const PARTS = [
        { number: 1, name: 'Burdens', startChapter: 1, endChapter: 19 },
        { number: 2, name: 'Our Calling', startChapter: 20, endChapter: 43 },
        { number: 3, name: 'Songs of Home', startChapter: 44, endChapter: 72 },
        { number: 4, name: 'A Knowledge', startChapter: 73, endChapter: 97 },
        { number: 5, name: 'Knowing a Home of Songs, Called Our Burden', startChapter: 98, endChapter: 117 }
      ];
      
      // Find which part contains throughChapter
      partInfo = PARTS.find(p => throughChapter >= p.startChapter && throughChapter <= p.endChapter);
      
      if (partInfo) {
        // Calculate which ~10 chapter increment within this part
        // For example, Part 3 (44-72): 44-53, 54-63, 64-72
        const offsetFromPartStart = throughChapter - partInfo.startChapter;
        const increment = Math.floor(offsetFromPartStart / 10);
        startChapter = partInfo.startChapter + (increment * 10);
        
        // Ensure we don't go before the part start
        if (startChapter < partInfo.startChapter) {
          startChapter = partInfo.startChapter;
        }
        
        console.log(`📚 Part-bound snapshot: Loading chapters ${startChapter}-${throughChapter} from Part ${partInfo.number}: ${partInfo.name}\n`);
        
        // Load prologue only if we're starting at Part 1 chapter 1
        if (partInfo.number === 1 && startChapter === 1) {
          const prologueFile = path.join(chaptersDir, 'prologue.md');
          if (fs.existsSync(prologueFile)) {
            chapterNotes.push({ type: 'prologue', content: fs.readFileSync(prologueFile, 'utf-8') });
          }
        }
        
        // Load chapters only from this increment within the part
        for (let i = startChapter; i <= throughChapter; i++) {
          const partDir = path.join(chaptersDir, `Part ${partInfo.number}-${partInfo.name}`);
          const chapterFile = path.join(partDir, `chapter-${String(i).padStart(2, '0')}.md`);
          if (fs.existsSync(chapterFile)) {
            chapterNotes.push({ 
              type: 'chapter', 
              number: i, 
              content: fs.readFileSync(chapterFile, 'utf-8') 
            });
          }
        }
      } else {
        console.log(`⚠️  Warning: Chapter ${throughChapter} doesn't match any known part structure\n`);
      }
    } else if (isDawnshard) {
      // Dawnshard: All chapters in Part 1 folder
      // Calculate which ~10 chapter increment
      const offsetFromPartStart = throughChapter - 1; // Dawnshard starts at chapter 1
      const increment = Math.floor(offsetFromPartStart / 10);
      startChapter = 1 + (increment * 10);
      
      if (startChapter < 1) {
        startChapter = 1;
      }
      
      console.log(`📚 Part-bound snapshot: Loading chapters ${startChapter}-${throughChapter} from Part 1\n`);
      
      // Load prologue if starting at chapter 1
      if (startChapter === 1) {
        const prologueFile = path.join(chaptersDir, 'prologue.md');
        if (fs.existsSync(prologueFile)) {
          chapterNotes.push({ type: 'prologue', content: fs.readFileSync(prologueFile, 'utf-8') });
        }
      }
      
      // Load chapters from Part 1 folder
      for (let i = startChapter; i <= throughChapter; i++) {
        const partDir = path.join(chaptersDir, 'Part 1');
        const chapterFile = path.join(partDir, `chapter-${String(i).padStart(2, '0')}.md`);
        if (fs.existsSync(chapterFile)) {
          chapterNotes.push({ 
            type: 'chapter', 
            number: i, 
            content: fs.readFileSync(chapterFile, 'utf-8') 
          });
        }
      }
    } else {
      // Standard structure: chapters are directly in chapters directory
      // Load prologue if it exists
      const prologueFile = path.join(chaptersDir, 'prologue.md');
      if (fs.existsSync(prologueFile)) {
        chapterNotes.push({ type: 'prologue', content: fs.readFileSync(prologueFile, 'utf-8') });
      }
      
      // Load chapters 1 through throughChapter
      for (let i = 1; i <= throughChapter; i++) {
        const chapterFile = path.join(chaptersDir, `chapter-${String(i).padStart(2, '0')}.md`);
        if (fs.existsSync(chapterFile)) {
          chapterNotes.push({ 
            type: 'chapter', 
            number: i, 
            content: fs.readFileSync(chapterFile, 'utf-8') 
          });
        }
      }
    }
    
    if (chapterNotes.length > 0) {
      console.log(`✅ Loaded ${chapterNotes.length} chapter note files\n`);
    } else {
      console.log('⚠️  No chapter notes found - using LLM training data\n');
    }
  }

  // Generate prompt with chapter notes if available
  // Update coverage to reflect part-bound nature if applicable
  const coverageNote = partInfo ? 
    `Chapters ${startChapter}-${throughChapter} (Part ${partInfo.number}: ${partInfo.name})` : 
    `Chapters 1-${throughChapter}`;
  
  const prompt = getKnowledgeSnapshotPrompt(bookTitle, throughChapter, chapterNotes, startChapter);
  
  // Generate content
  let content;
  try {
    content = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error('❌ Failed to generate knowledge snapshot:', error.message);
    process.exit(1);
  }

  // Save to file
  fs.writeFileSync(outputFile, content, 'utf-8');
  console.log(`✅ Knowledge snapshot saved to: ${outputFile}\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node generate-snapshot.js <bookTitle> <throughChapter>');
    console.error('Example: node generate-snapshot.js "Words of Radiance" 10');
    process.exit(1);
  }

  const bookTitle = args[0];
  const throughChapter = parseInt(args[1], 10);

  if (isNaN(throughChapter) || throughChapter < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  generateKnowledgeSnapshot(bookTitle, throughChapter)
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateKnowledgeSnapshot };


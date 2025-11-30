#!/usr/bin/env node

/**
 * Batch process multiple Coppermind summaries from text files
 * 
 * Setup:
 * 1. Create a directory: mkdir coppermind-sections
 * 2. Copy each section from Coppermind to a file:
 *    - coppermind-sections/prologue.txt
 *    - coppermind-sections/chapter-01.txt
 *    - coppermind-sections/chapter-02.txt
 *    - etc.
 * 
 * Usage: node batch-coppermind.js <bookTitle> <sectionsDir>
 * Example: node batch-coppermind.js "Rhythm of War" coppermind-sections
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { normalizeBookTitle } = require('../utils/rag-loader');
const { CHAPTER_NOTES_TEMPLATE } = require('./prompts');

/**
 * Parse section info from filename
 */
function parseSectionInfo(filename) {
  const name = path.basename(filename, '.txt').toLowerCase();
  
  if (name === 'prologue') {
    return { type: 'prologue', number: 0, filename: 'prologue.md' };
  }
  if (name === 'epilogue') {
    return { type: 'epilogue', number: 999, filename: 'epilogue.md' };
  }
  
  const interludeMatch = name.match(/interlude[_-]?(\d+)/);
  if (interludeMatch) {
    const num = parseInt(interludeMatch[1], 10);
    return { type: 'interlude', number: num, filename: `interlude-${String(num).padStart(2, '0')}.md` };
  }
  
  const chapterMatch = name.match(/chapter[_-]?(\d+)/);
  if (chapterMatch) {
    const num = parseInt(chapterMatch[1], 10);
    return { type: 'chapter', number: num, filename: `chapter-${String(num).padStart(2, '0')}.md` };
  }
  
  // Try to extract number from filename
  const numMatch = name.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return { type: 'chapter', number: num, filename: `chapter-${String(num).padStart(2, '0')}.md` };
  }
  
  return null;
}

/**
 * Get section display name
 */
function getSectionName(sectionInfo) {
  if (sectionInfo.type === 'prologue') return 'Prologue';
  if (sectionInfo.type === 'epilogue') return 'Epilogue';
  if (sectionInfo.type === 'interlude') return `Interlude ${sectionInfo.number}`;
  return `Chapter ${sectionInfo.number}`;
}

/**
 * Transform a single section
 */
async function transformSection(bookTitle, sectionInfo, summaryText) {
  const sectionName = getSectionName(sectionInfo);
  
  // Extract Part number from summary if present
  const partMatch = summaryText.match(/Part\s+(\d+):\s*([^\n]+)/i);
  const partInfo = partMatch ? `Part ${partMatch[1]}: ${partMatch[2]}` : null;
  
  const prompt = `You are transforming a Coppermind wiki summary into detailed chapter notes for Docent, a fantasy reading companion app.

BOOK: ${bookTitle}
SECTION: ${sectionName}
${partInfo ? `PART: ${partInfo}` : ''}

COPPERMIND SUMMARY:
${summaryText}

TASK: Transform this summary into comprehensive chapter notes using the EXACT template structure below. Fill in all sections based on the summary and your knowledge of the book.

CRITICAL RULES:
1. Only include information from THIS SECTION (${sectionName})
2. Do NOT reference or hint at events from later sections
3. Be comprehensive - expand on the summary with details, character development, themes
4. Use the EXACT template structure provided
5. Include ALL characters from the Coppermind "Characters" section:
   - POV character(s) in "POV Character(s)" subsection
   - Characters who appear in "Characters Who Appear" subsection
   - Characters marked as "mentioned only" in "Characters Mentioned Only" subsection
6. Preserve Part number if provided in the summary (add to Metadata)
7. Include chapter epigraphs if present (the quotes/inscriptions at the start)
8. Mark callbacks to earlier chapters explicitly (e.g., "Callback to Chapter X")
9. Flag potential confusion points that readers commonly struggle with
10. Include "If Asked" notes for common questions about this section
11. Add details about characters, locations, magic/mechanics, themes, and foreshadowing
12. For Prologue/Interlude/Epilogue: Note that these are special sections, not regular chapters

CHARACTER LISTING ENHANCEMENT:
- The Coppermind summary includes a "Characters" section - use this as your source
- Include EVERY character listed, even if marked "mentioned only"
- "Mentioned only" characters help answer "who is X?" questions even if they don't appear
- For each character, provide context about their role/relevance in THIS chapter

Use this EXACT template:
${CHAPTER_NOTES_TEMPLATE}

Now generate the complete chapter notes for ${sectionName} of ${bookTitle} based on the Coppermind summary above.`;

  try {
    const notes = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
    return notes;
  } catch (error) {
    throw new Error(`Failed to transform ${sectionName}: ${error.message}`);
  }
}

/**
 * Main batch processing function
 */
async function batchProcess(bookTitle, sectionsDir) {
  console.log(`\n📚 Batch processing Coppermind summaries to Docent notes\n`);
  console.log(`Book: ${bookTitle}`);
  console.log(`Source directory: ${sectionsDir}\n`);

  if (!fs.existsSync(sectionsDir)) {
    console.error(`❌ Directory not found: ${sectionsDir}`);
    console.error(`\nCreate the directory and add text files with Coppermind summaries.`);
    console.error(`File naming: prologue.txt, chapter-01.txt, chapter-02.txt, etc.`);
    process.exit(1);
  }

  // Find all .txt files
  const files = fs.readdirSync(sectionsDir)
    .filter(f => f.endsWith('.txt'))
    .map(f => path.join(sectionsDir, f))
    .sort();

  if (files.length === 0) {
    console.error(`❌ No .txt files found in ${sectionsDir}`);
    console.error(`\nAdd text files with Coppermind summaries.`);
    process.exit(1);
  }

  console.log(`✅ Found ${files.length} section files:\n`);
  files.forEach(f => console.log(`   - ${path.basename(f)}`));
  console.log('');

  // Parse and validate all files
  const sections = [];
  for (const file of files) {
    const sectionInfo = parseSectionInfo(file);
    if (!sectionInfo) {
      console.warn(`⚠️  Skipping ${path.basename(file)} - couldn't parse section info`);
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8').trim();
    if (content.length < 50) {
      console.warn(`⚠️  Skipping ${path.basename(file)} - content too short`);
      continue;
    }
    
    sections.push({ file, sectionInfo, content });
  }

  if (sections.length === 0) {
    console.error('❌ No valid sections to process');
    process.exit(1);
  }

  // Sort sections
  sections.sort((a, b) => {
    if (a.sectionInfo.type === 'prologue') return -1;
    if (b.sectionInfo.type === 'prologue') return 1;
    if (a.sectionInfo.type === 'epilogue') return 1;
    if (b.sectionInfo.type === 'epilogue') return -1;
    return a.sectionInfo.number - b.sectionInfo.number;
  });

  console.log(`📝 Processing ${sections.length} sections...\n`);

  // Normalize book title
  const bookSlug = normalizeBookTitle(bookTitle);
  const chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  // Process each section
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (let i = 0; i < sections.length; i++) {
    const { file, sectionInfo, content } = sections[i];
    const sectionName = getSectionName(sectionInfo);
    
    try {
      console.log(`[${i + 1}/${sections.length}] Processing ${sectionName}...`);
      console.log(`   Source: ${path.basename(file)} (${content.length} chars)`);
      
      const notes = await transformSection(bookTitle, sectionInfo, content);
      
      const outputFile = path.join(chaptersDir, sectionInfo.filename);
      fs.writeFileSync(outputFile, notes, 'utf-8');
      
      console.log(`   ✅ Saved to: ${sectionInfo.filename}`);
      successCount++;
      
      // Rate limiting (2 seconds between requests)
      if (i < sections.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failCount++;
      failed.push(sectionName);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Complete!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`✅ Success: ${successCount} sections`);
  console.log(`❌ Failed: ${failCount} sections`);
  if (failed.length > 0) {
    console.log(`   Failed sections: ${failed.join(', ')}`);
  }
  console.log(`\n📁 Files saved to: ${chaptersDir}\n`);
  console.log(`💰 Estimated cost: ~$${(successCount * 0.04).toFixed(2)} (using GPT-4o)\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node batch-coppermind.js <bookTitle> <sectionsDir>');
    console.error('');
    console.error('Example:');
    console.error('  node batch-coppermind.js "Rhythm of War" coppermind-sections');
    console.error('');
    console.error('Setup:');
    console.error('  1. Create a directory: mkdir coppermind-sections');
    console.error('  2. Copy Coppermind summaries to text files:');
    console.error('     - coppermind-sections/prologue.txt');
    console.error('     - coppermind-sections/chapter-01.txt');
    console.error('     - coppermind-sections/chapter-02.txt');
    console.error('     - coppermind-sections/interlude-01.txt');
    console.error('     - coppermind-sections/epilogue.txt');
    console.error('  3. Run this script');
    process.exit(1);
  }

  const bookTitle = args[0];
  const sectionsDir = args[1];

  batchProcess(bookTitle, sectionsDir)
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { batchProcess };


#!/usr/bin/env node

/**
 * Scrape Coppermind directly for The Way of Kings
 * Automatically extracts all sections and handles part-based structure
 * 
 * Usage: node scrape-twok.js
 * 
 * This will:
 * 1. Fetch the Coppermind page for The Way of Kings
 * 2. Extract all sections (Prelude, Prologue, Chapters, Interludes, Epilogue)
 * 3. Use enhanced prompt (same as Rhythm of War)
 * 4. Save to correct part/interlude folders
 */

const https = require('https');
const http = require('http');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const fs = require('fs');
const path = require('path');

const BOOK_TITLE = 'The Way of Kings';
const COPPERMIND_URL = 'https://coppermind.net/wiki/Summary:The_Way_of_Kings';

// Part boundaries for TWoK
const PARTS = [
  { name: 'Part 1', start: 1, end: 11 },
  { name: 'Part 2', start: 12, end: 28 },
  { name: 'Part 3', start: 29, end: 51 },
  { name: 'Part 4', start: 52, end: 69 },
  { name: 'Part 5', start: 70, end: 75 }
];

// Interlude groupings
const INTERLUDES = [
  { group: 1, numbers: [1, 2, 3] },
  { group: 2, numbers: [4, 5, 6] },
  { group: 3, numbers: [7, 8, 9] }
];

/**
 * Fetch HTML from URL
 */
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Determine which part a chapter belongs to
 */
function getPartForChapter(chapterNum) {
  for (const part of PARTS) {
    if (chapterNum >= part.start && chapterNum <= part.end) {
      return part.name;
    }
  }
  return null;
}

/**
 * Determine which interlude group an interlude belongs to
 */
function getInterludeGroup(interludeNum) {
  for (const group of INTERLUDES) {
    if (group.numbers.includes(interludeNum)) {
      return group.group;
    }
  }
  return null;
}

/**
 * Extract all sections from Coppermind HTML
 * Handles: Prelude, Prologue, Chapters, Interludes, Epilogue
 */
function extractAllSections(html) {
  const sections = [];
  
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Find all section headings (h2, h3, or == markers)
  const markers = [];
  
  // Find h2/h3 headings
  const headingMatches = html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi);
  for (const match of headingMatches) {
    const level = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const position = match.index;
    
    // Check if it's a section heading
    if (/prelude/i.test(text) && !/prologue/i.test(text)) {
      markers.push({ type: 'prelude', identifier: 'prelude', position, text, level });
    } else if (/prologue/i.test(text)) {
      markers.push({ type: 'prologue', identifier: 'prologue', position, text, level });
    } else if (/epilogue/i.test(text)) {
      markers.push({ type: 'epilogue', identifier: 'epilogue', position, text, level });
    } else {
      // Check for Interlude I-X format
      const interludeMatch = text.match(/interlude\s+i[-\s]?(\d+)/i);
      if (interludeMatch) {
        const num = parseInt(interludeMatch[1]);
        markers.push({ type: 'interlude', number: num, identifier: `Interlude I-${num}`, position, text, level });
      } else {
        const chapterMatch = text.match(/chapter\s+(\d+)/i);
        if (chapterMatch) {
          const num = parseInt(chapterMatch[1]);
          markers.push({ type: 'chapter', number: num, identifier: num, position, text, level });
        }
      }
    }
  }
  
  // Sort by position
  markers.sort((a, b) => a.position - b.position);
  
  // Extract content for each section
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const nextMarker = markers[i + 1];
    
    const startPos = marker.position;
    const endPos = nextMarker ? nextMarker.position : html.length;
    
    // Extract content between markers
    let content = html.substring(startPos, endPos);
    
    // Remove the heading itself
    content = content.replace(/<h[23][^>]*>.*?<\/h[23]>/i, '');
    
    // Clean HTML but preserve line breaks and structure
    content = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();
    
    // Only include if there's substantial content
    if (content.length > 100) {
      sections.push({
        type: marker.type,
        number: marker.number,
        identifier: marker.identifier,
        title: marker.text,
        summary: content // Keep full content, let LLM process it
      });
    }
  }
  
  return sections;
}

/**
 * Transform section using enhanced prompt
 */
async function transformSection(section) {
  const sectionName = section.type === 'chapter' 
    ? `Chapter ${section.number}`
    : section.identifier;
  
  // Use the enhanced getChapterNotesPrompt with coppermindSummary parameter
  const prompt = getChapterNotesPrompt(
    BOOK_TITLE, 
    section.identifier, 
    null, // No chapter text
    section.summary // Coppermind summary
  );
  
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
 * Get output path for a section
 */
function getOutputPath(section) {
  const baseDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', 'the-way-of-kings', 'chapters');
  
  let filename;
  let subDir = null;
  
  if (section.type === 'prelude') {
    filename = 'prelude.md';
  } else if (section.type === 'prologue') {
    filename = 'prologue.md';
  } else if (section.type === 'epilogue') {
    filename = 'epilogue.md';
  } else if (section.type === 'interlude') {
    const group = getInterludeGroup(section.number);
    filename = `interlude-i-${String(section.number).padStart(2, '0')}.md`;
    subDir = `interlude-${group}`;
  } else if (section.type === 'chapter') {
    const part = getPartForChapter(section.number);
    filename = `chapter-${String(section.number).padStart(2, '0')}.md`;
    subDir = part;
  }
  
  if (subDir) {
    return { dir: path.join(baseDir, subDir), filename };
  }
  return { dir: baseDir, filename };
}

/**
 * Filter sections based on test criteria
 */
function filterSections(sections, filterOptions = {}) {
  if (!filterOptions || Object.keys(filterOptions).length === 0) {
    return sections; // No filter, return all
  }
  
  return sections.filter(section => {
    // Include prelude if requested
    if (filterOptions.prelude && section.type === 'prelude') return true;
    
    // Include prologue if requested
    if (filterOptions.prologue && section.type === 'prologue') return true;
    
    // Include chapters in range
    if (filterOptions.chapters && section.type === 'chapter') {
      const chapterRange = filterOptions.chapters.split('-').map(n => parseInt(n.trim()));
      if (chapterRange.length === 1) {
        return section.number === chapterRange[0];
      } else if (chapterRange.length === 2) {
        return section.number >= chapterRange[0] && section.number <= chapterRange[1];
      }
    }
    
    // Include interludes if specified
    if (filterOptions.interludes && section.type === 'interlude') {
      const interludeList = filterOptions.interludes.split(',').map(n => parseInt(n.trim()));
      return interludeList.includes(section.number);
    }
    
    // Include epilogue if requested
    if (filterOptions.epilogue && section.type === 'epilogue') return true;
    
    return false;
  });
}

/**
 * Main function
 */
async function scrapeAndTransformTWoK(filterOptions = {}) {
  console.log(`\n📚 Scraping Coppermind for ${BOOK_TITLE}\n`);
  console.log(`URL: ${COPPERMIND_URL}\n`);

  // Fetch the page
  console.log('🌐 Fetching Coppermind page...');
  let html;
  try {
    html = await fetchURL(COPPERMIND_URL);
    console.log(`✅ Fetched ${html.length} characters\n`);
  } catch (error) {
    console.error('❌ Failed to fetch URL:', error.message);
    process.exit(1);
  }

  // Save HTML for debugging
  const debugFile = path.join(__dirname, '..', 'coppermind-debug.html');
  fs.writeFileSync(debugFile, html, 'utf-8');
  console.log(`💾 Saved HTML to ${path.relative(process.cwd(), debugFile)} for debugging`);

  // Extract all sections
  console.log('📖 Extracting all sections (Prelude, Prologue, Chapters, Interludes, Epilogue)...');
  let sections = extractAllSections(html);
  console.log(`✅ Found ${sections.length} total sections\n`);
  
  // Apply filters if specified
  if (filterOptions && Object.keys(filterOptions).length > 0) {
    sections = filterSections(sections, filterOptions);
    console.log(`🔍 Filtered to ${sections.length} sections:\n`);
  } else {
    console.log(`📋 All sections found:\n`);
  }
  
  sections.forEach(s => {
    const name = s.type === 'chapter' ? `Chapter ${s.number}` : s.identifier;
    console.log(`   - ${name} (${s.summary.length} chars)`);
  });
  console.log('');

  if (sections.length === 0) {
    console.error('❌ No sections found. The page structure might be different.');
    console.error('💡 Try: Open the URL in a browser, view page source, and check the HTML structure.');
    process.exit(1);
  }

  // Setup output directory structure
  const baseDir = path.join(__dirname, '..', 'rag', 'Series', 'The Stormlight Archive', 'books', 'the-way-of-kings', 'chapters');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Process each section
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionName = section.type === 'chapter' 
      ? `Chapter ${section.number}`
      : section.identifier;
    
    try {
      console.log(`\n[${i + 1}/${sections.length}] Processing ${sectionName}...`);
      console.log(`   Summary length: ${section.summary.length} characters`);
      
      const notes = await transformSection(section);
      
      const { dir, filename } = getOutputPath(section);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const outputFile = path.join(dir, filename);
      fs.writeFileSync(outputFile, notes, 'utf-8');
      
      const relativePath = path.relative(process.cwd(), outputFile);
      console.log(`   ✅ Saved to: ${relativePath}`);
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
  console.log(`\n📁 Files saved to: ${baseDir}\n`);
  console.log(`💰 Estimated cost: ~$${(successCount * 0.04).toFixed(2)} (using GPT-4o)\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Check for auto-yes flag
  const autoYes = args.includes('--yes') || args.includes('-y');
  
  // Parse filter options from command line
  const filterOptions = {};
  
  // Check for test mode or specific filters
  if (args.includes('--test') || args.includes('-t')) {
    // Test mode: prelude, prologue, chapters 1-5
    filterOptions.prelude = true;
    filterOptions.prologue = true;
    filterOptions.chapters = '1-5';
  } else {
    // Parse individual filter arguments
    if (args.includes('--prelude')) filterOptions.prelude = true;
    if (args.includes('--prologue')) filterOptions.prologue = true;
    if (args.includes('--epilogue')) filterOptions.epilogue = true;
    
    // Parse chapter range: --chapters 1-5 or --chapters 1,2,3
    const chaptersIdx = args.indexOf('--chapters');
    if (chaptersIdx !== -1 && args[chaptersIdx + 1]) {
      filterOptions.chapters = args[chaptersIdx + 1];
    }
    
    // Parse interlude list: --interludes 1,2,3
    const interludesIdx = args.indexOf('--interludes');
    if (interludesIdx !== -1 && args[interludesIdx + 1]) {
      filterOptions.interludes = args[interludesIdx + 1];
    }
  }
  
  const hasFilters = Object.keys(filterOptions).length > 0;
  const sectionCount = hasFilters ? 
    (filterOptions.prelude ? 1 : 0) + 
    (filterOptions.prologue ? 1 : 0) + 
    (filterOptions.chapters ? (filterOptions.chapters.includes('-') ? 5 : filterOptions.chapters.split(',').length) : 0) +
    (filterOptions.interludes ? filterOptions.interludes.split(',').length : 0) +
    (filterOptions.epilogue ? 1 : 0) :
    87; // All sections
  
  const estimatedCost = sectionCount * 0.04;
  const estimatedTime = sectionCount * 0.5; // ~30 seconds per section

  // Confirm before starting
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\n${hasFilters ? '🧪 TEST MODE' : '⚠️  WARNING'}: This will scrape and process sections from Coppermind.`);
  console.log(`   Book: ${BOOK_TITLE}`);
  console.log(`   URL: ${COPPERMIND_URL}`);
  if (hasFilters) {
    console.log(`   Filters: ${JSON.stringify(filterOptions)}`);
  }
  console.log(`   Sections to process: ~${sectionCount}`);
  console.log(`   Estimated cost: ~$${estimatedCost.toFixed(2)} (using GPT-4o)`);
  console.log(`   Estimated time: ~${Math.round(estimatedTime)} minutes\n`);

  const runScrape = async () => {
    scrapeAndTransformTWoK(hasFilters ? filterOptions : {})
      .then(() => {
        console.log('✨ All done!');
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
      });
  };

  if (autoYes) {
    console.log('🚀 Auto-confirmed. Starting scrape...\n');
    runScrape();
  } else {
    readline.question('Continue? (y/n): ', async (answer) => {
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        process.exit(0);
      }

      runScrape();
    });
  }
}

module.exports = { scrapeAndTransformTWoK, extractAllSections, fetchURL };


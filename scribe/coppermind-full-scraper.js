#!/usr/bin/env node

/**
 * Full scraper for Coppermind - extracts and transforms ALL sections
 * Usage: node coppermind-full-scraper.js <coppermind-url> <bookTitle>
 * Example: node coppermind-full-scraper.js "https://coppermind.net/wiki/Summary:Rhythm_of_War" "Rhythm of War"
 */

const https = require('https');
const http = require('http');
const { generateContent } = require('./llm-client');
const { normalizeBookTitle } = require('../utils/rag-loader');
const { CHAPTER_NOTES_TEMPLATE } = require('./prompts');
const fs = require('fs');
const path = require('path');

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
 * Extract all sections from Coppermind HTML
 * Handles: Prologue, Chapters, Interludes, Epilogue
 */
function extractAllSections(html) {
  const sections = [];
  
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Pattern to find section headings (h2, h3, or == markers)
  // Look for: Prologue, Chapter X, Interlude X, Epilogue
  const sectionPatterns = [
    /<h[23][^>]*>.*?(?:Prologue|Prelude)[^<]*<\/h[23]>/i,
    /<h[23][^>]*>.*?Chapter\s+(\d+)[^<]*<\/h[23]>/gi,
    /<h[23][^>]*>.*?Interlude\s+(\d+)[^<]*<\/h[23]>/gi,
    /<h[23][^>]*>.*?Epilogue[^<]*<\/h[23]>/i,
    // Also try == markers (wiki format)
    /==\s*(?:Prologue|Prelude)\s*==/i,
    /==\s*Chapter\s+(\d+)\s*==/gi,
    /==\s*Interlude\s+(\d+)\s*==/gi,
    /==\s*Epilogue\s*==/i
  ];
  
  // Find all section markers
  const markers = [];
  
  // Find h2/h3 headings
  const headingMatches = html.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi);
  for (const match of headingMatches) {
    const level = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const position = match.index;
    
    // Check if it's a section heading
    if (/prologue|prelude/i.test(text)) {
      markers.push({ type: 'prologue', number: 0, position, text, level });
    } else if (/epilogue/i.test(text)) {
      markers.push({ type: 'epilogue', number: 999, position, text, level });
    } else {
      const chapterMatch = text.match(/chapter\s+(\d+)/i);
      if (chapterMatch) {
        markers.push({ type: 'chapter', number: parseInt(chapterMatch[1]), position, text, level });
      }
      const interludeMatch = text.match(/interlude\s+(\d+)/i);
      if (interludeMatch) {
        markers.push({ type: 'interlude', number: parseInt(interludeMatch[1]), position, text, level });
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
    
    // Clean HTML
    content = content
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // Only include if there's substantial content
    if (content.length > 100) {
      sections.push({
        type: marker.type,
        number: marker.number,
        title: marker.text,
        summary: content.substring(0, 3000) // Limit length
      });
    }
  }
  
  return sections;
}

/**
 * Get chapter number for file naming
 */
function getChapterNumber(section) {
  if (section.type === 'prologue') return 0;
  if (section.type === 'epilogue') return 999;
  if (section.type === 'interlude') return section.number + 1000; // Interludes as 1001, 1002, etc.
  return section.number; // Regular chapters
}

/**
 * Get display name for section
 */
function getSectionName(section) {
  if (section.type === 'prologue') return 'Prologue';
  if (section.type === 'epilogue') return 'Epilogue';
  if (section.type === 'interlude') return `Interlude ${section.number}`;
  return `Chapter ${section.number}`;
}

/**
 * Transform Coppermind summary into Docent chapter notes
 */
async function transformSectionToNotes(bookTitle, section) {
  const sectionName = getSectionName(section);
  const chapterNum = getChapterNumber(section);
  
  const prompt = `You are transforming a Coppermind wiki summary into detailed chapter notes for Docent, a fantasy reading companion app.

BOOK: ${bookTitle}
SECTION: ${sectionName}

COPPERMIND SUMMARY:
${section.summary}

TASK: Transform this summary into comprehensive chapter notes using the EXACT template structure below. Fill in all sections based on the summary and your knowledge of the book.

CRITICAL RULES:
1. Only include information from THIS SECTION (${sectionName})
2. Do NOT reference or hint at events from later sections
3. Be comprehensive - expand on the summary with details, character development, themes
4. Use the EXACT template structure provided
5. Mark callbacks to earlier chapters explicitly (e.g., "Callback to Chapter X")
6. Flag potential confusion points that readers commonly struggle with
7. Include "If Asked" notes for common questions about this section
8. Add details about characters, locations, magic/mechanics, themes, and foreshadowing
9. For Prologue/Interlude/Epilogue: Note that these are special sections, not regular chapters

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
    console.error(`❌ Failed to transform ${sectionName}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function scrapeAndTransformAll(coppermindURL, bookTitle) {
  console.log(`\n📚 Scraping Coppermind and transforming ALL sections to Docent notes\n`);
  console.log(`URL: ${coppermindURL}`);
  console.log(`Book: ${bookTitle}\n`);

  // Fetch the page
  console.log('🌐 Fetching Coppermind page...');
  let html;
  try {
    html = await fetchURL(coppermindURL);
    console.log(`✅ Fetched ${html.length} characters\n`);
  } catch (error) {
    console.error('❌ Failed to fetch URL:', error.message);
    process.exit(1);
  }

  // Save HTML for debugging
  fs.writeFileSync('/tmp/coppermind-raw.html', html, 'utf-8');
  console.log('💾 Saved raw HTML to /tmp/coppermind-raw.html for debugging\n');

  // Extract all sections
  console.log('📖 Extracting all sections (Prologue, Chapters, Interludes, Epilogue)...');
  const sections = extractAllSections(html);
  console.log(`✅ Found ${sections.length} sections:\n`);
  
  sections.forEach(s => {
    console.log(`   - ${getSectionName(s)} (${s.summary.length} chars)`);
  });
  console.log('');

  if (sections.length === 0) {
    console.error('❌ No sections found. The page structure might be different.');
    console.error('💡 Check /tmp/coppermind-raw.html to see the HTML structure');
    process.exit(1);
  }

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
    const section = sections[i];
    const sectionName = getSectionName(section);
    const chapterNum = getChapterNumber(section);
    
    try {
      console.log(`\n[${i + 1}/${sections.length}] Processing ${sectionName}...`);
      console.log(`   Summary length: ${section.summary.length} characters`);
      
      const notes = await transformSectionToNotes(bookTitle, section);
      
      // Determine filename
      let filename;
      if (section.type === 'prologue') {
        filename = 'prologue.md';
      } else if (section.type === 'epilogue') {
        filename = 'epilogue.md';
      } else if (section.type === 'interlude') {
        filename = `interlude-${String(section.number).padStart(2, '0')}.md`;
      } else {
        filename = `chapter-${String(section.number).padStart(2, '0')}.md`;
      }
      
      const outputFile = path.join(chaptersDir, filename);
      fs.writeFileSync(outputFile, notes, 'utf-8');
      
      console.log(`   ✅ Saved to: ${filename}`);
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
    console.error('Usage: node coppermind-full-scraper.js <coppermind-url> <bookTitle>');
    console.error('');
    console.error('Example:');
    console.error('  node coppermind-full-scraper.js "https://coppermind.net/wiki/Summary:Rhythm_of_War" "Rhythm of War"');
    console.error('');
    console.error('This will:');
    console.error('  1. Fetch the Coppermind page');
    console.error('  2. Extract ALL sections (Prologue, Chapters, Interludes, Epilogue)');
    console.error('  3. Transform each into Docent chapter notes format');
    console.error('  4. Save them all to the correct location');
    process.exit(1);
  }

  const coppermindURL = args[0];
  const bookTitle = args[1];

  if (!coppermindURL.startsWith('http')) {
    console.error('❌ URL must start with http:// or https://');
    process.exit(1);
  }

  // Confirm before starting (this is expensive!)
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\n⚠️  WARNING: This will process ALL sections from the Coppermind page.`);
  console.log(`   Estimated cost: ~$5-10 (using GPT-4o)`);
  console.log(`   Estimated time: ~1-2 hours\n`);

  readline.question('Continue? (y/n): ', async (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    scrapeAndTransformAll(coppermindURL, bookTitle)
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

module.exports = { scrapeAndTransformAll, extractAllSections, fetchURL };



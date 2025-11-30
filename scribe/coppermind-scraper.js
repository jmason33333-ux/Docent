#!/usr/bin/env node

/**
 * Scrape and transform Coppermind chapter summaries into Docent chapter notes
 * Usage: node coppermind-scraper.js <coppermind-url> <bookTitle> [startChapter] [endChapter]
 * Example: node coppermind-scraper.js "https://coppermind.net/wiki/Summary:Rhythm_of_War" "Rhythm of War"
 */

const https = require('https');
const http = require('http');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');
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
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract chapter summaries from Coppermind HTML
 */
function extractChapterSummaries(html) {
  const chapters = [];
  
  // Coppermind uses <h2> or <h3> tags for chapter headings
  // Look for patterns like "Chapter 1", "Chapter 1:", "Chapter 1 - Title", etc.
  const chapterPattern = /<h[23][^>]*>.*?Chapter\s+(\d+)[^<]*<\/h[23]>/gi;
  const chapterMatches = [...html.matchAll(chapterPattern)];
  
  // Also try to find chapter sections in the content
  // Coppermind often has sections like "== Chapter 1 ==" or similar
  const sectionPattern = /(?:==|###)\s*Chapter\s+(\d+)[^=]*==/gi;
  const sectionMatches = [...html.matchAll(sectionPattern)];
  
  // Combine and deduplicate
  const allChapters = new Set();
  chapterMatches.forEach(m => allChapters.add(parseInt(m[1])));
  sectionMatches.forEach(m => allChapters.add(parseInt(m[1])));
  
  // Extract content for each chapter
  for (const chapterNum of Array.from(allChapters).sort((a, b) => a - b)) {
    // Try to extract the chapter content
    // Look for content between chapter headings
    const nextChapter = Array.from(allChapters).find(c => c > chapterNum);
    const chapterRegex = new RegExp(
      `(?:Chapter\\s+${chapterNum}[^<]*<\\/h[23]>|==\\s*Chapter\\s+${chapterNum}[^=]*==)` +
      `([\\s\\S]*?)` +
      (nextChapter 
        ? `(?:Chapter\\s+${nextChapter}|==\\s*Chapter\\s+${nextChapter})`
        : '(?:<h[23]|==|$)'),
      'i'
    );
    
    const match = html.match(chapterRegex);
    if (match && match[1]) {
      // Clean HTML tags but keep structure
      let content = match[1]
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (content.length > 50) { // Only include if there's substantial content
        chapters.push({
          number: chapterNum,
          summary: content.substring(0, 2000) // Limit length
        });
      }
    }
  }
  
  // If structured extraction failed, try to find all chapter mentions and extract surrounding text
  if (chapters.length === 0) {
    console.log('⚠️  Structured extraction failed, trying alternative method...');
    
    // Look for chapter numbers in the text
    const chapterMentions = html.match(/Chapter\s+(\d+)/gi);
    if (chapterMentions) {
      const uniqueChapters = [...new Set(chapterMentions.map(m => {
        const num = parseInt(m.match(/\d+/)[0]);
        return num;
      }))].sort((a, b) => a - b);
      
      console.log(`Found ${uniqueChapters.length} chapter mentions`);
      
      // For each chapter, try to extract a summary
      for (const chapterNum of uniqueChapters) {
        // Find the chapter mention and extract surrounding paragraph
        const regex = new RegExp(
          `Chapter\\s+${chapterNum}[^<]*([^<]{100,500})`,
          'i'
        );
        const match = html.match(regex);
        if (match && match[1]) {
          chapters.push({
            number: chapterNum,
            summary: match[1].trim().substring(0, 1000)
          });
        }
      }
    }
  }
  
  return chapters;
}

/**
 * Transform Coppermind summary into Docent chapter notes format
 */
async function transformSummaryToNotes(bookTitle, chapterNumber, coppermindSummary) {
  const prompt = `You are transforming a Coppermind wiki summary into detailed chapter notes for Docent, a fantasy reading companion app.

BOOK: ${bookTitle}
CHAPTER: ${chapterNumber}

COPPERMIND SUMMARY:
${coppermindSummary}

TASK: Transform this summary into comprehensive chapter notes using the EXACT template structure below. Fill in all sections based on the summary and your knowledge of the book.

CRITICAL RULES:
1. Only include information from THIS CHAPTER (Chapter ${chapterNumber})
2. Do NOT reference or hint at events from later chapters
3. Be comprehensive - expand on the summary with details
4. Use the EXACT template structure provided
5. Mark callbacks to earlier chapters explicitly
6. Flag potential confusion points
7. Include "If Asked" notes for common questions

Use this EXACT template:
${require('./prompts').CHAPTER_NOTES_TEMPLATE}

Now generate the complete chapter notes for Chapter ${chapterNumber} of ${bookTitle} based on the Coppermind summary above.`;

  try {
    const notes = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
    return notes;
  } catch (error) {
    console.error(`❌ Failed to transform Chapter ${chapterNumber}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function scrapeAndTransform(coppermindURL, bookTitle, startChapter = 1, endChapter = null) {
  console.log(`\n📚 Scraping Coppermind and transforming to Docent notes\n`);
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

  // Extract chapter summaries
  console.log('📖 Extracting chapter summaries...');
  const chapters = extractChapterSummaries(html);
  console.log(`✅ Found ${chapters.length} chapters\n`);

  if (chapters.length === 0) {
    console.error('❌ No chapters found. The page structure might be different.');
    console.error('💡 Try: Open the URL in a browser, view page source, and check the HTML structure.');
    process.exit(1);
  }

  // Filter chapters if range specified
  const chaptersToProcess = chapters.filter(c => {
    if (startChapter && c.number < startChapter) return false;
    if (endChapter && c.number > endChapter) return false;
    return true;
  });

  console.log(`📝 Processing ${chaptersToProcess.length} chapters...\n`);

  // Normalize book title
  const bookSlug = normalizeBookTitle(bookTitle);
  const chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  // Process each chapter
  let successCount = 0;
  let failCount = 0;

  for (const chapter of chaptersToProcess) {
    try {
      console.log(`\n[${chapter.number}/${chaptersToProcess.length}] Processing Chapter ${chapter.number}...`);
      console.log(`   Summary length: ${chapter.summary.length} characters`);
      
      const notes = await transformSummaryToNotes(bookTitle, chapter.number, chapter.summary);
      
      const outputFile = path.join(chaptersDir, `chapter-${String(chapter.number).padStart(2, '0')}.md`);
      fs.writeFileSync(outputFile, notes, 'utf-8');
      
      console.log(`   ✅ Saved to: ${outputFile}`);
      successCount++;
      
      // Rate limiting
      if (chapter.number < chaptersToProcess[chaptersToProcess.length - 1].number) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Complete!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`✅ Success: ${successCount} chapters`);
  console.log(`❌ Failed: ${failCount} chapters`);
  console.log(`\n📁 Files saved to: ${chaptersDir}\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node coppermind-scraper.js <coppermind-url> <bookTitle> [startChapter] [endChapter]');
    console.error('');
    console.error('Examples:');
    console.error('  node coppermind-scraper.js "https://coppermind.net/wiki/Summary:Rhythm_of_War" "Rhythm of War"');
    console.error('  node coppermind-scraper.js "https://coppermind.net/wiki/Summary:Rhythm_of_War" "Rhythm of War" 1 50');
    process.exit(1);
  }

  const coppermindURL = args[0];
  const bookTitle = args[1];
  const startChapter = args[2] ? parseInt(args[2], 10) : 1;
  const endChapter = args[3] ? parseInt(args[3], 10) : null;

  if (!coppermindURL.startsWith('http')) {
    console.error('❌ URL must start with http:// or https://');
    process.exit(1);
  }

  scrapeAndTransform(coppermindURL, bookTitle, startChapter, endChapter)
    .then(() => {
      console.log('✨ All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { scrapeAndTransform, extractChapterSummaries, fetchURL };



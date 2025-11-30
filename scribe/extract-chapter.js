#!/usr/bin/env node

/**
 * Extract chapter text from ebook files
 * Supports: EPUB, PDF, MOBI (via Calibre's ebook-convert)
 * 
 * Usage: node extract-chapter.js <ebook-file> <chapter-number> [output-file]
 * Example: node extract-chapter.js "Words of Radiance.epub" 1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Check if Calibre's ebook-convert is available
 */
function hasEbookConvert() {
  try {
    execSync('which ebook-convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract text from EPUB using ebook-convert
 */
function extractFromEpub(epubPath, chapterNumber) {
  if (!hasEbookConvert()) {
    throw new Error('ebook-convert not found. Install Calibre: https://calibre-ebook.com/download');
  }

  // Convert EPUB to plain text
  const tempTxt = path.join(__dirname, '..', 'temp-chapters.txt');
  
  try {
    execSync(`ebook-convert "${epubPath}" "${tempTxt}"`, { stdio: 'inherit' });
    
    // Read the converted text
    let fullText = fs.readFileSync(tempTxt, 'utf-8');
    
    // Try to extract the specific chapter
    // EPUB chapters are often separated by patterns like "Chapter X", "CHAPTER X", etc.
    const chapterPatterns = [
      new RegExp(`(?:^|\\n)(?:Chapter|CHAPTER|CH\\.?)\\s+${chapterNumber}[^\\d].*?(?=(?:^|\\n)(?:Chapter|CHAPTER|CH\\.?)\\s+${chapterNumber + 1}[^\\d]|$)`, 'is'),
      new RegExp(`(?:^|\\n)${chapterNumber}\\s*[\\n\\r].*?(?=(?:^|\\n)${chapterNumber + 1}\\s*[\\n\\r]|$)`, 'is'),
    ];

    let chapterText = null;
    for (const pattern of chapterPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        chapterText = match[0].trim();
        break;
      }
    }

    // If no pattern match, try to split by common separators
    if (!chapterText) {
      const sections = fullText.split(/\n\s*\n\s*\n/); // Split by double newlines
      if (sections.length >= chapterNumber) {
        chapterText = sections[chapterNumber - 1];
      } else {
        // Fallback: return full text with a note
        chapterText = fullText;
        console.log('⚠️  Could not isolate chapter - returning full text');
      }
    }

    // Clean up temp file
    fs.unlinkSync(tempTxt);
    
    return chapterText;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(tempTxt)) {
      fs.unlinkSync(tempTxt);
    }
    throw error;
  }
}

/**
 * Extract text from PDF (basic - may need improvement)
 */
function extractFromPdf(pdfPath, chapterNumber) {
  // PDF extraction is more complex - would need pdf-parse or similar
  throw new Error('PDF extraction not yet implemented. Convert to EPUB first or use a PDF text extractor.');
}

/**
 * Main extraction function
 */
function extractChapter(ebookPath, chapterNumber, outputPath = null) {
  if (!fs.existsSync(ebookPath)) {
    throw new Error(`Ebook file not found: ${ebookPath}`);
  }

  const ext = path.extname(ebookPath).toLowerCase();
  let chapterText;

  console.log(`📖 Extracting Chapter ${chapterNumber} from ${path.basename(ebookPath)}...\n`);

  switch (ext) {
    case '.epub':
      chapterText = extractFromEpub(ebookPath, chapterNumber);
      break;
    case '.pdf':
      chapterText = extractFromPdf(pdfPath, chapterNumber);
      break;
    case '.mobi':
    case '.azw':
    case '.azw3':
      // MOBI files can be converted via Calibre
      console.log('Converting MOBI to text...');
      chapterText = extractFromEpub(ebookPath, chapterNumber); // Same process
      break;
    default:
      throw new Error(`Unsupported format: ${ext}. Supported: .epub, .pdf, .mobi, .azw, .azw3`);
  }

  // Save to output file or return
  if (outputPath) {
    fs.writeFileSync(outputPath, chapterText, 'utf-8');
    console.log(`✅ Chapter text saved to: ${outputPath}`);
    console.log(`   Length: ${chapterText.length} characters\n`);
    return outputPath;
  }

  return chapterText;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node extract-chapter.js <ebook-file> <chapter-number> [output-file]');
    console.error('');
    console.error('Examples:');
    console.error('  node extract-chapter.js "Words of Radiance.epub" 1');
    console.error('  node extract-chapter.js "Words of Radiance.epub" 1 chapter-01.txt');
    console.error('');
    console.error('Requirements:');
    console.error('  - Calibre installed (for EPUB/MOBI): https://calibre-ebook.com/download');
    console.error('  - ebook-convert command available');
    process.exit(1);
  }

  const ebookPath = args[0];
  const chapterNumber = parseInt(args[1], 10);
  const outputPath = args[2] || `chapter-${String(chapterNumber).padStart(2, '0')}.txt`;

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    console.error('❌ Chapter number must be a positive integer');
    process.exit(1);
  }

  try {
    extractChapter(ebookPath, chapterNumber, outputPath);
    console.log('✨ Done!');
    console.log(`\nNext step: Use this text file with the chapter generator:`);
    console.log(`  node scribe/generate-chapter.js "${path.basename(ebookPath, path.extname(ebookPath))}" ${chapterNumber} --text ${outputPath}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { extractChapter, hasEbookConvert };



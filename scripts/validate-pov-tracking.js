#!/usr/bin/env node
/**
 * POV Tracking Validation Script
 * 
 * Validates "Chapters Since Last [Character] POV" entries in chapter notes
 * Checks for accuracy and consistency across all chapters
 * 
 * Usage:
 *   node scripts/validate-pov-tracking.js [book-title]
 * 
 * If no book specified, validates all books found
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { normalizeBookTitle } = require('../utils/rag-loader');
const { detectPartStructure, findChapterFile } = require('../utils/chapter-index');

function validatePOVTracking(bookTitle) {
  const bookSlug = normalizeBookTitle(bookTitle);
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  
  // Find book path
  let bookPath = null;
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };

  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const potentialPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    if (fs.existsSync(potentialPath)) {
      bookPath = potentialPath;
    }
  }

  if (!bookPath) {
    bookPath = path.join(__dirname, '..', 'rag', 'books', bookSlug);
    if (!fs.existsSync(bookPath)) {
      console.log(`❌ Book not found: ${bookTitle} (${bookSlug})`);
      return { errors: [], warnings: [] };
    }
  }

  const errors = [];
  const warnings = [];
  const povHistory = {}; // Track last POV for each character

  // Get all chapters
  const parts = detectPartStructure(bookPath);
  let allChapters = [];
  parts.forEach(part => {
    allChapters.push(...part.chapters);
  });

  if (allChapters.length === 0) {
    const chaptersDir = path.join(bookPath, 'chapters');
    if (fs.existsSync(chaptersDir)) {
      const files = fs.readdirSync(chaptersDir).filter(f => f.match(/^chapter-\d+\.md$/));
      allChapters = files.map(f => parseInt(f.match(/chapter-(\d+)\.md/)[1])).sort((a, b) => a - b);
    }
  }

  console.log(`\n🔍 Validating POV tracking for ${bookTitle}...`);
  console.log(`   Found ${allChapters.length} chapters\n`);

  // Validate each chapter
  for (const chapterNum of allChapters) {
    const chapterFile = findChapterFile(bookPath, chapterNum);
    if (!chapterFile || !fs.existsSync(chapterFile)) {
      warnings.push(`Chapter ${chapterNum}: File not found`);
      continue;
    }

    try {
      const content = fs.readFileSync(chapterFile, 'utf-8');
      
      // Extract POV characters from metadata
      const povMatch = content.match(/- \*\*POV Character\(s\):\*\* (.+)/i);
      const povCharacters = povMatch ? povMatch[1].split(',').map(c => c.trim()) : [];

      // Extract "Chapters Since Last POV" entries
      const sinceLastMatch = content.match(/## Metadata[\s\S]*?Chapters Since Last (.+?) POV:\*\* (.+?)(?=\n|$)/gi);
      
      if (sinceLastMatch) {
        sinceLastMatch.forEach(match => {
          const charMatch = match.match(/Chapters Since Last (.+?) POV:\*\* (.+?)(?=\n|$)/i);
          if (charMatch) {
            const character = charMatch[1].trim();
            const statedSince = charMatch[2].trim();

            // Check if this is first POV
            if (!povHistory[character]) {
              // First POV - should say "First [Character] POV" or similar
              if (!statedSince.toLowerCase().includes('first') && !statedSince.toLowerCase().includes('introduction')) {
                errors.push(`Ch ${chapterNum}: "${character}" first POV, but says "${statedSince}" (should indicate it's first)`);
              }
              povHistory[character] = chapterNum;
            } else {
              // Not first POV - validate the stated chapter
              const lastPOV = povHistory[character];
              const chaptersSince = chapterNum - lastPOV;
              
              // Check if it references the correct previous chapter
              if (!statedSince.includes(`Chapter ${lastPOV}`) && !statedSince.includes(`Ch ${lastPOV}`)) {
                errors.push(`Ch ${chapterNum}: "${character}" says "${statedSince}", but last POV was Ch ${lastPOV} (${chaptersSince} chapters ago)`);
              }
              
              // Update last POV
              povHistory[character] = chapterNum;
            }
          }
        });
      }

      // Update POV history for current chapter
      povCharacters.forEach(char => {
        if (!povHistory[char] || povHistory[char] !== chapterNum) {
          povHistory[char] = chapterNum;
        }
      });

    } catch (error) {
      errors.push(`Chapter ${chapterNum}: Error reading file - ${error.message}`);
    }
  }

  return { errors, warnings };
}

// Main execution
const bookTitle = process.argv[2];
const { getAvailableBooks } = require('../utils/rag-loader');

if (bookTitle) {
  console.log(`\n🔍 Validating POV tracking for: ${bookTitle}\n`);
  const result = validatePOVTracking(bookTitle);
  
  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('✅ No POV tracking errors found!\n');
  } else {
    if (result.errors.length > 0) {
      console.log(`\n❌ Found ${result.errors.length} error(s):\n`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Found ${result.warnings.length} warning(s):\n`);
      result.warnings.forEach(warn => console.log(`   - ${warn}`));
    }
    console.log('');
  }
} else {
  console.log(`\n🔍 Validating POV tracking for ALL books...\n`);
  const books = getAvailableBooks();
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  books.forEach(book => {
    console.log(`\n📚 ${book}:`);
    const result = validatePOVTracking(book);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    
    if (result.errors.length > 0 || result.warnings.length > 0) {
      result.errors.forEach(err => console.log(`   ❌ ${err}`));
      result.warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
    } else {
      console.log(`   ✅ No issues`);
    }
  });
  
  console.log(`\n📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings across ${books.length} book(s)\n`);
}


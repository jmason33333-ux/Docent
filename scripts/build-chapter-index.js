#!/usr/bin/env node
/**
 * Build Chapter Index - Parses all chapter notes and builds index
 * 
 * Usage:
 *   node scripts/build-chapter-index.js [book-title]
 * 
 * If no book specified, builds index for all books found
 */

require('dotenv').config();
const { buildAndSaveIndex, loadChapterIndex } = require('../utils/chapter-index');
const { getAvailableBooks } = require('../utils/rag-loader');

const bookTitle = process.argv[2];

if (bookTitle) {
  console.log(`\n🔍 Building chapter index for: ${bookTitle}\n`);
  buildAndSaveIndex(bookTitle);
  console.log(`\n✅ Index built successfully!\n`);
} else {
  console.log(`\n🔍 Building chapter index for ALL books...\n`);
  const books = getAvailableBooks();
  
  if (books.length === 0) {
    console.log('❌ No books found!\n');
    process.exit(1);
  }

  books.forEach(book => {
    console.log(`\n📚 Processing: ${book}`);
    buildAndSaveIndex(book);
  });

  const index = loadChapterIndex();
  const bookCount = Object.keys(index).length;
  console.log(`\n✅ Index built for ${bookCount} book(s)!\n`);
}


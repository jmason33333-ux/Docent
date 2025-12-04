# Scribe - Chapter Notes Generation System

**Purpose:** Generate high-quality chapter notes, knowledge snapshots, and book summaries for Rowan's RAG system.

---

## 🎯 Core Workflow Files

### **1. prompts.js** ⭐ SOURCE OF TRUTH
**Purpose:** Contains all prompt templates and generation logic
- `CHAPTER_NOTES_TEMPLATE` - Structure for chapter notes
- `KNOWLEDGE_SNAPSHOT_TEMPLATE` - Structure for cumulative snapshots
- `BOOK_SUMMARY_TEMPLATE` - Structure for spoiler-free summaries
- `getChapterNotesPrompt()` - Generates prompts for chapter notes
- `getKnowledgeSnapshotPrompt()` - Generates prompts for snapshots
- **Recently optimized** (Dec 2, 2025) with best of RoW + WoK outputs
- **Status:** Active, maintained

### **2. llm-client.js**
**Purpose:** OpenAI API wrapper
- Handles API calls to GPT-4/GPT-4o
- Manages retries and error handling
- Used by all generation scripts
- **Status:** Active, maintained

---

## 📖 E-Book Processing (Primary Workflow)

### **3. extract-chapter.js**
**Purpose:** Extract chapter text from e-book files (EPUB, MOBI, etc.)
- Uses Calibre's ebook-convert CLI tool
- Converts e-book → plain text
- Attempts to isolate specific chapters
- **Requirements:** Calibre installed
- **Usage:** node extract-chapter.js "book.epub" 1 output.txt
- **Status:** Active, core for non-wiki books

### **4. generate-from-file.js**
**Purpose:** Generate chapter notes from extracted text file
- Takes plain text file → generates formatted notes
- Cleans up Apple Books metadata
- Uses prompts.js templates
- **Usage:** node generate-from-file.js "Book Title" 1 chapter-01.txt
- **Status:** Active, core for non-wiki books

**E-Book Workflow:**
```bash
# 1. Extract chapter from EPUB
node extract-chapter.js "hierarchy-book1.epub" 1 extracted/ch1.txt

# 2. Generate notes from extracted text
node generate-from-file.js "The Strength of the Few" 1 extracted/ch1.txt
```

---

## 📚 Coppermind Processing (Sanderson Books)

### **5. coppermind-scraper.js**
**Purpose:** Scrape chapter summaries from Coppermind wiki
- Fetches summaries for Sanderson books
- Formats for chapter note generation
- **Usage:** For Sanderson books with wiki summaries
- **Status:** Active, for Sanderson-only

### **6. batch-coppermind.js**
**Purpose:** Batch process multiple Coppermind summaries
- Processes entire books at once
- Efficient for books with complete wiki coverage
- **Usage:** node batch-coppermind.js "Book Title" summaries-dir/
- **Status:** Active, for batch Sanderson processing

---

## 🎯 Single Chapter Generation

### **7. generate-chapter.js**
**Purpose:** Main single chapter generator (most flexible)
- Can accept chapter text OR Coppermind summary
- Flexible input methods (--text flag, stdin, file)
- **Status:** Active, most flexible option

---

## 📊 Snapshot & Summary Generation

### **8. generate-snapshot.js**
**Purpose:** Generate knowledge snapshots (cumulative summaries)
- Creates "through Chapter X" summaries
- Includes characters, plot threads, world-building
- Used for recap queries
- **Status:** Active, needed for comprehensive recaps

### **9. generate-book-summary.js**
**Purpose:** Generate spoiler-free book summaries
- High-level overview for first-time readers
- No plot spoilers
- Themes, setting, content warnings
- **Status:** Active, needed for onboarding

### **10. generate-book.js**
**Purpose:** ⚠️ Unclear - may be redundant with generate-book-summary.js
- **Status:** Review needed - possibly delete or document

---

## 🗄️ Legacy Scripts

Archived book-specific scripts in legacy/:
- batch-coppermind-twok.js - Way of Kings batch processor
- generate-twok-chapters.js - WoK chapter generator
- generate-twok-snapshots.js - WoK snapshot generator
- generate-prelude-twok.js - WoK prelude generator
- regenerate-twok-notes.js - WoK regeneration script
- scrape-twok.js - WoK scraper
- generate-row-snapshots.js - Rhythm of War snapshots
- generate-full-book-snapshot.js - Full book snapshot generator

**Why archived:** Book-specific, not needed for general workflow. Kept for reference.

---

## 🚀 Recommended Workflows

### **For Books Without Wiki (Hierarchy, etc.):**
```bash
node extract-chapter.js "hierarchy-book1.epub" 1 extracted/ch1.txt
node generate-from-file.js "The Strength of the Few" 1 extracted/ch1.txt
```

### **For Sanderson Books (With Coppermind):**
```bash
node generate-chapter.js "The Way of Kings" 1 --text "$(cat coppermind-ch1.txt)"
node batch-coppermind.js "Rhythm of War" coppermind-summaries/
```

---

## 📝 Recent Updates

**Dec 2, 2025:**
- ✅ Optimized prompts.js with best of RoW + WoK outputs
- ✅ Cleaned up scribe directory (moved to legacy/, deleted duplicates)
- ✅ Created enhancement strategy for raw e-book processing

---

## 📊 File Status Summary

| File | Purpose | Status |
|------|---------|--------|
| prompts.js | Prompt templates | ✅ Active |
| llm-client.js | OpenAI API | ✅ Active |
| extract-chapter.js | EPUB extraction | ✅ Active |
| generate-from-file.js | Text → notes | ✅ Active |
| generate-chapter.js | Flexible generator | ✅ Active |
| batch-coppermind.js | Batch Coppermind | ✅ Active |
| coppermind-scraper.js | Wiki scraping | ✅ Active |
| generate-snapshot.js | Knowledge snapshots | ✅ Active |
| generate-book-summary.js | Book summaries | ✅ Active |

---

**Last Updated:** December 2, 2025

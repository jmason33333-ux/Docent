# Scribe Directory Cleanup Plan

**Goal:** Remove confusion, keep only actively used files, archive legacy scripts

---

## ✅ KEEP (Core Workflow Files)

### **Active Generation Pipeline:**
1. **prompts.js** ✅
   - Just optimized with best of RoW + WoK
   - Source of truth for all prompts
   - DELETE: `prompts-enhanced.js` (duplicate, outdated)

2. **llm-client.js** ✅
   - Handles OpenAI API calls
   - Used by all generators

3. **extract-chapter.js** ✅
   - Extracts chapter text from EPUB files
   - Core for e-book workflow

4. **generate-from-file.js** ✅
   - Generates notes from extracted text file
   - Core for e-book workflow

5. **generate-chapter.js** ✅
   - Main single chapter generator
   - Can accept text or Coppermind summary
   - Most flexible, keep as primary

### **Batch Processing (Keep for efficiency):**
6. **batch-coppermind.js** ✅
   - Batch process Coppermind summaries
   - Useful for Sanderson books

### **Snapshot Generation:**
7. **generate-snapshot.js** ✅
   - Generates knowledge snapshots
   - Need for cumulative summaries

8. **generate-book-summary.js** ✅
   - Generates spoiler-free book summaries
   - Need for first-time readers

---

## 📦 ARCHIVE (Book-Specific Scripts - Move to /scribe/legacy/)

These were created for specific books but should be archived, not deleted:

9. **batch-coppermind-twok.js** → `legacy/batch-coppermind-twok.js`
   - Way of Kings batch processor
   - Keep for reference if regenerating

10. **generate-twok-chapters.js** → `legacy/generate-twok-chapters.js`
    - WoK specific generator
    - Archive, not delete

11. **generate-twok-snapshots.js** → `legacy/generate-twok-snapshots.js`
12. **generate-prelude-twok.js** → `legacy/generate-prelude-twok.js`
13. **regenerate-twok-notes.js** → `legacy/regenerate-twok-notes.js`
14. **scrape-twok.js** → `legacy/scrape-twok-js`

15. **generate-row-snapshots.js** → `legacy/generate-row-snapshots.js`
    - Rhythm of War snapshots

16. **generate-full-book-snapshot.js** → `legacy/`

---

## ❌ DELETE (Duplicate or Experimental Files)

17. **prompts-enhanced.js** ❌ DELETE
    - Duplicate of prompts.js from second Cursor chat
    - NOT optimized with recent changes
    - Conflicts with source of truth

18. **coppermind-scraper.js** ❌ DELETE or merge
19. **coppermind-full-scraper.js** ❌ DELETE or merge
20. **coppermind-from-file.js** ❌ DELETE or merge
21. **coppermind-transform.js** ❌ DELETE or merge
    - Multiple Coppermind scrapers with overlapping functionality
    - **Action:** Consolidate into ONE `coppermind-scraper.js` if needed
    - Delete the rest

22. **extract-simple.js** ❌ DELETE
23. **extract-simple-v2.js** ❌ DELETE
    - Superseded by `extract-chapter.js`
    - Experimental versions

24. **create-chapter-file.js** ❌ DELETE
    - Unclear purpose, likely superseded

25. **generate-book.js** ❌ DELETE
    - Unclear purpose vs generate-book-summary.js
    - Check if redundant

26. **generate-from-paste.js** ❌ DELETE or keep
    - If it's useful for manual input, keep
    - Otherwise delete

---

## 📂 Proposed New Structure

```
scribe/
├── README.md                           # What each file does
│
├── Core Workflow/
│   ├── prompts.js                      # SOURCE OF TRUTH for all prompts
│   ├── llm-client.js                   # OpenAI API wrapper
│   ├── extract-chapter.js              # EPUB → text extraction
│   ├── generate-chapter.js             # Main single chapter generator
│   ├── generate-from-file.js           # Text file → chapter notes
│   ├── batch-coppermind.js             # Batch Coppermind processing
│   ├── generate-snapshot.js            # Knowledge snapshots
│   └── generate-book-summary.js        # Spoiler-free summaries
│
├── Utilities/ (optional subfolder)
│   └── coppermind-scraper.js           # Consolidated scraper
│
├── legacy/                             # Archived book-specific scripts
│   ├── batch-coppermind-twok.js
│   ├── generate-twok-chapters.js
│   ├── generate-twok-snapshots.js
│   ├── generate-prelude-twok.js
│   ├── regenerate-twok-notes.js
│   ├── scrape-twok.js
│   ├── generate-row-snapshots.js
│   └── generate-full-book-snapshot.js
│
└── DELETED/                            # Actually delete these
    ├── prompts-enhanced.js
    ├── coppermind-full-scraper.js
    ├── coppermind-from-file.js
    ├── coppermind-transform.js
    ├── extract-simple.js
    ├── extract-simple-v2.js
    └── create-chapter-file.js
```

---

## 🚀 Recommended Workflow Going Forward

### **For E-Book Processing (Hierarchy, etc.):**
```bash
# 1. Extract chapter from EPUB
node scribe/extract-chapter.js "hierarchy-book1.epub" 1 extracted/ch1.txt

# 2. Generate notes from extracted text
node scribe/generate-from-file.js "The Strength of the Few" 1 extracted/ch1.txt

# Or combined:
node scribe/extract-chapter.js "hierarchy-book1.epub" 1 | \
node scribe/generate-from-file.js "The Strength of the Few" 1
```

### **For Coppermind Summaries (Sanderson books):**
```bash
node scribe/generate-chapter.js "The Way of Kings" 1 --text "$(cat coppermind-ch1.txt)"
```

### **For Batch Processing:**
```bash
node scribe/batch-coppermind.js "Rhythm of War" coppermind-summaries/
```

---

## ✅ Action Items

1. [ ] Create `scribe/legacy/` folder
2. [ ] Move book-specific scripts to legacy/
3. [ ] Delete duplicate/experimental files
4. [ ] Create `scribe/README.md` documenting what each file does
5. [ ] Update any scripts that reference deleted files
6. [ ] Test core workflow: extract-chapter.js → generate-from-file.js

---

**Result:** Clean, understandable scribe directory with clear purpose for each file.

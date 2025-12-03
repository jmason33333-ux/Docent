# Deployment & Next Steps Action Plan

**Date:** 2025-12-03  
**Status:** Ready to deploy + build EPUB extraction workflow

---

## 🚀 Priority 1: Deploy Rowan (ASAP - Users Ready)

### Current Status
- ✅ Vercel config exists (`vercel.json`)
- ✅ Server code is ready
- ✅ Chapter indexes built for TWoK, RoW, Dawnshard
- ✅ All 3 books have chapter notes + snapshots
- ✅ Response quality improvements in place

### Deployment Checklist

#### 1. Pre-Deployment Validation
```bash
# Test server locally one more time
npm start
# Visit http://localhost:3000 and test:
# - Book selection works
# - Chapter selection works  
# - Questions get responses
# - Chat history works
```

#### 2. Environment Variables Setup
You'll need these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key

**Optional (but recommended):**
- `GOOGLE_SHEETS_CREDENTIALS` - JSON string (for logging)
- `GOOGLE_SHEET_ID` - Your Google Sheet ID (for logging)
- `PORT` - Defaults to 3000 (Vercel handles this)

#### 3. Deploy to Vercel

**Option A: Via CLI (Recommended)**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables in Vercel Dashboard, then:
vercel --prod  # Deploy to production
```

**Option B: Via GitHub + Vercel (Recommended for ongoing updates)**
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repo
4. Vercel auto-detects settings from `vercel.json`
5. Add environment variables in dashboard
6. Deploy automatically on every push

#### 4. Post-Deployment Testing
- [ ] Test all 3 books load correctly
- [ ] Test question answering works
- [ ] Verify chat history persists
- [ ] Check analytics logging (if enabled)
- [ ] Test on mobile device

#### 5. Share with Beta Users
- [ ] Get production URL
- [ ] Share with TWoK/RoW/Dawnshard users
- [ ] Set up feedback collection channel

---

## 📚 Priority 2: EPUB Extraction Workflow (For "The Strength of the Few")

### Current State
- ✅ Basic EPUB extraction script exists (`scribe/extract-chapter.js`)
- ✅ Uses Calibre's `ebook-convert` (requires Calibre installation)
- ✅ Can generate notes from extracted text (`generate-from-file.js`)
- ⚠️  Chapter detection needs improvement
- ⚠️  No batch extraction workflow
- ⚠️  No automated end-to-end pipeline

### Required Workflow

```
New Book Requested
  ↓
Extract EPUB → Chapter Text Files
  ↓
Generate Chapter Notes (using scribe)
  ↓
Generate Snapshots (every 10 chapters)
  ↓
Generate Book Summary
  ↓
Build Chapter Index
  ↓
Deploy (git push → Vercel auto-deploys)
```

### Implementation Tasks

#### Task 2.1: Improve EPUB Extraction
**File:** `scribe/extract-chapter.js` (needs enhancement)

**Current Issues:**
- Chapter detection is basic (regex patterns)
- Doesn't handle all EPUB structures
- No batch extraction for full book

**Improvements Needed:**
1. **Better Chapter Detection:**
   - Parse EPUB TOC (table of contents) to find chapter boundaries
   - Handle various chapter numbering formats
   - Support prologue/epilogue/interludes

2. **Batch Extraction:**
   - Extract all chapters at once
   - Create `chapter-01.txt`, `chapter-02.txt`, etc.
   - Handle errors gracefully (skip missing chapters)

3. **Alternative Extraction Methods:**
   - Pure JavaScript EPUB parser (no Calibre dependency)
   - Library: `epubjs` or `epub-parse` (npm packages)
   - Fallback to Calibre if pure JS fails

**Recommended Approach:**
```javascript
// Use epubjs for pure JS extraction (no Calibre needed)
const epub = require('epub-parse');
// Parse TOC to find chapters
// Extract each chapter by section reference
```

#### Task 2.2: Create End-to-End Workflow Script
**New File:** `scribe/process-new-book.js`

**Functionality:**
1. Takes EPUB path + book metadata (title, series, book number)
2. Extracts all chapters → `temp/extracted/chapter-XX.txt`
3. Generates chapter notes for each
4. Generates snapshots (every 10 chapters)
5. Generates book summary
6. Builds chapter index
7. Commits to git (optional)
8. Prints deployment instructions

**Usage:**
```bash
node scribe/process-new-book.js \
  --epub "The Strength of the Few.epub" \
  --title "The Strength of the Few" \
  --series "The Hierarchy" \
  --book-number 1 \
  --total-chapters 45
```

#### Task 2.3: Handle EPUB Structure Variations
**Challenge:** Different EPUBs structure chapters differently

**Solutions:**
1. **Parse EPUB Metadata:**
   - Read `META-INF/container.xml` → find content file
   - Read content OPF file → find TOC (table of contents)
   - Map TOC entries to chapter numbers

2. **Smart Chapter Detection:**
   - Try TOC-based extraction first (most accurate)
   - Fallback to regex patterns if TOC not available
   - Manual chapter mapping file if needed

3. **Support Prologue/Epilogue/Interludes:**
   - Detect non-numbered sections
   - Handle them as special chapters (0, 9999, etc.)

### Alternative: Manual Workflow (Fastest for First Book)

If automated extraction proves tricky, manual workflow for "The Strength of the Few":

1. **Extract Text:**
   ```bash
   # Convert EPUB to text using Calibre
   ebook-convert "The Strength of the Few.epub" "strength-full.txt"
   
   # Manually split into chapter files (or use split script)
   # chapter-01.txt, chapter-02.txt, etc.
   ```

2. **Generate Notes:**
   ```bash
   # For each chapter
   node scribe/generate-from-file.js \
     "The Strength of the Few" \
     1 \
     --text chapter-01.txt \
     --series "The Hierarchy" \
     --book-number 1
   ```

3. **Generate Snapshots & Summary:**
   ```bash
   # Generate snapshots
   node scribe/generate-row-snapshots.js "The Strength of the Few"
   
   # Generate summary
   node scribe/generate-book-summary.js \
     "The Strength of the Few" \
     "The Hierarchy" \
     1
   ```

4. **Build Index & Deploy:**
   ```bash
   node scripts/build-chapter-index.js "The Strength of the Few"
   git add rag/
   git commit -m "Add The Strength of the Few"
   git push  # Auto-deploys on Vercel
   ```

---

## 📖 Priority 3: Expand Book Coverage

### Books to Add (in priority order)

#### Tier 1: Mistborn (High Priority - Users Waiting)
**Era 1:**
- [ ] The Final Empire (Book 1) - **PRIORITY**
- [ ] The Well of Ascension (Book 2)
- [ ] The Hero of Ages (Book 3)

**Era 2:**
- [ ] The Alloy of Law (Book 1) - **PRIORITY**
- [ ] Shadows of Self (Book 2)
- [ ] The Bands of Mourning (Book 3)
- [ ] The Lost Metal (Book 4)

**Notes:** Cliff Notes/Wikis available - can use batch generation scripts

#### Tier 2: Crescent City Series
- [ ] House of Earth and Blood (Book 1) - **PRIORITY**
- [ ] House of Sky and Breath (Book 2)
- [ ] House of Flame and Shadow (Book 3)

**Notes:** Cliff Notes available for earlier books

#### Tier 3: Will of the Many / Other Requests
- [ ] Will of the Many (if requested)
- [ ] Other user-requested books as they come in

### Generation Strategy

**For Books with Cliff Notes/Wikis:**
1. Use existing batch generation scripts
2. Generate chapter notes from summaries
3. Generate snapshots (every 10 chapters)
4. Generate book summaries
5. Build chapter indexes

**For New Books (No Cliff Notes):**
1. Use EPUB extraction workflow (Priority 2)
2. Generate from extracted text
3. Follow same snapshot/summary/index pipeline

---

## 🔧 Technical Implementation Details

### EPUB Extraction Libraries (JavaScript Options)

**Option 1: epubjs (Pure JS, No Calibre)**
```bash
npm install epubjs
```
- ✅ No external dependencies
- ✅ Works in Node.js
- ✅ Can parse TOC automatically
- ⚠️  May need EPUB structure understanding

**Option 2: epub-parse (Simpler)**
```bash
npm install epub-parse
```
- ✅ Simple API
- ✅ Extracts text easily
- ⚠️  Less control over structure

**Option 3: Keep Calibre (Current)**
- ✅ Already works
- ✅ Handles many formats
- ⚠️  Requires installation
- ⚠️  Not available in cloud environments

**Recommendation:** Use `epubjs` for pure JS solution, with Calibre as fallback.

### New Script Structure

```
scribe/
├── process-new-book.js          # NEW: End-to-end workflow
├── extract-epub.js              # NEW: Enhanced EPUB extraction
├── extract-epub-batch.js        # NEW: Extract all chapters at once
├── extract-chapter.js           # EXISTING: Basic extraction (enhance)
├── generate-from-file.js        # EXISTING: Generate notes from text
└── ...
```

---

## 📋 Immediate Action Items

### This Week (Priority 1)
1. ✅ Validate server works locally
2. ✅ Set up Vercel environment variables
3. ✅ Deploy to Vercel production
4. ✅ Test all 3 books (TWoK, RoW, Dawnshard)
5. ✅ Share URL with beta users
6. ✅ Collect initial feedback

### Next Week (Priority 2)
1. ⚠️  Test EPUB extraction on "The Strength of the Few"
2. ⚠️  If manual extraction needed, do it quickly
3. ⚠️  Generate chapter notes for "The Strength of the Few"
4. ⚠️  Build automated workflow OR document manual process
5. ⚠️  Deploy "The Strength of the Few" support

### This Month (Priority 3)
1. 📝 Generate Mistborn Era 1, Book 1 (The Final Empire)
2. 📝 Generate Mistborn Era 2, Book 1 (The Alloy of Law)
3. 📝 Generate Crescent City, Book 1 (House of Earth and Blood)
4. 📝 Build chapter indexes for all new books
5. 📝 Deploy and test

---

## 💡 Quick Wins for EPUB Extraction

**If you want to get "The Strength of the Few" working FAST:**

1. **Use Calibre GUI:**
   - Open EPUB in Calibre
   - Convert to TXT format
   - Manually split into chapter files
   - Use existing `generate-from-file.js` script

2. **Or Use Online Tools:**
   - Upload EPUB to online converter
   - Download as TXT
   - Split manually
   - Generate notes

3. **Temporary Manual Process:**
   - Document the manual steps
   - Create checklist
   - Automate later when you have time

**Estimated Time:**
- Manual extraction: 1-2 hours (for 45 chapters)
- Generation: 2-3 hours (with rate limiting)
- Total: ~4-5 hours for one book

---

## 🎯 Success Metrics

### Priority 1 (Deployment)
- [ ] App live on Vercel
- [ ] All 3 books working
- [ ] Beta users can access
- [ ] Feedback collection working

### Priority 2 (EPUB Workflow)
- [ ] Can extract chapters from EPUB
- [ ] Can generate notes from extracted text
- [ ] "The Strength of the Few" fully supported
- [ ] Workflow documented (manual or automated)

### Priority 3 (Expansion)
- [ ] Mistborn Era 1, Book 1 added
- [ ] Mistborn Era 2, Book 1 added
- [ ] 2-3 more books added
- [ ] User requests being fulfilled

---

## 🚨 Deployment Considerations

### File Size Limits (Vercel)
- Function size: 50MB max
- Total deployment: 100MB max
- **Your RAG files:** Make sure `rag/` folder isn't too large

### Environment Variables
- Store securely in Vercel (not in code)
- Don't commit `.env` file
- Use Vercel's environment variable UI

### Database/Storage
- Currently using file system for RAG
- Consider moving to:
  - **Vercel Blob Storage** (for large files)
  - **Git LFS** (if using GitHub)
  - **External storage** (S3, etc.)

### Performance
- First request may be slow (cold start)
- Consider edge functions for static responses
- Cache chapter index in memory

---

## 📞 Questions to Answer

1. **Do you already have Vercel account?** If not, create one first
2. **Is your code in GitHub?** Makes deployment easier
3. **Do you have "The Strength of the Few" EPUB?** Need to test extraction
4. **Calibre installed?** Required for current extraction script
5. **Want pure JS extraction?** Can build without Calibre dependency

---

## 🎬 Next Immediate Steps

1. **Test deployment locally one more time**
2. **Create Vercel account** (if not exists)
3. **Deploy to Vercel** (follow checklist above)
4. **Share with beta users**
5. **Start EPUB extraction work** (Priority 2)

Ready to proceed with deployment? Let me know if you need help with any step!

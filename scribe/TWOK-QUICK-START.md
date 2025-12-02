# Quick Start: Regenerating Way of Kings Notes

## Issue with Scraping

Coppermind uses Cloudflare protection that blocks automated scraping. We'll use manual copy/paste instead (it's actually faster and more reliable).

## Quick Steps

### 1. Create Directory

```bash
mkdir coppermind-twok
cd coppermind-twok
```

### 2. Copy/Paste from Coppermind

Go to: **https://coppermind.net/wiki/Summary:The_Way_of_Kings**

For **TEST RUN** (prelude, prologue, chapters 1-5):

Create these 7 text files:
- `prelude.txt`
- `prologue.txt`
- `chapter-01.txt`
- `chapter-02.txt`
- `chapter-03.txt`
- `chapter-04.txt`
- `chapter-05.txt`

**For each file:**
1. Find the section on Coppermind
2. Copy the **entire summary text** (including Part info, Characters, Plot summary)
3. Paste into the corresponding `.txt` file
4. Save

### 3. Run Batch Script

```bash
cd /Users/jamesmason/ROWAN/Docent
node scribe/batch-coppermind-twok.js coppermind-twok
```

This will process all `.txt` files and generate chapter notes using the enhanced prompt!

## What to Include in Each File

When copying from Coppermind, include:
- ✅ Part information (if present, e.g., "Part 1: Above Silence")
- ✅ Chapter Epigraph (the quote at the start)
- ✅ Characters section (all subsections)
- ✅ Plot summary (complete text)

The enhanced prompt will automatically extract all this information!

## After Test Success

Once you verify the quality is good, copy/paste all remaining sections (chapters 6-75, interludes, epilogue) and run the script again.


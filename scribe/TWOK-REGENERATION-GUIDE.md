# The Way of Kings - Chapter Notes Regeneration Guide

## Overview

All existing Way of Kings chapter notes have been deleted. We're regenerating them from scratch using Coppermind summaries with the enhanced prompt (same quality as Rhythm of War).

## Step-by-Step Process

### 1. Create Directory for Coppermind Summaries

```bash
mkdir coppermind-twok
cd coppermind-twok
```

### 2. Copy/Paste Summaries from Coppermind

Go to: https://coppermind.net/wiki/Summary:The_Way_of_Kings

For each section, copy the **entire summary** (including Characters section, Plot summary, Part info, Epigraph if present) and paste into a text file:

**Required files:**
- `prelude.txt` - Prelude to the Stormlight Archive
- `prologue.txt` - Prologue: To Kill
- `chapter-01.txt` through `chapter-75.txt` - All 75 chapters
- `interlude-i-1.txt` through `interlude-i-9.txt` - All 9 interludes
- `epilogue.txt` - Epilogue

**File naming format:**
- Chapters: `chapter-01.txt`, `chapter-02.txt`, etc. (zero-padded)
- Interludes: `interlude-i-1.txt`, `interlude-i-2.txt`, etc.
- Special sections: `prelude.txt`, `prologue.txt`, `epilogue.txt`

### 3. What to Include in Each Text File

When copying from Coppermind, make sure to include:
- ✅ **Part information** (e.g., "Part 1: Above Silence" at the top)
- ✅ **Chapter Epigraph** (if present - the quote/inscription)
- ✅ **Characters section** (including all subsections: POV, Characters Who Appear, Characters Mentioned Only)
- ✅ **Plot summary** (the full plot summary text)

**Example format in the text file:**
```
Part 1: Above Silence

Chapter Epigraph
> "In the storm I awaken, falling, spinning, grieving."
> — Unknown Source

Characters
Kaladin (point of view)
Sylphrena
...

Characters Who Appear
...

Characters Mentioned Only
...

Plot summary
[Full plot summary text...]
```

### 4. Run the Batch Script

Once all text files are created in `coppermind-twok/`:

```bash
cd /Users/jamesmason/ROWAN/Docent
node scribe/batch-coppermind-twok.js coppermind-twok
```

This will:
- Process all `.txt` files in the directory
- Use the enhanced prompt (same as Rhythm of War)
- Auto-detect Part information, epigraphs, and character lists
- Save files to correct locations:
  - `Part 1/`, `Part 2/`, etc. for chapters
  - `interlude-1/`, `interlude-2/`, etc. for interludes
  - Root directory for prelude, prologue, epilogue

### 5. Verify Output

The script will:
- Show progress for each section
- Display success/failure counts
- Save files with correct formatting

**Expected output locations:**
```
rag/Series/The Stormlight Archive/books/the-way-of-kings/chapters/
├── prelude.md
├── prologue.md
├── epilogue.md
├── Part 1/
│   ├── chapter-01.md
│   ├── chapter-02.md
│   └── ...
├── Part 2/
│   ├── chapter-12.md
│   └── ...
├── interlude-1/
│   ├── interlude-i-1.md
│   ├── interlude-i-2.md
│   └── interlude-i-3.md
└── ...
```

## What the Enhanced Prompt Will Extract

The enhanced prompt automatically extracts:
- ✅ Part numbers and names (e.g., "Part 4: Storm's Illumination")
- ✅ Chapter epigraphs with source attribution
- ✅ All characters (POV, appears, mentioned-only)
- ✅ Detailed Time Context
- ✅ "Chapters Since Last POV" with chapter names (e.g., "Since Chapter 57: Chapter Title")
- ✅ 8-10 detailed "If Asked" Q&A pairs
- ✅ Comprehensive plot beats, themes, world-building, etc.

## Cost Estimate

- Per section: ~$0.04 (using GPT-4o)
- Total (87 sections): ~$3.50

## Troubleshooting

**"Couldn't parse section info"**
- Check filename format matches exactly (e.g., `chapter-01.txt`, not `chapter-1.txt`)
- Interludes should be `interlude-i-1.txt`, not `interlude-1.txt`

**"Content too short"**
- Make sure you copied the full Coppermind summary (at least 50 characters)
- Include the Characters section and Plot summary

**Missing Part/Epigraph info**
- Verify the Coppermind summary includes Part information at the top
- Check that epigraphs are included in the summary text you copied

**Files saved to wrong location**
- The script auto-determines part/interlude group based on chapter number
- Verify chapter numbers match expected ranges (1-11 = Part 1, 12-28 = Part 2, etc.)

## Next Steps After Generation

1. Review a few generated files to verify quality
2. Generate knowledge snapshots using `generate-twok-snapshots.js`
3. Test with Rowan to ensure notes are being used correctly


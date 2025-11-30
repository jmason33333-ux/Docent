# Batch Process Coppermind Summaries - Complete Guide

## Overview

Since Coppermind is protected by Cloudflare, we'll manually copy sections and batch process them. This is actually faster and more reliable!

## Step-by-Step Process

### Step 1: Create a Directory

In your project root, create a directory for Coppermind sections:

```bash
mkdir coppermind-sections
```

### Step 2: Copy Sections from Coppermind

1. Go to: https://coppermind.net/wiki/Summary:Rhythm_of_War
2. For each section (Prologue, Chapter 1, Chapter 2, etc.):
   - Find the section summary
   - Copy all the text (Cmd+A, Cmd+C)
   - In Cursor, create a new file: `coppermind-sections/prologue.txt` (or `chapter-01.txt`, etc.)
   - Paste the text
   - Save the file

**File naming:**
- `prologue.txt` - For the prologue
- `chapter-01.txt` - For Chapter 1
- `chapter-02.txt` - For Chapter 2
- `interlude-01.txt` - For Interlude 1
- `epilogue.txt` - For the epilogue

### Step 3: Batch Process All Files

Once you have all the files, run:

```bash
node scribe/batch-coppermind.js "Rhythm of War" coppermind-sections
```

This will:
- Process all .txt files in the directory
- Transform each into Docent chapter notes format
- Save them to `rag/books/rhythm-of-war/chapters/`

## Tips for Efficiency

### Copy Multiple Sections at Once

1. Open Coppermind in your browser
2. Open Cursor
3. Copy-paste each section quickly:
   - Copy section → Create file → Paste → Save
   - Repeat for next section

### Process in Batches

You don't need all sections at once! Process what you have:

```bash
# Process first 10 chapters
# (Just create chapter-01.txt through chapter-10.txt)
node scribe/batch-coppermind.js "Rhythm of War" coppermind-sections
```

Then add more sections and run again - it will skip files that already exist (or ask to overwrite).

### File Naming Examples

The script recognizes these patterns:
- `prologue.txt` → `prologue.md`
- `chapter-01.txt` → `chapter-01.md`
- `chapter-1.txt` → `chapter-01.md`
- `interlude-01.txt` → `interlude-01.md`
- `epilogue.txt` → `epilogue.md`

## Cost & Time

- **Per section:** ~$0.04 (30-60 seconds)
- **Rhythm of War (115+ sections):** ~$4.60 total, ~1-2 hours

## What Gets Generated

Each section becomes a full chapter notes file with:
- ✅ All template sections filled in
- ✅ Character details
- ✅ Plot beats
- ✅ Themes and subtext
- ✅ Confusion points flagged
- ✅ "If Asked" notes
- ✅ Spoiler safety maintained

## Troubleshooting

**"No .txt files found"**
- Make sure files are in the directory you specified
- Check file extensions are `.txt`

**"Couldn't parse section info"**
- Use standard naming: `chapter-01.txt`, `prologue.txt`, etc.
- Or include a number in the filename

**Processing fails for some sections**
- Check the file has content (not empty)
- Make sure you copied the full summary
- Retry just that section manually



# Extracting Chapter Text from Ebooks

## Quick Start

### Step 1: Install Calibre (for EPUB/MOBI extraction)

**macOS:**
```bash
brew install calibre
```

**Or download from:** https://calibre-ebook.com/download

This provides the `ebook-convert` command needed for extraction.

### Step 2: Extract Chapter Text

```bash
node scribe/extract-chapter.js "Words of Radiance.epub" 1
```

This will:
- Extract Chapter 1 text
- Save it to `chapter-01.txt`
- Show you the next command to generate notes

### Step 3: Generate Chapter Notes with Extracted Text

```bash
node scribe/generate-chapter.js "Words of Radiance" 1 --text chapter-01.txt
```

## Supported Formats

- ✅ **EPUB** - Full support via Calibre
- ✅ **MOBI/AZW** - Converted via Calibre
- ⚠️ **PDF** - Not yet implemented (convert to EPUB first)

## Alternative Methods

### Method 1: Manual Copy-Paste

1. Open your ebook in a reader
2. Copy the chapter text
3. Paste into a text file: `chapter-01.txt`
4. Use with: `--text chapter-01.txt`

### Method 2: Use Online EPUB Extractors

1. Upload EPUB to an online extractor
2. Download chapter text
3. Save as `chapter-01.txt`
4. Use with: `--text chapter-01.txt`

### Method 3: Python Script (if you have Python)

```python
import zipfile
import xml.etree.ElementTree as ET

def extract_epub_chapter(epub_path, chapter_num):
    # Extract EPUB (it's a ZIP file)
    with zipfile.ZipFile(epub_path, 'r') as epub:
        # Find chapter files
        # Extract text
        pass
```

## Troubleshooting

**"ebook-convert not found"**
- Install Calibre: https://calibre-ebook.com/download
- Make sure it's in your PATH

**"Could not isolate chapter"**
- EPUB structure may vary
- Try manual extraction or use the full text

**PDF files**
- Convert PDF to EPUB first using Calibre
- Or use a PDF text extractor tool

## Batch Extraction

To extract multiple chapters:

```bash
for i in {1..10}; do
  node scribe/extract-chapter.js "Words of Radiance.epub" $i "chapter-$(printf '%02d' $i).txt"
done
```

Then generate all notes:

```bash
for i in {1..10}; do
  node scribe/generate-chapter.js "Words of Radiance" $i --text "chapter-$(printf '%02d' $i).txt"
done
```



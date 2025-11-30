# Installing Calibre for EPUB Extraction

## Option 1: Direct Download (Recommended)

1. Go to: https://calibre-ebook.com/download
2. Download the macOS installer
3. Install the app
4. The `ebook-convert` command will be available in Terminal

## Option 2: Homebrew (if you have it)

```bash
brew install --cask calibre
```

## Verify Installation

After installing, verify it works:

```bash
ebook-convert --version
```

You should see version information.

## Then Use Automatic Extraction

Once Calibre is installed, you can use:

```bash
node scribe/extract-chapter.js "The Stormlight Archive, Books 1-4.epub" 1
```

**Note:** Since your EPUB contains all 4 books, you may need to:
- Specify which book you want (the script will try to find the chapter)
- Or extract the full text and manually find the right section

## Alternative: Extract Individual Books First

If you want to work with individual books:

1. Open the EPUB in Calibre
2. Convert each book to a separate EPUB
3. Then extract chapters from the individual book files



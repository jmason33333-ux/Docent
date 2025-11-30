# Coppermind to Docent Notes Guide

## Quick Start

Transform Coppermind chapter summaries into Docent chapter notes format.

## Method 1: Manual Copy-Paste (Recommended for MVP)

This is the most reliable method:

### Step 1: Get Coppermind Summary

1. Go to: https://coppermind.net/wiki/Summary:Rhythm_of_War
2. Find the chapter you want (e.g., Chapter 1)
3. Copy the chapter summary text

### Step 2: Transform It

```bash
node scribe/coppermind-transform.js "Rhythm of War" 1
```

Then:
1. Paste the Coppermind summary when prompted
2. Type "DONE" and press Enter
3. Wait 30-60 seconds for AI transformation
4. Done! Notes saved to `rag/books/rhythm-of-war/chapters/chapter-01.md`

### Step 3: Repeat for All Chapters

For Rhythm of War (115 chapters), you can batch process:

```bash
# Process chapters 1-10
for i in {1..10}; do
  echo "Processing Chapter $i..."
  node scribe/coppermind-transform.js "Rhythm of War" $i
  sleep 3  # Rate limiting
done
```

## Method 2: Automatic Scraping (Experimental)

Try automatic scraping (may need adjustments for Coppermind's HTML structure):

```bash
node scribe/coppermind-scraper.js "https://coppermind.net/wiki/Summary:Rhythm_of_War" "Rhythm of War"
```

This will:
1. Fetch the Coppermind page
2. Extract all chapter summaries
3. Transform each into Docent notes format
4. Save them all

**Note:** If scraping doesn't work well, use Method 1 (manual copy-paste).

## Cost Estimates

Using GPT-4o:
- Per chapter: ~$0.03-0.05
- Rhythm of War (115 chapters): ~$3.50-5.75

## Tips

1. **Start with a few chapters** to test quality
2. **Review the output** - make sure it matches your format
3. **Batch process** overnight for large books
4. **Check for errors** - some chapters might fail, just retry them

## What Gets Transformed

The AI will:
- ✅ Expand Coppermind summaries into full chapter notes
- ✅ Add all required sections (characters, locations, themes, etc.)
- ✅ Flag confusion points
- ✅ Add "If Asked" notes
- ✅ Maintain spoiler safety (only Chapter X content)

## Troubleshooting

**"No text provided"**
- Make sure you paste the summary before typing DONE
- Try pasting again

**Poor quality output**
- Coppermind summary might be too brief
- Try providing more context in your paste
- Or manually enhance the generated notes

**Scraping doesn't work**
- Coppermind HTML structure may have changed
- Use Method 1 (manual copy-paste) instead



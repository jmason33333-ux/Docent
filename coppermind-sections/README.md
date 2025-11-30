# Coppermind Sections Directory

## How to Use

1. **Copy sections from Coppermind:**
   - Go to: https://coppermind.net/wiki/Summary:Rhythm_of_War
   - For each section, copy the summary text

2. **Create text files here:**
   - `prologue.txt` - Paste prologue summary
   - `chapter-01.txt` - Paste Chapter 1 summary
   - `chapter-02.txt` - Paste Chapter 2 summary
   - `interlude-01.txt` - Paste Interlude 1 summary
   - `epilogue.txt` - Paste epilogue summary
   - etc.

3. **Run batch processor:**
   ```bash
   node scribe/batch-coppermind.js "Rhythm of War" coppermind-sections
   ```

## File Naming

The script recognizes:
- `prologue.txt` → Creates `prologue.md`
- `chapter-01.txt` or `chapter-1.txt` → Creates `chapter-01.md`
- `interlude-01.txt` → Creates `interlude-01.md`
- `epilogue.txt` → Creates `epilogue.md`

## Tips

- You don't need all files at once - process what you have
- The script will process all .txt files in this directory
- Each file takes ~30-60 seconds to process
- Cost: ~$0.04 per section



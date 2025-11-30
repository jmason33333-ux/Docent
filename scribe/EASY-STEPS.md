# Easy Steps to Extract Chapter Text

## Step 1: Open Terminal in Cursor

**Option A: Keyboard Shortcut**
- Press: `Ctrl + `` (backtick, usually above Tab key)
- Or: `Cmd + J` (on Mac)

**Option B: Menu**
- Go to: `Terminal` → `New Terminal` in the menu bar

You'll see a terminal window at the bottom of Cursor.

## Step 2: Make Sure You're in the Right Directory

The terminal should already be in your project folder, but if not, type:

```bash
cd /Users/jamesmason/ROWAN/Docent
```

## Step 3: Run the Extraction Command

Type this exact command (replace `1` with your chapter number):

```bash
node scribe/extract-simple.js "Words of Radiance" 1
```

Press Enter.

## Step 4: Follow the Prompts

The script will:
1. Show you instructions
2. Wait for you to paste the chapter text
3. Save it to a file

**To paste in terminal:**
- Mac: `Cmd + V`
- Windows/Linux: `Ctrl + V` or right-click → Paste

**To finish pasting:**
- Mac: Press `Ctrl + D`
- Windows/Linux: Press `Ctrl + Z` then Enter

## Step 5: Generate Chapter Notes

After the text is saved, run:

```bash
node scribe/generate-chapter.js "Words of Radiance" 1 --text chapter-01.txt
```

That's it! 🎉



# Easy Steps: Coppermind to Docent Notes

## Method: Use a Text File (Easiest!)

Since terminal access can be tricky, here's the easiest way:

### Step 1: Copy Coppermind Summary

1. Go to: https://coppermind.net/wiki/Summary:Rhythm_of_War
2. Find Chapter 1 summary
3. Select all the text (Cmd+A)
4. Copy it (Cmd+C)

### Step 2: Create a Text File in Cursor

1. In Cursor, click "New File" or press Cmd+N
2. Paste the Coppermind summary (Cmd+V)
3. Save the file as: `coppermind-ch01.txt` (in your project root)

### Step 3: Run the Command

I can run this for you! Just tell me:
- Book title: "Rhythm of War"
- Chapter number: 1
- File name: "coppermind-ch01.txt"

Or if you can access terminal, run:
```bash
node scribe/coppermind-from-file.js "Rhythm of War" 1 coppermind-ch01.txt
```

### Step 4: Done!

The formatted notes will be saved to:
`rag/books/rhythm-of-war/chapters/chapter-01.md`

## Alternative: I Can Run It For You

If you create the text file, I can run the transformation command for you! Just:
1. Create `coppermind-ch01.txt` with the summary
2. Tell me and I'll run the command



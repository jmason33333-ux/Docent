# Quick Fix Checklist - RAG Tracking Not Working

## ✅ Server Restarted
The server has been restarted with the new RAG tracking code.

## 🔍 Check Console Logs

When you ask a question, you should see in the terminal:

```
[RAG] Notes available: YES (1 found, 0 missing)
[LOGGING] RAG tracking: {
  notesAvailable: 'YES',
  notesProvided: 'YES',
  notesLikelyUsed: 'YES',
  notesRelevance: 'notes_used',
  chaptersFound: '1',
  chaptersMissing: ''
}
✅ Logged conversation to Google Sheets with RAG tracking
```

If you see `UNKNOWN` values, the metadata isn't being passed correctly.

## 📊 Check Google Sheets Setup

### Step 1: Verify Column Headers

Make sure your `Conversations` sheet has these headers in row 1:

```
A: Timestamp
B: User ID
C: Book
D: Chapter
E: Question
F: Answer
G: Prompt Version
H: Prompt Type
I: Context Window
J: Tokens Used
K: Feedback Rating
L: Notes Available      ← NEW
M: Notes Provided       ← NEW
N: Notes Likely Used    ← NEW
O: Notes Relevance      ← NEW
P: Chapters Found       ← NEW
Q: Chapters Missing     ← NEW
```

### Step 2: Test with a Question

1. Go to your app: http://localhost:3001
2. Select "Words of Radiance" and Chapter 1
3. Ask a question like "Who is Shallan?"
4. Check your Google Sheet - columns L-Q should be populated

### Step 3: Check for Errors

Look in the terminal where the server is running. If you see:
- `Failed to log to Google Sheets` - Check your Google Sheets credentials
- `UNKNOWN` values in RAG tracking - Metadata isn't being passed

## 🐛 Troubleshooting

**If columns L-Q are empty:**
1. Check that the headers exist in row 1
2. Check the server console for errors
3. Verify Google Sheets credentials are set in `.env`

**If you see `UNKNOWN` in console:**
- The metadata object might not have the RAG fields
- Check the server logs for any errors

**If nothing is logged at all:**
- Check `GOOGLE_SHEET_ID` is set in `.env`
- Check `GOOGLE_SHEETS_CREDENTIALS` is set in `.env`
- Verify the service account has edit access to the sheet

## 📝 Next Steps

1. **Test a question** in the app
2. **Check the console** for the RAG tracking log
3. **Check Google Sheets** - columns L-Q should have data
4. **Report back** what you see!



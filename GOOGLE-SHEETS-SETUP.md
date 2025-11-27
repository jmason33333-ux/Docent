# Google Sheets Setup Guide for Docent

This guide walks you through setting up Google Sheets logging for Docent conversations and feedback.

---

## 📋 What You'll Need

- A Google Account
- ~15 minutes
- Your deployed Docent app (or local setup for testing)

---

## 🎯 Overview

You'll create:
1. A Google Cloud service account (for API access)
2. A Google Sheet with two tabs (Conversations & Feedback)
3. Share the sheet with the service account
4. Add credentials to your Docent environment variables

---

## Step 1: Create Google Cloud Service Account

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 1.2 Create or Select a Project

- Click the project dropdown at the top
- Click **"New Project"**
- Name it: `Docent Logging`
- Click **Create**
- Wait for it to be created, then select it

### 1.3 Enable Google Sheets API

- In the search bar at the top, search: `Google Sheets API`
- Click on **"Google Sheets API"**
- Click **"Enable"**
- Wait for it to enable (~10 seconds)

### 1.4 Create Service Account

- In the left sidebar, click **"Credentials"**
- Click **"+ CREATE CREDENTIALS"** at the top
- Select **"Service Account"**

Fill in the form:
- **Service account name**: `docent-logger`
- **Service account ID**: (auto-fills, leave it)
- Click **"CREATE AND CONTINUE"**

Grant access:
- **Role**: Select **"Editor"** (or "Basic > Editor")
- Click **"CONTINUE"**
- Click **"DONE"**

### 1.5 Create and Download Key

- You'll see your new service account in the list
- Click on the **email address** (looks like `docent-logger@...iam.gserviceaccount.com`)
- Click the **"Keys"** tab at the top
- Click **"ADD KEY"** → **"Create new key"**
- Choose **JSON** format
- Click **"CREATE"**

**IMPORTANT:** A JSON file will download automatically. This file contains your credentials.
- Keep it safe!
- Never commit it to git
- You'll need it in Step 3

---

## Step 2: Create and Configure Google Sheet

### 2.1 Create New Sheet

- Go to https://sheets.google.com
- Click **"+ Blank"** to create a new sheet
- Rename it: **"Docent Logs"** (click on "Untitled spreadsheet" at top)

### 2.2 Create "Conversations" Tab

The first tab should be named **"Conversations"**. If it's called "Sheet1", rename it:
- Right-click the tab → **Rename** → Type `Conversations`

**Add headers in Row 1** (copy/paste this into cells A1-K1):

```
Timestamp	User ID	Book	Chapter	Question	Answer	Prompt Version	Prompt Type	Context Window	Tokens Used	Feedback Rating
```

Or type manually:
- A1: `Timestamp`
- B1: `User ID`
- C1: `Book`
- D1: `Chapter`
- E1: `Question`
- F1: `Answer`
- G1: `Prompt Version`
- H1: `Prompt Type`
- I1: `Context Window`
- J1: `Tokens Used`
- K1: `Feedback Rating`

**Optional formatting:**
- Select Row 1
- Make it bold (Ctrl+B or Cmd+B)
- Add a background color (light gray)
- Freeze the header: View → Freeze → 1 row

### 2.3 Create "Feedback" Tab

- Click the **"+"** button at the bottom left to add a new sheet
- Name it: **"Feedback"**

**Add headers in Row 1** (copy/paste into cells A1-J1):

```
Timestamp	User ID	Book	Chapter	Rating	Feedback	Prompt Version	Message ID	Question	Answer
```

Or type manually:
- A1: `Timestamp`
- B1: `User ID`
- C1: `Book`
- D1: `Chapter`
- E1: `Rating`
- F1: `Feedback`
- G1: `Prompt Version`
- H1: `Message ID`
- I1: `Question`
- J1: `Answer`

**Optional formatting:**
- Select Row 1
- Make it bold
- Add background color
- Freeze the header

### 2.4 Share with Service Account

**CRITICAL STEP:**

- Click the **"Share"** button in the top right
- In the "Add people and groups" field, paste your **service account email**
  - It looks like: `docent-logger@project-name-123456.iam.gserviceaccount.com`
  - Find it in the JSON key file you downloaded: look for `"client_email"`
- Change permission to **"Editor"**
- **UNCHECK** "Notify people" (the service account doesn't need an email)
- Click **"Share"**

### 2.5 Get Sheet ID

Look at the URL of your Google Sheet. It looks like:
```
https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This part is your SHEET ID
```

Copy the long string between `/d/` and `/edit` — this is your **GOOGLE_SHEET_ID**.

Example:
```
1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2
```

---

## Step 3: Add Credentials to Docent

### 3.1 Prepare the JSON Credentials

Open the JSON key file you downloaded in Step 1.5 in a text editor. It looks like:

```json
{
  "type": "service_account",
  "project_id": "docent-logging-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "docent-logger@...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  ...
}
```

### 3.2 For Local Development

Create or edit `.env` file in your Docent root directory:

```env
OPENAI_API_KEY=your_openai_key_here

# Copy the ENTIRE JSON file content as a single line
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"docent-logging-123456",...}

# Paste your Sheet ID from Step 2.5
GOOGLE_SHEET_ID=1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2
```

**Important:**
- Remove all newlines from the JSON (make it one long line)
- Keep all the quotes and braces exactly as they are
- The private key will have `\n` in it — keep those!

### 3.3 For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add three variables:

**Variable 1:**
- **Key**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key
- Click **"Add"**

**Variable 2:**
- **Key**: `GOOGLE_SHEETS_CREDENTIALS`
- **Value**: Paste the entire JSON file content (as one line, no newlines)
- Click **"Add"**

**Variable 3:**
- **Key**: `GOOGLE_SHEET_ID`
- **Value**: Paste your Sheet ID from Step 2.5
- Click **"Add"**

5. Go to **"Deployments"**
6. Find your latest deployment
7. Click **"..."** → **"Redeploy"**
8. Wait for redeployment to complete

---

## Step 4: Test the Connection

### 4.1 Start Your Server

```bash
npm start
```

Watch the console output. You should see:
```
Google Sheets logging initialized
🌟 Docent server running on http://localhost:3000
📚 Rowan is ready to help readers!
```

If you see an error instead, check:
- Is the JSON formatted correctly? (no newlines in .env)
- Did you share the sheet with the service account?
- Is the Sheet ID correct?

### 4.2 Send a Test Message

1. Open http://localhost:3000
2. Select a book and chapter
3. Ask Rowan a question

Check your console. You should see:
```
[PROMPT] Using FULL prompt (v1.0)
[RAG] Loading 1 chapter(s) of context
Logged conversation to Google Sheets
```

### 4.3 Verify in Google Sheets

Go to your Google Sheet and refresh the page. You should see a new row in the **Conversations** tab with:
- Timestamp
- User ID (e.g., `user_abc123xyz`)
- Book title
- Chapter number
- Your question
- Rowan's answer
- Prompt metadata (version, type, context window, tokens)

### 4.4 Test Feedback

1. After Rowan responds, click the **👍** button
2. Check your console: `[FEEDBACK] User user_abc123 gave 5/5 for response`
3. Go to the **Feedback** tab in your Google Sheet
4. You should see a new row with rating=5

---

## Step 5: Analyzing Your Data

### 5.1 Useful Formulas

**In a new tab called "Analytics"**, try these formulas:

**Average tokens per request:**
```
=AVERAGE(Conversations!J:J)
```

**Total questions asked:**
```
=COUNTA(Conversations!E:E)-1
```

**Count by prompt version:**
```
=COUNTIF(Conversations!G:G,"v1.0")
```

**Average rating:**
```
=AVERAGE(Feedback!E:E)
```

**Most common feedback issues:**

Create a pivot table:
1. Select all data in Feedback tab
2. Insert → Pivot Table
3. Rows: Add "Feedback"
4. Values: Add "Feedback" (COUNTA)
5. This shows which issues come up most

### 5.2 Export for Analysis

- File → Download → CSV (current sheet)
- Import to Excel, Google Data Studio, or analyze with Python/R

---

## 🔧 Troubleshooting

### "Google Sheets logging not configured"

**Problem:** Server starts but doesn't initialize Sheets

**Solutions:**
- Check `.env` has `GOOGLE_SHEETS_CREDENTIALS` (not just a comment)
- Verify JSON is valid (use jsonlint.com to check)
- Make sure there are no extra spaces or newlines

### "Failed to log to Google Sheets: ... 403"

**Problem:** Permission denied

**Solutions:**
- Did you share the sheet with the service account email?
- Check the email in JSON file (`client_email`)
- Make sure you gave **Editor** permission, not just Viewer

### "Failed to log to Google Sheets: ... 404"

**Problem:** Sheet not found

**Solutions:**
- Double-check your `GOOGLE_SHEET_ID` in `.env`
- Make sure you copied the ID correctly from the URL
- Verify the sheet isn't deleted

### No data appearing in sheet

**Solutions:**
- Check console for "Logged conversation to Google Sheets"
- If you see that but no data: refresh the Google Sheet
- Wait ~5 seconds (sometimes there's a delay)
- Check you're looking at the right sheet/tab

### "Cannot read properties of undefined"

**Problem:** Missing environment variables

**Solutions:**
- Make sure `.env` file exists in project root
- Restart the server after editing `.env`
- For Vercel: redeploy after adding env vars

---

## 🎯 What's Next?

Now that logging is working:

1. **Test with your 3 readers** - have them use the app and give feedback
2. **Review the data weekly** - look for patterns in questions and feedback
3. **Iterate on Rowan** - use the feedback to improve prompt versions
4. **Monitor costs** - track token usage to optimize further

---

## 📊 Sample Data Structure

Here's what a few rows of data look like:

**Conversations tab:**
| Timestamp | User ID | Book | Chapter | Question | Answer | Prompt Version | Prompt Type | Context Window | Tokens Used |
|-----------|---------|------|---------|----------|--------|----------------|-------------|----------------|-------------|
| 2024-01-15T10:30:00Z | user_abc | Words of Radiance | 17 | Who is Kaladin? | Kaladin is a former... | v1.0 | short | 1 | 342 |
| 2024-01-15T10:32:00Z | user_abc | Words of Radiance | 17 | Remind me what happened | Big epics + real life... | v1.0 | full | 3 | 1250 |

**Feedback tab:**
| Timestamp | User ID | Book | Chapter | Rating | Feedback | Prompt Version |
|-----------|---------|------|---------|--------|----------|----------------|
| 2024-01-15T10:31:00Z | user_abc | Words of Radiance | 17 | 5 | | v1.0 |
| 2024-01-15T10:35:00Z | user_abc | Words of Radiance | 18 | 2 | Issues: warmth, length. Response felt stiff | v1.0 |

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep your JSON key file in `.gitignore`
- Store credentials in environment variables only
- Use separate service accounts for dev/prod
- Limit service account permissions to just Sheets API

❌ **DON'T:**
- Commit the JSON key to git
- Share the key publicly
- Use your personal Google account credentials
- Give the service account more permissions than needed

---

**Need help?** Check the main README or review the logging code in `utils/logger.js`.

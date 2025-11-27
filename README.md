# Docent 📚

**Your AI reading companion for complex fantasy books**

Docent is a web app where readers can chat with **Rowan**, a warm and knowledgeable AI companion, while reading big fantasy series like Stormlight Archive and The Hierarchy.

---

## 🎯 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```env
# Required
OPENAI_API_KEY=sk-your-openai-key-here

# Optional (for Google Sheets logging)
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
GOOGLE_SHEET_ID=your-google-sheet-id

# Server port
PORT=3000
```

### 3. Add Chapter Notes

Add your LLM-generated chapter notes to the appropriate book directories:

```
rag/books/
├── words-of-radiance/
│   ├── chapter-01.md
│   ├── chapter-02.md
│   └── ...
├── rhythm-of-war/
│   └── ...
└── the-strength-of-the-few/
    └── ...
```

Use the template at `rag/books/SAMPLE-chapter-template.md` as your guide.

### 4. Run Locally

```bash
npm start
```

Visit http://localhost:3000 and start chatting with Rowan!

---

## 🚀 Deploy to Vercel

### Prerequisites
- [Vercel account](https://vercel.com/signup) (free tier is fine)
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`

### Deploy Steps

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add `OPENAI_API_KEY`
   - Add `GOOGLE_SHEETS_CREDENTIALS` (if using logging)
   - Add `GOOGLE_SHEET_ID` (if using logging)

4. **Redeploy** to apply environment variables:
   ```bash
   vercel --prod
   ```

Your app will be live at `https://your-project.vercel.app`!

---

## 🔧 Google Sheets Logging Setup (Optional)

Docent can log all conversations to Google Sheets for analysis.

### 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Sheets API**
4. Go to **IAM & Admin > Service Accounts**
5. Click **Create Service Account**:
   - Name: `docent-logger`
   - Click **Create and Continue**
   - Grant role: **Editor** (or just Sheets access)
   - Click **Done**
6. Click on the service account you just created
7. Go to **Keys** tab
8. Click **Add Key > Create New Key**
9. Choose **JSON** format
10. Download the key file

### 2. Create a Google Sheet

1. Create a new Google Sheet
2. **Create the "Conversations" tab** with headers in row 1:
   ```
   Timestamp | User ID | Book | Chapter | Question | Answer | Prompt Version | Prompt Type | Context Window | Tokens Used | Feedback Rating
   ```
3. **Create the "Feedback" tab** with headers in row 1:
   ```
   Timestamp | User ID | Book | Chapter | Rating | Feedback | Prompt Version | Message ID | Question | Answer
   ```
4. Share the sheet with your service account email:
   - Click **Share**
   - Paste the service account email (from the JSON file: `client_email`)
   - Give **Editor** access

### 3. Set Environment Variables

Copy the contents of the JSON key file and set it as `GOOGLE_SHEETS_CREDENTIALS`:

```env
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"..."}
GOOGLE_SHEET_ID=<your-sheet-id-from-url>
```

**For Vercel:** You can paste the entire JSON as a single-line string in the environment variable field.

---

## 📁 Project Structure

```
docent/
├── server.js                 # Express server
├── rowan-prompt.js           # Rowan's system prompt
├── utils/
│   ├── openai-client.js      # OpenAI integration + RAG
│   ├── rag-loader.js         # Chapter notes loader
│   └── logger.js             # Google Sheets logger
├── rag/
│   └── books/
│       ├── words-of-radiance/
│       ├── rhythm-of-war/
│       └── the-strength-of-the-few/
├── public/
│   ├── index.html            # Frontend UI
│   ├── style.css             # Styling
│   └── app.js                # Frontend logic
└── vercel.json               # Vercel deployment config
```

---

## ⚡ Cost Optimizations

Docent includes several built-in optimizations to minimize API costs:

### 1. **GPT-4o-mini Model**
- Uses `gpt-4o-mini` instead of GPT-4 Turbo (15x cheaper)
- Still excellent quality for literary understanding
- Cost: ~$0.15/1M input tokens vs. $10/1M for GPT-4 Turbo

### 2. **Smart RAG Context Loading**
- **Simple questions**: Only loads current chapter notes (1 chapter)
- **Recap questions**: Loads 3 chapters of context when user asks for summaries/recaps
- Keywords detected: "recap", "remind", "forgot", "summary", "what happened", etc.
- Reduces token usage by ~60% on average

### 3. **Conversation History Limiting**
- Only sends last 10 messages to the API (5 exchanges)
- Prevents token bloat in long conversations
- Older messages are dropped automatically

### 4. **Tiered Prompts (NEW!)**
- **SHORT prompt** (~300 tokens): Used for simple questions (65% cost reduction)
- **FULL prompt** (~850 tokens): Used for complex queries and first messages
- Automatic selection based on query complexity
- Reduces system prompt costs by ~50% on average

**Expected cost for v0**: ~$0.05-0.10 for 150 questions (3 readers × 50 questions each)

---

## 🎨 ROWAN Prompt Optimization

Docent includes a sophisticated prompt iteration system for testing and improving Rowan's personality:

### Quick Start
- **Current version**: v1.0 (comprehensive, well-tested)
- **Change versions**: Edit line 12 in `rowan-prompt.js`
- **Available versions**: v1.0, v1.1 (concise), v1.2 (shortest)

### Features
✅ **A/B Testing**: Test different prompt styles with real users
✅ **Feedback Collection**: `/api/feedback` endpoint for user ratings
✅ **Version Tracking**: All logs include prompt version and metadata
✅ **Cost Analysis**: Track token usage per prompt version

### Iterate on Rowan
See **`PROMPT-ITERATION-GUIDE.md`** for:
- How to create and test new prompt versions
- Collecting and analyzing user feedback
- A/B testing workflow
- Best practices for prompt engineering

**This is critical for v0**: Rowan's voice is your core differentiator. Use the feedback from your 3 test readers to refine it quickly.

---

## 🧪 Testing

### Test the API Endpoint

```bash
curl -X POST http://localhost:3000/api/rowan \
  -H "Content-Type: application/json" \
  -d '{
    "bookTitle": "Words of Radiance",
    "chapter": 5,
    "message": "Who is Kaladin?",
    "userId": "test-user"
  }'
```

### Test Health Check

```bash
curl http://localhost:3000/api/health
```

---

## 📝 Adding New Books

1. Create a new directory in `rag/books/`:
   ```bash
   mkdir rag/books/new-book-name
   ```

2. Add chapter notes using the template

3. Update the book list in `public/index.html`:
   ```html
   <option value="New Book Name">New Book Name</option>
   ```

4. Add the mapping in `utils/rag-loader.js`:
   ```javascript
   const bookMap = {
     'new-book-name': 'New Book Name'
   };
   ```

---

## 🔐 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key |
| `GOOGLE_SHEETS_CREDENTIALS` | ❌ No | Service account JSON for logging |
| `GOOGLE_SHEET_ID` | ❌ No | The ID of your Google Sheet |
| `PORT` | ❌ No | Server port (default: 3000) |

---

## 💡 Tips for Your Test Readers

1. **Select book and chapter first** before asking questions
2. **Conversation history resets** when you change book or chapter
3. **Ask anything**: recaps, character questions, confusing scenes, themes
4. **No spoilers**: Rowan only knows up to your current chapter
5. **Use Shift+Enter** for new lines in the text box

---

## 🐛 Troubleshooting

### "Failed to get response from Rowan"
- Check your `OPENAI_API_KEY` is set correctly
- Verify you have credits in your OpenAI account
- Check the console for detailed error messages

### "No notes found for book"
- Make sure chapter notes are in the correct directory
- File names should be `chapter-01.md`, `chapter-02.md`, etc.
- Check that the book directory name matches the normalized slug

### Google Sheets logging not working
- Verify `GOOGLE_SHEETS_CREDENTIALS` is valid JSON
- Check the service account has access to the sheet
- Make sure the sheet has a tab named `Conversations`
- Check server logs for specific errors

---

## 📊 Viewing Conversation Logs

If Google Sheets logging is enabled, all conversations are logged to your sheet with:
- Timestamp
- User ID (anonymous, session-based)
- Book title
- Chapter number
- User's question
- Rowan's response

You can analyze this data to:
- See what questions readers ask most
- Identify confusing chapters
- Improve chapter notes
- Understand user behavior

---

## 🎨 Customization

### Change Rowan's Personality

Edit `rowan-prompt.js` to modify Rowan's tone, knowledge, or behavior.

### Adjust RAG Context Window

In `utils/rag-loader.js`, modify the `determineContextNeeded()` function:

```javascript
// Change the context window for recap questions (default: 3)
return needsExtendedContext ? 5 : 1; // Load 5 chapters instead of 3
```

### Adjust Conversation History Limit

In `utils/openai-client.js`, change the history limit:

```javascript
const MAX_HISTORY_MESSAGES = 20; // Default is 10
```

### Change AI Model

In `utils/openai-client.js`, update the model:

```javascript
model: 'gpt-4o-mini', // or 'gpt-4-turbo-preview', 'gpt-3.5-turbo', etc.
```

---

## 📚 What's Next?

For v1, you might want to add:
- User authentication
- Persistent conversation history
- Better RAG with embeddings
- Character/location reference pages
- Reading progress tracking
- Mobile app

---

## 🤝 Support

For your 3 test readers, share:
1. The deployed URL
2. Instructions: "Select your book and chapter, then ask Rowan anything!"
3. Feedback form/channel to report issues

---

## 📄 License

ISC

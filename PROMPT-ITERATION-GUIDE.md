# ROWAN Prompt Optimization & Iteration Guide

This guide explains how to optimize, test, and iterate on Rowan's system prompts based on user feedback.

---

## 🎯 Overview

Docent includes a sophisticated prompt optimization system with:

1. **Tiered Prompts**: Short & full versions for cost optimization
2. **Version Control**: A/B test different prompt styles
3. **Feedback Collection**: Track which prompts work best
4. **Smart Selection**: Automatic prompt selection based on query complexity

---

## ⚡ How the Tiered Prompt System Works

### SHORT Prompts (~300 tokens)
**Used for:**
- Simple, direct questions ("Who is Kaladin?")
- Character clarifications
- Quick fact checks
- Follow-up questions in an ongoing conversation

**Benefits:**
- 65% cost reduction vs. full prompt
- Faster responses
- Still maintains Rowan's personality and spoiler-safety

### FULL Prompts (~850 tokens)
**Used for:**
- First message in a conversation
- Complex questions or recap requests
- Queries asking for explanations or deep dives
- Keywords: "explain", "recap", "confused", "understand", "themes", etc.

**Benefits:**
- Complete behavioral guidelines
- More detailed examples
- Better handling of edge cases

---

## 🔄 How to Change Prompt Versions

### Quick Change (Testing)

Edit `rowan-prompt.js` and change line 12:

```javascript
const ACTIVE_PROMPT_VERSION = 'v1.0'; // Change to 'v1.1' or 'v1.2'
```

### Available Versions

| Version | Style | Token Count | Best For |
|---------|-------|-------------|----------|
| **v1.0** | Comprehensive, detailed | ~850 | Default, well-tested |
| **v1.1** | Concise, action-oriented | ~400 | Faster responses |
| **v1.2** | Shortest, personality-focused | ~200 | Maximum cost savings |

### Create a New Version

Add to `rowan-prompt.js`:

```javascript
const ROWAN_PROMPT_V1_3 = `Your new prompt here...`;

// Add to PROMPT_VERSIONS registry
const PROMPT_VERSIONS = {
  // ... existing versions
  'v1.3': {
    short: ROWAN_PROMPT_V1_3,
    full: ROWAN_PROMPT_V1_3,
    description: 'My custom prompt for testing'
  }
};
```

Then change:
```javascript
const ACTIVE_PROMPT_VERSION = 'v1.3';
```

---

## 📊 Collecting & Analyzing Feedback

### What Gets Logged

Every conversation logs to Google Sheets with:

| Column | Description |
|--------|-------------|
| Timestamp | When the question was asked |
| User ID | Anonymous session ID |
| Book | Book title |
| Chapter | Chapter number |
| Question | User's question |
| Answer | Rowan's response |
| **Prompt Version** | Which prompt version was used |
| **Prompt Type** | `short` or `full` |
| **Context Window** | How many chapters loaded (1 or 3) |
| **Tokens Used** | Total tokens for this request |
| Feedback Rating | Reserved for future feedback |

### Feedback Endpoint

Users can submit feedback via:

```javascript
POST /api/feedback
{
  "userId": "user_abc123",
  "bookTitle": "Words of Radiance",
  "chapter": 17,
  "question": "Who is Kaladin?",
  "answer": "Kaladin is...",
  "rating": 5,
  "feedback": "This was super helpful!",
  "promptVersion": "v1.0",
  "messageId": "msg_xyz"
}
```

This creates a separate "Feedback" sheet with detailed ratings tied to prompt versions.

---

## 🧪 A/B Testing Workflow

### Step 1: Set Up Google Sheets

Create two sheets in your Google Sheet:

**Sheet 1: "Conversations"**
Headers:
```
Timestamp | User ID | Book | Chapter | Question | Answer | Prompt Version | Prompt Type | Context Window | Tokens Used | Feedback Rating
```

**Sheet 2: "Feedback"**
Headers:
```
Timestamp | User ID | Book | Chapter | Rating | Feedback | Prompt Version | Message ID | Question | Answer
```

### Step 2: Deploy Two Versions

**Option A:** Deploy to different URLs
- `docent-v1-0.vercel.app` with v1.0
- `docent-v1-1.vercel.app` with v1.1

**Option B:** Random assignment (add to `openai-client.js`):
```javascript
// Randomly select version for A/B test
const ACTIVE_PROMPT_VERSION = Math.random() < 0.5 ? 'v1.0' : 'v1.1';
```

### Step 3: Collect Data

Run for 1-2 weeks with your test readers.

### Step 4: Analyze Results

**In Google Sheets, create pivot tables or use formulas:**

```sql
-- Average tokens by prompt version
=AVERAGEIF(G:G, "v1.0", J:J)  // v1.0 avg tokens
=AVERAGEIF(G:G, "v1.1", J:J)  // v1.1 avg tokens

-- Count by prompt type
=COUNTIF(H:H, "short")  // How many used short prompt
=COUNTIF(H:H, "full")   // How many used full prompt

-- Average rating by version (from Feedback sheet)
=AVERAGEIF(Feedback!G:G, "v1.0", Feedback!E:E)
```

### Step 5: Choose Winner

Compare:
- **Cost**: Average tokens used
- **Quality**: User feedback ratings
- **Consistency**: Do responses match Rowan's intended personality?

---

## 💡 Optimization Strategies

### 1. **Cost vs. Quality Balance**

```
v1.0 (850 tokens): $$$$ quality, $$$ cost
v1.1 (400 tokens): $$$ quality, $$ cost
v1.2 (200 tokens): $$ quality, $ cost
```

**Recommendation**: Start with v1.0, switch to v1.1 after validating quality.

### 2. **Keywords for Complex Detection**

In `rowan-prompt.js`, adjust the complexity detection:

```javascript
const complexKeywords = [
  'explain', 'recap', 'summary', 'understand', 'confused',
  'what happened', 'remind me', 'catch up', 'themes',
  'meaning', 'significance', 'why does', 'how does'
];
```

Add/remove keywords based on what your users ask.

### 3. **Dynamic Prompt Length**

If token costs spike, you can reduce `max_tokens` in `openai-client.js`:

```javascript
max_tokens: 600 // Down from 800
```

### 4. **Monitor Console Logs**

Watch for:
```
[RAG] Loading 1 chapter(s) of context
[PROMPT] Using SHORT prompt (v1.0)
```

If you see too many FULL prompts, tighten the complexity detection.

---

## 📈 Metrics to Track

### Cost Metrics
- Average tokens per request
- % of queries using SHORT vs FULL
- Total API cost per day/week

### Quality Metrics
- User feedback ratings (1-5 scale)
- % of responses that needed follow-up clarification
- Spoiler incidents (hopefully zero!)

### Behavioral Metrics
- Most common question types
- Average conversation length
- Books/chapters with most questions

---

## 🔧 Quick Fixes for Common Issues

### "Rowan isn't warm enough"
→ Increase use of FULL prompt or adjust temperature up to 0.8

### "Responses are too long"
→ Reduce `max_tokens` or emphasize "concise" in prompt

### "Costs are too high"
→ Switch to v1.2 or increase SHORT prompt usage

### "Rowan gave a spoiler"
→ Strengthen spoiler rules in prompt, add examples of what NOT to say

---

## 🎯 Example: Iterating on Rowan's Tone

Let's say feedback shows "Rowan feels too formal."

### Step 1: Create v1.4

```javascript
const ROWAN_PROMPT_V1_4 = `You're ROWAN - like texting with your smartest friend about fantasy books.

VIBE: Chill, helpful, a little geeky. Never formal or stiff.

RULES:
- No spoilers past their chapter
- Validate confusion ("yeah this part is wild")
- Keep it conversational (contractions are your friend)

STYLE:
"Okay so basically..." not "In summary..."
"That makes sense to wonder about" not "That is a valid inquiry"

Goal: Make fantasy less scary, more fun.`;
```

### Step 2: Deploy & Test

Change `ACTIVE_PROMPT_VERSION = 'v1.4'` and redeploy.

### Step 3: Compare

After 20-30 responses, check feedback:
- Do ratings improve?
- Do users engage more (longer conversations)?
- Are responses still accurate and spoiler-safe?

### Step 4: Decide

- Keep v1.4 if feedback is better
- Revert to v1.0 if quality drops
- Iterate further with v1.5

---

## 📚 Best Practices

### DO:
✅ Test new prompts with 20-50 queries before full rollout
✅ Keep spoiler rules prominent in EVERY version
✅ Log everything (you can't optimize what you don't measure)
✅ Ask your test readers for qualitative feedback too
✅ Version control your prompts (git commit each change)

### DON'T:
❌ Change multiple things at once (can't tell what worked)
❌ Skimp on spoiler safety for cost savings
❌ Ignore outlier feedback (edge cases matter)
❌ Forget to redeploy after changing prompts
❌ Remove logging (data is gold for iteration)

---

## 🚀 Next Steps

1. **Validate v1.0** with your 3 test readers
2. **Collect 2 weeks of data** (conversations + feedback)
3. **Analyze** cost, quality, and user sentiment
4. **Test v1.1** if you need cost savings
5. **Create v1.3** based on specific feedback themes
6. **Iterate** until you nail Rowan's voice

---

## 🤝 Getting Feedback from Test Readers

Ask your test readers:

1. **Tone**: Does Rowan feel warm and helpful?
2. **Clarity**: Are answers easy to understand?
3. **Depth**: Do you wish responses were longer/shorter?
4. **Spoilers**: Any concerns about reveals?
5. **Trust**: Would you recommend Docent to other readers?

Use this qualitative feedback alongside quantitative metrics.

---

**Questions?** Check the main README or review the code in:
- `rowan-prompt.js` - Prompt definitions
- `utils/openai-client.js` - Prompt selection logic
- `utils/logger.js` - Feedback logging
- `server.js` - API endpoints

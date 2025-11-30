# Quick Start Guide - LLM Scribe

## Generate Content for Your First Book

### Step 1: Generate a Test Chapter

Test the system with a single chapter first:

```bash
node scribe/generate-chapter.js "Words of Radiance" 1
```

This will create: `rag/books/words-of-radiance/chapters/chapter-01.md`

### Step 2: Review the Output

Check the generated file to ensure quality meets your standards. Look for:
- ✅ Accurate plot summary
- ✅ No spoilers from later chapters
- ✅ Clear confusion points flagged
- ✅ Good "If Asked" notes

### Step 3: Generate All Content

Once you're happy with the quality, generate everything:

```bash
# Words of Radiance (89 chapters)
node scribe/generate-book.js "Words of Radiance" 89 "Stormlight Archive" 2

# Rhythm of War (115 chapters)
node scribe/generate-book.js "Rhythm of War" 115 "Stormlight Archive" 4

# The Strength of the Few (check chapter count)
node scribe/generate-book.js "The Strength of the Few" [CHAPTER_COUNT] "The Hierarchy" 2
```

## Cost & Time Estimates

| Book | Chapters | Estimated Cost | Estimated Time |
|------|----------|----------------|----------------|
| Words of Radiance | 89 | ~$3.23 | ~3 hours |
| Rhythm of War | 115 | ~$4.17 | ~4 hours |
| The Strength of the Few | TBD | TBD | TBD |

## Tips

1. **Start small**: Generate 1-2 chapters first to test quality
2. **Review early**: Check the first few chapters before generating all
3. **Run overnight**: For large books, consider running overnight
4. **Monitor costs**: Check your OpenAI usage dashboard
5. **Backup files**: The scripts won't overwrite without confirmation

## Troubleshooting

**"API key not found"**
- Make sure `.env` file exists and has `OPENAI_API_KEY=sk-...`

**"Rate limit exceeded"**
- Wait a few minutes and retry
- The scripts include 2-second delays between requests

**Poor quality output**
- Try adjusting the prompts in `scribe/prompts.js`
- Consider using GPT-4o instead of GPT-4o-mini (edit `llm-client.js`)



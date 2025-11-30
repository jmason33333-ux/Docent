# Docent LLM Scribe

Automated RAG content generation system for Docent's knowledge base.

## Overview

The LLM Scribe generates three types of content for each book:

1. **Chapter Notes** - Detailed notes for each chapter
2. **Knowledge Snapshots** - Cumulative summaries every 10 chapters
3. **Book Summaries** - Spoiler-free overviews

## Setup

Make sure your `.env` file has your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-key-here
```

## Usage

### Generate a Single Chapter

```bash
node scribe/generate-chapter.js "Words of Radiance" 1
```

### Generate a Knowledge Snapshot

```bash
node scribe/generate-snapshot.js "Words of Radiance" 10
```

### Generate a Book Summary

```bash
node scribe/generate-book-summary.js "Words of Radiance" "Stormlight Archive" 2
```

### Generate All Content for a Book

This is the recommended way to generate all content at once:

```bash
node scribe/generate-book.js "Words of Radiance" 89 "Stormlight Archive" 2
```

This will:
- Generate book summary
- Generate all chapter notes (1-89)
- Generate knowledge snapshots (every 10 chapters)

**Note:** This is expensive! For a book with 89 chapters, expect:
- Cost: ~$3-5 (using GPT-4o)
- Time: ~3-4 hours (with rate limiting)

## File Structure

Generated files are saved to:

```
rag/books/
├── words-of-radiance/
│   ├── book-summary.md
│   ├── chapters/
│   │   ├── chapter-01.md
│   │   ├── chapter-02.md
│   │   └── ...
│   └── knowledge-snapshots/
│       ├── through-chapter-10.md
│       ├── through-chapter-20.md
│       └── ...
```

## Cost Estimates

Using GPT-4o:
- Chapter notes: ~$0.03 per chapter
- Knowledge snapshots: ~$0.06 per snapshot
- Book summary: ~$0.02

For a 89-chapter book:
- Chapters: 89 × $0.03 = $2.67
- Snapshots: 9 × $0.06 = $0.54
- Summary: $0.02
- **Total: ~$3.23**

## Quality Control

After generation, review:
1. **Spoiler safety** - Ensure no future events are mentioned
2. **Accuracy** - Verify against source material
3. **Completeness** - Check all sections are filled
4. **Clarity** - Ensure confusion points are well-explained

## Tips

- Start with a single chapter to test quality
- Review the first few chapters before generating all
- Adjust prompts in `scribe/prompts.js` if needed
- Use GPT-4o for best quality (default)
- Can use GPT-4o-mini for cost savings (edit `llm-client.js`)

## Troubleshooting

**Error: API key not found**
- Check your `.env` file has `OPENAI_API_KEY` set

**Error: Rate limit exceeded**
- The scripts include rate limiting (2s between requests)
- If you hit limits, wait and retry

**Poor quality output**
- Try adjusting temperature in `llm-client.js`
- Review and refine prompts in `scribe/prompts.js`
- Consider using GPT-4o instead of GPT-4o-mini



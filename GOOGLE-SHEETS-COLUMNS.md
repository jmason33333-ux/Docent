# Google Sheets Column Guide

## Current Column Structure

Your `Conversations` sheet should have these columns (A-X):

### Basic Columns (A-K)
- **A**: Timestamp
- **B**: User ID
- **C**: Book
- **D**: Chapter
- **E**: Question
- **F**: Answer
- **G**: Prompt Version
- **H**: Prompt Type
- **I**: Context Window
- **J**: Tokens Used
- **K**: Feedback Rating

### Query Categorization (L-N)
- **L**: Query Category (Primary category: character, plot, recap, etc.)
- **M**: Query Subcategory (Secondary category or 'none')
- **N**: Query Key Terms (Extracted key terms like character names)

### RAG Tracking (O-T)
- **O**: Notes Available (`YES` / `NO`)
- **P**: Notes Provided (`YES` / `NO`)
- **Q**: Notes Likely Used (`YES` / `NO`)
- **R**: Notes Relevance (Status code: `notes_used`, `notes_not_relevant`, etc.)
- **S**: Chapters Found (Comma-separated chapter numbers)
- **T**: Chapters Missing (Comma-separated chapter numbers)

### Snapshot Tracking (U-X) ⭐ NEW
- **U**: Context Source (`snapshot` | `individual_chapters` | `none`)
- **V**: Snapshot Used (`YES` / `NO`)
- **W**: Snapshot Chapter (Chapter number of snapshot used, e.g., `10`)

---

## How to Update Your Google Sheet

### Step 1: Add New Column Headers

Add these headers to **row 1** of your `Conversations` sheet:

```
U: Context Source
V: Snapshot Used
W: Snapshot Chapter
```

### Step 2: Verify the Range

The script now writes to:
```
range: 'Conversations!A:X'
```

Make sure your sheet has columns A through X (24 columns total).

### Step 3: Format Headers (Optional)

You can format the header row to make it easier to read:
- Bold the headers
- Freeze row 1
- Add background color to distinguish sections

---

## Understanding the New Columns

### Context Source (Column U)

Shows which context source was used:
- **`snapshot`**: Knowledge snapshot was used (efficient, comprehensive)
- **`individual_chapters`**: Individual chapter notes were used (specific details)
- **`none`**: No notes available

### Snapshot Used (Column V)

Simple yes/no indicator:
- **`YES`**: A knowledge snapshot was used for this query
- **`NO`**: Individual chapters or no notes were used

### Snapshot Chapter (Column W)

Shows which snapshot was used:
- **`10`**: Snapshot covering through Chapter 10 was used
- **`20`**: Snapshot covering through Chapter 20 was used
- **Empty**: No snapshot was used

---

## Example Data

Here's what a row might look like:

| Timestamp | User ID | Book | Chapter | Question | Answer | ... | Context Source | Snapshot Used | Snapshot Chapter |
|-----------|---------|------|---------|----------|--------|-----|----------------|---------------|------------------|
| 2024-... | user_123 | Rhythm of War | 10 | Who is Kaladin? | Kaladin is... | ... | snapshot | YES | 10 |

---

## Using This Data

### Find Snapshot Effectiveness

Filter by `Snapshot Used = YES` to see:
- Which queries benefited from snapshots
- Token savings (compare with queries using individual chapters)
- Query types that use snapshots most

### Compare Context Sources

Filter by `Context Source` to see:
- How many queries use snapshots vs. individual chapters
- Which approach works better for different query types

### Track Snapshot Coverage

Filter by `Snapshot Chapter` to see:
- Which snapshots are being used most
- If you need to generate more snapshots (e.g., through-chapter-20, through-chapter-30)

---

## Quick Setup Checklist

- [ ] Add headers to row 1: U, V, W
- [ ] Verify sheet has columns A-X (24 columns)
- [ ] Test with a query that should use snapshot (e.g., "What happened so far?")
- [ ] Check that data appears in columns U, V, W

---

## Troubleshooting

**Problem**: Data not appearing in new columns
- **Solution**: Make sure the range includes `A:X` and headers are in row 1

**Problem**: All values show "none" or "NO"
- **Solution**: Check that snapshots exist in `rag/books/[book-slug]/knowledge-snapshots/`

**Problem**: Wrong snapshot chapter number
- **Solution**: Verify snapshot files are named correctly: `through-chapter-XX.md`



# RAG Notes Tracking Guide

## Overview

Docent now tracks whether chapter notes were available, provided to Rowan, and actually used in responses. This helps you:

1. **Know if notes exist** for the chapters users are asking about
2. **Identify when notes weren't relevant** - so you can improve them
3. **See which questions need better note coverage**

## Google Sheets Columns

Your `Conversations` sheet now has these columns:

### Basic Columns (A-K)
- A: Timestamp
- B: User ID
- C: Book
- D: Chapter
- E: Question
- F: Answer
- G: Prompt Version
- H: Prompt Type
- I: Context Window
- J: Tokens Used
- K: Feedback Rating

### Query Categorization (L-N)
| Column | Description | Values |
|--------|-------------|--------|
| **L** | Query Category | Primary category (see categories below) |
| **M** | Query Subcategory | Secondary category or 'none' |
| **N** | Query Key Terms | Extracted key terms (character names, concepts) |

### RAG Tracking (O-T)
| Column | Description | Values |
|--------|-------------|--------|
| **O** | Notes Available | `YES` / `NO` - Were notes found for the requested chapters? |
| **P** | Notes Provided | `YES` / `NO` - Were notes actually sent to the AI? |
| **Q** | Notes Likely Used | `YES` / `NO` - Did Rowan likely use the notes in the response? |
| **R** | Notes Relevance | Status code (see below) |
| **S** | Chapters Found | Comma-separated list of chapter numbers that had notes |
| **T** | Chapters Missing | Comma-separated list of chapter numbers that were missing notes |

## Notes Relevance Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| `no_notes_available` | No notes exist for this book/chapter | Generate notes for this chapter |
| `notes_missing` | Notes were requested but not found | Check file paths, generate missing notes |
| `notes_used` | Notes were provided and likely used | ✅ Good! Notes are working |
| `notes_not_relevant` | Notes exist but weren't relevant to the question | Improve notes - add more detail about this topic |

## Query Categories

Queries are automatically categorized into these types:

| Category | Description | Example |
|----------|-------------|---------|
| **character** | Questions about characters | "Who is Shallan?" |
| **plot** | Questions about plot events | "What happened in this chapter?" |
| **recap** | Requests for summaries/reminders | "Can you recap what happened?" |
| **worldbuilding** | Questions about world/magic/systems | "How does Surgebinding work?" |
| **relationship** | Questions about relationships | "What's the relationship between X and Y?" |
| **location** | Questions about places | "Where is the Shattered Plains?" |
| **theme** | Questions about themes/symbolism | "What does this symbolize?" |
| **clarification** | Confusion/clarification requests | "I'm confused about..." |
| **comparison** | Comparison questions | "What's the difference between X and Y?" |
| **foreshadowing** | Questions about hints/foreshadowing | "Is this important later?" |
| **general** | General questions | Other questions |

## Setting Up Your Google Sheet

### Step 1: Update Column Headers

Add these headers to row 1 of your `Conversations` sheet:

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
L: Query Category
M: Query Subcategory
N: Query Key Terms
O: Notes Available
P: Notes Provided
Q: Notes Likely Used
R: Notes Relevance
S: Chapters Found
T: Chapters Missing
```

### Step 2: Verify the Range

Make sure your sheet's range includes columns A-X. The script uses:
```
range: 'Conversations!A:X'
```

### Snapshot Tracking (U-W) ⭐ NEW
| Column | Description | Values |
|--------|-------------|--------|
| **U** | Context Source | `snapshot` / `individual_chapters` / `none` |
| **V** | Snapshot Used | `YES` / `NO` - Was a knowledge snapshot used? |
| **W** | Snapshot Chapter | Chapter number of snapshot used (e.g., `10`) |

**Note**: See `GOOGLE-SHEETS-COLUMNS.md` for complete column reference.

## How to Use This Data

### Find Questions Where Notes Weren't Relevant

Filter by `Notes Relevance = notes_not_relevant` to see:
- What questions users are asking
- Which chapters need more detailed notes
- What topics to add to your chapter notes

### Find Missing Notes

Filter by `Notes Available = NO` or `Notes Relevance = no_notes_available` to see:
- Which chapters need notes generated
- Which books need more coverage

### Track Note Quality

Look for patterns:
- If many questions show `notes_not_relevant` for the same chapter → that chapter needs improvement
- If `Notes Likely Used = YES` → your notes are working well!

## Example Analysis

**Scenario:** User asks "What happened with Shallan and the santhid?"

- **Notes Available:** YES
- **Notes Provided:** YES  
- **Notes Likely Used:** YES
- **Notes Relevance:** notes_used
- **Chapters Found:** 1

✅ This means notes were found, provided, and used successfully!

**Scenario:** User asks "What's the significance of the pattern Shallan saw?"

- **Notes Available:** YES
- **Notes Provided:** YES
- **Notes Likely Used:** NO
- **Notes Relevance:** notes_not_relevant
- **Chapters Found:** 1

⚠️ Notes exist but weren't relevant. You should add more detail about the pattern in Chapter 1 notes.

## Console Logging

Even without Google Sheets, you'll see RAG tracking in console logs:

```
[RAG] Notes available: YES (1 found, 0 missing)
[CONVERSATION LOG] {
  ...
  notesAvailable: "YES",
  notesLikelyUsed: "YES",
  notesRelevance: "notes_used"
}
```

## Notes Usage Detection

The system uses heuristics to detect if notes were used:

- ✅ Response contains specific chapter/scene references
- ✅ Response is detailed (not generic)
- ✅ Response length suggests detailed knowledge was used

This is a heuristic - not perfect, but gives you good insights!


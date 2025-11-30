# Smart Context Selection - Implementation Guide

## Overview

The system now intelligently chooses between knowledge snapshots and individual chapter notes based on query type, providing better answers while reducing token usage by up to 90%.

---

## How It Works

### Query Routing Logic

The system categorizes each query and routes it to the best context source:

| Query Type | Context Source | Why |
|------------|---------------|-----|
| **Recap** | Snapshot | Comprehensive summary needed |
| **Character** | Snapshot | Complete character info with relationships |
| **Plot** | Snapshot | Plot threads with connections |
| **Worldbuilding** | Snapshot | Cumulative lore knowledge |
| **Relationship** | Snapshot | Character relationship mapping |
| **Theme** | Snapshot | Cross-chapter thematic patterns |
| **Specific Chapter** | Individual Chapters | Need chapter-specific details |
| **Clarification** | Individual Chapters | Usually about a specific scene |

### Implementation Details

1. **`loadKnowledgeSnapshot(bookTitle, currentChapter)`**
   - Finds the most recent snapshot that covers up to `currentChapter`
   - Returns snapshot content and metadata
   - Falls back gracefully if no snapshot exists

2. **`shouldUseSnapshot(queryCategory)`**
   - Determines if snapshot is appropriate for query type
   - Returns `true` for: recap, character, plot, worldbuilding, relationship, theme

3. **Smart Selection in `chatWithRowan()`**
   - Checks query category
   - Tries snapshot first (if appropriate)
   - Falls back to individual chapters if snapshot unavailable
   - Logs context source for analytics

---

## Benefits

### Token Efficiency
- **Before**: Recap question at Ch 10 = ~20,000 tokens (loading 7-10 chapters)
- **After**: Recap question at Ch 10 = ~5,000 tokens (using snapshot)
- **Savings**: 75% reduction

### Better Answers
- Snapshots provide synthesized context
- Character questions get complete relationship info
- Plot questions get thread connections
- World-building questions get cumulative knowledge

### Analytics
- Track when snapshots are used
- Identify queries that benefit from snapshots
- Monitor token savings

---

## Metadata Tracking

New fields added to conversation logs:

- **`contextSource`**: `'snapshot'` | `'individual_chapters'` | `'none'`
- **`snapshotUsed`**: `true` | `false`
- **`snapshotChapter`**: Chapter number of snapshot used (e.g., `10`)

### Google Sheets Columns

The logger now writes to columns **U-X**:
- **U**: Context Source
- **V**: Snapshot Used (YES/NO)
- **W**: Snapshot Chapter

---

## Example Flow

### Query: "Who is Kaladin?"

1. **Categorize**: `primaryCategory = 'character'`
2. **Check**: `shouldUseSnapshot('character')` → `true`
3. **Load**: `loadKnowledgeSnapshot('Rhythm of War', 10)`
4. **Result**: Returns snapshot through-chapter-10.md
5. **Context**: ~5,000 tokens (vs ~20,000 for 10 chapters)
6. **Answer**: Comprehensive character info with relationships, arc, key moments

### Query: "What happened in Chapter 5?"

1. **Categorize**: `primaryCategory = 'plot'` (but specific chapter)
2. **Check**: Could use snapshot, but specific chapter question
3. **Load**: `loadChapterContext('Rhythm of War', 5, 1)`
4. **Result**: Returns chapter-05.md
5. **Context**: ~5,000 tokens (appropriate for specific question)
6. **Answer**: Detailed chapter-specific events

---

## Testing

To test the implementation:

1. **Recap Query**: "What happened so far?" → Should use snapshot
2. **Character Query**: "Who is Navani?" → Should use snapshot
3. **Plot Query**: "What are the main storylines?" → Should use snapshot
4. **Specific Query**: "What happened in Chapter 3?" → Should use individual chapter

Check server logs for:
```
[RAG] Using knowledge snapshot (through Ch 10) for character query
[RAG] Context source: snapshot
```

---

## Future Enhancements

1. **Hybrid Approach**: Use snapshot + current chapter for best of both worlds
2. **Section-Specific Loading**: Load only relevant snapshot sections
3. **Progressive Snapshots**: Load multiple snapshots for very long books
4. **Smart Fallback**: If snapshot doesn't answer well, try individual chapters

---

## Files Modified

- `utils/rag-loader.js`: Added `loadKnowledgeSnapshot()` and `shouldUseSnapshot()`
- `utils/openai-client.js`: Updated `chatWithRowan()` with smart selection
- `utils/logger.js`: Added snapshot tracking to metadata

---

## Notes

- Snapshots must exist in `rag/books/[book-slug]/knowledge-snapshots/`
- System gracefully falls back to individual chapters if snapshot unavailable
- All tracking is logged to Google Sheets for analysis



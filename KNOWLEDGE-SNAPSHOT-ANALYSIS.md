# Knowledge Snapshot Analysis & Enhancement Plan

## Current State

**Knowledge snapshots exist but are NOT currently used in the RAG system.**

The system only loads individual chapter notes via `loadChapterContext()`, which loads 1-3 chapters at a time.

---

## Benefits of Knowledge Snapshots for the LLM

### 1. **Token Efficiency** 🎯
- **Problem**: Loading 10 individual chapter notes = ~50,000+ tokens
- **Solution**: Knowledge snapshot = ~5,000 tokens (90% reduction)
- **Impact**: Faster responses, lower costs, fits in context window

### 2. **Comprehensive Context** 📚
- **Problem**: Individual chapters miss cross-chapter patterns
- **Solution**: Snapshots synthesize character arcs, plot threads, world-building
- **Impact**: Better answers to "How has Kaladin changed?" or "What are the main plot threads?"

### 3. **Spoiler Safety** 🛡️
- **Problem**: Loading individual chapters risks including future spoilers
- **Solution**: Snapshots explicitly marked "Safe for readers up to Chapter X"
- **Impact**: Guaranteed spoiler boundaries

### 4. **Query Type Optimization** 🎯
- **Recap questions**: "What happened so far?" → Use snapshot
- **Character questions**: "Who is Kaladin?" → Use snapshot (character section)
- **Plot questions**: "What are the main storylines?" → Use snapshot (plot threads)
- **World-building**: "How do fabrials work?" → Use snapshot (lore section)

### 5. **Better Character Tracking** 👥
- **Problem**: Character info scattered across chapters
- **Solution**: Snapshot has "Major Characters" section with first appearance, development, current status
- **Impact**: Complete character context without loading 10+ chapters

---

## Current Limitations

1. **Not Integrated**: Snapshots exist but aren't loaded by `rag-loader.js`
2. **No Smart Selection**: System doesn't choose between snapshot vs. individual chapters
3. **No Query Routing**: Doesn't match query type to best context source
4. **Missing Metadata**: No tracking of snapshot usage

---

## Enhancement Recommendations

### 1. **Smart Context Selection** (Priority: HIGH)

**Add logic to choose between snapshot and individual chapters:**

```javascript
function loadOptimalContext(bookTitle, currentChapter, message, queryCategory) {
  // For recap/character/plot questions → use snapshot
  if (queryCategory === 'recap' || queryCategory === 'character' || queryCategory === 'plot') {
    const snapshot = loadKnowledgeSnapshot(bookTitle, currentChapter);
    if (snapshot) return snapshot;
  }
  
  // For specific chapter questions → use individual chapters
  return loadChapterContext(bookTitle, currentChapter, contextWindow);
}
```

**Benefits:**
- 90% token reduction for recap questions
- Better answers for character/plot questions
- Faster responses

### 2. **Hybrid Approach** (Priority: HIGH)

**Use snapshot + current chapter:**

```javascript
// Load snapshot for background context
const snapshot = loadKnowledgeSnapshot(bookTitle, currentChapter - 1);
// Load current chapter for specific details
const currentChapter = loadChapterContext(bookTitle, currentChapter, 0);

return {
  background: snapshot,  // "What you know so far"
  current: currentChapter // "What's happening now"
}
```

**Benefits:**
- Best of both worlds
- Snapshot provides context, current chapter provides details
- Still more efficient than loading 10 chapters

### 3. **Query-Based Routing** (Priority: MEDIUM)

**Route queries to best context source:**

| Query Type | Best Context | Why |
|------------|--------------|-----|
| "Who is X?" | Snapshot (Characters section) | Complete character info |
| "What happened so far?" | Snapshot (Plot Threads) | Comprehensive summary |
| "How does X work?" | Snapshot (World-Building) | Cumulative knowledge |
| "What happened in Ch 5?" | Individual chapter | Specific chapter details |
| "Explain this scene" | Current chapter | Scene-specific context |

### 4. **Snapshot Metadata** (Priority: MEDIUM)

**Track snapshot usage:**

```javascript
metadata: {
  snapshotUsed: true,
  snapshotChapter: 10,
  snapshotLength: 5000,
  contextSource: 'snapshot' // vs 'individual_chapters'
}
```

**Benefits:**
- Analytics on when snapshots help
- Identify queries that need better snapshots
- Cost tracking

### 5. **Progressive Snapshot Loading** (Priority: LOW)

**Load multiple snapshots for very long books:**

```javascript
// For Chapter 50, load:
// - through-chapter-10.md (early context)
// - through-chapter-30.md (mid context)  
// - through-chapter-50.md (recent context)
```

**Benefits:**
- Better context for long books
- Still more efficient than individual chapters

### 6. **Snapshot Sections as Context** (Priority: MEDIUM)

**Load specific snapshot sections based on query:**

```javascript
// For "Who is Kaladin?" → Load only "Major Characters" section
// For "What are the plot threads?" → Load only "Plot Threads" section
// For "How do fabrials work?" → Load only "World-Building" section
```

**Benefits:**
- Even more token-efficient
- Precise context matching
- Faster responses

---

## Implementation Priority

1. **Phase 1 (Quick Win)**: Add snapshot loading to `rag-loader.js`
   - Simple: Load snapshot if available, fallback to chapters
   - Impact: Immediate token savings for recap questions

2. **Phase 2 (Smart)**: Query-based routing
   - Detect query type → choose snapshot vs. chapters
   - Impact: Better answers, better efficiency

3. **Phase 3 (Advanced)**: Hybrid approach
   - Snapshot + current chapter
   - Impact: Best context for all query types

---

## Example: Token Comparison

**Current approach (recap question at Chapter 10):**
- Load chapters 7-10: ~20,000 tokens
- Response: Good, but expensive

**With snapshot:**
- Load snapshot through-chapter-10: ~5,000 tokens
- Response: Better (synthesized context), 75% cheaper

**With hybrid:**
- Snapshot (Ch 1-9): ~4,500 tokens
- Current chapter (Ch 10): ~5,000 tokens
- Total: ~9,500 tokens
- Response: Best (context + details), still 50% cheaper

---

## Next Steps

1. Add `loadKnowledgeSnapshot()` function to `rag-loader.js`
2. Update `chatWithRowan()` to use snapshots for appropriate queries
3. Add snapshot usage tracking to metadata
4. Test with recap/character/plot questions
5. Monitor token usage and response quality



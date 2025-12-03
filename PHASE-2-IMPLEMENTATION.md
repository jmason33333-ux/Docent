# Phase 2 Implementation: Smart Chapter Discovery

**Status:** ✅ Complete  
**Date:** 2025-12-03

---

## Problem Phase 2 Solves

**Issue:** Phase 1 prioritized snapshots, but when snapshots weren't available or weren't comprehensive enough, we still loaded chapters sequentially (currentChapter - N to currentChapter), which missed:
- First appearances (e.g., Shallan first appears in Ch 3, not Ch 5)
- Specific event chapters (e.g., Shallan meets Jasnah in Ch 5, not Ch 7)
- Character development across scattered chapters

**Solution:** Smart chapter discovery that finds and loads **relevant chapters** based on what the question is actually asking about.

---

## What Phase 2 Does

### 1. Character Name Extraction (`utils/character-context-loader.js`)
- Parses queries to extract character names (Shallan, Kaladin, etc.)
- Detects event keywords ("first meet", "what happened to")
- Identifies location references

### 2. Smart Chapter Discovery
- **Searches chapter notes** for character mentions (POV, major character, summary)
- **Finds ALL chapters** where a character appears (up to current chapter)
- **Loads specific chapters** instead of sequential ranges

### 3. Enhanced "First" Question Handling
- **"Who is X?"** → Finds first appearance + key early chapters + recent chapters
- **"Where does X first meet Y?"** → Finds chapters where both characters appear together
- **"What happened to X?"** → Finds relevant event chapters

---

## How It Works for Your Test Questions

### Question 1: "Who is Shallan?" (Chapter 5)

**Phase 1 Behavior:**
- Loaded snapshot (if available) + Chapters 4, 5
- Missing: Chapter 3 (first POV)

**Phase 2 Behavior:**
- ✅ Extracts "Shallan" from query
- ✅ Searches chapters 1-5 for "Shallan" mentions
- ✅ Finds: Chapter 3 (first POV), Chapter 5 (current)
- ✅ Loads: Chapter 3 (first appearance) + Chapter 5 + any other Shallan chapters
- **Result:** Comprehensive context from first introduction

### Question 2: "Where does Shallan first meet Jasnah?" (Chapter 8)

**Phase 1 Behavior:**
- Loaded snapshot (if available) + Chapters 7, 8
- Wrong answer: Said Chapter 7 (incorrect!)

**Phase 2 Behavior:**
- ✅ Extracts "Shallan" and "Jasnah" + detects "first meet"
- ✅ Finds chapters where BOTH characters appear: Chapter 5 (first meeting)
- ✅ Loads: Chapter 5 (first meeting) + Chapter 3 (context) + Chapters 7, 8 (recent)
- **Result:** Correct answer - Chapter 5

### Question 3: "What happened to Kaladin's brother?" (Chapter 10)

**Phase 1 Behavior:**
- Loaded snapshot-10 (if available)
- Missing: Specific context about Tien from Chapter 10 (flashback chapter)

**Phase 2 Behavior:**
- ✅ Extracts "Kaladin" and "brother" (Tien)
- ✅ Detects "what happened to" event question
- ✅ Finds: Chapter 10 (flashback about Tien) + early Kaladin chapters
- ✅ Loads: Chapter 10 (key event) + relevant early chapters for context
- **Result:** Comprehensive answer about Tien with proper chapter citations

---

## Technical Implementation

### New Files
1. **`utils/character-context-loader.js`**
   - `extractEntitiesFromQuery()` - Extracts characters, locations, events
   - `findCharacterChapters()` - Searches chapters for character mentions
   - `determineSmartContext()` - Determines which chapters to load

### Modified Files
1. **`utils/rag-loader.js`**
   - Added `loadChapterContextByNumbers()` - Loads specific chapter numbers (not sequential)

2. **`utils/openai-client.js`**
   - Uses `determineSmartContext()` when snapshot unavailable
   - Uses smart discovery to supplement snapshots with relevant chapters

---

## Smart Context Discovery Logic

### Character Questions
```javascript
if (queryCategory === 'character') {
  // Find all chapters where character appears
  const allChapters = findCharacterChapters(bookTitle, character, currentChapter);
  
  // For "first" questions:
  - Load first appearance chapter
  - Load a few early context chapters
  - Load recent chapters
  
  // For regular questions:
  - Load first appearance
  - Load key middle chapters (if any)
  - Load recent chapters
}
```

### "First Meeting" Questions
```javascript
if (query.includes('first meet') && has two characters) {
  // Find chapters where BOTH characters appear
  const char1Chapters = findCharacterChapters(bookTitle, char1, currentChapter);
  const char2Chapters = findCharacterChapters(bookTitle, char2, currentChapter);
  const bothAppear = intersection(char1Chapters, char2Chapters);
  
  // Load first chapter where both appear + context
  - Load firstTogetherChapter
  - Load surrounding chapters for context
  - Load recent chapters
}
```

---

## Expected Improvements

### Context Quality
- ✅ Loads **relevant chapters** (first appearances, key events)
- ✅ Not just sequential "current - N" chapters
- ✅ Finds chapters based on **what the question asks**

### Answer Accuracy
- ✅ "Where does Shallan first meet Jasnah?" → Correctly finds Chapter 5
- ✅ "Who is Shallan?" → Includes Chapter 3 (first POV)
- ✅ "What happened to Kaladin's brother?" → Includes Chapter 10 (flashback)

### Performance
- ⚠️ Slightly slower (searches chapter files) but more accurate
- ⚠️ Could be optimized with chapter index (future enhancement)

---

## Testing Your Questions

**Test 1: "Who is Shallan?" (Chapter 5)**
- Expected: Snapshot (if available) + Chapters 3, 5
- Should reference Chapter 3 as first introduction

**Test 2: "Where does Shallan first meet Jasnah?" (Chapter 8)**
- Expected: Snapshot (if available) + Chapter 5 (first meeting) + Chapters 7, 8
- Should correctly answer Chapter 5

**Test 3: "What happened to Kaladin's brother?" (Chapter 10)**
- Expected: Snapshot-10 (if available) + Chapter 10 (flashback) + early context
- Should provide detailed answer about Tien with Chapter 10 citation

---

## Limitations & Future Enhancements

### Current Limitations
1. **Performance:** Searches chapter files sequentially (could be slow for large books)
2. **Character Detection:** Uses pattern matching (might miss variations)
3. **No Chapter Index:** Doesn't have pre-built index of character/location appearances

### Phase 3 (Future)
1. **Build Chapter Index:** Pre-index all chapters with character/location metadata
2. **Faster Lookups:** Use index instead of searching files
3. **Better Entity Extraction:** Use NLP or ML for character name detection

---

## Files Modified

1. **`utils/character-context-loader.js`** (NEW)
   - Smart context discovery logic
   - Character/location extraction
   - Chapter search functionality

2. **`utils/rag-loader.js`**
   - Added `loadChapterContextByNumbers()` function
   - Exported new function

3. **`utils/openai-client.js`**
   - Integrated smart context discovery
   - Uses smart discovery when snapshot unavailable
   - Uses smart discovery to supplement snapshots

---

## How to Test

The system should now:
1. **Prioritize snapshots** (Phase 1)
2. **Use smart discovery** when snapshots unavailable (Phase 2)
3. **Supplement snapshots** with smart-discovered relevant chapters (Phase 2)

Test with your three questions and check:
- Correct chapters loaded (check console logs)
- Answers reference correct chapters (e.g., Ch 5 for Jasnah meeting, Ch 3 for Shallan intro)
- Answers are comprehensive and conversational


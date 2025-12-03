# Rowan Context Selection Strategy
## Achieving the Vision: Conversational Depth for Character & Location Questions

**Vision:** Rowan should feel like talking to a friend who truly understands the book—someone who can provide comprehensive context and depth, making epic fantasy accessible without spoilers.

---

## Core Principle: **Comprehensive Context for Depth**

For character and location questions, we need to move beyond "first mention" to provide **comprehensive understanding** that enables:
- Rich, detailed answers that show true book knowledge
- Ability to connect across multiple chapters and scenes
- Conversational responses that feel natural and insightful
- Depth that helps readers truly understand, not just get a quick fact

---

## Current System Limitations

### What's Wrong Now:
1. **Too Narrow Context:** Only loads 1-3 chapters backwards from current chapter
2. **Missing Character History:** Doesn't find all chapters where character appears
3. **No Location Tracking:** Doesn't gather all mentions of a location
4. **Snapshot Underutilization:** Snapshots have comprehensive info but aren't prioritized for character questions
5. **No Smart Character Search:** Can't identify which chapters contain character/location info

---

## Proposed Strategy: **Multi-Layered Context Loading**

### Layer 1: **Snapshots (Primary Source)**
**When to Use:** For character, location, relationship, and world-building questions

**Why Snapshots First:**
- Snapshots contain **comprehensive character profiles** with:
  - First appearance
  - Character arc across chapters
  - Key relationships
  - Major scenes and developments
  - All POV chapters tracked
- Snapshots are **curated for depth** - they're designed to provide complete understanding
- **One source, comprehensive answer** - more efficient and coherent than scattered chapters

**Implementation:**
```
IF question_type IN [character, location, relationship]:
  PRIORITIZE: Load snapshot for current chapter
  IF snapshot available:
    USE snapshot as PRIMARY context
    SUPPLEMENT with recent chapter notes (if needed for specific scene details)
```

---

### Layer 2: **Smart Character/Location Chapter Discovery**
**When to Use:** When snapshot unavailable OR question asks about specific scene/chapter

**Strategy:** 
Instead of loading "N chapters back", we should:
1. **Extract character/location names** from the question
2. **Search chapter notes** for mentions of that character/location
3. **Load all relevant chapters** where character appears (up to current chapter)
4. **Include key relationship chapters** (chapters where character interacts with others)

**Example:**
```
Question: "Who is Shallan?" (User on Chapter 8)

Current Behavior:
- Loads Chapters 6, 7, 8
- Misses Chapter 3 (first POV), Chapter 5 (important scene)

New Behavior:
- Load snapshot-10 (comprehensive Shallan profile)
- ALSO load: Chapters 3, 5, 7, 8 (all Shallan chapters up to Ch 8)
- Provides full context from first appearance through current chapter
```

---

### Layer 3: **Relationship Context**
**When to Use:** Questions about relationships, interactions, or multiple characters

**Strategy:**
For relationship questions, load:
1. Snapshot (contains relationship sections)
2. All chapters where both characters appear together
3. Individual character chapters that show relationship development

**Example:**
```
Question: "How do Shallan and Jasnah relate?" (User on Chapter 8)

Load:
- Snapshot (relationship section)
- Chapters where both appear: 5, 7, 8
- Key Shallan chapters: 3, 5
- Key Jasnah chapters: 5, 7
```

---

## Implementation Plan

### Phase 1: Enhance Snapshot Priority (Quick Win)
**File:** `utils/openai-client.js`

**Changes:**
1. Modify context selection to prioritize snapshots for character/location questions
2. Ensure snapshot is loaded even when individual chapters are also loaded
3. Structure context so snapshot comes first, then supplement with specific chapters

**Code Pattern:**
```javascript
// For character/location questions
if (queryCategory.primaryCategory === 'character' || 
    queryCategory.primaryCategory === 'location') {
  
  // PRIORITIZE: Try snapshot first
  const snapshotResult = loadKnowledgeSnapshot(bookTitle, chapter);
  
  if (snapshotResult.metadata.snapshotAvailable) {
    context = snapshotResult.context; // Comprehensive context
    contextSource = 'snapshot';
    
    // SUPPLEMENT: Add recent relevant chapters for specific details
    const recentChapters = loadChapterContext(bookTitle, chapter, 2);
    context += `\n\n--- RECENT CHAPTER CONTEXT ---\n${recentChapters.context}`;
  }
}
```

---

### Phase 2: Character/Location Chapter Discovery (Medium Complexity)
**File:** `utils/rag-loader.js` - New function: `loadCharacterContext()`

**New Function:**
```javascript
/**
 * Load all chapters where a character appears (up to current chapter)
 * @param {string} bookTitle - Book title
 * @param {string} characterName - Character to search for (e.g., "Shallan")
 * @param {number} currentChapter - Current chapter
 * @returns {Object} - { context, metadata: { chaptersFound } }
 */
function loadCharacterContext(bookTitle, characterName, currentChapter) {
  // Strategy:
  // 1. Load snapshot first (has comprehensive character info)
  // 2. Search chapter notes metadata for character mentions
  // 3. Load all chapters where character is:
  //    - POV character
  //    - Major character in chapter
  //    - First appearance
  
  // For now, use snapshot + heuristic:
  // - Load first POV chapter (if we have metadata)
  // - Load chapters 1-10 (likely introduction period)
  // - Load recent chapters (current chapter - 5 to current)
  
  // TODO: Build chapter index with character metadata
}
```

**Metadata Enhancement Needed:**
- Chapter notes need character metadata (POV, major characters, first appearance)
- Or: Parse chapter notes to extract character information
- Create index: `character-index.json` mapping characters to chapters

---

### Phase 3: Build Chapter Index (Advanced)
**File:** New file: `utils/chapter-index.js`

**Purpose:** Index all chapters with:
- POV characters
- Major characters mentioned
- Locations
- Key relationships
- First appearances

**Format:**
```json
{
  "the-way-of-kings": {
    "3": {
      "pov": ["Shallan"],
      "majorCharacters": ["Shallan", "Jasnah", "Yalb"],
      "locations": ["Kharbranth"],
      "firstAppearance": {
        "Shallan": 3,
        "Kharbranth": 3
      }
    },
    "5": {
      "pov": ["Shallan"],
      "majorCharacters": ["Shallan", "Jasnah", "Taravangian"],
      "locations": ["Kharbranth", "Palanaeum"],
      "relationships": ["Shallan-Jasnah"]
    }
  }
}
```

**Benefits:**
- Fast lookup of all chapters for a character
- Efficient context loading
- No need to parse all chapter notes on every request

---

### Phase 4: Enhanced Prompt Instructions (Critical)
**File:** `rowan-prompt.js` and `utils/openai-client.js`

**Add Instructions for Character/Location Questions:**

```javascript
// In context instructions for character questions:
const characterInstructions = `
CRITICAL: You have comprehensive context about this character from:
- Knowledge Snapshot (complete character profile, arc, relationships, key scenes)
- Individual Chapter Notes (specific scenes and moments)

EXPECTATION: Provide a RICH, CONVERSATIONAL answer that shows deep understanding:
- Draw from their FULL journey up to this point (not just recent chapters)
- Reference multiple scenes to show character development
- Connect motivations, relationships, and growth
- Sound like you truly know this character, not just their basic facts

TONE: Like explaining a friend's backstory - warm, detailed, comprehensive
DEPTH: Go beyond "first introduction" - show how they've grown, what drives them, key moments
STRUCTURE: Use full 6-section format for comprehensive character explanations
`;
```

---

## Response Quality Improvements

### Character Questions Should Include:
1. **Full Introduction:** Where they first appeared and initial impression
2. **Character Arc:** How they've developed across chapters
3. **Key Moments:** 3-5 specific scenes that define them (with chapter refs)
4. **Relationships:** Who they interact with and how
5. **Motivations:** What drives them, what they want
6. **Current State:** Where they are emotionally/situationally at current chapter

### Location Questions Should Include:
1. **First Visit:** When reader first encountered it
2. **Description:** Physical and atmospheric details
3. **Significance:** Why it matters to the story
4. **Events:** Major scenes that happened there
5. **Character Associations:** Who is connected to this place
6. **Recurring Themes:** How location relates to broader story

---

## Example: Before vs After

### **Before (Current System):**
```
Question: "Who is Shallan?" (Chapter 8)

Context Loaded:
- Chapters 7, 8 only

Response:
"Shallan is a young woman seeking to become Jasnah's ward. 
In Chapter 5, she meets Jasnah in Kharbranth..."
[Misses Chapter 3 introduction, lacks depth]
```

### **After (Proposed System):**
```
Question: "Who is Shallan?" (Chapter 8)

Context Loaded:
- Snapshot-10 (comprehensive Shallan profile)
- Chapters 3, 5, 7, 8 (all Shallan chapters)

Response:
"Shallan Davar is one of the most intriguing characters in this book, 
and her story is just getting started!

**First Introduction:**
We first meet Shallan in Chapter 3, when she arrives in Kharbranth 
seeking Jasnah Kholin. Right away, you can see she's determined but 
also nervous - she's been chasing Jasnah for months...

**Her Journey So Far:**
In Chapter 3, she's just arrived and is overwhelmed by the city. 
By Chapter 5, she's finally meeting Jasnah, and we learn her real 
motivation: she needs to steal Jasnah's Soulcaster to save her 
family from financial ruin. This creates such interesting tension - 
she wants to be scholarly and good, but she's driven by desperation.

**What Makes Her Interesting:**
Shallan is fascinating because she's simultaneously:
- Brilliant (she's self-taught and incredibly observant)
- Vulnerable (her family situation is dire)
- Morally complex (she's planning to steal, but for her family)

**Key Moments Up to Chapter 8:**
- Chapter 3: Her arrival in Kharbranth - wide-eyed and determined
- Chapter 5: Meeting Jasnah, revealing her hidden agenda
- Chapter 7: Kabsal's interest, her artistic abilities shine
- Chapter 8: Jasnah finally accepts her as a ward - a major turning point

**Current State:**
By Chapter 8, Shallan has achieved her initial goal (becoming Jasnah's ward), 
but now she's in a difficult position - she still needs that Soulcaster, 
but she's also developing genuine respect for Jasnah. It's a moral dilemma 
that's going to drive her character arc forward.

**Want to explore more?** I can:
- Walk through her specific interactions with Jasnah in detail
- Explain the significance of her artistic abilities
- Discuss the family situation that's driving her decisions"
```

---

## Migration Path

### Step 1: Quick Win (Immediate)
- ✅ Prioritize snapshots for character/location questions
- ✅ Update prompt to emphasize depth for character questions
- ✅ Ensure snapshots are loaded and used properly

### Step 2: Enhanced Context (Next Sprint)
- ✅ Improve `determineContextNeeded()` to be category-aware
- ✅ Load more chapters for character questions (current chapter - 10 to current)
- ✅ Add logic to include first POV chapters

### Step 3: Smart Discovery (Future)
- ✅ Build chapter index with character/location metadata
- ✅ Implement `loadCharacterContext()` function
- ✅ Add character name extraction from queries

---

## Success Metrics

**Quality Indicators:**
- Answers reference 3+ different chapters for character questions
- Answers include character arc, not just "who they are"
- Answers feel conversational and comprehensive
- "Want to Know More?" offers are specific and relevant

**Technical Indicators:**
- Snapshots loaded for 90%+ of character/location questions
- Average context size increases (but remains token-efficient)
- Response quality improves in user feedback

---

## Key Insight

**The vision isn't about finding the "right" chapter - it's about providing comprehensive understanding.**

For character questions:
- NOT: "Load first POV chapter"
- YES: "Load snapshot (full character profile) + all relevant chapters up to current"

For location questions:
- NOT: "Load first mention"
- YES: "Load snapshot (location details) + all chapters where location is significant"

**Snapshots are our secret weapon** - they contain exactly the comprehensive context we need, curated by design. We should use them as the foundation, then supplement with specific chapter notes when needed for recent developments or specific scenes.


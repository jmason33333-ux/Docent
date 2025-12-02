# Chapter Notes Generation - Prompt Optimization

**Date:** December 2, 2025
**Status:** Optimized and ready for use

---

## Problem Statement

Two different Cursor chat sessions generated chapter notes with different quality characteristics:

### Rhythm of War Output (RoW Chat)
- ✅ **Quick Summary:** Excellent - Dense 2-3 sentences covering full arc
- ❌ **Key Beats:** TOO granular (58 bullet points!) - every tiny action listed
- ✅ **If Asked Notes:** Excellent - 9 comprehensive Q&As with detailed answers

### Way of Kings Output (WoK Chat)
- ⚠️ **Quick Summary:** Good but less detailed
- ✅ **Key Beats:** Perfect! (7 beats hitting major plot points only)
- ❌ **If Asked Notes:** Too sparse - only 3 Q&As

---

## Root Cause

The prompt in `scribe/prompts.js` contained ambiguous instructions:

**Original template description (line 30-31):**
```
## Key Beats (Chronological, ~5-8 points)
[Granular plot moments. These feed "what happened?" queries.]
```

**Original prompt instruction (line 490):**
```
- Accurate plot summary (expand Coppermind summary into detailed beats)
```

**Problem:** "Granular" and "expand into detailed beats" caused the LLM to create 58 micro-beats for RoW, while WoK somehow got it right with 7 major beats.

---

## Solution: Optimized Prompt

### 1. Updated Template Description (lines 25-36)

**Quick Summary:**
```markdown
## Quick Summary (2-3 sentences)
[Dense narrative summary covering the main story arc. Include key character actions,
plot developments, and outcomes. Make it comprehensive but concise.]
```

**Key Beats:**
```markdown
## Key Beats (Chronological, 5-8 points)
[MAJOR plot points only - the key story beats that drive the narrative forward.
DO NOT list every tiny detail or action. Focus on significant moments, decisions,
revelations, and turning points.]

- [Major beat 1 - a significant plot point]
- [Major beat 2 - another important development]
- [Major beat 3 - key turning point or revelation]
- [Continue with 2-5 more MAJOR beats only]
```

**If Asked Notes:**
```markdown
## Rowan's "If Asked" Notes
[Anticipate common questions readers will ask about this chapter. Create 8-10
comprehensive Q&A pairs with DETAILED answers. These are pre-written responses
that Rowan can use directly, so make them thorough and helpful.]

[Includes 8 example Q&A slots with instructions for 2-4 sentence detailed answers]

[Include 8-10 total Q&A pairs covering: world-building concepts, plot events,
character actions/motivations, magic mechanics, confusing moments, and common
misunderstandings]
```

### 2. Updated Prompt Instructions (lines 489-509)

**Added explicit focus areas:**
```
- **Quick Summary:** Dense 2-3 sentences covering the full narrative arc of this chapter
- **Key Beats:** 5-8 MAJOR plot points only (NOT every tiny detail)
- **"If Asked" Notes:** 8-10 comprehensive Q&A pairs with detailed answers
```

**Added critical instructions section:**
```
CRITICAL INSTRUCTIONS FOR KEY BEATS:
- List only 5-8 MAJOR story beats
- Each beat should be a significant plot point, not a minor action
- Think: "What are the 5-8 most important things that happen?"
- DO NOT create a beat for every sentence or paragraph
- Example GOOD beats: "Kaladin is assigned to bridge crew", "Sylphrena revives Kaladin"
- Example BAD beats: "Kaladin walks", "Kaladin thinks about his past", "Kaladin feels pain"
```

---

## Expected Results

With the optimized prompt, chapter notes should now have:

### ✅ Quick Summary
- **Style:** RoW-style dense 2-3 sentences
- **Content:** Full narrative arc with key actions, developments, outcomes
- **Example:** "Navani speaks with Kaladin, thanking him for helping to protect the tower. She reassures him that he did not fail, even though he had to break the node. He tells her that he can no longer fly, but was able to get some of the Fused spanreeds, which Syl has determined work via corrupted spren..."

### ✅ Key Beats
- **Style:** WoK-style concise major beats
- **Count:** 5-8 bullets
- **Content:** MAJOR plot points only - significant moments, decisions, revelations
- **Example:**
  ```
  - Kaladin and the slave caravan arrive at the Shattered Plains
  - Kaladin tries to convince a woman to let him fight, but Tvlakv reveals his deserter status
  - Kaladin and others are assigned to the bridge crews
  - Kaladin suffers during a bridge run and is the sole survivor in the front row
  - Sylphrena revives Kaladin with energy after he collapses
  - Kaladin makes his way back to camp, exhausted
  ```

### ✅ If Asked Notes
- **Style:** RoW-style comprehensive Q&As
- **Count:** 8-10 Q&A pairs
- **Content:** Detailed 2-4 sentence answers covering world-building, plot, characters, magic, confusions
- **Example:**
  ```
  Q: What is Towerlight?
  A: Towerlight is a combination of Stormlight and Lifelight. Navani sees it in a
  diamond sphere in Raboniel's office. This is significant because it shows that
  different types of Light can be combined, which may be important for Navani's research.
  ```

---

## Usage

### For New Chapter Notes

Use the existing `scribe/generate-chapter.js` or batch scripts - they all use `getChapterNotesPrompt()` from `prompts.js`, which now has the optimized template and instructions.

```bash
# Single chapter
node scribe/generate-chapter.js "The Way of Kings" 15

# Batch from Coppermind summaries
node scribe/batch-coppermind.js
```

### For Regenerating Existing Notes

If you want to regenerate RoW Chapter 61 with the new optimized prompt:

```bash
node scribe/generate-chapter.js "Rhythm of War" 61 --text "$(cat path/to/coppermind-summary.txt)"
```

Compare the new output to the old one - you should see:
- ✅ Same dense Quick Summary quality
- ✅ Much more concise Key Beats (7-8 instead of 58)
- ✅ Same comprehensive If Asked Notes (8-10 Q&As)

---

## Testing Checklist

Before regenerating all chapter notes, test with a few chapters:

- [ ] Generate a RoW chapter with the new prompt
- [ ] Verify Quick Summary is still dense and comprehensive
- [ ] Verify Key Beats are 5-8 items (not 50+)
- [ ] Verify If Asked has 8-10 comprehensive Q&As
- [ ] Compare side-by-side with old RoW output
- [ ] Generate a WoK chapter with the new prompt
- [ ] Verify quality matches or exceeds the good WoK output

Once validated, proceed with batch regeneration if needed.

---

## Backward Compatibility

**No breaking changes.** The optimized prompt:
- Uses the same template structure
- Works with existing scripts
- Outputs to the same file format
- Only improves the quality/conciseness of Key Beats

Existing chapter notes don't need to be regenerated unless you want to improve them.

---

## Next Steps

1. ✅ Optimized prompt committed to `scribe/prompts.js`
2. [ ] Test with 2-3 sample chapters (both RoW and WoK)
3. [ ] Validate output quality matches expectations
4. [ ] Consider regenerating RoW chapters if Key Beats are too verbose
5. [ ] Use optimized prompt for all future chapter note generation

---

## Files Modified

- **scribe/prompts.js** (lines 25-36, 133-160, 489-509)
  - Updated Quick Summary description
  - Updated Key Beats description with explicit "MAJOR points only" instruction
  - Updated If Asked Notes to require 8-10 comprehensive Q&As
  - Added "CRITICAL INSTRUCTIONS FOR KEY BEATS" section with examples

**Note:** This optimization combines the best qualities observed in both Cursor chat sessions to create a single source of truth for high-quality chapter note generation.

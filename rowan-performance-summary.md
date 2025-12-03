# Rowan Performance Summary - The Way of Kings Testing

**Date:** 2025-12-03  
**Test Questions:** 11 questions across Chapters 5-65  
**Performance:** Mixed - Several critical issues identified

---

## 🚨 Critical Issues (High Priority)

### 1. **Context Loading Failures** 
**Impact:** CRITICAL - Causes wrong answers

**Examples:**
- **Q: Chapter 8 - "Where does Shallan first meet Jasnah?"**
  - ❌ Loaded Chapters 7,8 → Answer said Chapter 7
  - ✅ Should load Chapter 3 or 5 → Correct answer is Chapter 5
  - **Root Cause:** Wrong chapter context selection logic

- **Q: Chapter 5 - "Who is Shallan?"**
  - ❌ Loaded Chapters 4,5 → Referenced Kaladin's "If Asked" notes from Ch 4
  - ✅ Should include Chapter 3 → First Shallan POV is Chapter 3
  - **Root Cause:** Not including prior POV chapters when answering character questions

- **Q: Chapters 25, 45, 57 - Various questions**
  - ❌ Shows "no_notes_available" in metadata
  - ❌ Notes Length: 0 chars, Chapters Found: none
  - ✅ Notes clearly exist for these chapters
  - **Root Cause:** Chapter notes not loading correctly from file system

### 2. **Chapter Selection Not Recognized**
**Impact:** CRITICAL - Prevents answering valid questions

**Example:**
- **Q: Chapter 65 - "give me a quick recap of what happened at the tower in chapter 65"**
  - ❌ System thinks user has only read to Chapter 60
  - ❌ Multiple attempts all failed to recognize Chapter 65 selection
  - ✅ User explicitly selected Chapter 65
  - **Root Cause:** Chapter parameter from frontend not being properly used for spoiler checks

### 3. **Data Accuracy in Chapter Notes**
**Impact:** HIGH - Causes incorrect information in responses

**Examples:**
- **Chapter 5 notes:** Says "Chapters Since Last Shallan POV: Since Chapter 4" 
  - ❌ Last Shallan POV was actually Chapter 3
  - **Action:** Need to audit and fix POV tracking in all TWoK chapter notes

- **Chapter 8 notes:** Loaded chapters 7,8 but answer was in Chapter 5
  - ❌ Context selection loaded wrong chapters
  - **Action:** Fix context selection to include relevant prior chapters

---

## ⚠️ Major Issues (Medium-High Priority)

### 4. **Response Structure Inconsistency**
**Impact:** HIGH - Breaks user expectations

**Pattern:** 
- ✅ **Good:** Chapter 20 (Shardblade question) - Followed 6-section structure
- ❌ **Bad:** Chapter 10 (Tien question) - No structure, just paragraphs
- ❌ **Bad:** Chapter 8 (Jasnah meeting) - No structure
- ❌ **Bad:** Chapter 35 (Bridge crew) - No structure

**Root Cause:** SHORT prompt structure not being enforced consistently
**Fix:** Ensure ALL responses use either 3-section (SHORT) or 6-section (FULL) format

### 5. **Tone and Voice Issues**
**Impact:** MEDIUM - Doesn't sound like Rowan

**Examples:**
- ❌ "Unfortunately, Tien died during a battle, which deeply affected Kaladin"
  - Too clinical, lacks Rowan's warmth
- ✅ Should be: "Tien's death in battle hit Kaladin hard - it's a loss that still haunts him because he couldn't protect his younger brother."

**Action:** Enhance prompt instructions to maintain conversational, warm tone

### 6. **Content Depth Issues**
**Impact:** MEDIUM - Answers too shallow

**Examples:**
- **Tien (Chapter 10):** Response lacks depth on their relationship, Tien's personality, impact
- **Spren (Chapter 57):** Correct structure but "so much more depth to explain"
- **Dawnchant (Chapter 60):** Incorrect - said "poem/hymn about creation" when it's "the language of the Dawnsingers"

**Action:** 
- Use snapshots for comprehensive topics
- Ensure chapter notes contain sufficient detail
- Enhance prompts to encourage deeper explanations

---

## 🔧 Technical Issues (Medium Priority)

### 7. **Snapshot Selection Logic**
**Impact:** MEDIUM - Missing opportunities for better answers

**Examples:**
- **Q: Chapter 25 - Surgebinding**
  - ❌ Used individual_chapters (which weren't found)
  - ✅ Should use snapshot-20 or snapshot-30 for comprehensive Surgebinding explanation

**Pattern:** World-building/magic system questions should prioritize snapshots over individual chapters

### 8. **Spoiler Safety in "Want to Know More?"**
**Impact:** LOW-MEDIUM - May reveal too much

**Example:**
- **Q: Chapter 20 - Shardblades**
  - "Discuss what we know about the Ideals of the Knights Radiant"
  - Reader at Chapter 20 may not know about Ideals yet

**Action:** Add spoiler checks for "Want to Know More?" suggestions

### 9. **Metadata Tracking Issues**
**Impact:** LOW - Makes debugging harder

**Pattern:** Shows "no_notes_available" when notes clearly exist
- Chapters 24-25, 44-45, 56-57 all show this
- **Root Cause:** Likely file path or loading logic issue in `rag-loader.js`

---

## 📊 Performance Breakdown by Category

### ✅ **Strengths:**
- Structure followed when FULL prompt used (Ch 20 Shardblade question excellent)
- Good answers when correct context loaded (Ch 20, Ch 60 when using snapshots)
- Proper spoiler checking in most cases

### ❌ **Weaknesses:**
- Context selection (wrong chapters loaded)
- Structure consistency (SHORT prompt not enforcing format)
- Data accuracy (POV tracking, chapter notes errors)
- Chapter selection recognition (Chapter 65 issue)

---

## 🎯 Action Plan

### **Phase 1: Critical Fixes (Immediate)**

1. **Fix Context Selection Logic** (`utils/openai-client.js`)
   - [ ] For character questions, include first POV chapter (e.g., Shallan = include Ch 3)
   - [ ] For location questions, search backwards for first mention
   - [ ] Improve chapter range selection for character introductions

2. **Fix Chapter Selection Recognition** (`utils/openai-client.js`)
   - [ ] Use `currentChapter` parameter from request for spoiler checks
   - [ ] Ensure frontend properly sends selected chapter
   - [ ] Log chapter parameter to debug

3. **Fix Chapter Notes Loading** (`utils/rag-loader.js`)
   - [ ] Debug why Chapters 24-25, 44-45, 56-57 show as "not found"
   - [ ] Verify file paths match expected structure
   - [ ] Add better error logging

4. **Audit TWoK Chapter Notes POV Tracking**
   - [ ] Check all "Chapters Since Last [Character] POV" entries
   - [ ] Fix Chapter 5 notes (Shouldan POV tracking)
   - [ ] Verify all POV entries are accurate

### **Phase 2: Structure & Quality (Next)**

5. **Enforce Response Structure** (`rowan-prompt.js`, `utils/openai-client.js`)
   - [ ] Add explicit structure reminders to ALL context instructions
   - [ ] Ensure SHORT prompt always uses 3-section format
   - [ ] Add validation that structure is followed

6. **Improve Snapshot Selection** (`utils/openai-client.js`)
   - [ ] Prioritize snapshots for world-building/magic system questions
   - [ ] Fall back to snapshots when individual chapters not found
   - [ ] Use full-book snapshot for broad concepts

7. **Enhance Tone Instructions** (`rowan-prompt.js`)
   - [ ] Add examples of warm, conversational tone
   - [ ] Explicitly avoid clinical language
   - [ ] Emphasize empathy and validation

### **Phase 3: Content Quality (Follow-up)**

8. **Spoiler Safety for "Want to Know More?"**
   - [ ] Check if suggested topics exist in user's current chapter range
   - [ ] Filter suggestions based on spoiler safety
   - [ ] Add validation logic

9. **Improve Content Depth**
   - [ ] Review chapter notes for key topics (Tien, Spren, etc.)
   - [ ] Enhance snapshot content for comprehensive topics
   - [ ] Add instructions to use all available context

---

## 🔍 Root Cause Analysis

### **Why Context Selection Fails:**
1. Logic only looks at chapters near the selected chapter
2. Doesn't account for character introductions happening earlier
3. Doesn't search backwards for first mentions

### **Why Structure Inconsistency:**
1. SHORT prompt has structure instructions but not enforced
2. Context instructions may override prompt structure
3. LLM sometimes ignores format requirements

### **Why Chapter Notes Don't Load:**
1. Likely file path mismatch (Part folder structure?)
2. Error handling may silently fail
3. No validation that notes were actually loaded

---

## 📝 Test Cases for Validation

After fixes, retest:
- [ ] Q: Chapter 8 - "Where does Shallan first meet Jasnah?" → Should load Ch 3 or 5
- [ ] Q: Chapter 65 - "recap chapter 65" → Should recognize Ch 65 selection
- [ ] Q: Chapter 25 - "Surgebinding" → Should use snapshot, not individual chapters
- [ ] Q: Chapter 10 - "What happened to Tien?" → Should use structure, more depth
- [ ] Q: Chapter 51 - "Why did Kaladin refuse Shards?" → Should use chapter notes answer
- [ ] Verify metadata shows notes found for Ch 24-25, 44-45, 56-57

---

## 📈 Success Metrics

- **Context Accuracy:** 100% of questions load correct chapter context
- **Structure Compliance:** 100% of responses follow required format
- **Chapter Recognition:** 100% of selected chapters properly recognized
- **Content Depth:** Answers include sufficient detail for topic complexity
- **Tone Consistency:** All responses sound like Rowan (warm, conversational)


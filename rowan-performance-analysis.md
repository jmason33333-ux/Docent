# Rowan Performance Analysis & Action Plan
## Based on Test Results (Row 48+ in Google Sheets)

---

## 📊 PERFORMANCE SUMMARY

### Overall Assessment
- **Total Questions Tested:** [Fill in from your notes]
- **Good Responses:** [Fill in]
- **Poor Responses:** [Fill in]
- **Success Rate:** [Calculate]

---

## 🔴 CRITICAL ISSUES IDENTIFIED

### Issue Category 1: Structure & Format
**Symptoms:**
- [ ] Responses not following 3-section format (SHORT prompt)
- [ ] Responses not following 6-section format (FULL prompt)
- [ ] Missing "Want to Know More?" section
- [ ] Inconsistent structure across responses

**Impact:** Medium-High - Breaks consistency expectations

---

### Issue Category 2: Prompt Selection
**Symptoms:**
- [ ] SHORT prompt used when FULL should be used
- [ ] FULL prompt used for simple questions (wasteful)
- [ ] Keywords not triggering correct prompt type

**Impact:** High - Affects answer quality and cost efficiency

**Examples:**
- Question: "[example]" → Used [SHORT/FULL] → Should have used [SHORT/FULL]

---

### Issue Category 3: Context Loading
**Symptoms:**
- [ ] Wrong snapshot selected (e.g., Ch 20 snapshot for Ch 25 question)
- [ ] Missing context when should have loaded snapshot
- [ ] Book summary loaded when snapshot would be better
- [ ] Individual chapters loaded when snapshot exists

**Impact:** High - Directly affects answer quality

**Examples:**
- Question at Ch [X] → Loaded [context type] → Should have loaded [context type]

---

### Issue Category 4: Answer Quality
**Symptoms:**
- [ ] Answers too vague/generic
- [ ] Missing chapter citations
- [ ] Not using "Rowan's If Asked" sections
- [ ] Answers lack depth for deep questions
- [ ] Answers too verbose for simple questions

**Impact:** Critical - Core user experience

**Examples:**
- Question: "[example]" → Answer was: "[issue description]"

---

### Issue Category 5: Content Accuracy
**Symptoms:**
- [ ] Incorrect information
- [ ] Information from wrong chapters (potential spoilers)
- [ ] Missing key details
- [ ] Confusing explanations

**Impact:** Critical - Breaks trust

---

### Issue Category 6: Tone & Style
**Symptoms:**
- [ ] Too formal/academic
- [ ] Too casual
- [ ] Not warm/reassuring
- [ ] Condescending tone

**Impact:** Medium - Affects user experience

---

## 🎯 ROOT CAUSE ANALYSIS

### Likely Root Causes:

1. **Prompt Selection Logic Issues**
   - Keyword detection not catching all "help me understand" variants
   - Query categorization incorrectly assigning categories
   - First message detection not working properly

2. **Context Selection Issues**
   - Snapshot loading logic selecting wrong snapshot
   - Priority order incorrect (book summary vs snapshot vs chapters)
   - Snapshot not available when expected

3. **Structure Enforcement Issues**
   - LLM not following structured format instructions
   - Context instructions not emphasizing structure enough
   - Prompt examples not clear enough

4. **Content Quality Issues**
   - "If Asked" sections not being prioritized
   - Chapter notes not being utilized effectively
   - LLM hallucinating instead of using RAG content

---

## ✅ ACTION PLAN

### Priority 1: Immediate Fixes (Critical Issues)

#### Fix 1.1: Strengthen Structure Enforcement
**Action:**
- Add explicit structure reminders to context message
- Include structure template directly in context
- Add validation instructions in prompt

**Files to modify:**
- `utils/openai-client.js` - Context message building
- `rowan-prompt.js` - Add structure examples

**Expected Impact:** Ensures consistent format

---

#### Fix 1.2: Improve Prompt Selection
**Action:**
- Expand keyword detection for FULL prompt
- Improve query categorization for worldbuilding questions
- Add pattern matching for "help me understand" variations

**Files to modify:**
- `rowan-prompt.js` - `getRowanPrompt()` function
- `utils/query-categorizer.js` - Category keywords

**Expected Impact:** Correct prompt type always selected

---

#### Fix 1.3: Fix Context Loading Priority
**Action:**
- Ensure snapshot is always checked before individual chapters
- Improve snapshot selection logic (closest but not exceeding)
- Add fallback logic when snapshot missing

**Files to modify:**
- `utils/openai-client.js` - Context loading order
- `utils/rag-loader.js` - Snapshot selection logic

**Expected Impact:** Best context always loaded

---

### Priority 2: Quality Improvements (High Impact)

#### Fix 2.1: Enforce "If Asked" Priority
**Action:**
- Move "If Asked" sections to top of context (already done)
- Add explicit instruction: "You MUST use 'If Asked' section if it exists"
- Add validation: "Did you check 'If Asked' section before answering?"

**Files to modify:**
- `utils/rag-loader.js` - Prioritization logic
- `rowan-prompt.js` - Priority instructions

**Expected Impact:** Better use of curated Q&As

---

#### Fix 2.2: Improve Chapter Citation Requirements
**Action:**
- Require at least 2-3 chapter citations per answer
- Add example of good vs bad citation format
- Flag when answer lacks citations

**Files to modify:**
- `rowan-prompt.js` - Citation requirements

**Expected Impact:** More grounded, trustworthy answers

---

#### Fix 2.3: Add Quality Validation Instructions
**Action:**
- Add pre-response checklist to prompt
- Require LLM to verify structure before sending
- Add examples of good vs poor responses

**Files to modify:**
- `rowan-prompt.js` - Validation steps

**Expected Impact:** Higher quality responses

---

### Priority 3: Enhancements (Medium Impact)

#### Fix 3.1: Improve Query Categorization
**Action:**
- Add more worldbuilding keywords ("magic", "system", "mechanic")
- Improve pattern matching for clarification questions
- Better handling of "what is" questions

**Files to modify:**
- `utils/query-categorizer.js` - Category definitions

**Expected Impact:** Better context selection

---

#### Fix 3.2: Tone Consistency
**Action:**
- Add tone examples to both prompts
- Emphasize warmth and validation
- Add "never say" examples for formal language

**Files to modify:**
- `rowan-prompt.js` - Tone guidelines

**Expected Impact:** Consistent personality

---

## 📋 TESTING CHECKLIST

After fixes, verify:
- [ ] All quick questions use 3-section format
- [ ] All deep questions use 6-section format
- [ ] "Want to Know More?" present in all responses
- [ ] Correct prompt type selected
- [ ] Appropriate context loaded
- [ ] Chapter citations present
- [ ] No spoilers beyond stated chapter
- [ ] "If Asked" sections used when available
- [ ] Answers match quality of Dawnshard example

---

## 🔄 ITERATION PLAN

1. **Immediate (Today):**
   - Fix structure enforcement (Priority 1.1)
   - Fix prompt selection (Priority 1.2)
   - Fix context loading (Priority 1.3)

2. **This Week:**
   - Enforce "If Asked" priority (Priority 2.1)
   - Improve citations (Priority 2.2)
   - Add validation (Priority 2.3)

3. **Ongoing:**
   - Monitor Google Sheets for patterns
   - Collect user feedback
   - Iterate based on data

---

## 📝 NOTES

[Add your specific findings from column AC here]

**Key Observations:**
- 
- 
- 

**Patterns Noticed:**
- 
- 
- 


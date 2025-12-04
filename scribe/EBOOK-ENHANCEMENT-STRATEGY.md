# E-Book Chapter Notes Enhancement Strategy

**Context:** When generating notes from raw e-book text (not Coppermind summaries), we have access to the FULL chapter. This gives us opportunities to create BETTER notes than wiki-based summaries.

---

## 🎯 Key Advantages of Raw E-Book Text

### **1. Full Chapter Access**
- ✅ Complete dialogue and quotes
- ✅ Exact scene descriptions
- ✅ Author's original pacing and structure
- ✅ Epigraphs (always present)
- ✅ Subtle foreshadowing LLM can catch

### **2. No Summarization Bias**
- ✅ Wiki summaries filter through someone else's interpretation
- ✅ Raw text lets LLM extract what's actually important
- ✅ Can catch details wiki editors missed

### **3. Better Quote Extraction**
- ✅ Can pull exact memorable lines
- ✅ Character voice preserved
- ✅ Dialogue snippets for context

---

## 🚀 Prompt Enhancements for Raw E-Book Text

### **Current Prompt Works, But Can Be Improved:**

Your existing `prompts.js` already has this section (lines 414-417):
```javascript
sourceNote = `\n\nCHAPTER TEXT (use this as your source material):
${effectiveChapterText}

IMPORTANT: Base your notes EXCLUSIVELY on the chapter text provided above.`;
```

**This is good, but we can make it BETTER for raw e-books.**

---

## ✨ Proposed Enhancements

### **Enhancement 1: Explicit Quote Extraction**

Add to the prompt instructions:

```
QUOTE EXTRACTION (Raw E-Book Text Only):
Since you have the full chapter text, include:
- 3-5 memorable or significant quotes (not just 1-2)
- Include dialogue that reveals character voice
- Include descriptive passages that set tone
- Format: > "Quote" — Character or narration, [context]

Example:
> "The most important step a man can take is always the next one."
> — Dalinar, speaking to [character] about [context in this chapter]
```

### **Enhancement 2: Scene-by-Scene Breakdown**

For longer chapters (>5000 words), add a new section:

```markdown
## Scene Breakdown (For Long Chapters)
[If chapter has multiple distinct scenes, break them down]

**Scene 1: [Location] - [POV if it changes]**
- What happens: [2-3 sentences]
- Key moment: [The critical beat]

**Scene 2: [Location]**
- What happens: [2-3 sentences]
- Key moment: [The critical beat]
```

This helps readers navigate complex chapters.

### **Enhancement 3: Emotional Arc Tracking**

Add a new section to the template:

```markdown
## Emotional Arc
[Track the POV character's emotional journey through the chapter]

- **Opening mood:** [How the character feels at start]
- **Turning point:** [What moment shifts their emotional state]
- **Closing mood:** [How they feel at end]
- **Character development:** [What changed for them]
```

**Why:** Helps readers connect emotionally, especially important for character-driven fantasy.

### **Enhancement 4: World-Building Details**

Expand the Magic/Mechanics section for raw e-books:

```markdown
## Magic / World-Building (if applicable)
[How magic works, new rules revealed, limitations]

**New Information Revealed:**
- [Specific mechanic or rule introduced]
- [How it's demonstrated in this chapter]
- [Implications for the magic system]

**World-Building Details:**
- [Cultural details mentioned]
- [Historical references]
- [Cosmological information]
```

### **Enhancement 5: Foreshadowing Detection**

Improve the existing Foreshadowing section:

```markdown
## Foreshadowing / Setup
[Things that seem minor but likely matter later]

**Subtle Hints (easily missed):**
- **[Detail from text]:** [Why it might be significant]
- **[Offhand comment]:** [What it could set up]

**Obvious Setup:**
- **[Clear setup moment]:** [What it's likely building toward, no spoilers]

**Recurring Motifs:**
- **[Symbol/theme that appears multiple times]:** [Pattern observation]
```

---

## 🔧 Updated Prompt Template Additions

Add these sections to `CHAPTER_NOTES_TEMPLATE` in `prompts.js`:

```javascript
// After "Quotes / Memorable Lines" section, add:

---

## Scene Breakdown (For Multi-Scene Chapters)
[If chapter has 3+ distinct scenes or POV shifts, break them down. Otherwise omit this section.]

**Scene 1: [Location/Setting]**
- **What happens:** [2-3 sentences covering the scene]
- **Key moment:** [The critical beat or turning point]

**Scene 2: [Location/Setting]**
- **What happens:** [2-3 sentences]
- **Key moment:** [Critical beat]

[Add more scenes as needed]

---

## Emotional Arc (POV Character)
[Track the POV character's emotional journey through this chapter]

- **Opening mood:** [How the character feels at chapter start - be specific]
- **Turning point:** [What moment or event shifts their emotional state]
- **Closing mood:** [How they feel at chapter end]
- **Character development:** [What changed for them internally - growth, regression, realization]

Example:
- **Opening mood:** Kaladin feels defeated and numb, going through motions
- **Turning point:** Syl's question about protecting others reignites his purpose
- **Closing mood:** Tentative hope, first spark of determination
- **Character development:** Begins to remember why he became a soldier, shifts from passive to active

---

// Update the existing "Foreshadowing / Setup" section to:

## Foreshadowing / Setup
[Things that seem minor but likely matter later - with raw e-book text, you can catch subtle details]

**Subtle Hints (Easily Missed):**
- **[Specific detail from text]:** [Why it might be significant - character mentions something offhand, object described in unusual detail, etc.]

**Obvious Setup:**
- **[Clear setup moment]:** [What it's building toward, no spoilers]

**Recurring Motifs:**
- **[Symbol/phrase/image that appears multiple times in this chapter]:** [Pattern observation]

**Questions Raised:**
- [What mysteries or questions does this chapter introduce?]

---

// And enhance the "Magic / Mechanics" section:

## Magic / Mechanics (if applicable)
[How magic works, new rules revealed, limitations]

**New Information Revealed in This Chapter:**
- **[Specific mechanic or rule]:** [How it's demonstrated, what scene shows it]
- **[Limitation or cost]:** [Evidence from the text]

**World-Building Details:**
- **[Cultural practice/belief]:** [Context from this chapter]
- **[Historical reference]:** [What's mentioned and why it matters]
- **[Societal structure]:** [How social dynamics are shown]

**Implications:**
- [What do these details mean for the larger story or world?]

---

## Rowan's "If Asked" Notes
[Anticipate common questions readers will ask about this chapter. With raw e-book text, you can answer MORE comprehensively than wiki summaries]

[Rest of existing "If Asked" template...]
```

---

## 📝 Enhanced Prompt Instructions

Update the prompt generation function in `prompts.js` (around line 471-500) to include these instructions when using raw chapter text:

```javascript
// For raw e-book text (when effectiveChapterText is provided)
const rawEbookInstructions = effectiveChapterText ? `

ENHANCED INSTRUCTIONS FOR RAW E-BOOK TEXT:
You have the FULL chapter text, which allows you to create better notes than wiki summaries:

1. **Quote Extraction:** Include 3-5 memorable quotes (not just 1-2)
   - Include dialogue that reveals character voice
   - Include descriptive passages that set tone
   - Always cite the context (who said it, to whom, why)

2. **Scene Breakdown:** If the chapter has multiple distinct scenes (3+), add a "Scene Breakdown" section
   - Helps readers navigate complex chapters
   - 2-3 sentences per scene + key moment

3. **Emotional Arc:** Track POV character's emotional journey
   - Opening mood → Turning point → Closing mood → Development
   - Be specific about internal character changes

4. **Foreshadowing Detection:** You can catch subtle hints from raw text
   - Offhand comments that might matter
   - Recurring motifs or symbols
   - Details described in unusual detail

5. **World-Building Details:** Extract cultural, historical, societal information
   - Not just plot events
   - How the world works
   - Social dynamics

6. **Comprehensive "If Asked":** With full text, you can answer MORE deeply
   - 10-12 Q&As (not just 8-10)
   - Cover nuances that wiki summaries miss
   - Address potential confusion points from complex prose

7. **Epigraphs:** ALWAYS include if present (they're always in e-books)
   - Analyze significance
   - Connect to chapter themes

CRITICAL: You have the author's exact words - use them to create notes that EXCEED wiki quality.
` : '';
```

Then add this to the return statement (around line 500):

```javascript
return `You are creating detailed chapter notes for a fantasy reading companion app called Docent.

CRITICAL RULES:
1. Only include events and information from THIS SECTION (${chapterDisplay})
2. Do NOT reference or hint at events from later sections
3. Be accurate to the source material - no hallucinations
4. Use the EXACT template structure provided below${enhancedRules}${rawEbookInstructions}

${sourceNote}
...
```

---

## 🎯 Expected Quality Improvements

### **Coppermind Summary-Based Notes:**
- ✅ Good coverage of main plot points
- ❌ Limited quotes (1-2)
- ❌ Filtered through wiki editor's interpretation
- ❌ May miss subtle foreshadowing
- ❌ Usually 8 "If Asked" Q&As

### **Raw E-Book-Based Notes (With Enhancements):**
- ✅ Excellent coverage of main plot points
- ✅ Rich quotes (3-5) with context
- ✅ Direct from author's text
- ✅ Better foreshadowing detection
- ✅ Scene breakdowns for complex chapters
- ✅ Emotional arc tracking
- ✅ 10-12 comprehensive "If Asked" Q&As
- ✅ More world-building details

---

## 💵 Cost Considerations

**Trade-off:**
- Coppermind summary: ~1,000 tokens input = $0.10/chapter
- Raw e-book text: ~6,000 tokens input = $0.50/chapter

**Mitigation:**
1. Use GPT-4o mini for initial generation ($0.15/chapter)
2. Only use GPT-4o for books without wiki summaries
3. Batch process to reduce API overhead
4. Cache common world-building context

**ROI:**
- For books like Hierarchy (no wiki), this is the ONLY option
- Quality increase justifies cost (users want depth)
- $15/book is negligible compared to user value

---

## 🔄 Recommended Workflow

### **Step 1: Extract Chapter**
```bash
node scribe/extract-chapter.js "hierarchy-book1.epub" 1 extracted/ch1.txt
```

### **Step 2: Generate Enhanced Notes**
```bash
node scribe/generate-from-file.js "The Strength of the Few" 1 extracted/ch1.txt
```

The enhanced prompt will automatically:
- Detect it's raw e-book text
- Apply enhanced instructions
- Generate richer notes

### **Step 3: Review & Adjust**
- Check emotional arc accuracy
- Verify quote contexts
- Ensure scene breakdown makes sense

---

## 📊 Testing Plan

1. **Generate 3 sample chapters** with enhanced prompt
2. **Compare to existing Coppermind-based notes**
3. **Validate improvements:**
   - More quotes?
   - Better foreshadowing?
   - Emotional arc tracking useful?
   - Scene breakdown helpful for long chapters?
4. **Adjust template** based on results
5. **Roll out** for Hierarchy series

---

## 🎯 Success Metrics

**Quality Indicators:**
- [ ] 10-12 "If Asked" Q&As (vs 8-10 from Coppermind)
- [ ] 3-5 memorable quotes (vs 1-2)
- [ ] Emotional arc section always populated for character chapters
- [ ] Foreshadowing section catches 2-3 subtle hints (not just obvious ones)
- [ ] Scene breakdown for chapters >5000 words

**User Satisfaction:**
- [ ] Users say notes are "comprehensive"
- [ ] Users find answers to nuanced questions
- [ ] Users appreciate quote selections

---

## 📁 Files to Update

1. **scribe/prompts.js**
   - Add new template sections (Scene Breakdown, Emotional Arc, enhanced Foreshadowing)
   - Add `rawEbookInstructions` to prompt generation
   - Update instructions to emphasize quote extraction

2. **scribe/generate-from-file.js**
   - Already works! No changes needed
   - Will use updated prompts.js automatically

3. **scribe/extract-chapter.js**
   - Already works! No changes needed

---

**Result:** Best-in-class chapter notes that leverage full e-book text to provide depth that wiki summaries can't match.

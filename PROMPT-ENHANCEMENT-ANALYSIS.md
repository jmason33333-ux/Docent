# Rowan Prompt Enhancement Analysis

## Problem Diagnosis

**Question tested:** "I really don't understand what dawnshards are - help me understand them better"

**Rowan's response:** Surface-level, generic, no structure
**ChatGPT's response:** Deep, structured (1,2,3), specific examples, mental models

## Root Cause

The chapter notes contain EXCELLENT content, including:
- Pre-written "Rowan's If Asked" Q&As
- Specific scenes and character moments
- Detailed explanations

**But the prompt doesn't tell Rowan to USE these sections.**

---

## What ChatGPT Did Better

### 1. **Structure**
- Started with "Short version" TL;DR
- Used numbered sections (1, 2, 3) with subsections (3.1, 3.2, 3.3)
- Clear hierarchy

### 2. **Specificity**
- "In Chapter 16, Rysn touches the mural..."
- "Nikli/The Sleepless tells Rysn that..."
- Named actual characters and scenes

### 3. **Mental Models**
- "Think of Adonalsium as a god-program, Shards as 16 chunks, Dawnshards as instructions"
- Used analogies ("like a cosmic voice command")

### 4. **Depth Layering**
- Simple → Intermediate → Deep
- "What you know" → "How to think about it" → "Why it matters"

### 5. **"What's Unknown" Section**
- Explicitly acknowledged mysteries
- Set expectations

### 6. **Next Steps**
- Ended with clear options: "I can also..."
- Made them specific and actionable

---

## Current Prompt Gaps

### Gap 1: No Instructions to Use "Rowan's If Asked"
**Current:** Prompt says "use your reference notes"
**Missing:** "**Prioritize the 'Rowan's If Asked' sections** - these are pre-written answers to common questions. Use them as your foundation."

### Gap 2: No Structure Requirements
**Current:** Generic "explain clearly"
**Missing:**
```
For complex topics, structure your response:
1. Short version (1-2 sentences)
2. What you've seen in the book (cite specific chapters)
3. How to think about it (mental models/analogies)
4. Why it matters (plot/character implications)
5. What's still unknown
6. Next-step options
```

### Gap 3: No Citation Examples
**Current:** "Ground in sources"
**Missing:**
```
✓ GOOD: "In Chapter 16, when Rysn touches the ancient mural on Aimia, she feels..."
✗ AVOID: "Dawnshards are ancient artifacts..."
```

### Gap 4: No Mental Model Instructions
**Current:** Not mentioned
**Missing:** "Always provide at least one analogy or comparison for complex concepts"

### Gap 5: No Depth Requirements
**Current:** "Start concise, offer more depth"
**Missing:** "For world-building/lore questions, go deep by default. Use all available context."

---

## Recommended Prompt Additions

### Addition 1: Prioritize Pre-Written Answers

Add to prompt after "INFORMATION GROUNDING":

```markdown
USING "ROWAN'S IF ASKED" SECTIONS (CRITICAL)

Your chapter notes include a section called "Rowan's If Asked Notes" with pre-written Q&As. These are your HIGHEST PRIORITY resource:

1. ALWAYS check if the "Rowan's If Asked" section addresses the question
2. Use those pre-written answers as your FOUNDATION
3. Expand on them with additional context from other sections
4. But NEVER contradict or ignore the pre-written answers

Example workflow:
- User asks: "What does Lopen discover?"
- Check chapter notes → Find "Rowan's If Asked" → Use that answer → Add context from "Key Beats" and "Locations"
```

### Addition 2: Structured Response Requirements

Add after "CONFUSION DIAGNOSIS PROTOCOL":

```markdown
COMPLEX TOPIC STRUCTURE (FOR LORE/WORLD-BUILDING/MAGIC)

When explaining complex concepts (magic systems, Dawnshards, spren, world-building), use this structure:

**1. Short Version** (Lead with this)
   - 1-2 sentence summary
   - Give them the essential idea immediately

**2. What You've Seen in the Book**
   - Cite specific chapters: "In Chapter 16, when Rysn..."
   - Reference actual scenes and characters
   - Ground everything in the text

**3. How to Think About It** (Mental Models)
   - Provide an analogy or comparison
   - Example: "Think of Dawnshards like cosmic voice commands to the universe"
   - Make abstract concepts concrete

**4. Why It Matters**
   - Connect to character motivations or plot stakes
   - Show how this affects the story

**5. What's Still Unknown** (If applicable)
   - Explicitly name mysteries
   - Set expectations: "This gets explored more later"

**6. Want to Know More?**
   - Offer 2-3 specific next-step options
   - Make them actionable: "I can walk through the scene where..." NOT "Let me know if you want more"

Example structure:
"Great question about Dawnshards!

**Short version:**
Dawnshards are cosmic Commands that can rewrite reality itself. One of them is currently bonded to Rysn.

**1. What you've seen in the book:**
In Chapter 16, when Rysn touches the ancient mural on Aimia, she feels a powerful force...
[Continue with specific details]

**2. How to think about Dawnshards:**
Think of Adonalsium as a computer program, Shards as 16 pieces of that program, and Dawnshards as the commands that tell those pieces what to do...

**3. Why this matters for the story:**
This explains why Nikli is so worried about...

**What's still mysterious:**
- We don't know what the other three Dawnshards are
- We haven't seen anyone use one intentionally

**Want to go deeper?** I can:
- Walk through that Chapter 16 scene in detail
- Explain how Dawnshards relate to the Shattering
- Compare this to how Radiants bond spren"
```

### Addition 3: Citation Requirements

Add to "INFORMATION GROUNDING":

```markdown
CITING SOURCES (REQUIRED FOR CREDIBILITY)

Always cite specific chapters when explaining:

Format options:
- "In Chapter 16, when Rysn touches the mural..."
- "Back in Chapter 12, you saw that..."
- "The 'Rowan's If Asked' notes for Chapter 15 explain that..."

NEVER say:
- "Dawnshards are known to be..." (vague)
- "Throughout the series..." (implies future knowledge)
- "It's mentioned that..." (where? when?)

If you don't have a specific chapter reference:
"I don't have the exact chapter, but based on your progress through Chapter 19, here's what we know..."
```

### Addition 4: Depth Requirements

Add after "CONTENT STYLE":

```markdown
DEPTH EXPECTATIONS BY QUESTION TYPE

**For world-building/lore/magic questions:**
- Go DEEP by default
- Use full structured response (sections 1-6)
- Pull from "Magic/Mechanics", "Themes", "Rowan's If Asked"
- Minimum 3-4 paragraphs with examples

**For character questions:**
- Focus on specific scenes and motivations
- Pull from "Characters", "Themes", "Key Beats"
- Include character arc context

**For "what happened" recaps:**
- Use "Quick Summary" + "Key Beats"
- Chronological order
- Bullet or numbered list format

**For confusion diagnosis:**
- Start with clarifying question
- Then provide structured explanation
- Offer multiple angles
```

---

## Implementation Priority

1. **High Priority:** Add "Using Rowan's If Asked" section
2. **High Priority:** Add "Complex Topic Structure" requirements
3. **Medium Priority:** Add citation format examples
4. **Medium Priority:** Add depth expectations

---

## Test Plan

After implementing these changes:

1. **Test with same Dawnshard question**
   - User: "I really don't understand what dawnshards are"
   - Expected: Structured response (1-6), cites Chapter 16, uses mental model

2. **Test with character question**
   - User: "Why did Cord jump overboard?"
   - Expected: Cites Chapter 15, explains motivation, connects to Horneater lore

3. **Test with recap question**
   - User: "Remind me what happened in the last few chapters"
   - Expected: Uses "Quick Summary" sections, chronological, specific beats

---

## Success Criteria

Rowan's responses should:
- ✅ Use numbered/structured format for complex topics
- ✅ Cite specific chapters ("In Chapter 16...")
- ✅ Include at least one mental model/analogy
- ✅ Pull from "Rowan's If Asked" sections when available
- ✅ Offer specific next-step options
- ✅ Match or exceed ChatGPT's depth on lore questions

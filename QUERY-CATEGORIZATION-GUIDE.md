# Query Categorization Guide

## Overview

Docent now automatically categorizes every user query to help you understand:
- What types of questions users ask most
- Which categories need better note coverage
- Patterns in user confusion

## Categories

### Character Questions
**Examples:**
- "Who is Shallan?"
- "Tell me about Kaladin"
- "What's the character's name?"

**When to improve notes:** If many character questions show `notes_not_relevant`, add more character details to your chapter notes.

### Plot Questions
**Examples:**
- "What happened in this chapter?"
- "What did Shallan do?"
- "Explain the scene with the santhid"

**When to improve notes:** If plot questions aren't being answered well, ensure your "Key Beats" section is comprehensive.

### Recap Questions
**Examples:**
- "Can you recap what happened?"
- "Remind me what happened earlier"
- "I forgot, what was that about?"

**When to improve notes:** These trigger extended context (3 chapters). Make sure your knowledge snapshots are good.

### Worldbuilding Questions
**Examples:**
- "How does Surgebinding work?"
- "What is Shadesmar?"
- "Explain the magic system"

**When to improve notes:** Add detailed explanations to your "Magic / Mechanics" section.

### Relationship Questions
**Examples:**
- "What's the relationship between X and Y?"
- "How do these characters interact?"

**When to improve notes:** Add relationship context to your "Characters in This Chapter" section.

### Location Questions
**Examples:**
- "Where is the Shattered Plains?"
- "What is this place?"

**When to improve notes:** Ensure your "Locations" section has good descriptions.

### Theme Questions
**Examples:**
- "What does this symbolize?"
- "What's the theme here?"

**When to improve notes:** Expand your "Themes / Subtext" section.

### Clarification Questions
**Examples:**
- "I'm confused about..."
- "I don't understand..."
- "This doesn't make sense"

**When to improve notes:** These are critical! Add explanations to your "Confusion Points" section.

### Comparison Questions
**Examples:**
- "What's the difference between X and Y?"
- "How is this similar to..."

**When to improve notes:** Add comparison context where relevant.

### Foreshadowing Questions
**Examples:**
- "Is this important later?"
- "Does this matter?"
- "What's the significance?"

**When to improve notes:** Expand your "Foreshadowing / Setup" section.

## Using the Data

### Find Most Common Question Types

In Google Sheets, create a pivot table on column L (Query Category) to see:
- Which categories users ask about most
- Which categories need better note coverage

### Identify Gaps

Filter by:
- `Query Category = worldbuilding` AND `Notes Relevance = notes_not_relevant`
- This shows worldbuilding questions that your notes didn't cover well

### Track Improvements

Before/after adding notes:
1. Note the count of `notes_not_relevant` for a category
2. Improve your notes
3. Check if the count decreases

## Key Terms Extraction

Column N extracts key terms like:
- Character names (capitalized words)
- Quoted phrases
- Important concepts

Use this to see what users are asking about most frequently.



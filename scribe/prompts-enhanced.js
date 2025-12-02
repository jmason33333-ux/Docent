// LLM Scribe Prompts for RAG Content Generation
// These prompts are used to generate chapter notes, knowledge snapshots, and book summaries

const CHAPTER_NOTES_TEMPLATE = `# Chapter [X]: [Chapter Title, if applicable]

## Metadata
- **Book:** [Title]
- **Part:** [Part number and name, if applicable - e.g., "Part 1: Burdens"]
- **POV Character(s):** [Name(s)]
- **Location(s):** [Where this takes place]
- **Time Context:** [How long after last chapter, or "concurrent with Ch. X"]
- **Chapters Since Last [POV Character 1] POV:** [e.g., "First [Character] POV" if this is their first POV in the book, or "Since Chapter 57: Chapter Title" if they've appeared before]
- **Chapters Since Last [POV Character 2] POV:** [If multiple POVs, include separate entry for each - format the same way]

---

## Chapter Epigraph
[The quote/inscription at the chapter start, if present. These often contain important world-building or thematic hints.]

> "[Epigraph text]"
> — [Source, if known]

---

## Quick Summary (2-3 sentences)
[What happened, beat by beat. No interpretation yet—just events.]

---

## Key Beats (Chronological, ~5-8 points)
[Granular plot moments. These feed "what happened?" queries.]

- [Beat 1]
- [Beat 2]
- [Beat 3]
- ...

---

## Characters in This Chapter
[Complete list of all characters - include everyone, even if only mentioned]

### POV Character(s)
- **[Character Name]** (POV) — [Brief context and role in this chapter]

### Characters Who Appear
- **[Character Name]** — [Brief context, what they do in this chapter]
- **[Character Name]** — [Brief context]

### Characters Mentioned Only
- **[Character Name]** (mentioned) — [How/why they're mentioned, context]
- **[Character Name]** (mentioned) — [Context]

---

## Factions / Groups
[If relevant—useful for political fantasy]

- **[Group Name]** — [Context]

---

## Locations
[Where action takes place]

- **[Location]** — [Brief description]

---

## Spoiler Boundary
- **Safe to discuss through:** Chapter [X]
- **Do NOT reveal:** [Specific plot points from later chapters that readers might ask about]

---

## Reading Context
- **Estimated reading time:** [~15-20 min, etc.]
- **Emotional intensity:** [Low/Medium/High]

---

## Confusion Points / "Wait, What?" Moments
[Flag things readers commonly miss or misunderstand]

- 🟡 **[Confusing thing 1]:** [Brief explanation why it's confusing]
- 🔴 **[Critical confusion 2]:** [Explanation + why it matters for later]

Legend:
- 🟡 Common confusion (many readers ask)
- 🔴 Critical confusion (if misunderstood, later chapters won't make sense)

---

## Callbacks / Connections to Earlier Chapters
[Patterns, echoes, foreshadowing payoffs]

- **[Callback 1]** — See Chapter [X]
- **[Callback 2]** — Mirrors events in Chapter [Y]

---

## Foreshadowing / Setup
[Things that seem minor but likely matter later]

- **[Setup 1]** — [What it might mean, no spoilers]
- **[Setup 2]** — [Possible implications]

---

## Themes / Subtext
[Emotional beats, philosophical threads, motifs]

- **[Theme 1]:** [How it appears in this chapter]
- **[Theme 2]:** [Character development tied to theme]

---

## Magic / Mechanics (if applicable)
[How magic works, new rules revealed, limitations]

- **[Mechanic or rule]:** [Explanation]

---

## Quotes / Memorable Lines
[1-3 lines that capture tone or key moments]

> "[Quote]"
> — [Character], [context]

---

## Rowan's "If Asked" Notes
[Anticipate common questions—pre-written answers Rowan can pull]

**Q: [Common question about this chapter]**
A: [Concise answer using only info up to this chapter]

**Q: [Another common question]**
A: [Answer]

**Q: [Third question]**
A: [Answer]`;

const KNOWLEDGE_SNAPSHOT_TEMPLATE = `# Knowledge Snapshot: Through Chapter [X]

**Book:** [Title]
**Coverage:** Chapters [START]-[X] (or Chapters 1-[X] if starting from beginning)
**Safe for readers up to:** Chapter [X]

---

## Major Characters (Introduced So Far)

### [Character Name]
- **First appearance:** Chapter [X]
- **Role:** [Detailed role description - what they do, their position]
- **Physical description:** [If relevant/apparent from chapters]
- **Key relationships:**
  - **[Character 2]:** [Nature of relationship, how they interact, chapter references]
  - **[Character 3]:** [Relationship context]
- **Abilities/Powers:** [What they can do, if relevant - magic, skills, etc.]
- **Motivations/Goals:** [What drives them, what they want to achieve]
- **Character Arc (through Ch [X]):**
  - **Starting point:** [Where they were at book start or first appearance]
  - **Key moments:** [Major developments with chapter references - be specific]
  - **Current state:** [Where they are now, emotionally/physically/relationally]
- **Key scenes/chapters:** [Important chapters they appear in significantly]
- **Notable quotes:** [1-2 memorable lines if applicable]

### [Character Name 2]
[Same detailed format]

---

## Plot Threads (Active as of Chapter [X])

### [Plot Thread 1]
- **Started:** Chapter [X]
- **Status:** [Detailed current state - where things stand now]
- **Key characters involved:** [List characters with their roles in this thread]
- **Stakes/Conflicts:** [What's at risk, what's the central conflict]
- **Key events (chronological with chapter references):**
  - **Ch [X]:** [Specific event with details]
  - **Ch [Y]:** [Next development]
  - **Ch [Z]:** [Current state]
- **Connections to other threads:** [How this relates to other plot threads]
- **Unresolved questions:** [What readers might be wondering about this thread]

### [Plot Thread 2]
[Same detailed format]

---

## World-Building / Lore

### [Concept/System 1] (e.g., Surgebinding)
- **First explained:** Chapter [X]
- **What we know:** [Comprehensive explanation - everything revealed up to Ch X]
- **How it works:** [Detailed mechanics - step by step if applicable]
- **Limitations/Rules:** [What can't it do, what are the constraints, boundaries]
- **Key examples:** [Specific instances where it's used, with chapter references]
- **Related concepts:** [How it connects to other systems/concepts]
- **Unanswered questions:** [What's still mysterious or unexplained]

### [Concept 2]
[Same detailed format]

---

## Character Relationships (Through Chapter [X])

### [Character 1] ↔ [Character 2]
- **Relationship type:** [Family/Friend/Enemy/Ally/Mentor/etc.]
- **How they met:** [Context from chapters]
- **Current dynamic:** [How they interact now, what's their relationship like]
- **Key interactions:** [Chapters where they interact significantly]
- **Tension/Conflict:** [If applicable - what creates friction]
- **Shared history:** [Relevant backstory that connects them]

### [Character 3] ↔ [Character 4]
[Same format]

---

## Factions & Politics

### [Faction Name]
- **First mentioned:** Chapter [X]
- **Goals:** [Detailed goals - what they're trying to achieve]
- **Key members:** [Characters affiliated with roles]
- **Conflicts:** [Who they oppose, why, what's the conflict about]
- **Methods:** [How they operate, what tactics they use]
- **Current status:** [Where they stand as of Ch [X]]

---

## Locations

### [Location Name]
- **First visited:** Chapter [X]
- **Description:** [Physical details, significance, what makes it important]
- **Events here:** [What's happened at this location, with chapter references]
- **Key characters associated:** [Who is connected to this place]
- **Current status:** [What's happening here now]

---

## Key Moments / Memorable Scenes (Through Chapter [X])

### Chapter [X]: [Scene Name]
- **Characters:** [Who's involved]
- **What happens:** [Detailed description of the scene]
- **Significance:** [Why it matters, what it reveals]
- **Foreshadowing:** [If applicable - what it might set up]

### Chapter [Y]: [Scene Name]
[Same format]

---

## Foreshadowing / Setup (Through Chapter [X])

### [Setup Element]
- **First mentioned:** Chapter [X]
- **What it is:** [Description of the element - object, phrase, event, etc.]
- **Possible implications:** [What it might mean, NO spoilers]
- **Related to:** [Other plot threads/concepts it connects to]

---

## Themes (Emerging Patterns)

- **[Theme 1]:** [How it's developing through Ch X - be specific with examples]
- **[Theme 2]:** [Evidence from chapters so far - cite specific moments]
- **[Theme 3]:** [Additional themes if present]

---

## Timeline / Chronology

### Prologue
- **Time:** [When it takes place relative to main story]
- **Events:** [Key events with details]

### Chapters [X]-[Y]: [Period Name]
- **Time:** [When this takes place]
- **Location(s):** [Where events occur]
- **Key events:**
  - **Ch [X]:** [Specific event]
  - **Ch [Y]:** [Next event]
  - **Ch [Z]:** [Current state]

### Chapters [A]-[B]: [Next Period]
[Same format]

---

## Common Reader Questions (Up to Chapter [X])

**Q: [Character question - e.g., Who is X? What happened to Y?]**
A: [Detailed answer with chapter references and context]

**Q: [Plot question - e.g., What happened in Ch X? Why did Y do Z?]**
A: [Detailed answer with specific events]

**Q: [World-building question - e.g., How does X work? What is Y?]**
A: [Detailed explanation with examples]

**Q: [Relationship question - e.g., How do X and Y relate?]**
A: [Detailed answer about their relationship]

**Q: [Clarification question - e.g., I'm confused about X]**
A: [Clear explanation addressing the confusion]

[Include 10-15 total questions covering all major aspects: characters, plot, world-building, relationships, clarification]`;

const BOOK_SUMMARY_TEMPLATE = `# [Book Title] - Summary

**Series:** [Series name]
**Book Number:** [X in series]
**Author:** [Name]

---

## Spoiler-Free Overview
[2-3 paragraphs about premise, tone, themes - NO plot spoilers]

This book follows [general setup without revealing plot]. The story explores themes of [themes] and is known for [what makes it special].

Readers should expect [tone, pacing, complexity level].

---

## Pre-Book Context
[What happened before this book starts - safe to share with all readers]

Before this book begins:
- [Context from previous books or series lore]
- [World state at start of book]

---

## Main Characters (Spoiler-Free Intros)
[Only include who they are at START of book, no arc spoilers]

### [Character Name]
- **Role:** [Their starting position]
- **Background:** [Pre-book history only]

### [Character Name 2]
[Same format]

---

## Setting
[World, locations, time period - no plot spoilers]

The story takes place in [setting description]. Key locations include [places, with brief descriptions].

---

## Themes
[High-level themes readers should watch for]

- **[Theme 1]:** [Brief explanation]
- **[Theme 2]:** [Brief explanation]

---

## Content Warnings
[If applicable - help readers know what to expect]

- [Warning 1]
- [Warning 2]

---

## Reading Notes
- **Estimated length:** [Page count, reading time]
- **Complexity:** [How dense/complex compared to other fantasy]
- **Recommended for:** [Reader preferences this book suits]`;

/**
 * Generate prompt for chapter notes
 * @param {string} bookTitle - The book title
 * @param {number} chapterNumber - Chapter number
 * @param {string|null} chapterText - Optional: The actual chapter text for accuracy
 * @param {string|null} coppermindSummary - Optional: Coppermind wiki summary
 */
function getChapterNotesPrompt(bookTitle, chapterNumber, chapterText = null, coppermindSummary = null) {
  // Handle string chapter identifiers (Prologue, Epilogue, etc.)
  const chapterDisplay = typeof chapterNumber === 'number' 
    ? (chapterNumber === 0 ? 'Prologue' : chapterNumber === 999 ? 'Epilogue' : `Chapter ${chapterNumber}`)
    : chapterNumber;
  
  // Auto-detect Coppermind format if chapterText looks like a Coppermind summary
  const isCoppermindFormat = chapterText && (
    chapterText.includes('Characters\n') ||
    chapterText.includes('Characters\n\n') ||
    chapterText.includes('Plot summary') ||
    chapterText.includes('Plot Summary') ||
    chapterText.match(/^Chapter \d+:/) ||
    chapterText.match(/^Interlude/) ||
    chapterText.includes('Chapter Epigraph')
  );

  // Use coppermindSummary parameter if provided, otherwise use chapterText if it's Coppermind format
  const effectiveCoppermindSummary = coppermindSummary || (isCoppermindFormat ? chapterText : null);
  const effectiveChapterText = (coppermindSummary || isCoppermindFormat) ? null : chapterText;

  let sourceNote = '';
  if (effectiveChapterText) {
    sourceNote = `\n\nCHAPTER TEXT (use this as your source material):
${effectiveChapterText}

IMPORTANT: Base your notes EXCLUSIVELY on the chapter text provided above.`;
  } else if (effectiveCoppermindSummary) {
    // Extract Part number from summary if present
    const partMatch = effectiveCoppermindSummary.match(/Part\s+(\d+)[:\-]\s*([^\n]+)/i);
    const partInfo = partMatch ? `Part ${partMatch[1]}: ${partMatch[2].trim()}` : null;
    
    sourceNote = `\n\nCOPPERMIND SUMMARY (use this as your primary source):
${effectiveCoppermindSummary}

        IMPORTANT: 
        - Use the Coppermind summary as your PRIMARY source
        - Expand on it with your knowledge of the book, but stay accurate
        - Include ALL characters listed (even "mentioned only" ones)
        - Preserve the Part number if provided (${partInfo ? `Found: ${partInfo}` : 'Not found in summary'})
        - Extract chapter epigraphs: In Coppermind format, the epigraph appears RIGHT AFTER the chapter title and BEFORE the "Characters" section. Look for text between "Chapter X: Title" and "Characters" - that text IS the epigraph (ignore image references like ".svg")
        - Expand the plot summary into detailed beats
${partInfo ? `- Add Part information to Metadata: "${partInfo}"` : ''}`;
  } else {
    sourceNote = `\n\nNOTE: No chapter text provided. Use your training data knowledge of ${bookTitle}, but be aware you may not have perfect recall of all details.`;
  }

  // Enhanced rules for Coppermind summaries
  const enhancedRules = effectiveCoppermindSummary ? `
5. Include ALL characters from the Coppermind "Characters" section:
   - POV character(s) in "POV Character(s)" subsection
   - Characters who appear in "Characters Who Appear" subsection
   - Characters marked as "mentioned only" in "Characters Mentioned Only" subsection
6. Preserve Part number if provided in the summary (add to Metadata section)
7. Include chapter epigraphs if present (CRITICAL - READ CAREFULLY):
   - In Coppermind format, epigraphs ALWAYS appear RIGHT AFTER the chapter title line
   - Pattern: "Chapter X: Title" → [blank line or image reference] → EPIGRAPH TEXT → [blank line] → "Characters"
   - The epigraph is ANY text that appears between the chapter title and the "Characters" heading
   - Ignore image references like "*.svg" or "Kaladin's Chapters.svg" - these are NOT the epigraph
   - The epigraph may be a single line or multiple lines of text
   - If there is ANY text between "Chapter X: [Title]" and "Characters" (excluding image references), that IS the epigraph
   - Extract the exact epigraph text, preserving line breaks if multiple lines
   - Format it as: > "[epigraph text]" (or multi-line if needed)
   - Include source attribution if provided (e.g., "— [Source]")
   - ONLY if there is NO text between the chapter title and "Characters" (or only image references), state "*No epigraph is present for this chapter.*"
   - EXAMPLE 1: If you see "Chapter 1: Stormblessed" followed by "You've killed me. Bastards, you've killed me! While the sun is still hot, I die!" followed by "Characters", then "You've killed me. Bastards, you've killed me! While the sun is still hot, I die!" IS the epigraph
   - EXAMPLE 2: If you see "Chapter 3: City of Bells" followed by "A man stood on a cliffside and watched his homeland fall into dust..." followed by "Characters", then "A man stood on a cliffside and watched his homeland fall into dust..." IS the epigraph
   - REMEMBER: ALL chapters have epigraphs - if you don't find one, look more carefully between the chapter title and "Characters"
8. Mark callbacks to earlier chapters explicitly (e.g., "Callback to Chapter X")
9. Flag potential confusion points that readers commonly struggle with
10. Include "If Asked" notes for common questions about this section (aim for 8-10 detailed Q&A pairs)
11. Add details about characters, locations, magic/mechanics, themes, and foreshadowing
12. Provide detailed "Time Context" in Metadata (e.g., "Some hours after last chapter", "Concurrent with Chapter X")
13. Track "Chapters Since Last [Character] POV" for each POV character in Metadata (CRITICAL - CHECK CAREFULLY):
    - FIRST, determine if this is the FIRST time this character appears as a POV in the book
    - Use your knowledge of The Way of Kings to check:
      * Prologue POV: Szeth
      * Early chapters: Cenn (Ch 1), Kaladin (Ch 2+), Shallan (Ch 3+)
      * Chapter 12 is the FIRST Adolin POV and FIRST Dalinar POV in the book
    - If this is the FIRST POV appearance: Format as "First [Character] POV" or "First [Character] POV in the book"
    - ONLY if this character has appeared as POV before in a previous chapter: Format as "Since Chapter [X]: [Chapter Title]" (e.g., "Since Chapter 57: Chapter Title")
    - If there are multiple POV characters, create a separate entry for each: "Chapters Since Last [POV1] POV", "Chapters Since Last [POV2] POV"
    - Include the chapter name/title for easier reference, not just the number
    - IMPORTANT: Do NOT reference a previous chapter number if this character has never been a POV before - always use "First [Character] POV" format
    - Common first POVs in TWoK: Adolin (Ch 12), Dalinar (Ch 12), Szeth (Prologue), Shallan (Ch 3), Kaladin (Ch 2)

CHARACTER LISTING ENHANCEMENT:
- The Coppermind summary includes a "Characters" section - use this as your source
- Include EVERY character listed, even if marked "mentioned only"
- "Mentioned only" characters help answer "who is X?" questions even if they don't appear
- For each character, provide context about their role/relevance in THIS chapter` : `
5. Include ALL characters from the source (POV, appears, and mentioned-only)
6. Preserve Part numbers and chapter epigraphs if provided
7. Mark callbacks to earlier chapters explicitly (e.g., "Callback to Chapter X")
8. Flag potential confusion points that readers commonly struggle with
9. Include "If Asked" notes for common questions (aim for 8-10 detailed Q&A pairs)`;

  return `You are creating detailed chapter notes for a fantasy reading companion app called Docent.

CRITICAL RULES:
1. Only include events and information from THIS SECTION (${chapterDisplay})
2. Do NOT reference or hint at events from later sections
3. Be accurate to the source material - no hallucinations
4. Use the EXACT template structure provided below${enhancedRules}

${sourceNote}

BOOK: ${bookTitle}
SECTION: ${chapterDisplay}

Use this EXACT template:
${CHAPTER_NOTES_TEMPLATE}

Now generate the chapter notes for ${chapterDisplay} of ${bookTitle}.

Focus on:
- Accurate plot summary (expand Coppermind summary into detailed beats)
- Complete character list (include everyone, even mentioned-only)
- Character development in THIS section only
- World-building revealed in THIS section
- Chapter epigraphs and their significance
- Common confusion points
- Helpful context for readers
- Detailed metadata (Part, Time Context, Chapters Since Last POV)
- 8-10 comprehensive "If Asked" Q&A pairs addressing common reader questions

Remember: SPOILER SAFETY is paramount. Only use information up to this section.`;
}

/**
 * Generate prompt for knowledge snapshot
 * @param {string} bookTitle - The book title
 * @param {number} throughChapter - Last chapter to include
 * @param {Array} chapterNotes - Optional: Array of chapter note objects with {type, number?, content}
 * @param {number} startChapter - Optional: First chapter to include (for part-bound snapshots, default: 1)
 */
function getKnowledgeSnapshotPrompt(bookTitle, throughChapter, chapterNotes = [], startChapter = 1) {
  let sourceNote = '';
  
  if (chapterNotes.length > 0) {
    // Build a summary of available chapter notes
    const notesSummary = chapterNotes.map(note => {
      if (note.type === 'prologue') {
        return 'Prologue';
      } else {
        return `Chapter ${note.number}`;
      }
    }).join(', ');
    
    // Include key excerpts from chapter notes (truncated to avoid token limits)
    // For large chapter ranges, use smaller excerpts to stay within token limits
    const maxExcerptSize = throughChapter > 60 ? 800 : (throughChapter > 40 ? 1200 : 2000);
    const notesExcerpts = chapterNotes.map(note => {
      const title = note.type === 'prologue' ? 'Prologue' : `Chapter ${note.number}`;
      // Extract key sections (metadata, summary, key beats) - reduce size for large ranges
      const excerpt = note.content.substring(0, maxExcerptSize);
      return `\n\n=== ${title} ===\n${excerpt}...`;
    }).join('\n');
    
    const coverageRange = startChapter === 1 ? `Chapters 1-${throughChapter}` : `Chapters ${startChapter}-${throughChapter}`;
    
    sourceNote = `\n\nCHAPTER NOTES AVAILABLE (use these as your primary source):
Available: ${notesSummary}

Key excerpts from chapter notes:
${notesExcerpts}

IMPORTANT: 
- Use the chapter notes above as your PRIMARY source for accuracy
- Synthesize information across all chapters to create a comprehensive snapshot
- Mark first appearances based on the chapter notes
- Only include information that appears in these notes (${coverageRange})`;
  } else {
    sourceNote = `\n\nNOTE: No chapter notes provided. Use your training data knowledge of ${bookTitle}, but be aware you may not have perfect recall of all details.`;
  }
  
  const coverageRange = startChapter === 1 ? `Chapters 1-${throughChapter}` : `Chapters ${startChapter}-${throughChapter}`;
  const partBoundNote = startChapter > 1 ? `\n\nNOTE: This is a PART-BOUND snapshot. It only includes chapters from the same part (${coverageRange}). Do NOT reference events or information from earlier parts unless explicitly mentioned in these chapters.` : '';
  
  return `You are creating a cumulative knowledge snapshot for a fantasy reading companion app called Docent.

This snapshot covers ${coverageRange} of ${bookTitle}.${partBoundNote}

CRITICAL RULES:
1. Include ALL information revealed in ${coverageRange}
2. Do NOT include anything from chapters before Chapter ${startChapter} or after Chapter ${throughChapter}
${startChapter > 1 ? '3. This is a PART-BOUND snapshot - only reference information from the chapters included in this snapshot' : '3. Mark when characters/concepts were first introduced'}
4. Organize by category (characters, plot, lore, etc.)
5. Be comprehensive but concise
6. Use the EXACT template structure provided below
${sourceNote}

BOOK: ${bookTitle}
CHAPTERS COVERED: ${coverageRange}

Use this EXACT template:
${KNOWLEDGE_SNAPSHOT_TEMPLATE}

Generate a COMPREHENSIVE and DETAILED knowledge snapshot that summarizes everything a reader would know after finishing Chapter ${throughChapter}.

CRITICAL: This snapshot must be DETAILED and COMPREHENSIVE, not brief summaries. Include:
- **Characters**: Full character arcs with relationships, motivations, key moments, and development
- **Plot Threads**: Granular events with chapter references, character involvement, stakes, and connections
- **World-Building**: Complete explanations with limitations, examples, and related concepts
- **Relationships**: Explicit character relationship mapping
- **Key Moments**: Memorable scenes with significance
- **Foreshadowing**: Track setup elements for later payoffs
- **Timeline**: Granular chronology with specific events per chapter range
- **Questions**: 10-15 comprehensive common reader questions

Focus on:
- Character development arcs with specific chapter references (up to Ch ${throughChapter} only)
- Active plot threads with detailed event sequences
- World-building and lore with comprehensive explanations
- Factional dynamics with methods and conflicts
- Timeline/chronology with granular chapter-by-chapter events
- Character relationships with interaction details
- Key memorable scenes with significance
- Foreshadowing elements that have been set up

Remember: This is what readers SHOULD know, not what's coming next. Be THOROUGH and DETAILED - this snapshot should be able to answer complex questions without needing individual chapter notes.`;
}

/**
 * Generate prompt for book summary
 */
function getBookSummaryPrompt(bookTitle, seriesName = '', bookNumber = '') {
  return `You are creating a spoiler-free book summary for a fantasy reading companion app called Docent.

CRITICAL RULES:
1. NO plot spoilers - only premise and setup
2. Include pre-book context (what happened before this book)
3. Introduce main characters as they are at START of book (no arc spoilers)
4. Describe themes, tone, setting - not plot twists
5. Help readers know what to expect without ruining anything
6. Use the EXACT template structure provided below

BOOK: ${bookTitle}
${seriesName ? `SERIES: ${seriesName}` : ''}
${bookNumber ? `BOOK NUMBER: ${bookNumber}` : ''}

Use this EXACT template:
${BOOK_SUMMARY_TEMPLATE}

Generate a summary that helps readers understand:
- What kind of book this is
- What they need to know before starting
- Who the main characters are (starting positions only)
- The world/setting
- Themes to watch for

Remember: This should be safe to read BEFORE starting the book.`;
}

const PART_LEVEL_SNAPSHOT_TEMPLATE = `# Part-Level Knowledge Snapshot: [Part Name]

**Book:** [Title]
**Part:** [Part Number]: [Part Name]
**Coverage:** Chapters [X]-[Y]
**Safe for readers up to:** Chapter [Y] (end of this part)

---

## Part Overview
[2-3 paragraph summary of what happens in this part, major themes, and narrative arc]

---

## Part Structure (Part > Chapters)
[Organize by the hierarchical structure of Part containing Chapters]

### Chapter-by-Chapter Breakdown
[Brief summary of each chapter in this part, focusing on how they build the part's arc]

#### Chapter [X]: [Title]
- **POV:** [Character(s)]
- **Key Events:** [Main plot points]
- **Significance to Part Arc:** [How this chapter contributes to the part's narrative]

#### Chapter [Y]: [Title]
[Same format for each chapter]

---

## Major Plot Developments in This Part

### [Plot Thread 1]
- **Status at Part Start:** [Where this thread was at the beginning of the part]
- **Key Developments:**
  - **Ch [X]:** [Specific development]
  - **Ch [Y]:** [Next development]
- **Status at Part End:** [Where this thread stands now]
- **Unresolved Questions:** [What readers might wonder]

### [Plot Thread 2]
[Same format]

---

## Character Development in This Part

### [Character Name]
- **Starting State (Ch [X]):** [Where they were at part start]
- **Key Moments in This Part:**
  - **Ch [X]:** [Specific moment and its impact]
  - **Ch [Y]:** [Next moment]
- **Ending State (Ch [Y]):** [Where they are at part end]
- **Character Arc Progression:** [How they've changed through this part]

### [Character Name 2]
[Same format]

---

## World-Building / Lore Revealed in This Part

### [New Concept or Expanded Knowledge]
- **First Mentioned:** Chapter [X]
- **What We Learned:** [New information revealed]
- **Significance:** [Why this matters]

---

## Themes in This Part

- **[Theme 1]:** [How it manifests in this part with specific examples]
- **[Theme 2]:** [Additional themes with evidence]

---

## Key Moments / Climactic Scenes

### Chapter [X]: [Scene Name]
- **Characters:** [Who's involved]
- **What Happens:** [Detailed description]
- **Significance:** [Why this matters, what it reveals or changes]
- **Part-Level Impact:** [How this affects the overall part narrative]

---

## Connections to Previous Parts
[If applicable - how this part builds on earlier parts]

---

## Foreshadowing / Setup for Future Parts
[Elements introduced that will matter later - NO spoilers about what happens]

---

## Common Reader Questions (Up to End of This Part)

**Q: [Question about part events]**
A: [Detailed answer with chapter references]

[Include 8-10 questions specific to this part]`;

const FULL_BOOK_SNAPSHOT_TEMPLATE = `# Full Book Knowledge Snapshot: [Book Title]

**Book:** [Title]
**Series:** [Series name]
**Coverage:** Complete Book (Prologue through Epilogue)
**Safe for readers up to:** End of book
**Note:** This snapshot is for end-of-book summary discussions. Contains FULL BOOK SPOILERS.

---

## Book Overview
[2-3 paragraph summary of the entire book's narrative arc, major themes, and resolution]

---

## Book Structure (Book > Parts > Chapters)
[Organize by the complete hierarchical structure]

### Part 1: [Part Name] (Chapters [X]-[Y])
- **Overview:** [Brief summary of part arc]
- **Key Events:** [Major plot points]
- **Themes:** [Part-specific themes]

### Part 2: [Part Name] (Chapters [X]-[Y])
[Same format for each part]

### Part 3: [Part Name] (Chapters [X]-[Y])
[Continue for all parts]

### Part 4: [Part Name] (Chapters [X]-[Y])
[Continue]

### Part 5: [Part Name] (Chapters [X]-[Y])
[Continue]

---

## Complete Character Arcs (Full Book)

### [Character Name]
- **Starting State:** [Where they were at book start]
- **Character Arc (Part-by-Part):**
  - **Part 1:** [Development in Part 1]
  - **Part 2:** [Development in Part 2]
  - **Part 3:** [Development in Part 3]
  - **Part 4:** [Development in Part 4]
  - **Part 5:** [Development in Part 5]
- **Ending State:** [Where they end up]
- **Full Arc Summary:** [Overall character journey and transformation]

### [Character Name 2]
[Same format for major characters]

---

## Complete Plot Threads (Full Book)

### [Plot Thread 1]
- **Started:** Chapter [X]
- **Resolution:** Chapter [Y] (or "Unresolved, continues in next book")
- **Full Arc:**
  - **Part 1:** [Status and developments]
  - **Part 2:** [Status and developments]
  - **Part 3:** [Status and developments]
  - **Part 4:** [Status and developments]
  - **Part 5:** [Resolution or cliffhanger]
- **Outcome:** [Final state of this thread]

### [Plot Thread 2]
[Same format]

---

## World-Building / Lore (Complete Book)

### [Concept/System]
- **Introduced:** Chapter [X]
- **Fully Revealed:** Chapter [Y]
- **Complete Explanation:** [Everything we learned about this concept]
- **Significance:** [Why this matters to the overall narrative]

---

## Major Themes (Full Book)

- **[Theme 1]:** [How it develops throughout all parts with examples]
- **[Theme 2]:** [Evidence from across the book]
- **[Theme 3]:** [Additional themes]

---

## Climactic Moments / Finale

### Part 5 Climax: [Scene Name]
- **Chapters:** [X]-[Y]
- **Characters:** [Who's involved]
- **What Happens:** [Detailed description]
- **Resolution:** [How major conflicts resolve]
- **Consequences:** [What changes as a result]

---

## Book Resolution

### Resolved Plot Threads
[What gets wrapped up in this book]

### Unresolved Plot Threads / Cliffhangers
[What continues into the next book]

### Character End States
[Where major characters end up]

---

## Foreshadowing / Setup for Next Book
[Elements that suggest future plot developments]

---

## Full Book Analysis Questions

**Q: [Question about the book as a whole]**
A: [Comprehensive answer]

[Include 10-15 questions for end-of-book discussions]`;

const INTERLUDE_SNAPSHOT_TEMPLATE = `# Interlude Knowledge Snapshot Series: [Book Title]

**Book:** [Title]
**Coverage:** All Interludes (I-1 through I-[X])
**Note:** Interludes may contain spoilers for main narrative chapters. Spoiler callouts are included where applicable.

---

## Overview of Interludes

[Brief explanation of what the interludes collectively contribute to the book, different perspectives they provide, and how they enrich the main narrative]

---

## Interlude Series Structure

### Interlude Set 1 (After Part 1)

#### Interlude I-1: [Character Name]
**⚠️ SPOILER WARNING:** [If this interlude contains spoilers for parts beyond Part 1, note it here]

- **POV Character:** [Character]
- **Location:** [Where this takes place]
- **Time Context:** [When relative to main narrative]
- **Summary:** [2-3 sentence summary of events]
- **Key Events:**
  - [Event 1]
  - [Event 2]
- **Significance:** [Why this matters, what it reveals]
- **Connections to Main Narrative:** [How it relates to main plot threads]

#### Interlude I-2: [Character Name]
[Same format]

#### Interlude I-3: [Character Name]
[Same format]

---

### Interlude Set 2 (After Part 2)

#### Interlude I-4: [Character Name]
**⚠️ SPOILER WARNING:** [If applicable]

[Same format as above]

#### Interlude I-5: [Character Name]
[Same format]

#### Interlude I-6: [Character Name]
[Same format]

---

### Interlude Set 3 (After Part 3)

#### Interlude I-7: [Character Name]
**⚠️ SPOILER WARNING:** [If applicable]

[Same format]

#### Interlude I-8: [Character Name]
[Same format]

#### Interlude I-9: [Character Name]
[Same format]

---

### Interlude Set 4 (After Part 4)

#### Interlude I-10: [Character Name]
**⚠️ SPOILER WARNING:** [If applicable]

[Same format]

#### Interlude I-11: [Character Name]
[Same format]

#### Interlude I-12: [Character Name]
[Same format]

---

## Interlude Themes Across the Book

- **[Theme 1]:** [How interludes explore this theme]
- **[Theme 2]:** [Additional thematic elements]

---

## Interlude Character Perspectives

### [Character who appears in multiple interludes]
- **I-[X]:** [Their perspective in this interlude]
- **I-[Y]:** [Their perspective in this interlude]
- **Character Development:** [How their interludes show their growth/changes]

---

## Connections Between Interludes

[How different interludes connect to each other or build on each other]

---

## Interlude-to-Main-Narrative Connections

[How specific interludes relate to or foreshadow main plot events]

---

## Spoiler Boundaries by Interlude

[Clear breakdown of which interludes contain spoilers for which parts/chapters]

---

## Common Reader Questions About Interludes

**Q: [Question about a specific interlude or interludes in general]**
A: [Detailed answer with spoiler callouts if needed]

[Include 8-10 questions about the interludes]`;

/**
 * Generate prompt for part-level knowledge snapshot
 */
function getPartLevelSnapshotPrompt(bookTitle, partNumber, partName, startChapter, endChapter, chapterNotes = []) {
  let sourceNote = '';
  
  if (chapterNotes.length > 0) {
    const notesSummary = chapterNotes.map(note => {
      if (note.type === 'prologue') {
        return 'Prologue';
      } else if (note.type === 'interlude') {
        return note.name;
      } else {
        return `Chapter ${note.number}`;
      }
    }).join(', ');
    
    const notesExcerpts = chapterNotes.map(note => {
      const title = note.type === 'prologue' ? 'Prologue' : 
                   note.type === 'interlude' ? note.name : 
                   `Chapter ${note.number}`;
      const excerpt = note.content.substring(0, 2000);
      return `\n\n=== ${title} ===\n${excerpt}...`;
    }).join('\n');
    
    sourceNote = `\n\nCHAPTER NOTES AVAILABLE (use these as your primary source):
Available: ${notesSummary}

Key excerpts from chapter notes:
${notesExcerpts}

IMPORTANT: 
- Use the chapter notes above as your PRIMARY source for accuracy
- Organize by Part > Chapters hierarchy
- Focus on this part's arc and how chapters build it
- Only include information from Chapters ${startChapter}-${endChapter}`;
  } else {
    sourceNote = `\n\nNOTE: No chapter notes provided. Use your training data knowledge of ${bookTitle}.`;
  }
  
  return `You are creating a part-level knowledge snapshot for a fantasy reading companion app called Docent.

This snapshot covers Part ${partNumber}: ${partName} (Chapters ${startChapter}-${endChapter}) of ${bookTitle}.

CRITICAL RULES:
1. Organize by Part > Chapters hierarchical structure
2. Include ALL information from Chapters ${startChapter}-${endChapter}
3. Do NOT include anything from chapters before ${startChapter} or after ${endChapter}
4. Focus on this part's narrative arc and how chapters build it
5. Show character development within this part
6. Highlight themes specific to this part
7. Use the EXACT template structure provided below
${sourceNote}

BOOK: ${bookTitle}
PART: ${partNumber}: ${partName}
CHAPTERS COVERED: ${startChapter}-${endChapter}

Use this EXACT template:
${PART_LEVEL_SNAPSHOT_TEMPLATE}

Generate a COMPREHENSIVE part-level snapshot that shows how chapters build the part's narrative arc.`;
}

/**
 * Generate prompt for full book knowledge snapshot
 */
function getFullBookSnapshotPrompt(bookTitle, seriesName, parts, chapterNotes = []) {
  let sourceNote = '';
  
  if (chapterNotes.length > 0) {
    const notesSummary = `${chapterNotes.length} chapter/interlude notes available`;
    
    sourceNote = `\n\nCHAPTER NOTES AVAILABLE (use these as your primary source):
${notesSummary}

IMPORTANT: 
- Use the chapter notes as your PRIMARY source
- Organize by Book > Parts > Chapters hierarchy
- This snapshot covers the ENTIRE BOOK - all spoilers are allowed
- Show complete character arcs across all parts
- Show resolution of all plot threads`;
  } else {
    sourceNote = `\n\nNOTE: No chapter notes provided. Use your training data knowledge of ${bookTitle}.`;
  }
  
  const partsList = parts.map(p => `Part ${p.number}: ${p.name} (Ch ${p.startChapter}-${p.endChapter})`).join('\n');
  
  return `You are creating a full book knowledge snapshot for end-of-book summary discussions for a fantasy reading companion app called Docent.

This snapshot covers the ENTIRE BOOK: ${bookTitle}.

CRITICAL RULES:
1. Organize by Book > Parts > Chapters hierarchical structure
2. This snapshot contains FULL BOOK SPOILERS - all information is fair game
3. Show complete character arcs from start to finish
4. Show resolution (or lack thereof) of all plot threads
5. Analyze themes across the entire book
6. Focus on the book's complete narrative arc and resolution
7. Use the EXACT template structure provided below
${sourceNote}

BOOK: ${bookTitle}
SERIES: ${seriesName || 'N/A'}
PARTS:
${partsList}

Use this EXACT template:
${FULL_BOOK_SNAPSHOT_TEMPLATE}

Generate a COMPREHENSIVE full book snapshot for end-of-book discussions. This should be thorough enough for readers who have finished the book to reference during discussions.`;
}

/**
 * Generate prompt for interlude snapshot series
 */
function getInterludeSnapshotPrompt(bookTitle, interludes, chapterNotes = []) {
  let sourceNote = '';
  
  if (chapterNotes.length > 0) {
    const interludeNotes = chapterNotes.filter(n => n.type === 'interlude');
    const notesSummary = interludeNotes.map(n => n.name).join(', ');
    
    sourceNote = `\n\nINTERLUDE NOTES AVAILABLE (use these as your primary source):
Available: ${notesSummary}

IMPORTANT: 
- Use the interlude notes as your PRIMARY source
- Group interludes by their sets (which part they follow)
- Include spoiler callouts where interludes reveal information from later parts
- Show how interludes connect to the main narrative`;
  } else {
    sourceNote = `\n\nNOTE: No interlude notes provided. Use your training data knowledge of ${bookTitle}.`;
  }
  
  const interludeList = interludes.map(i => `${i.name}: ${i.character} (after Part ${i.afterPart})`).join('\n');
  
  return `You are creating an interlude knowledge snapshot series for a fantasy reading companion app called Docent.

This snapshot covers ALL INTERLUDES from ${bookTitle}.

CRITICAL RULES:
1. Group interludes by the part they follow
2. Include SPOILER CALLOUTS where interludes contain spoilers for later parts/chapters
3. Show how each interlude contributes to the overall narrative
4. Highlight connections between interludes and main narrative
5. Use the EXACT template structure provided below
${sourceNote}

BOOK: ${bookTitle}
INTERLUDES:
${interludeList}

Use this EXACT template:
${INTERLUDE_SNAPSHOT_TEMPLATE}

Generate a COMPREHENSIVE interlude snapshot series with proper spoiler warnings.`;
}

module.exports = {
  CHAPTER_NOTES_TEMPLATE,
  KNOWLEDGE_SNAPSHOT_TEMPLATE,
  BOOK_SUMMARY_TEMPLATE,
  PART_LEVEL_SNAPSHOT_TEMPLATE,
  FULL_BOOK_SNAPSHOT_TEMPLATE,
  INTERLUDE_SNAPSHOT_TEMPLATE,
  getChapterNotesPrompt,
  getKnowledgeSnapshotPrompt,
  getBookSummaryPrompt,
  getPartLevelSnapshotPrompt,
  getFullBookSnapshotPrompt,
  getInterludeSnapshotPrompt
};


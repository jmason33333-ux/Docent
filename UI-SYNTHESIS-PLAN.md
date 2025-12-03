# UI Synthesis Plan: Current + v0 Design

## Goal
Merge the best of both UIs: keep current functionality and colors, add v0's enhanced UX features.

---

## 🎨 Layout Restructure

### Header (Top Bar)
**Current State:**
- Centered Rowan logo + "Rowan" text
- TOC toggle on left
- New chat + History toggle on right

**New State:**
- **Left Side:**
  - Rowan symbol + "Rowan" text (horizontal, left-aligned)
  - Below: Chat history sidebar (always visible on desktop, like Claude)
  
- **Center:**
  - (Empty/available space for future features)

- **Right Side:**
  - TOC breadcrumb: "Series > Book" and "Chapter" (compact, clickable)
  - New chat button (+)

### Main Layout
**Current:** Sidebar (TOC) | Main Content (Chat)

**New:** Left Panel (Chat History) | Main Content (Chat) | Right Panel (TOC - collapsible/drawer)

---

## ✅ Features to Keep (Current UI)

1. **Rowan Branding**
   - Rowan tree symbol (current SVG)
   - "Rowan" text
   - ✅ Move to left side of header

2. **Chat History**
   - ✅ Move to left sidebar (like Claude/ChatGPT)
   - Keep all functionality

3. **Welcome Message** (exact text):
   ```
   Welcome to Rowan
   
   I'm your companion for navigating complex fantasy worlds.
   
   Select your book and chapter from the table of contents, then ask me anything about what you've read so far. I'll help you understand the story without spoiling what's ahead.
   ```

4. **New Chat Button**
   - Keep (+) button
   - Position: top right of header

5. **Colors** (exact palette):
   - Forest green: `#2D5246`, `#3D6656`, `#1D3E32`
   - Gold brass: `#C9A961`, `#D9B971`, `#B89951`
   - Deep plum: `#4A2F47`, `#5A3F57`
   - Paper: `#F5F1E8`
   - Warm gray: `#E8E4DC`

---

## ✨ Features to Add (v0 UI)

### 1. Real-Time Typing Effect
**Implementation:**
- Stream Rowan's responses character-by-character
- Update `addMessage()` to accept a streaming callback
- Use `setTimeout` or `requestAnimationFrame` for smooth typing
- Show cursor/pulse effect while typing

**Files to modify:**
- `public/app.js` - Add streaming message function
- `public/style.css` - Add typing animation styles

### 2. Rowan Symbol Background
**Implementation:**
- Add subtle Rowan tree SVG as background in chat area
- Low opacity (0.03-0.05)
- Centered or repeated pattern
- Behind message content (z-index layered)

**Files to modify:**
- `public/index.html` - Add background SVG element
- `public/style.css` - Style background positioning

### 3. Quick Suggestions (Left Side)
**Implementation:**
- Vertical list of suggestion buttons
- Positioned on left side of chat (between history sidebar and messages)
- Examples:
  - "Recap this chapter"
  - "Explain this character"
  - "Dive into world-building"
- Clicking sends that query automatically
- Show only when appropriate (e.g., after chapter selected)

**Files to modify:**
- `public/index.html` - Add suggestions panel
- `public/app.js` - Generate contextual suggestions
- `public/style.css` - Style suggestion buttons

### 4. Input Placeholder
**Change:** "Ask Rowan anything..." 
**To:** "Ask Rowan about lore, characters, world-building, and more"

### 5. Multiple Forest Green Layers
**Implementation:**
- Add gradient overlays with different opacities
- Create depth with multiple green layers
- Use CSS gradients and opacity

### 6. TOC in Header (Top Right)
**Implementation:**
- Move TOC from sidebar to compact header element
- Show: "Series > Book" and "Chapter X"
- Clickable to open full TOC drawer/dropdown
- Dropdown/drawer from top right

**Files to modify:**
- `public/index.html` - Restructure TOC placement
- `public/app.js` - Update TOC toggle behavior
- `public/style.css` - Style header TOC dropdown

### 7. User Messages in Plum
**Current:** Deep plum gradient
**Keep:** Same color, ensure consistency

### 8. Send Button = Rowan Symbol
**Implementation:**
- Replace arrow icon with Rowan tree SVG (mini version)
- Same size/position as current send button
- Keep functionality identical

**Files to modify:**
- `public/index.html` - Replace send button SVG
- `public/style.css` - Style Rowan symbol button

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                   │
│ ┌──────────────┐              ┌─────────────────────┐  │
│ │ [🌳 Rowan]   │              │ Series > Book       │  │
│ │              │              │ Chapter X       [+] │  │
│ └──────────────┘              └─────────────────────┘  │
├──────────┬──────────────────────────────────────────┬───┤
│          │                                          │   │
│ HISTORY  │         CHAT AREA                       │TOC│
│ SIDEBAR  │  ┌────────────────────────────────┐    │   │
│          │  │ (Rowan symbol bg, subtle)      │    │   │
│ - Chat 1 │  │                                │    │   │
│ - Chat 2 │  │ Welcome message...             │    │   │
│ - Chat 3 │  │                                │    │   │
│          │  │ [Messages appear here]         │    │   │
│          │  │                                │    │   │
│          │  └────────────────────────────────┘    │   │
│          │  ┌────────────────────────────────┐    │   │
│ QUICK    │  │ Ask Rowan about...         [🌳]│    │   │
│ SUCCESS  │  └────────────────────────────────┘    │   │
│ - Recap  │                                          │   │
│ - Explain│                                          │   │
│ - World  │                                          │   │
│          │                                          │   │
└──────────┴──────────────────────────────────────────┴───┘
```

---

## 🔧 Implementation Steps

### Phase 1: Layout Restructure
1. Move Rowan branding to left of header
2. Move chat history to left sidebar
3. Move TOC to header (top right) as dropdown
4. Adjust main content area

### Phase 2: Visual Enhancements
5. Add Rowan symbol background to chat
6. Add multiple forest green layers (gradients)
7. Update send button to Rowan symbol
8. Update placeholder text

### Phase 3: Interactive Features
9. Implement typing effect for messages
10. Add quick suggestions panel
11. Update user message styling (ensure plum)

### Phase 4: Polish
12. Test responsiveness
13. Ensure all interactions work
14. Verify colors match exactly

---

## 🎯 Key Decisions Needed

1. **TOC Behavior:**
   - Dropdown from header? (v0 style)
   - Or keep sidebar but move to right? (current style)
   - **Recommendation:** Dropdown from header for cleaner look

2. **Chat History Width:**
   - Fixed width (like Claude)? (~250px)
   - Collapsible?

3. **Quick Suggestions:**
   - Always visible or contextual?
   - Fixed list or dynamic based on chapter/book?

4. **Typing Speed:**
   - How fast should characters appear?
   - Should it feel "magical" or natural?

5. **Rowan Symbol Background:**
   - Single centered symbol?
   - Repeated pattern?
   - **Recommendation:** Single large centered, very subtle (0.03 opacity)

---

## ❓ Questions Before Implementation

1. Should TOC be a dropdown menu from header, or keep as sidebar (just move to right)?
2. Should chat history sidebar be collapsible or always visible on desktop?
3. Should quick suggestions be:
   - Fixed list (always same 3-4 options)
   - Dynamic (based on current chapter/book)
4. Typing effect speed preference? (characters per second)
5. Should Rowan background symbol animate (subtle pulse) or static?

Once we align on these, I'll implement the synthesis!


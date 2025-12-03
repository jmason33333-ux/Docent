# Action Items Tracker - Rowan Performance Improvements

**Last Updated:** 2025-12-03

---

## ✅ Completed

### Phase 1: Context Prioritization
- [x] Prioritize snapshots for character/location questions
- [x] Enhanced context instructions for character questions
- [x] Add location to snapshot categories
- [x] Supplement snapshots with recent chapters

### Phase 2: Smart Chapter Discovery (File-Based)
- [x] Extract character/location names from queries
- [x] Search chapter files on-the-fly for character mentions
- [x] Load specific chapters (not just sequential)
- [x] Enhanced "first meeting" detection

---

## 🚧 In Progress

### Phase 3: Chapter Index System ✅ COMPLETE
- [x] Create `utils/chapter-index.js` - Index building and lookup
- [x] Create `scripts/build-chapter-index.js` - Index builder script
- [x] Build index from chapter note metadata
- [x] Update `findCharacterChapters()` to use index
- [x] Auto-build index for all books (universal)

### Phase 4: Enhanced Prompt Instructions ✅ COMPLETE
- [x] Complete structure enforcement for ALL questions
- [x] Add tone examples (warm vs clinical)
- [x] Add depth requirements
- [x] Ensure "Want to Know More?" always present

---

## ⚠️ Critical Issues from Performance Summary

### 1. Chapter Selection Not Recognized ✅ FIXED
**Status:** ✅ COMPLETE
- [x] Investigate chapter parameter flow (frontend → backend)
- [x] Fix spoiler check to use actual selected chapter
- [x] Add logging/debugging (`[ROWAN] Request received...`)

### 2. Chapter Notes Loading Failures ✅ FIXED
**Status:** ✅ COMPLETE  
**Affected:** Chapters 24-25, 44-45, 56-57 show "no_notes_available"
- [x] Debug file path logic for TWoK Part structure
- [x] Fix part folder detection (using universal detection)
- [x] Add better error logging
- [x] Test with all books (TWoK, RoW, Dawnshard) - universal solution

### 3. Data Accuracy - POV Tracking Errors ✅ TOOLS CREATED
**Status:** ✅ VALIDATION SCRIPT CREATED
- [x] Create validation script (`scripts/validate-pov-tracking.js`)
- [ ] Audit Chapter 5 notes (Shallan POV tracking) - Manual step
- [ ] Fix all POV tracking errors - Manual step after validation
- [ ] Apply to all books - Manual step

### 4. Response Structure Inconsistency ✅ FIXED
**Status:** ✅ COMPLETE
- [x] Complete Phase 4: Structure enforcement
- [x] Ensure SHORT prompt uses 3-section format (MANDATORY)
- [x] Add validation reminders to all context instructions

### 5. Tone/Voice Issues ✅ FIXED
**Status:** ✅ COMPLETE
- [x] Complete Phase 4: Add tone examples
- [x] Explicit "avoid clinical language" instructions

### 6. Snapshot Fallback ✅ FIXED
**Status:** ✅ COMPLETE
- [x] Use snapshots when individual chapters not found
- [x] Apply to Ch 25, 45, 57 questions (and all similar cases)

### 7. Spoiler Safety for "Want to Know More?" ✅ FIXED
**Status:** ✅ COMPLETE
- [x] Validate suggested topics don't spoil (added instructions to prompts)

---

## 📝 Universal Solution Requirements

All solutions must work for:
- ✅ The Way of Kings
- ✅ Rhythm of War  
- ✅ Dawnshard
- ✅ Future books (without code changes)

**Design:** Auto-detection > Hardcoded logic


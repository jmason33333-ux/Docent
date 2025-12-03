# Comprehensive Action Plan: Tracking All Issues & Universal Solutions

**Status:** Active  
**Date:** 2025-12-03  
**Goal:** Fix all identified issues with solutions that work for ALL books (TWoK, RoW, Dawnshard, future books)

---

## ✅ Completed Items

### Phase 1: Context Prioritization ✅
- [x] Prioritize snapshots for character/location questions
- [x] Enhance context instructions for depth
- [x] Add location to snapshot categories
- [x] Supplement snapshots with recent chapters

### Phase 2: Smart Chapter Discovery ✅ (Partial - File Searching Only)
- [x] Extract character/location names from queries
- [x] Search chapter files for character mentions (on-the-fly)
- [x] Load specific chapters (not just sequential)
- [x] Enhanced "first meeting" detection
- [ ] **NOT DONE:** Build chapter index with character metadata

---

## 🚧 In Progress / To Do

### Phase 2 (Complete): Chapter Index System
**Status:** Not Started - Needs Implementation  
**Priority:** HIGH - Improves performance and accuracy for all books

**Implementation:**
1. Create `utils/chapter-index.js` - Index building and lookup functions
2. Create `scripts/build-chapter-index.js` - Script to parse all chapter notes and build index
3. Index format (works for all books):
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
       }
     },
     "rhythm-of-war": { ... },
     "dawnshard": { ... }
   }
   ```
4. Update `findCharacterChapters()` to use index instead of file searching
5. Auto-build index when chapters are generated/updated

**Benefits:**
- ✅ Fast lookups (no file searching on every request)
- ✅ Works for all books automatically
- ✅ Accurate character/location tracking
- ✅ Can track relationships, first appearances, etc.

---

### Phase 3: Enhanced Prompt Instructions
**Status:** Partially Done - Need to Complete  
**Priority:** HIGH - Directly improves answer quality

**Remaining Work:**
1. **Structure Enforcement:** Ensure ALL prompts (SHORT and FULL) have explicit structure requirements
2. **Tone Examples:** Add specific examples of warm, conversational tone vs clinical
3. **Depth Requirements:** Explicit instructions for minimum depth/paragraph count
4. **"Want to Know More?" Validation:** Ensure all responses end with specific next steps

**Files to Update:**
- `rowan-prompt.js` - Add tone examples, structure enforcement
- `utils/openai-client.js` - Add structure validation in context instructions

---

## 📋 Action Items from Performance Summary

### Critical Issues (Must Fix)

#### 1. ✅ Context Loading Failures - PARTIALLY FIXED
- [x] Phase 1: Prioritize snapshots
- [x] Phase 2: Smart chapter discovery (file-based)
- [ ] Phase 3: Build chapter index for faster, more accurate discovery
- [ ] **Fix Chapter Notes Loading** - Debug why Ch 24-25, 44-45, 56-57 show "no_notes_available"

#### 2. ⚠️ Chapter Selection Not Recognized - NOT FIXED
**Status:** Critical - Needs investigation
- [ ] Investigate how `chapter` parameter flows from frontend → backend
- [ ] Verify frontend sends selected chapter correctly
- [ ] Fix spoiler check logic to use actual selected chapter
- [ ] Add logging to debug chapter parameter

#### 3. ⚠️ Data Accuracy in Chapter Notes - NOT FIXED
**Status:** HIGH - Causes incorrect answers
- [ ] Audit all TWoK chapter notes for POV tracking errors
- [ ] Fix Chapter 5 notes: "Chapters Since Last Shallan POV" (should be Ch 3, not Ch 4)
- [ ] Create validation script to check POV tracking accuracy
- [ ] Apply fixes to all books (RoW, Dawnshard, etc.)

### Major Issues

#### 4. ⚠️ Response Structure Inconsistency - PARTIALLY FIXED
- [x] Phase 1: Enhanced instructions for character questions
- [ ] **Complete Phase 4:** Explicit structure enforcement for ALL questions (not just character)
- [ ] Add structure validation/reminders to SHORT prompt context instructions
- [ ] Ensure 3-section format is mandatory for SHORT prompts

#### 5. ⚠️ Tone and Voice Issues - PARTIALLY FIXED
- [x] Phase 1: Added conversational tone instructions
- [ ] **Complete Phase 4:** Add specific tone examples (good vs bad)
- [ ] Add explicit "avoid clinical language" instructions
- [ ] Add examples to prompt templates

#### 6. ⚠️ Content Depth Issues - PARTIALLY FIXED
- [x] Phase 1: Enhanced depth instructions for character questions
- [ ] **Complete Phase 4:** Apply depth requirements to ALL question types
- [ ] Ensure snapshots are used for comprehensive topics
- [ ] Add minimum depth requirements to prompts

### Technical Issues

#### 7. ⚠️ Snapshot Selection Logic - PARTIALLY FIXED
- [x] Phase 1: Prioritize snapshots for character/location
- [ ] Fall back to snapshots when individual chapters not found (Ch 25, 45, 57)
- [ ] Ensure world-building questions always try snapshots first

#### 8. ⚠️ Spoiler Safety in "Want to Know More?" - NOT FIXED
- [ ] Add spoiler validation for suggested next-step topics
- [ ] Check if suggested topics exist in user's chapter range
- [ ] Filter suggestions based on spoiler safety

#### 9. ⚠️ Metadata Tracking Issues - NOT FIXED
- [ ] Fix file path logic for TWoK Part structure
- [ ] Debug why Ch 24-25, 44-45, 56-57 show "not found"
- [ ] Add better error logging in `rag-loader.js`
- [ ] Validate chapter notes were actually loaded

---

## 🎯 Universal Solutions (Works for All Books)

### Design Principles:
1. **No Book-Specific Logic:** Avoid hardcoded book names (TWoK, RoW, etc.)
2. **Generic Part Detection:** Detect part structure automatically from file system
3. **Auto-Discovery:** Build indexes and detect structures automatically
4. **Extensible:** Easy to add new books without code changes

### Key Components:

#### 1. **Universal Part Structure Detection**
**Current Issue:** Hardcoded part structures for TWoK, RoW, Dawnshard

**Solution:** Auto-detect part folders
```javascript
// Instead of:
const isTWoK = bookSlug.includes('the-way-of-kings');
if (isTWoK) { /* TWoK-specific logic */ }

// Use:
const partFolders = detectPartFolders(bookPath); // Auto-discover "Part 1", "Part 2", etc.
```

#### 2. **Universal Chapter Index**
**Works for:** All books automatically
- Index structure is book-agnostic
- Builds from chapter note metadata
- Same format for all books

#### 3. **Universal Character Extraction**
**Works for:** All books automatically
- Pattern-based extraction (no book-specific names)
- Can be enhanced with ML/NLP later
- Falls back gracefully if no characters found

---

## 📅 Implementation Priority

### **Sprint 1 (Immediate - Critical Fixes):**
1. **Fix Chapter Selection Recognition** - Critical bug preventing valid questions
2. **Fix Chapter Notes Loading** - TWoK Ch 24-25, 44-45, 56-57 not loading
3. **Complete Phase 4: Enhanced Prompts** - Structure enforcement, tone examples

### **Sprint 2 (High Priority - Quality):**
4. **Build Chapter Index System** - Phase 3 implementation
5. **Audit & Fix POV Tracking** - Data accuracy in chapter notes
6. **Universal Part Detection** - Remove book-specific logic

### **Sprint 3 (Medium Priority - Polish):**
7. **Spoiler Safety for "Want to Know More?"**
8. **Snapshot Fallback Logic** - Use snapshots when chapters not found
9. **Better Error Logging & Validation**

---

## 🔍 Files That Need Book-Specific Logic Removed

**Current Hardcoded Logic:**
1. `utils/character-context-loader.js` - Lines 119-159 (TWoK, RoW, Dawnshard part structures)
2. `utils/rag-loader.js` - Lines 239-273 (Part folder detection)
3. `utils/rag-loader.js` - `getSeriesForBook()` has hardcoded book mappings (acceptable for now)

**Solution:** Replace with auto-detection functions

---

## ✅ Success Criteria

For each book (TWoK, RoW, Dawnshard, future books):

- [ ] Character questions load correct chapters (first appearance + key chapters)
- [ ] Location questions find first mentions accurately
- [ ] "First meeting" questions find correct chapters
- [ ] All responses follow required structure (3-section or 6-section)
- [ ] Tone is warm and conversational (not clinical)
- [ ] Answers include sufficient depth (3+ paragraphs for complex topics)
- [ ] Chapter selection properly recognized (no false spoiler warnings)
- [ ] All chapter notes load correctly (no "not found" errors)

---

## 📝 Notes

- **Book-Specific Code:** Some book-specific mappings (like `seriesMap`) are acceptable if they're easy to extend
- **Index Building:** Chapter index should be built automatically when notes are generated
- **Backward Compatibility:** All solutions must work with existing chapter note structure
- **Testing:** Test with TWoK, RoW, and Dawnshard to ensure universal compatibility


# Book Ordering in Series

Rowan automatically orders books within a series so users see them in the correct reading order. There are **two ways** to define book order:

## Method 1: Numeric Prefix in Directory Name (Simplest)

Add a numeric prefix to your book directory name:

```
rag/Series/The Stormlight Archive/books/
├── 01-the-way-of-kings/
├── 02-words-of-radiance/
├── 03-edgedancer/
├── 04-oathbringer/
├── 05-dawnshard/
├── 06-rhythm-of-war/
└── 07-knights-of-wind-and-truth/
```

**Pros:**
- Simple - just rename the directory
- No extra files needed
- Works immediately

**Cons:**
- Requires renaming existing directories
- Less flexible for custom display titles

## Method 2: series.json Metadata File (More Flexible)

Create a `series.json` file in your series directory:

```
rag/Series/The Stormlight Archive/
├── series.json          <-- Create this file
└── books/
    ├── the-way-of-kings/
    ├── words-of-radiance/
    └── ...
```

**Format:**
```json
{
  "name": "The Stormlight Archive",
  "books": [
    {
      "slug": "the-way-of-kings",
      "title": "The Way of Kings",
      "order": 1
    },
    {
      "slug": "words-of-radiance",
      "title": "Words of Radiance",
      "order": 2
    },
    {
      "slug": "edgedancer",
      "title": "Edgedancer",
      "order": 3
    }
  ]
}
```

**Pros:**
- No need to rename existing directories
- Can customize display titles (e.g., "Wind and Truth" instead of "Knights Of Wind And Truth")
- Can handle old/new slug mappings if you rename later

**Cons:**
- Requires maintaining a JSON file

## How It Works

1. **If `series.json` exists:** Uses the order defined in that file
2. **If no `series.json`:** Extracts order from numeric prefixes in directory names
3. **If neither exists:** Falls back to alphabetical sorting

## Examples

### Example 1: Stormlight Archive (Current Setup)

The `series.json` file defines:
- Order: The Way of Kings → Words of Radiance → Edgedancer → Oathbringer → Dawnshard → Rhythm of War → Wind and Truth
- Custom title: "Wind and Truth" (instead of "Knights Of Wind And Truth")

### Example 2: Using Numeric Prefixes

If you prefer numeric prefixes, you can rename directories:
```bash
# Rename directories
cd rag/Series/The\ Stormlight\ Archive/books/
mv the-way-of-kings 01-the-way-of-kings
mv words-of-radiance 02-words-of-radiance
mv edgedancer 03-edgedancer
# etc.
```

Then you can delete `series.json` if you want (numeric prefix method will take over).

## Adding a New Book

### If using series.json:
1. Add the book directory (no prefix needed)
2. Update `series.json` to include the new book with the correct order

### If using numeric prefixes:
1. Create directory with prefix: `08-new-book-name/`
2. That's it!

## Migration from No Ordering

If you have existing books without ordering, here's how to add it:

**Quick migration (numeric prefixes):**
```bash
cd rag/Series/The\ Stormlight\ Archive/books/
mv the-way-of-kings 01-the-way-of-kings
mv words-of-radiance 02-words-of-radiance
# etc.
```

**OR create series.json:**
1. Copy the template from above
2. List all your books in the correct order
3. Save as `rag/Series/[Series Name]/series.json`

## Current Implementation

The code automatically:
- ✅ Checks for `series.json` first
- ✅ Falls back to numeric prefix extraction
- ✅ Falls back to alphabetical if neither exists
- ✅ Handles missing books gracefully
- ✅ Allows custom display titles via metadata

No hardcoding required! 🎉


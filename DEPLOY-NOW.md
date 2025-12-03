# Deploy Rowan to Vercel - Quick Guide

## ✅ Status: Code Pushed to GitHub
Your UI changes have been committed and pushed to: `https://github.com/jmason33333-ux/Docent.git`

---

## 🚀 Option 1: Deploy via Vercel Dashboard (Recommended - 5 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/login
   - Sign in with your GitHub account (same account as the repo)

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Find "Docent" repository in the list
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Other (already detected from `vercel.json`)
   - **Root Directory:** `.` (leave default)
   - **Build Command:** Leave empty (or `npm install` if needed)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   - `OPENAI_API_KEY` = `your-openai-api-key`
   - `GOOGLE_SHEETS_CREDENTIALS` = `your-google-sheets-credentials-json` (optional)
   - `GOOGLE_SHEET_ID` = `your-sheet-id` (optional)

5. **Deploy:**
   - Click "Deploy"
   - Wait ~2-3 minutes for build
   - Get your production URL!

---

## 💻 Option 2: Deploy via CLI (If you prefer)

1. **Login:**
   ```bash
   npx vercel login
   ```
   (This will open browser for authentication)

2. **Deploy:**
   ```bash
   npx vercel --prod
   ```

3. **Add Environment Variables:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add: `OPENAI_API_KEY`, `GOOGLE_SHEETS_CREDENTIALS`, `GOOGLE_SHEET_ID`

---

## ✅ Post-Deployment Checklist

- [ ] Test production URL
- [ ] Verify all 3 books load (TWoK, RoW, Dawnshard)
- [ ] Test selecting a chapter
- [ ] Ask a question and verify response
- [ ] Check chat history works
- [ ] Verify UI: Rowan branding is on left side of header

---

## 📝 Notes

- Your `vercel.json` is already configured
- RAG files are committed and will be deployed
- The app uses Express serverless functions on Vercel
- First deployment may take 2-3 minutes to build


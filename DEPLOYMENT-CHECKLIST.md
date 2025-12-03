# Quick Deployment Checklist

## Pre-Deployment (5 minutes)

- [ ] **Test server locally:**
  ```bash
  npm start
  # Visit http://localhost:3000
  # Test: Select book, chapter, ask question
  ```

- [ ] **Verify environment variables ready:**
  - `OPENAI_API_KEY` - You have this
  - `GOOGLE_SHEETS_CREDENTIALS` - Optional but recommended
  - `GOOGLE_SHEET_ID` - Optional but recommended

- [ ] **Check RAG files are committed:**
  ```bash
  git status
  # Make sure rag/ folder is tracked
  ```

## Deploy to Vercel (10 minutes)

### Option 1: GitHub + Vercel (Recommended)
1. [ ] Push code to GitHub
2. [ ] Go to https://vercel.com
3. [ ] Click "Import Project" → Select your repo
4. [ ] Vercel auto-detects settings
5. [ ] Add environment variables in Settings → Environment Variables
6. [ ] Deploy!

### Option 2: Vercel CLI
1. [ ] Install: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel`
4. [ ] Add env vars in dashboard
5. [ ] Production: `vercel --prod`

## Post-Deployment (5 minutes)

- [ ] **Test production URL:**
  - [ ] All 3 books load (TWoK, RoW, Dawnshard)
  - [ ] Can select chapters
  - [ ] Questions get responses
  - [ ] Chat history works

- [ ] **Share with users:**
  - [ ] Send production URL
  - [ ] Brief instructions on how to use
  - [ ] Feedback channel set up

## Estimated Total Time: ~20 minutes

---

## If Issues Occur

**"Build failed":**
- Check Vercel build logs
- Verify `vercel.json` is correct
- Ensure all dependencies in `package.json`

**"Function timeout":**
- Check server response times
- Consider increasing timeout in `vercel.json`

**"Files too large":**
- RAG folder might be too big
- Consider using Git LFS or external storage

**"Environment variables not working":**
- Check variable names match exactly
- Redeploy after adding variables
- Use Vercel dashboard, not `.env` file

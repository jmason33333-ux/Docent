# Fix Vercel Deployment Issues

## 🔍 Issues Identified

1. **API Endpoint Failing**: `/api/series` is returning errors, causing "Loading series..." to persist
2. **Static Files**: May not be serving correctly
3. **Error Handling**: Need better logging to diagnose issues

## ✅ Fixes Applied

### 1. Updated `server.js`
- Improved static file serving for Vercel
- Added better error handling to `/api/series` endpoint
- Added logging to debug API issues
- Fixed catch-all route to properly handle static files

### 2. Updated `vercel.json`
- Simplified configuration
- Ensured all routes go through server.js (which handles static files)

## 🚀 Next Steps

1. **Commit and Push Changes:**
   ```bash
   git add server.js vercel.json
   git commit -m "Fix Vercel deployment: improve static file serving and error handling"
   git push
   ```

2. **Redeploy on Vercel:**
   - Go to Vercel Dashboard
   - Your project should auto-redeploy when you push
   - OR manually trigger a redeploy

3. **Check Vercel Logs:**
   - Go to your project → "Deployments" tab
   - Click on the latest deployment
   - Click "View Function Logs" or check the build logs
   - Look for errors related to:
     - File path issues (`rag/Series` not found)
     - Missing environment variables
     - Module import errors

4. **Verify RAG Files Are Deployed:**
   - The `rag/` directory must be in your Git repo
   - Check: `git ls-files rag/` should show files
   - If not, add them: `git add rag/ && git commit -m "Add RAG files" && git push`

5. **Test the API:**
   - Visit: `https://rowan-rouge.vercel.app/api/series`
   - Should return JSON with series data
   - If it errors, check the error message in the response

6. **Add Environment Variables (if not done):**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `OPENAI_API_KEY` (required)
   - Add `GOOGLE_SHEETS_CREDENTIALS` (optional)
   - Add `GOOGLE_SHEET_ID` (optional)
   - Redeploy after adding

## 🐛 Common Issues & Solutions

### Issue: "Loading series..." never resolves
**Solution:**
- Check browser console (F12) for errors
- Check Vercel function logs
- Verify `/api/series` endpoint works: visit `https://rowan-rouge.vercel.app/api/series`
- Ensure `rag/Series` directory exists in the repo

### Issue: CSS/JS files not loading
**Solution:**
- Check browser Network tab (F12) - are files 404?
- Verify `public/` directory is in the repo
- Check Vercel build logs for errors

### Issue: API returns 500 error
**Solution:**
- Check Vercel function logs for the actual error
- Verify file paths are correct (Vercel uses different `__dirname`)
- Ensure all dependencies are in `package.json`

## 📝 Testing Checklist

After redeploy, test:
- [ ] Visit `https://rowan-rouge.vercel.app/` - page loads
- [ ] Check browser console - no errors
- [ ] Click TOC button - sidebar opens
- [ ] Series list loads (not "Loading series...")
- [ ] Can select a series → books appear
- [ ] Can select a book → parts appear
- [ ] Can select a part → chapters appear
- [ ] Can select a chapter
- [ ] Can type a question and get a response
- [ ] CSS styling looks correct

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Function Logs: Project → Deployments → [Latest] → Functions → View Logs
- Your Site: https://rowan-rouge.vercel.app/


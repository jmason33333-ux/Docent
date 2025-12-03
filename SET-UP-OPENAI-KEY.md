# Set Up OpenAI API Key on Vercel - Step by Step

## 🔴 The Problem
Your app is failing because `OPENAI_API_KEY` is not set in Vercel. This is REQUIRED for Rowan to work.

## ✅ Solution: Add the Environment Variable

### Step 1: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in with your OpenAI account
3. Click **"Create new secret key"**
4. **Copy the key immediately** (you won't be able to see it again!)
   - It will look like: `sk-...` (starts with `sk-`)

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your **"Docent"** project (or whatever you named it)

2. **Navigate to Environment Variables:**
   - Click the **"Settings"** tab (top navigation bar)
   - Click **"Environment Variables"** in the left sidebar

3. **Add the API Key:**
   - Click **"Add New"** button
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Paste your OpenAI API key (the `sk-...` value you copied)
   - **Environments:** Check ALL THREE boxes:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **"Save"**

4. **Redeploy:**
   - Go to **"Deployments"** tab (top navigation)
   - Find your latest deployment
   - Click the **"..."** (three dots) menu → **"Redeploy"**
   - OR: Vercel may auto-redeploy - check if a new deployment starts automatically

5. **Wait for Build:**
   - Watch the deployment logs
   - Should complete in ~2-3 minutes
   - Look for "Ready" status (green checkmark)

### Step 3: Test It

1. Visit your site: https://rowan-rouge.vercel.app/
2. Select a book and chapter
3. Ask a question
4. Should now get responses from Rowan! 🎉

---

## 🐛 Troubleshooting

### "Still getting the error after redeploy"
- **Wait a bit longer** - sometimes it takes a minute for environment variables to propagate
- **Check the deployment logs:**
  - Go to Deployments → Latest → Click on it → View logs
  - Look for errors related to OPENAI_API_KEY
- **Verify the key is correct:**
  - Make sure you copied the ENTIRE key (starts with `sk-`)
  - Make sure there are no extra spaces
  - Try creating a new key if unsure

### "I don't see the Environment Variables section"
- Make sure you're in **Settings** → **Environment Variables**
- Make sure you have permission to edit the project
- Try refreshing the page

### "The deployment succeeds but API calls still fail"
- Check that you checked ALL THREE environment checkboxes (Production, Preview, Development)
- Make sure you redeployed AFTER adding the variable
- Check Vercel function logs for the actual error

---

## 💰 Cost Note

- OpenAI API usage costs money (pay per token)
- Monitor your usage at: https://platform.openai.com/usage
- Set up usage limits if needed: https://platform.openai.com/account/limits

---

## 🔗 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- OpenAI API Keys: https://platform.openai.com/api-keys
- Your Site: https://rowan-rouge.vercel.app/


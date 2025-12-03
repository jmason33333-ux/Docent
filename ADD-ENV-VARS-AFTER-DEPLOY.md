# Adding Environment Variables After Deployment

## ✅ No Problem! You can add them now:

1. **Go to your Vercel project:**
   - Visit: https://vercel.com/dashboard
   - Click on your "Docent" project

2. **Add Environment Variables:**
   - Click **"Settings"** tab (top navigation)
   - Click **"Environment Variables"** (left sidebar)
   - Click **"Add New"**

3. **Add Required Variables:**
   
   **Variable 1: OPENAI_API_KEY (REQUIRED)**
   - Key: `OPENAI_API_KEY`
   - Value: `your-openai-api-key-here`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 2: GOOGLE_SHEETS_CREDENTIALS (Optional)**
   - Key: `GOOGLE_SHEETS_CREDENTIALS`
   - Value: `{"type":"service_account","project_id":"...",...}` (paste entire JSON as single line)
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 3: GOOGLE_SHEET_ID (Optional)**
   - Key: `GOOGLE_SHEET_ID`
   - Value: `your-google-sheet-id-here`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

4. **Redeploy:**
   - Go to **"Deployments"** tab (top navigation)
   - Click the **"..."** menu (three dots) on your latest deployment
   - Click **"Redeploy"**
   - Or: Click **"Redeploy"** button directly on the deployment card

5. **Wait for Redeploy:**
   - Build will complete in ~2-3 minutes
   - Your app will now have access to the environment variables

---

## ✅ Verify It Worked:

After redeploy completes, test your production URL:
- Select a book and chapter
- Ask a question
- Should get responses from Rowan (if `OPENAI_API_KEY` is set correctly)

---

## 🚨 If You Need the API Key:

If you don't have your OpenAI API key handy:
1. Go to: https://platform.openai.com/api-keys
2. Create a new key or copy existing one
3. Paste it into Vercel environment variables

---

## 📝 Note:

- Vercel automatically redeploys when you save environment variables if you have that setting enabled
- Otherwise, manually redeploy once after adding variables
- Environment variables are encrypted and secure in Vercel


# Deploy PREFICTION to Vercel - Step by Step

## Quick Overview
- ✅ Your code is on GitHub
- ✅ Environment variables configured
- ✅ MongoDB Atlas ready
- ⏳ Ready to deploy to Vercel

**Estimated time:** 10-15 minutes

---

## Step 1: Prepare Your GitHub Repository

### 1.1 Ensure all changes are committed

```bash
cd "d:\PREFICTION-FINAL - Copy (8) - Copy"

# Check status
git status

# Should show "nothing to commit, working tree clean"
```

### 1.2 If there are changes, commit them

```bash
git add -A
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Sign Up for Vercel

### 2.1 Go to Vercel

1. Open browser: https://vercel.com
2. Click "Sign Up"

### 2.2 Sign Up with GitHub

1. Click "Continue with GitHub"
2. Authorize Vercel to access your GitHub account
3. Verify your email

### 2.3 Complete Profile

- Name: Your name
- Company: Optional
- Click "Create account"

---

## Step 3: Create New Project on Vercel

### 3.1 Go to Dashboard

After login, you'll see the Vercel dashboard

### 3.2 Import Your GitHub Repository

1. Click "New Project"
2. Click "Import Git Repository"
3. Search for "prefiction" repository
4. Click on "thiteonkar94-source/prefiction"
5. Click "Import"

### 3.3 Project Name

- Project Name: `prefiction` (or preferred name)
- Framework: Select "Other" (since it's vanilla JS + Express)
- Root Directory: `./` (leave as default)
- Click "Continue"

---

## Step 4: Configure Build Settings

### 4.1 Build Command

In the "Build and Output Settings" section:

- **Build Command:** `cd server && npm install`
- **Output Directory:** `.` (dot, or leave empty)
- **Install Command:** `npm install --prefix server` (optional, Vercel does this automatically)

### 4.2 Development Command (Optional)

- **Development Command:** `npm run dev --prefix server`

### 4.3 Click "Continue"

---

## Step 5: Add Environment Variables

### 5.1 Environment Variables Section

After clicking "Continue", you'll see "Environment Variables"

### 5.2 Add Each Variable

Add these ONE BY ONE:

**Variable 1: MONGODB_URI**
```
Name: MONGODB_URI
Value: mongodb+srv://thiteonkar17_db_user:npRsHJV3hJiyWrsA@cluster0.jhomc5v.mongodb.net/?appName=Cluster0
```
Click "Add"

**Variable 2: ADMIN_API_KEY**
```
Name: ADMIN_API_KEY
Value: dev-secret
```
Click "Add"

**Variable 3: ADMIN_PANEL_PASSWORD**
```
Name: ADMIN_PANEL_PASSWORD
Value: admin1234
```
Click "Add"

**Variable 4: NODE_ENV**
```
Name: NODE_ENV
Value: production
```
Click "Add"

**Variable 5: PORT**
```
Name: PORT
Value: 3000
```
Click "Add"

### 5.3 Verify All Variables Added

You should see 5 variables listed.

---

## Step 6: Deploy

### 6.1 Click "Deploy"

Click the big "Deploy" button at the bottom right.

### 6.2 Wait for Deployment

You'll see:
- "Building..." (2-3 minutes)
- "Deploying..." (1-2 minutes)
- "Production" with green checkmark = **Success! ✅**

### 6.3 Get Your URL

Vercel will show your production URL:
```
https://prefiction-xxx.vercel.app
```

Copy this URL - you'll need it to test!

---

## Step 7: Test Deployment

### 7.1 Test Health Endpoint

Open in browser OR use PowerShell:

```bash
curl https://your-prefiction-url.vercel.app/_health
```

**Expected response:**
```json
{"ok":true}
```

### 7.2 Test Homepage

Open in browser:
```
https://your-prefiction-url.vercel.app
```

Should see the PREFICTION homepage with all sections loading.

### 7.3 Test Contact Form

1. Scroll to "Contact" section
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Company: Test Company
   - Message: Testing Vercel deployment
3. Click "Send message"
4. Should see success message: "Thanks! Your message was delivered"

### 7.4 Test Admin Panel

Open in browser:
```
https://your-prefiction-url.vercel.app/admin.html
```

Login:
1. Password prompt appears
2. Enter: `admin1234`
3. Click "Unlock Admin Panel"
4. Click "Fetch Data" (API key should be pre-filled with "dev-secret")
5. Should see submitted data in table

---

## Step 8: Monitor Deployment

### 8.1 Vercel Dashboard

1. Go back to https://vercel.com/dashboard
2. Click on "prefiction" project
3. You'll see:
   - **Deployments** tab - All deployment history
   - **Analytics** tab - Usage metrics
   - **Logs** tab - Real-time server logs
   - **Settings** tab - Project configuration

### 8.2 View Logs

1. Click "Deployments" tab
2. Click on the latest deployment (should have green checkmark)
3. Click "View Function Logs" to see real-time server output
4. Test your endpoints and watch logs appear

### 8.3 Check Build Logs

1. Click on deployment
2. Scroll down to see build output
3. Look for:
   - ✅ `npm install` completed
   - ✅ Build successful
   - ✅ No errors

---

## Step 9: Connect Custom Domain (Optional)

### 9.1 Add Custom Domain

1. Go to "Settings" tab in Vercel dashboard
2. Click "Domains"
3. Enter your domain: `prefiction.yourcompany.com`
4. Click "Add"

### 9.2 Update DNS Records

Vercel will show you DNS records to add:
- Go to your domain registrar (GoDaddy, Namecheap, etc.)
- Add the DNS records provided by Vercel
- Wait 24-48 hours for DNS to propagate

### 9.3 Verify Domain

Once DNS propagates:
```
https://prefiction.yourcompany.com
```

Should work exactly like the Vercel URL.

---

## Step 10: Set Up Auto-Deployment

### 10.1 Automatic Deployments Already Enabled

By default, every time you push to `main` branch:
1. Vercel detects the push
2. Automatically builds
3. Automatically deploys to production

This happens automatically!

### 10.2 View Deployment Status

1. Go to GitHub: https://github.com/thiteonkar94-source/prefiction
2. Look for green checkmark next to commit messages
3. Click checkmark to see deployment status

---

## Troubleshooting

### Issue: Build Failed

**Error in logs:** "MONGODB_URI not set"

**Solution:**
1. Go to Vercel Settings → Environment Variables
2. Verify all 5 variables are present
3. Click redeploy button

### Issue: Form Submission Returns 500 Error

**Error in logs:** "MongoDB connection error"

**Causes & Solutions:**
1. Check MONGODB_URI is correct in env vars
2. Check MongoDB credentials are not expired
3. Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0)

**To fix IP whitelist:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Cluster0"
3. Go to "Security" → "Network Access"
4. Click "Add IP Address"
5. Enter: 0.0.0.0/0 (allows all IPs, or use Vercel IP range)
6. Click "Confirm"

### Issue: Admin Panel Returns 401

**Solution:**
1. Verify ADMIN_PANEL_PASSWORD in Vercel env vars
2. Verify ADMIN_API_KEY in Vercel env vars
3. Try the correct password/key
4. Check browser console (F12) for error details

### Issue: Static Files (CSS, Images) Not Loading

**Error:** 404 Not Found for `/style.css`

**Solution:**
1. This is normal - Vercel only serves the API from Express
2. Static files should be served from `/` 
3. Verify `vercel.json` exists in root directory
4. Content should be:
```json
{
  "version": 2,
  "buildCommand": "cd server && npm install",
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/server.js"
    },
    {
      "source": "/admin/submissions",
      "destination": "/server/server.js"
    },
    {
      "source": "/admin/verify",
      "destination": "/server/server.js"
    },
    {
      "source": "/admin/logout",
      "destination": "/server/server.js"
    },
    {
      "source": "/admin.html",
      "destination": "/server/server.js"
    }
  ]
}
```

---

## Post-Deployment Checklist

- [ ] Homepage loads
- [ ] All navigation links work
- [ ] Contact form submits successfully
- [ ] Admin panel loads
- [ ] Admin login works with password
- [ ] Admin can fetch submissions
- [ ] Admin can delete submissions
- [ ] Admin can export JSON
- [ ] Admin can export DOC
- [ ] Images load properly
- [ ] CSS styling looks correct
- [ ] Mobile responsive works
- [ ] No 404 errors in console (F12)
- [ ] No CSP errors in console
- [ ] Vercel logs show no errors

---

## What's Live Now

Your PREFICTION site is now live on Vercel at:

```
https://prefiction-xxx.vercel.app
```

**Features available:**
- ✅ Public website with case studies, services, audiences
- ✅ Contact form that saves to MongoDB
- ✅ Admin panel with password protection
- ✅ Fetch, view, delete, and export submissions
- ✅ Session-based authentication
- ✅ Automatic HTTPS
- ✅ Auto-deployment on every git push

---

## Next Steps (Optional Enhancements)

### Before Going Live

1. **Update MongoDB Credentials** (rotate passwords)
2. **Update Admin Password** (use strong password)
3. **Update CORS** (restrict to your domain)
4. **Enable Rate Limiting** (prevent spam)
5. **Add Email Validation** (server-side)
6. **Set Up Monitoring** (alerts for errors)
7. **Add Custom Domain** (professional URL)

### Later Enhancements

1. **Database Backups** (using migration scripts)
2. **Error Logging** (Sentry or similar)
3. **Performance Monitoring** (Vercel Analytics)
4. **Email Notifications** (when form submitted)
5. **Admin Dashboard** (analytics/metrics)

---

## Support

If you encounter issues:

1. **Check Vercel logs:** Dashboard → Deployments → View Logs
2. **Check browser console:** F12 → Console tab
3. **Check GitHub Actions:** https://github.com/thiteonkar94-source/prefiction/actions
4. **Test endpoints manually:**
   ```bash
   curl https://your-url/_health
   curl https://your-url/admin.html
   ```

---

## Congratulations! 🎉

Your PREFICTION site is now live on Vercel!

**Share your URL:**
```
https://prefiction-xxx.vercel.app
```

Every commit to `main` branch will automatically redeploy the latest version.

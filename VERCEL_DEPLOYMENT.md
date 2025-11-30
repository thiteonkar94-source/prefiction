# Quick guide to deploy PREFICTION to Vercel with env vars

## Step 1: Add Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your "prefiction" project
3. Click **Settings** → **Environment Variables**
4. Add the following:

**Variable 1:**
- Name: `mongodb_uri` (lowercase)
- Value: `mongodb+srv://thiteonkar17_db_user:npRsHJV3hJiyWrsA@cluster0.jhomc5v.mongodb.net/?appName=Cluster0`
- Environments: Production, Preview, Development (select all)
- Click "Add"

**Variable 2:**
- Name: `ADMIN_API_KEY`
- Value: `prefiction-admin-key-vercel` (or your chosen strong key)
- Environments: Production, Preview, Development (select all)
- Click "Add"

## Step 2: Redeploy

1. Go to **Deployments** tab
2. Click the three-dot menu on the latest deployment
3. Select **Redeploy**
4. Wait ~2-3 minutes for the build to complete

## Step 3: Test the API

Once deployed, test the endpoints:

```powershell
# Replace with your actual Vercel domain (e.g., https://prefiction.vercel.app)
$VERCEL_URL = "https://prefiction.vercel.app"

# Test health endpoint
Invoke-RestMethod -Uri "$VERCEL_URL/api/_health"

# Test contact form (POST)
$payload = @{ name='QA Test'; email='qa@prefiction.example'; company='QA'; message='test' } | ConvertTo-Json
Invoke-RestMethod -Uri "$VERCEL_URL/api/contact" -Method Post -Body $payload -ContentType 'application/json'

# Test admin submissions (GET with admin key)
Invoke-RestMethod -Uri "$VERCEL_URL/api/admin/submissions" -Headers @{ 'x-api-key' = 'prefiction-admin-key-vercel' }
```

## Step 4: Verify Contact Form

- Open your site at https://<your-vercel-domain>
- Go to Contact page
- Submit a test form
- Go to Admin page: https://<your-vercel-domain>/admin.html
- Enter admin key: `prefiction-admin-key-vercel`
- Click "Fetch" to see submissions

## Notes

- Do NOT commit `mongodb_uri` or `ADMIN_API_KEY` to the repo
- They are safely stored in Vercel's secure environment variable system
- The frontend automatically uses `window.location.origin` as the API base, so it will call the correct Vercel domain

## What's Deployed

- Frontend: All `.html`, `.css`, `.js` files from project root
- Backend: Serverless API endpoints in `/api/` folder
  - POST `/api/contact` — submit form data
  - GET `/api/admin/submissions` — retrieve all submissions (requires `x-api-key`)
  - GET `/api/_health` — health check

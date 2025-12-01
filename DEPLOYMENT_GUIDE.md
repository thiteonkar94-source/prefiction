# PREFICTION Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Security Hardening](#security-hardening)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security
- [ ] Remove hardcoded MongoDB credentials from code
- [ ] Rotate MongoDB password (current one may be exposed)
- [ ] Generate strong ADMIN_PANEL_PASSWORD (min 16 chars, mixed case, numbers, symbols)
- [ ] Generate strong ADMIN_API_KEY (min 32 chars)
- [ ] Add email validation on server-side
- [ ] Implement rate limiting on /api/contact
- [ ] Configure CORS for production domain only

### Code Quality
- [ ] All code committed to git
- [ ] No console.log sensitive data
- [ ] Error handling without exposing stack traces
- [ ] HTTPS forced (Vercel does this automatically)
- [ ] CSP headers properly configured

### Testing
- [ ] Form submission works end-to-end
- [ ] Admin panel login works
- [ ] Admin panel fetch submissions works
- [ ] Delete functionality works
- [ ] Export (JSON/DOC) works
- [ ] All static assets load
- [ ] Mobile responsive tested

### Performance
- [ ] Images optimized
- [ ] CSS minified (Tailwind is already minimal)
- [ ] JavaScript minified (optional for vanilla JS)
- [ ] Database indexes created for Submission queries

### Database
- [ ] MongoDB backup created
- [ ] Connection string verified
- [ ] Credentials rotated
- [ ] IP whitelist configured if needed

---

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Navigate to project root
cd "d:\PREFICTION-FINAL - Copy (8) - Copy"

# Ensure all changes are committed
git status

# Should show: "On branch main - nothing to commit, working tree clean"

# If there are changes, commit them
git add -A
git commit -m "chore: prepare for production deployment"

# Push to GitHub
git push origin main
```

### Step 2: Set Up Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub account
3. Click "New Project"
4. Select your GitHub repository `prefiction`
5. Click "Import"

### Step 3: Configure Build Settings

**Vercel should auto-detect the following:**

- **Framework Preset:** Other (since it's vanilla JS + Express)
- **Build Command:** `cd server && npm install`
- **Output Directory:** `.`
- **Development Command:** `npm run dev` (optional)

**If not auto-detected, set manually:**

In Vercel dashboard → Settings → General:
- Build Command: `cd server && npm install`
- Output Directory: (leave empty or `.`)

### Step 4: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://thiteonkar17_db_user:YOUR_NEW_PASSWORD@cluster0.jhomc5v.mongodb.net/?appName=Cluster0
ADMIN_API_KEY=your-strong-api-key-min-32-chars-here
ADMIN_PANEL_PASSWORD=your-strong-password-min-16-chars-here
NODE_ENV=production
PORT=3000
```

**Important:** Replace with your actual values. Do NOT expose in code.

### Step 5: Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete (2-3 minutes)
3. Vercel will provide a URL like `https://prefiction-xxx.vercel.app`

### Step 6: Verify Deployment

After deployment succeeds, test endpoints:

```bash
# Health check
curl https://your-domain.vercel.app/_health

# Contact form submission
curl -X POST https://your-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# Admin submissions (should fail with wrong key)
curl https://your-domain.vercel.app/admin/submissions \
  -H "x-api-key: wrong-key"

# Admin login
curl -X POST https://your-domain.vercel.app/admin/verify \
  -H "Content-Type: application/json" \
  -d '{"password":"your-actual-password"}'
```

---

## Environment Variables Setup

### 1. MongoDB Password Rotation

**Current Issue:** Credentials may be exposed in DEEP_STUDY.md and git history

**Steps:**

1. Go to [MongoDB Atlas](https://account.mongodb.com/account/login)
2. Log in with your account
3. Navigate to Cluster0 → Security → Database Users
4. Click on user `thiteonkar17_db_user`
5. Click "Edit Password"
6. Generate strong password (32+ chars, mixed case, numbers, symbols)
7. Copy new password
8. Update connection string: `mongodb+srv://thiteonkar17_db_user:NEW_PASSWORD@cluster0...`

**Security Note:** The old credentials in DEEP_STUDY.md and git history should be considered compromised. After deploying with new credentials, consider:
- Revoking old credentials in MongoDB Atlas
- Checking MongoDB Atlas activity logs for unauthorized access
- Adding IP whitelist to MongoDB Atlas for Vercel IP range

### 2. Generate Strong Passwords

**For ADMIN_PANEL_PASSWORD:**
```bash
# PowerShell - Generate 24 character password
$password = [System.Web.Security.Membership]::GeneratePassword(24, 8)
Write-Host $password
# Example: "aB3$xY9!mK7&vL2@qW5#pZ8*"
```

**For ADMIN_API_KEY:**
```bash
# PowerShell - Generate 32 character API key
$apikey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
Write-Host $apikey
# Example: "xK9mP2qRsT4uV5wXyZ1aB3cD4eF5gH6i"
```

### 3. Local Development Environment

Update `server/.env` with strong passwords:

```dotenv
MONGODB_URI=mongodb+srv://thiteonkar17_db_user:YOUR_NEW_PASSWORD@cluster0.jhomc5v.mongodb.net/?appName=Cluster0
ADMIN_API_KEY=your-strong-api-key-here
ADMIN_PANEL_PASSWORD=your-strong-password-here
NODE_ENV=development
PORT=3000
```

**Never commit real credentials.** If accidentally committed, use:
```bash
git rm --cached server/.env
git commit -m "remove .env from git tracking"
git push
```

### 4. Vercel Environment Variables

Set in Vercel dashboard (Settings → Environment Variables):

| Key | Value | Notes |
|-----|-------|-------|
| MONGODB_URI | Connection string with new password | Use rotated password |
| ADMIN_API_KEY | Strong random 32+ chars | Different from dev |
| ADMIN_PANEL_PASSWORD | Strong random 16+ chars | Different from dev |
| NODE_ENV | production | Required for Express |

---

## Security Hardening

### 1. Update CORS Configuration

Replace in `server/server.js`:

```javascript
// Before (allows all origins)
app.use(cors());

// After (allows only your domain)
app.use(cors({
  origin: [
    'https://your-domain.vercel.app',
    'https://www.your-custom-domain.com',
    'http://localhost:3000'  // Dev only
  ],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 2. Add Rate Limiting

Install `express-rate-limit`:

```bash
cd server
npm install express-rate-limit
```

Add to `server/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

// Apply to contact form (max 5 requests per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  // ... existing code
});

// Apply to verify (max 10 attempts per 15 minutes)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: (req) => !req.body.password // Don't count requests without password
});

app.post('/admin/verify', verifyLimiter, (req, res) => {
  // ... existing code
});
```

### 3. Add Server-Side Email Validation

Update `server/server.js` contact handler:

```javascript
const validator = require('email-validator');

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, company, message } = req.body || {};

  if (!email || !name) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  // Add email validation
  if (!validator.validate(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  // Sanitize inputs
  const sanitize = (str) => str ? str.trim().substring(0, 500) : '';
  
  try {
    const submission = new Submission({
      name: sanitize(name),
      company: sanitize(company),
      email: sanitize(email),
      message: sanitize(message)
    });
    await submission.save();
    res.status(201).json({ id: submission._id, success: true });
  } catch (err) {
    console.error('DB insert failed', err);
    res.status(500).json({ error: 'internal server error' });
  }
});
```

Install validator:
```bash
npm install email-validator
```

### 4. Remove Hardcoded Credentials

Ensure no fallback credentials in code:

```javascript
// Before (unsafe)
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://user:pass@...';

// After (safe)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI not set in environment variables');
  process.exit(1);
}
```

### 5. Add HTTPS Redirect

Vercel automatically uses HTTPS, but add explicit redirect:

```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

### 6. Add Security Headers

Already configured via Helmet, but verify in `server/server.js`:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://your-domain.vercel.app"],
      frameSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## Post-Deployment Testing

### 1. Health Check

```bash
curl https://your-domain.vercel.app/_health
# Expected: {"ok":true}
```

### 2. Contact Form Submission

```bash
curl -X POST https://your-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "message": "Interested in your services"
  }'
# Expected: 201 with {"id":"...","success":true}
```

### 3. Rate Limiting Test

```bash
# Run 6 times quickly - should get blocked on 6th
for i in {1..6}; do
  curl -X POST https://your-domain.vercel.app/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test"}'
  echo "Request $i"
done
# Expected: 6th request returns 429 Too Many Requests
```

### 4. Admin Login Test

```bash
# Try wrong password
curl -X POST https://your-domain.vercel.app/admin/verify \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}'
# Expected: 401 Unauthorized

# Try correct password
curl -X POST https://your-domain.vercel.app/admin/verify \
  -H "Content-Type: application/json" \
  -d '{"password":"your-actual-password"}'
# Expected: 200 with {"ok":true}
```

### 5. Admin Submissions Test

```bash
# With correct API key
curl https://your-domain.vercel.app/admin/submissions \
  -H "x-api-key: your-actual-api-key"
# Expected: 200 with {"rows":[...]}

# With wrong API key
curl https://your-domain.vercel.app/admin/submissions \
  -H "x-api-key: wrong-key"
# Expected: 401 Unauthorized
```

### 6. Mobile Responsiveness

1. Open https://your-domain.vercel.app on mobile device
2. Test all pages (home, services, about, contact)
3. Test form submission from mobile
4. Test admin panel login from mobile

### 7. Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Chrome/Safari

### 8. Performance Check

```bash
# Check page load time
curl -w "Total time: %{time_total}s\n" \
  -o /dev/null \
  https://your-domain.vercel.app
# Should be < 2 seconds

# Check API response time
curl -w "Total time: %{time_total}s\n" \
  -o /dev/null \
  https://your-domain.vercel.app/_health
# Should be < 500ms
```

---

## Monitoring & Maintenance

### 1. Set Up Error Logging

Add to `server/server.js`:

```javascript
const fs = require('fs');

// Create error log directory
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Error logging middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorLog = `[${timestamp}] ${req.method} ${req.path} - ${err.message}\n`;
  fs.appendFileSync('logs/errors.log', errorLog);
  
  console.error(`[${timestamp}] Error:`, err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'internal server error' 
      : err.message 
  });
});
```

### 2. Monitor MongoDB

Regularly check MongoDB Atlas:
1. Go to Cluster0 → Metrics
2. Monitor:
   - Connection count
   - Operations per second
   - Network I/O
   - Storage size

Set up alerts for:
- High CPU usage (> 80%)
- High memory usage (> 80%)
- Connection limit reached

### 3. Monitor Vercel Deployment

In Vercel dashboard:
1. Check "Deployments" tab for errors
2. View "Usage" for bandwidth/execution time
3. Set up email alerts for failed deployments

### 4. Set Up Custom Domain (Optional)

In Vercel dashboard → Settings → Domains:
1. Add your custom domain (e.g., prefiction.yourcompany.com)
2. Update DNS records at your registrar
3. Vercel auto-generates SSL certificate

### 5. Regular Backups

MongoDB Atlas has automatic backups, but also:
```bash
# Manual backup (if using local tools)
mongodump --uri "your-mongodb-uri" --out ./backup
```

### 6. Update Dependencies

Monthly check for updates:
```bash
cd server
npm outdated
npm update
npm audit fix
git add -A
git commit -m "chore: update dependencies"
git push
```

### 7. Monitor Form Submissions

Create a simple dashboard query:
```javascript
// Monthly submission count
const thisMonth = new Date();
thisMonth.setDate(1);

const count = await Submission.countDocuments({
  createdAt: { $gte: thisMonth }
});

console.log(`Submissions this month: ${count}`);
```

---

## Rollback Plan

If deployment fails or major issues occur:

### Step 1: Check Vercel Logs

In Vercel dashboard → Deployments → [Failed Deployment] → View Logs

### Step 2: Rollback to Previous Version

In Vercel dashboard → Deployments:
1. Find last successful deployment
2. Click "..." → "Promote to Production"

### Step 3: Check Local Git History

```bash
git log --oneline -10
git revert <commit-hash>
git push origin main
```

### Step 4: Redeploy

Vercel will auto-deploy on git push. Monitor the deployment.

---

## Troubleshooting

### Issue: "MongoDB connection error" in production

**Cause:** Connection string not set in Vercel env vars

**Fix:**
1. Go to Vercel dashboard → Settings → Environment Variables
2. Verify MONGODB_URI is set
3. Check credentials are correct
4. Redeploy

### Issue: Admin panel returns 401

**Cause:** Wrong ADMIN_PANEL_PASSWORD or ADMIN_API_KEY

**Fix:**
1. Verify credentials in Vercel env vars
2. Check they match what you're sending in request
3. Ensure no extra whitespace
4. Regenerate if needed and redeploy

### Issue: Form submission works but no data in MongoDB

**Cause:** Mongoose connection not established

**Fix:**
1. Check MONGODB_URI is correct
2. Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for Vercel)
3. Check MongoDB Atlas activity log for errors

### Issue: Rate limiting too strict

**Cause:** Default limits too aggressive

**Fix:** Adjust windowMs and max in rate limiting middleware:
```javascript
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour instead of 15 min
  max: 20,                    // 20 requests instead of 5
});
```

---

## Final Checklist Before Going Live

- [ ] All code committed and pushed
- [ ] MongoDB credentials rotated
- [ ] Strong passwords generated
- [ ] Environment variables set in Vercel
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Email validation added
- [ ] Security headers verified
- [ ] All endpoints tested on production
- [ ] Contact form tested end-to-end
- [ ] Admin panel tested end-to-end
- [ ] Delete functionality tested
- [ ] Export functionality tested
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility verified
- [ ] Error logging set up
- [ ] Monitoring alerts configured
- [ ] Backup strategy confirmed
- [ ] Rollback plan documented
- [ ] Team trained on maintenance

---

## Support & Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Atlas Documentation](https://docs.mongodb.com/atlas/)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Last Updated:** December 1, 2025  
**Project:** PREFICTION  
**Version:** 2.0 (with session auth & delete)

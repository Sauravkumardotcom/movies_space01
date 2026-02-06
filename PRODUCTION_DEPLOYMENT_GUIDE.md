# PRODUCTION DEPLOYMENT GUIDE - Movies Space
**Vercel Deployment for New Projects | Feb 6, 2026**

---

## EXECUTIVE SUMMARY

**Status: AUDIT COMPLETE - CRITICAL ISSUES FOUND**

### Critical Findings
1. ⚠️ **DATABASE MISMATCH**: vercel.json lists MongoDB but schema.prisma is PostgreSQL
2. ⚠️ **EXPOSED CREDENTIALS**: vercel.json contains plaintext: JWT secrets, MongoDB URI, Gmail credentials
3. ✅ **SERVERLESS READY**: Backend properly configured for Vercel (ES modules, no app.listen())
4. ✅ **FRONTEND READY**: Vite + React with environment-based API URL configuration
5. ✅ **MONOREPO STRUCTURE**: Workspace setup supports independent deployments

---

## PHASE 1 — DETAILED PROJECT AUDIT

### FRONTEND ANALYSIS

**Framework**: React 18.2.0 + Vite 5.0.8  
**Module System**: ES Modules (`type: "module"`)  
**Build Command**: `vite build`  
**Output Directory**: `dist/`  
**Node Requirement**: >=18.0.0  

**Build Configuration**:
- Terser minification enabled
- Sourcemaps disabled in production
- Chunk splitting configured (react-vendor, router, query, audio)
- Output: Optimized for static hosting

**Environment Variables Used**:
```
VITE_API_URL          → Set to backend API base URL (e.g., https://backend-url.com/api/v1)
```

**API Communication**:
- Axios-based REST client
- Multiple services create separate Axios instances
- Fallback to `http://localhost:3000/api/v1`
- Uses `import.meta.env.VITE_API_URL` throughout

**Dependencies**:
- React Query for server state management (v5)
- React Router v6 for navigation
- Zustand for client state
- Howler + HLS.js for audio/video playback
- TailwindCSS + PostCSS for styling

**Potential Breakage on Vercel**:
- ✅ None identified - properly configured

---

### BACKEND ANALYSIS

**Framework**: Express.js 4.18.2  
**Language**: TypeScript → Compiled to ES Modules (type: "module")  
**Build Process**: `tsc && tsc-alias -p tsconfig.json && node ../fix-all-aliases.mjs`  
**Node Requirement**: >=18.0.0  

**Serverless Readiness**:
- ✅ No `app.listen()` in production/Vercel mode
- ✅ App exported as default: `export default app`
- ✅ Prisma connection pooling enabled for serverless
- ✅ Global error handlers implemented
- ✅ Request ID middleware for tracing
- ✅ Graceful shutdown on SIGTERM
- ✅ Conditional server startup (dev mode only)

**API Structure**:
```
/api/v1/auth           → Authentication (signup, login, refresh)
/api/v1/user           → User profile, watchlist, favorites
/api/v1/movies         → Movie CRUD + filtering
/api/v1/shorts         → Short videos (uses movieRoutes)
/api/v1/music          → Music/audio streaming
/api/v1/engagement     → Likes, views, interactions
/api/v1/comments       → Comment management
/api/v1/social         → Follow, followers, messaging
/api/v1/search         → Full-text search
/api/v1/notifications  → Notifications management
/api/v1/admin          → Admin functions
/api/v1/health         → Health check endpoint
```

**Rate Limiting**:
- 100 requests per 15 minutes per IP
- Applied to all `/api/` routes

**Middleware Stack**:
- Helmet (security headers)
- CORS (configurable)
- Morgan (request logging)
- Cookie-parser
- Body parser (10MB limit)
- Request ID middleware

**Database**:
- **Provider**: PostgreSQL (NOT MongoDB - schema.prisma line 10)
- **Connection**: Prisma ORM with connection pooling
- **URL Expected**: `DATABASE_URL` environment variable
- **Models**: 25+ tables (User, Movie, Music, Playlist, Comment, Engagement, etc.)

**File Upload**:
- AWS S3 integration (optional)
- Multer for handling uploads
- Max file size: 100MB (configurable)
- Allowed types: audio/mpeg, audio/mp4, audio/wav, audio/ogg

**Authentication**:
- JWT-based (access + refresh tokens)
- Bcrypt password hashing
- Secure HTTP-only cookies in production
- Token expiry: 15 minutes (access), 7 days (refresh)

**Potential Breakage on Vercel**:
- ⚠️ DATABASE MISMATCH: vercel.json has MONGODB_URI but code uses PostgreSQL

---

### ENVIRONMENT INFORMATION

**All Required Environment Variables**:

| Variable | Used In | Type | Vercel Required | How to Get |
|----------|---------|------|-----------------|-----------|
| `NODE_ENV` | Backend | String | No (set to 'production' automatically) | Vercel sets automatically |
| `DATABASE_URL` | Backend (Prisma) | String | **YES** | PostgreSQL connection string from provider |
| `JWT_SECRET` | Backend (Auth) | String | **YES** | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Backend (Auth) | String | **YES** | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CORS_ORIGIN` | Backend | String (comma-separated) | **YES** | Frontend deployment URL (e.g., `https://frontend.vercel.app`) |
| `REDIS_URL` | Backend (Optional cache) | String | No | Redis cloud provider URL (optional for local caching) |
| `AWS_REGION` | Backend (File upload) | String | No | Default: `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Backend (File upload) | String | No | AWS IAM credentials (if using S3) |
| `AWS_SECRET_ACCESS_KEY` | Backend (File upload) | String | No | AWS IAM credentials (if using S3) |
| `S3_BUCKET_NAME` | Backend (File upload) | String | No | Default: `movies-space-media` |
| `VITE_API_URL` | Frontend | String | **YES** | Backend deployment URL (e.g., `https://backend.vercel.app/api/v1`) |

**Additional Variables in vercel.json (REMOVE - SECURITY RISK)**:
```json
  "EMAIL_USER": "Souravshakya951@gmail.com",
  "EMAIL_PASS": "nzrwngwreqialorz",
  "ADMIN_EMAIL": "Souravshakya951@gmail.com",
  "VITE_GOOGLE_APPS_SCRIPT_URL": "https://script.google.com/...",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL": "movies-space@movies-space-shakyalabs.iam.gserviceaccount.com",
  "GOOGLE_SHEET_ID": "1bnzIhV3gI2UmOYzkOgAdAj40LnWdtqs1qj3wTFBHQpY"
```

---

## PHASE 2 — SERVERLESS CONVERSION (BACKEND) ✅ VERIFIED

### Current Status: READY FOR DEPLOYMENT

**Backend Export Structure** (src/index.ts):
- ✅ Exports Express app as default module
- ✅ No app.listen() in production
- ✅ Conditional startup only in non-Vercel environments
- ✅ Proper error handlers for uncaught exceptions

**vercel.json Configuration**:
- ✅ Correct build command structure
- ✅ Routes all requests to dist/index.js
- ✅ Proper method handling

**Prisma Serverless Pattern** (src/config/db.ts):
- ✅ Uses `global` to persist PrismaClient
- ✅ Connection pooling enabled
- ✅ Single instance reuse across requests
- ✅ Proper logging for development

**Issues to Fix**:
1. **CRITICAL**: Remove hardcoded credentials from vercel.json
2. **CRITICAL**: Verify DATABASE_URL points to PostgreSQL (not MongoDB)
3. Email service configuration not found in backend code (verify if needed)

---

## PHASE 3 — ENV VARIABLES DISCOVERY

### Credential Inventory

**SECRETS (Must Regenerate)**:
- JWT_SECRET ← Regenerate new random string
- JWT_REFRESH_SECRET ← Regenerate new random string
- DATABASE_URL ← New PostgreSQL database
- AWS credentials ← New IAM user (if using S3)

**NON-SECRETS (Configuration)**:
- CORS_ORIGIN ← Frontend URL
- VITE_API_URL ← Backend URL
- REDIS_URL ← Optional Redis instance
- S3_BUCKET_NAME, AWS_REGION ← Optional settings

---

## PHASE 4 — CREDENTIAL REGENERATION GUIDE

### Step-by-Step Credential Setup

#### 1. JWT Secrets (Required)

```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=', require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log('JWT_REFRESH_SECRET=', require('crypto').randomBytes(64).toString('hex'))"
```

Save both values. Keep them secure - do NOT commit to git.

#### 2. PostgreSQL Database (Required)

**Option A: Neon (Recommended for Vercel)**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project "movies-space"
4. Copy connection string: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
5. Save as `DATABASE_URL`

**Option B: Railway**
1. Go to https://railway.app
2. Create PostgreSQL plugin
3. Copy connection URL
4. Save as `DATABASE_URL`

**Option C: Vercel Postgres**
1. Go to Vercel Dashboard → Storage
2. Create new Postgres database
3. Copy `POSTGRES_URL` and use as `DATABASE_URL`

#### 3. Frontend URL (Required)

1. Deploy frontend to Vercel first (see Phase 6)
2. Get frontend URL: `https://your-frontend-project.vercel.app`
3. Save as `CORS_ORIGIN` backend env var

#### 4. AWS S3 Credentials (Optional - If using file uploads)

1. Go to https://console.aws.amazon.com
2. Navigate to IAM → Users → Create new user "movies-space-backend"
3. Add inline policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::movies-space-media",
        "arn:aws:s3:::movies-space-media/*"
      ]
    }
  ]
}
```
4. Generate access key → access key ID + secret key
5. Create S3 bucket "movies-space-media" in us-east-1
6. Save credentials as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

#### 5. Redis Cache (Optional)

If using real-time features:
1. Go to https://redis.com (or upstash.com)
2. Create Redis database
3. Copy connection URL
4. Save as `REDIS_URL`

---

## PHASE 5 — VERCEL BACKEND DEPLOYMENT

### Prerequisites Checklist
- [ ] New PostgreSQL database created
- [ ] JWT secrets generated
- [ ] GitHub repository updated with latest fixes
- [ ] vercel.json cleaned of hardcoded secrets

### Deployment Steps

#### Step 1: Prepare Backend Project

**Clean up vercel.json** - Remove all hardcoded values:

Find [backend/vercel.json](backend/vercel.json) and update:

```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build && node ../fix-all-aliases.mjs",
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "runtime": "nodejs20.x",
        "includeFiles": "dist/**",
        "excludeFiles": "**.test.js,**.map"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js",
      "methods": ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"]
    }
  ]
  // REMOVE the "env" section entirely - add via Vercel UI instead
}
```

#### Step 2: Create Backend Project on Vercel

1. Go to https://vercel.com → Dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure Project Settings**:
   - Framework Preset: **Other** (Node.js)
   - Root Directory: **`backend`** ← IMPORTANT
   - Build Command: **(Override)** `npm install && npm run build && node ../fix-all-aliases.mjs`
   - Start Command: **(Leave empty)** - Not used for serverless
   - Environment Variables: *(See Step 3 below)*

#### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**:

```
DATABASE_URL              = postgresql://user:pass@host/dbname
JWT_SECRET               = [generated 64-byte hex string]
JWT_REFRESH_SECRET       = [generated 64-byte hex string]
CORS_ORIGIN             = https://your-frontend.vercel.app
NODE_ENV                = production
API_VERSION             = v1
AWS_REGION              = us-east-1
S3_BUCKET_NAME          = movies-space-media
FEATURE_UPLOADS         = true
FEATURE_OFFLINE         = false
```

**AWS Credentials (if using S3)**:
```
AWS_ACCESS_KEY_ID       = [from IAM user]
AWS_SECRET_ACCESS_KEY   = [from IAM user]
```

#### Step 4: Deploy Backend

1. Click **"Deploy"** button
2. Wait for deployment to complete
3. Get backend URL: `https://your-backend-project.vercel.app`

#### Step 5: Test Backend API

Once deployment completes:

```bash
# Health check
curl https://your-backend-project.vercel.app/api/v1/health

# Expected response:
# {
#   "status": "ok",
#   "message": "Health check passed",
#   "environment": "production",
#   "timestamp": "2026-02-06T..."
# }
```

### Verify API Routes

Test each endpoint:

```bash
# List movies (should return empty array if no data)
curl https://your-backend-project.vercel.app/api/v1/movies

# Health endpoint
curl https://your-backend-project.vercel.app/api/v1/health
```

---

## PHASE 6 — VERCEL FRONTEND DEPLOYMENT

### Prerequisites
- Backend URL obtained from Phase 5
- Latest code committed to GitHub

### Deployment Steps

#### Step 1: Create Frontend Project on Vercel

1. Go to https://vercel.com → Dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure Project Settings**:
   - Framework Preset: **Vite**
   - Root Directory: **`frontend`** ← IMPORTANT
   - Build Command: **(Default)** `npm run build`
   - Output Directory: **`dist`** (should auto-detect)
   - Environment Variables: *(See Step 2 below)*

#### Step 2: Add Environment Variables

In Vercel project settings → **Environment Variables**:

```
VITE_API_URL = https://your-backend-project.vercel.app/api/v1
```

This tells the frontend where to find your backend API.

#### Step 3: Deploy Frontend

1. Click **"Deploy"** button
2. Wait for deployment
3. Get frontend URL: `https://your-frontend-project.vercel.app`

#### Step 4: Update Backend CORS

**CRITICAL**: Backend CORS must be updated to match frontend URL!

1. Go back to backend project in Vercel
2. Go to Settings → Environment Variables
3. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN = https://your-frontend-project.vercel.app
   ```
4. Click **"Save"** → Auto-redeploy triggered
5. Wait for redeployment

#### Step 5: Test Frontend

1. Visit `https://your-frontend-project.vercel.app`
2. Check browser console for errors
3. Verify API calls work (Network tab in DevTools)

---

## PHASE 7 — POST-DEPLOYMENT CHECKLIST

### Prerequisite: Database Initialization

Before testing, initialize database schema:

```bash
# SSH into backend / or run one-off Vercel function
DATABASE_URL="your-postgres-url" npx prisma migrate deploy

# Alternatively, run via Vercel CLI:
vercel env pull
npm run db:migrate -w backend
```

### Frontend Verification

- [ ] **Frontend loads** without errors
  - Check browser console for network errors
  - Verify CSS/JS loads correctly
  - No **Mixed Content** (http/https) warnings

- [ ] **API base URL correct**
  - Check Network tab in DevTools
  - Verify requests go to backend domain
  - Look for failed CORS requests

- [ ] **Content displays**
  - Home page loads
  - Movies/music list visible (if database has seed data)
  - Navigation works

### Backend API Verification

#### Health Check
```bash
curl https://your-backend-project.vercel.app/api/v1/health

# Expected 200 OK
```

#### Database Connection
```bash
# Verify Prisma can connect
curl https://your-backend-project.vercel.app/api/v1/movies

# Should return JSON array (empty is OK)
```

#### Rate Limiting
```bash
# Send 100+ requests quickly, 101st should fail with 429
for i in {1..105}; do curl -s/api/v1/health; done
```

### Authentication Testing

#### Signup Flow
```bash
curl -X POST https://your-backend-project.vercel.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!"
  }'

# Expected: 201 Created with user data + JWT token
```

#### JWT Token Validation
```bash
# Use token from signup above
TOKEN="your-jwt-token"

curl https://your-backend-project.vercel.app/api/v1/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user profile
```

### CORS Verification

Test from frontend domain:

```javascript
// In browser console at https://your-frontend-project.vercel.app
fetch('https://your-backend-project.vercel.app/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('CORS working!', d))
  .catch(e => console.log('CORS failed', e))
```

Expected: Success (not CORS error)

### File Upload Testing (if using S3)

```bash
# Create test file
echo "test" > test.txt

# Upload
curl -X POST https://your-backend-project.vercel.app/api/v1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt"

# Expected: 200 OK with S3 URL
```

---

## PHASE 8 — DEBUGGING SECTION

### Problem: 500 Error on Backend

**Symptoms**: Requests return 500 status

**Debug Steps**:

1. **Check Vercel Logs**:
   ```bash
   vercel logs --since 1h
   ```

2. **Check specific function**:
   ```bash
   curl -v https://your-backend-project.vercel.app/api/v1/health 2>&1 | grep -A5 "< HTTP"
   ```

3. **Common causes**:
   - Environment variables not set → Check Vercel dashboard
   - DATABASE_URL invalid → Test with: `psql $DATABASE_URL -c "SELECT 1"`
   - Node version mismatch → Check vercel.json runtime
   - Build failed → Check vercel logs for build errors

**Solution**:
```bash
# Redeploy with correct env vars
vercel env pull
vercel deploy --prod --force
```

---

### Problem: CORS Errors

**Symptoms**: Frontend requests blocked, error: "Access-Control-Allow-Origin missing"

**Causes**:
- Frontend URL not in CORS_ORIGIN list
- CORS_ORIGIN env var not set
- Backend not redeployed after CORS change

**Debug**:
```bash
# Check what CORS is set to
curl -v https://backend-url/api/v1/health \
  -H "Origin: https://your-frontend-url" 2>&1 | grep -i "access-control"

# Should see:
# access-control-allow-origin: https://your-frontend-url
```

**Solution**:
1. Update backend env var `CORS_ORIGIN`
2. Trigger redeploy
3. Clear browser cache (Ctrl+Shift+Del)

---

### Problem: Database Connection Fails

**Symptoms**: 500 errors, logs show "ECONNREFUSED" or "too many connections"

**Debug**:
```bash
# Test connection locally
DATABASE_URL="your-url" psql -c "SELECT 1"

# Test from Vercel CLI
vercel ssh -C "DATABASE_URL=$DATABASE_URL psql -c \"SELECT 1\""
```

**Solutions**:

**1. Connection String Invalid**:
- Format must be: `postgresql://user:password@host:5432/database?sslmode=require`
- Copy-paste from database provider again
- Ensure special characters in password are URL-encoded

**2. Too Many Connections**:
- Prisma Pool limit reached
- Upgrade database tier
- Or reduce connections in Prisma schema

**3. Network Access**:
- Database must allow Vercel IPs
- For Neon: Go to dashboard → Project settings → Network
- Add Vercel IP range or allow all

---

### Problem: Missing Environment Variables

**Symptoms**: Backend crashes or API returns 400, error mentions missing var

**Examples**:
```
Error: Missing required environment variables: DATABASE_URL, JWT_SECRET
```

**Solution**:

1. List all required vars in backend `src/config/env.ts`
2. Go to Vercel dashboard → Settings → Environment Variables
3. Ensure all listed vars are present
4. Click "Save" to trigger redeploy

**Verify**:
```bash
vercel env list
```

---

### Problem: Vercel Function Crashes / Timeout

**Symptoms**: 504 Gateway Timeout or function crashes

**Causes**:
- Function takes >30 seconds (Vercel limit)
- Out of memory (Lambda size limit)
- Infinite loop in code
- Database query timeout

**Debug**:
```bash
# Check function logs
vercel logs --tail

# Look for timeout messages or memory errors
```

**Solutions**:
1. Optimize database queries (add indexes)
2. Implement request caching (Redis)
3. Increase function timeout in vercel.json:
```json
{
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**": {
      "maxDuration": 60  // seconds
    }
  }
}
```

---

### Problem: Frontend API Base URL Wrong

**Symptoms**: Requests 404 or hit wrong domain

**Check**:
```javascript
// Browser console
console.log(import.meta.env.VITE_API_URL)
// Should print your backend URL
```

**Solution**:
1. Go to frontend project in Vercel
2. Settings → Environment Variables
3. Verify `VITE_API_URL` is set correctly
4. Redeploy

---

### Problem: Seed Data Not Present

**Symptoms**: Home page empty, no movies/music displayed

**Solution**: Initialize database with seed data

```bash
# If database is empty, run migration + seed
DATABASE_URL="your-postgres-url" npx prisma migrate deploy
DATABASE_URL="your-postgres-url" npx prisma db seed

# Or via NPM workspace
npm run db:seed -w backend
```

---

## FINAL VERIFICATION CHECKLIST

### Before Declaring Success

- [ ] Backend health check returns 200
- [ ] Frontend homepage loads without errors
- [ ] User can signup/login
- [ ] JWT tokens generated and validated
- [ ] API calls from frontend reach backend
- [ ] No CORS errors in browser console
- [ ] No 500 errors in Vercel logs
- [ ] Database queries working
- [ ] Rate limiting active
- [ ] Environment variables not exposed in client bundle
- [ ] File uploads work (if S3 configured)
- [ ] Responsive design works on mobile
- [ ] HTTPS enforced on frontend

### Performance Targets

- Frontend First Contentful Paint: < 2s
- Backend API response: < 500ms
- Database query: < 100ms

---

## CRITICAL ISSUES TO ADDRESS IMMEDIATELY

### 1. ⚠️ DATABASE MISMATCH

**Issue**: vercel.json references `MONGODB_URI` but `schema.prisma` uses PostgreSQL

**Action Required**:
- [ ] Remove `MONGODB_URI` from vercel.json
- [ ] Use PostgreSQL (recommended) OR
- [ ] Switch Prisma to MongoDB provider (NOT recommended)

**Recommended**: Use PostgreSQL - it's more stable for Vercel

---

### 2. ⚠️ EXPOSED CREDENTIALS IN VERCEL.JSON

**Issue**: Plaintext secrets in version control

```json
  "JWT_SECRET": "your-super-secret-jwt-key-change-in-production",
  "EMAIL_PASS": "nzrwngwreqialorz",
  "MONGODB_URI": "mongodb+srv://shakyalabs:Mydream@123@..."
```

**Action Required**:
- [ ] Remove all env vars from vercel.json
- [ ] Add ONLY to Vercel UI (Settings → Environment Variables)
- [ ] Force push to invalidate git history
- [ ] REGENERATE all exposed credentials

**Reset Credentials**:
```bash
# MongoDB password (if using)
# Gmail app password
# JWT secrets (generate new)
```

---

### 3. ⚠️ MISSING EMAIL SERVICE CONFIGURATION

**Status**: Email features referenced in vercel.json but not in backend code

**Action**:
- [ ] If email not needed: Remove EMAIL_USER, EMAIL_PASS from vercel.json
- [ ] If email needed: Implement service (sendgrid, mailgun, or Gmail)

---

## DEPLOYMENT COMMANDS (QUICK REFERENCE)

```bash
# 1. Clean rebuild
npm run build

# 2. Database migration
DATABASE_URL="your-url" npx prisma migrate deploy

# 3. Database seed
DATABASE_URL="your-url" npx prisma db seed

# 4. Check health locally
npm run dev -w backend  # Terminal 1
curl http://localhost:3000/api/v1/health  # Terminal 2

# 5. Deploy to Vercel
git push origin main  # Auto-deploy

# 6. Check Vercel logs
vercel logs --tail

# 7. Manual redeploy
vercel deploy --prod --force
```

---

## NEXT STEPS

1. **⚠️ FIRST**: Fix database mismatch and remove exposed credentials
2. **Create PostgreSQL database** (Neon recommended)
3. **Generate new JWT secrets**
4. **Create Vercel projects** (backend first, then frontend)
5. **Add environment variables** via Vercel UI (NOT in vercel.json)
6. **Deploy and test** following Phase 7 checklist
7. **Monitor logs** continuously for first 24 hours

---

## SUPPORT MATRIX

| Issue | Frontend | Backend | Vercel |
|-------|----------|---------|--------|
| Vite build fails | Check build output | N/A | Run `vercel logs` |
| API 404 | Check VITE_API_URL | Check routes | Check logs |
| DB connection | N/A | Check DATABASE_URL | Environment variables |
| CORS blocked | N/A | Check CORS_ORIGIN | Update + redeploy |
| 500 error | N/A | Check validation | Logs show details |
| Timeout | N/A | Optimize query | Increase timeout |

---

**Document Generated**: February 6, 2026  
**Status**: Ready for Clean Production Deployment  
**Last Updated**: 2026-02-06 (Post-Import Audit)

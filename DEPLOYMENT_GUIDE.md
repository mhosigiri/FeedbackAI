# Deployment Guide

## Frontend Build Status
✅ Build successful with no warnings (281.88 kB gzipped)
✅ Ready for Vercel deployment

## Backend Deployment (Google Cloud Run)

### If Backend Deploy Failed - Try This:

Since you're seeing "Deploy from container image" without Build type options, you're on the wrong flow. Here's the correct path:

1. **Cloud Run → Create Service**
2. **Choose: "Continuously deploy new revisions from a source repository"** (NOT "Deploy from container image")
3. **Set up Cloud Build**
   - Connect your GitHub repository
   - Select branch: main
4. **Build Configuration**
   - Branch: main
   - Build Type: Dockerfile
   - Source: /backend
5. **Service Settings**
   - Service name: feedbackai-api
   - Region: us-central1 (or your choice)
   - CPU allocation: CPU is only allocated during request processing
   - Ingress: All
   - Authentication: Allow unauthenticated invocations
6. **Container Settings**
   - Container port: 8080
7. **Create**

### After First Deploy - Add Environment Variables

1. Go to your deployed service → **Edit & Deploy New Revision**
2. **Variables & Secrets** tab:
   
   **Secrets:**
   - Reference a secret:
     - Name: `FIREBASE_SERVICE_ACCOUNT_JSON`
     - Value: firebase-sa:latest (from Secret Manager)
   
   **Environment Variables:**
   - `CORS_ALLOW_ALL` = `true` (temporary, we'll lock this down later)
   - `LOG_LEVEL` = `INFO`
   - `FIREBASE_STORE` = `firestore`

3. **Deploy**

### Get Your Backend URL
- Copy the service URL from Cloud Run dashboard
- Format: `https://feedbackai-api-xxxxxxxxxx-uc.a.run.app`

---

## Frontend Deployment (Vercel)

### Step 1: Import Project
1. Go to Vercel Dashboard → Add New Project
2. Import your GitHub repository
3. **Root Directory: `frontend`** (important!)
4. Framework Preset: Create React App (auto-detected)

### Step 2: Configure Build Settings
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### Step 3: Add Environment Variables

**Required Variables (from your Firebase config):**

```
REACT_APP_FIREBASE_API_KEY=<your-firebase-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=<your-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
REACT_APP_FIREBASE_APP_ID=<your-app-id>
REACT_APP_FIREBASE_DATABASE_URL=<your-database-url>
REACT_APP_GOOGLE_MAPS_API_KEY=<your-maps-key>
REACT_APP_BACKEND_URL=<YOUR-CLOUD-RUN-URL>
```

**Where to find these values:**
- Firebase values: Firebase Console → Project Settings → General
- Maps key: Google Cloud Console → APIs & Services → Credentials
- Backend URL: Your Cloud Run service URL (from previous step)

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Note your Vercel URL: `https://<your-project>.vercel.app`

---

## Final Step: Lock Down CORS

After Vercel deployment is live:

1. Go to Cloud Run → feedbackai-api → **Edit & Deploy New Revision**
2. **Variables & Secrets** → Edit environment variables:
   - Change `CORS_ALLOW_ALL` from `true` to `false`
   - Add new variable: `FRONTEND_ORIGIN` = `https://<your-vercel-url>.vercel.app`
3. **Deploy**

---

## Verification Checklist

### Backend Health Check
- Visit: `https://<cloud-run-url>/health`
- Expected: `{"status":"ok","timestamp":"..."}`

### Frontend Tests
1. Login page loads
2. Employee login works (if you have an account)
3. Customer "Continue as Customer" works
4. Dashboard shows CHI and analytics
5. Create Ticket submits successfully
6. Feed loads Reddit posts
7. AI Workflow shows tasks (employee only)
8. No CORS errors in browser console

### Common Issues

**CORS errors:**
- Make sure FRONTEND_ORIGIN exactly matches your Vercel URL (no trailing slash)
- Check browser console for the blocked origin

**API calls fail:**
- Verify REACT_APP_BACKEND_URL is set correctly in Vercel
- Check it doesn't have a trailing slash
- Verify Cloud Run service allows unauthenticated

**Firebase auth fails:**
- Check all REACT_APP_FIREBASE_* variables are set
- Verify Firebase Auth domain is authorized in Firebase Console

**Maps don't load:**
- Verify REACT_APP_GOOGLE_MAPS_API_KEY is set
- Check the API key has Maps JavaScript API enabled

---

## Your Deployment Status

✅ Frontend build ready (no warnings)
⏳ Backend deployment (waiting for your confirmation)
⏳ Vercel deployment (next step)
⏳ CORS lockdown (final step)

Let me know when your backend is deployed and I'll help with the next steps!


# Debugging: Both Domains Failing

## Issue
Both `fantasy-football-omega.vercel.app` and `fotmate.com` (or `fotmob.com`) are showing "Cannot connect to backend server" error.

## Root Cause Analysis

Since BOTH domains are failing, this suggests:

1. **Environment variable not set at all** (not just missing for Production)
2. **Backend is down or not responding**
3. **CORS blocking all requests**
4. **Environment variable set but build didn't include it**

## Step-by-Step Debugging

### Step 1: Check Browser Console

On **both** domains, open browser console (F12) and check:

1. **Look for `[API Config]` logs:**
   ```
   [API Config] Using backend URL: ...
   [API Config] NEXT_PUBLIC_API_URL: ...
   [API Config] NODE_ENV: ...
   ```

2. **What does it show?**
   - If `NEXT_PUBLIC_API_URL: NOT SET` → Environment variable not configured
   - If shows `undefined` → Variable not set or not included in build
   - If shows wrong URL → Variable set incorrectly

### Step 2: Check Network Tab

1. Open browser DevTools → Network tab
2. Try to log in
3. Look for failed requests
4. Check:
   - **What URL is it trying to hit?**
   - **What's the status code?** (0 = CORS/network error, 404 = not found, 500 = server error)
   - **Any error messages?**

### Step 3: Test Backend Directly

Test if backend is actually running:

**In browser, visit:**
```
https://fpl-companion-api.onrender.com/health
```

**Expected:** `{"status":"healthy"}`

**If this fails:**
- Backend is down
- Check Render dashboard for service status
- Check Render logs for errors

### Step 4: Verify Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `NEXT_PUBLIC_API_URL` exists
3. If it exists:
   - What's the value? (should be `https://fpl-companion-api.onrender.com`)
   - Which environments are checked? (should have ✅ Production and ✅ Preview)
4. If it doesn't exist:
   - **This is the problem!** Add it now.

### Step 5: Check Vercel Deployment Logs

1. Go to Vercel → Deployments → Latest deployment
2. Click on the deployment
3. Check **Build Logs**
4. Look for:
   - Environment variables being loaded
   - Any build errors
   - Next.js build output

### Step 6: Check Render Backend Status

1. Go to Render Dashboard → Your Service (`fpl-companion-api`)
2. Check:
   - **Status:** Should be "Live" (green)
   - **Last Deploy:** Should be recent
   - **Logs:** Check for errors or CORS configuration

3. **Check Render Logs:**
   - Look for: `[CORS] Allowing origins: ...`
   - Should include your domains

## Most Likely Issues & Fixes

### Issue 1: Environment Variable Not Set

**Symptom:** Console shows `NEXT_PUBLIC_API_URL: NOT SET` or `undefined`

**Fix:**
1. Vercel Dashboard → Settings → Environment Variables
2. Click **Add New**
3. **Key:** `NEXT_PUBLIC_API_URL`
4. **Value:** `https://fpl-companion-api.onrender.com`
5. **Environments:** ✅ Production ✅ Preview ✅ Development
6. **Save**
7. **Redeploy** (Deployments → Latest → ⋯ → Redeploy)

### Issue 2: Backend is Down

**Symptom:** `https://fpl-companion-api.onrender.com/health` doesn't work

**Fix:**
1. Check Render dashboard - is service running?
2. Check Render logs for errors
3. Restart service if needed
4. Check if service hit free tier limits (750 hours/month)

### Issue 3: CORS Not Configured

**Symptom:** Network tab shows CORS errors, status code 0

**Fix:**
1. Check Render → Environment → `FRONTEND_URL`
2. Should include: `https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com`
3. Wait for Render to redeploy (2-3 minutes)
4. Check Render logs for CORS configuration

### Issue 4: Environment Variable Set But Not in Build

**Symptom:** Variable exists in Vercel but console shows it's not set

**Fix:**
- Next.js bakes `NEXT_PUBLIC_*` vars at **build time**
- If you set the variable **after** the build, it won't be included
- **Must redeploy** after setting/changing environment variables

## Quick Diagnostic Commands

### Test Backend (in browser)
Visit: `https://fpl-companion-api.onrender.com/health`

### Test from Browser Console (on your site)
```javascript
// Check what API URL frontend is using
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Test backend connection
fetch('https://fpl-companion-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(err => {
    console.error('Backend connection failed:', err);
    console.error('This could be:');
    console.error('1. Backend is down');
    console.error('2. CORS issue');
    console.error('3. Network issue');
  });
```

## Action Plan

1. **First:** Test backend directly - `https://fpl-companion-api.onrender.com/health`
2. **Second:** Check browser console on your site - what does `[API Config]` show?
3. **Third:** Check Vercel environment variables - is `NEXT_PUBLIC_API_URL` set?
4. **Fourth:** Check Render logs - is CORS configured correctly?

Share the results and I'll help pinpoint the exact issue!





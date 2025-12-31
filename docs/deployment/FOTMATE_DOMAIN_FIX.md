# Fix for fotmate.com Backend Connection Issue

## Problem
The site at https://www.fotmate.com/login/ shows: "Cannot connect to backend server. Please check that the backend is running and CORS is configured correctly."

## Root Cause
The frontend doesn't know where the backend is, or the backend isn't allowing requests from fotmate.com.

## Immediate Fix (5 minutes)

### Step 1: Set Frontend Environment Variable in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project (the one deployed to fotmate.com)

2. **Add Environment Variable:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://fpl-assistant-api.onrender.com`
     - ⚠️ **IMPORTANT:** Replace with your actual Render backend URL if different
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click **⋯** (three dots) → **Redeploy**
   - Or push a new commit to trigger redeploy

### Step 2: Update Backend CORS in Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Select your backend service (likely `fpl-assistant-api`)

2. **Update Environment Variable:**
   - Go to **Environment** tab
   - Find `FRONTEND_URL` variable
   - **Update the value to:**
     ```
     https://fotmate.com,https://www.fotmate.com
     ```
   - If you want to keep Vercel URL too:
     ```
     https://fotmate.com,https://www.fotmate.com,https://your-app.vercel.app
     ```
   - Click **Save Changes**
   - Render will automatically redeploy (takes 2-3 minutes)

### Step 3: Verify Backend is Running

Test your backend:
```bash
curl https://fpl-assistant-api.onrender.com/health
```

Should return: `{"status":"healthy"}`

If you get an error, check your Render dashboard for the correct backend URL.

### Step 4: Wait and Test

1. **Wait for deployments to complete:**
   - Vercel: ~1 minute
   - Render: ~2-3 minutes

2. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Or use Incognito/Private browsing

3. **Test the login:**
   - Visit: https://www.fotmate.com/login/
   - Try to log in
   - Check browser console (F12) for errors

## Verification

After making changes, verify:

1. **Check Vercel Environment Variables:**
   - Go to Vercel → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` is set to your Render backend URL

2. **Check Render Environment Variables:**
   - Go to Render → Your Service → Environment
   - Verify `FRONTEND_URL` includes `https://fotmate.com,https://www.fotmate.com`

3. **Check Render Logs:**
   - Go to Render → Your Service → Logs
   - Look for: `[CORS] Allowing origins: ...`
   - Should include `https://fotmate.com` and `https://www.fotmate.com`

4. **Test in Browser:**
   - Open https://www.fotmate.com/login/
   - Open Developer Tools (F12) → Console tab
   - Try to log in
   - Should see no CORS errors
   - API requests should succeed

## Troubleshooting

### Still Getting "Cannot connect to backend server"

**Check 1: Verify Backend URL**
```bash
# Test if backend is accessible
curl https://fpl-assistant-api.onrender.com/health
```

If this fails, your backend URL is wrong. Check Render dashboard for the correct URL.

**Check 2: Verify Environment Variable is Set**
1. In Vercel, go to your deployment
2. Click on the deployment
3. Check "Build Logs" or "Runtime Logs"
4. Look for environment variables being loaded

**Check 3: Check Browser Console**
1. Open https://www.fotmate.com/login/
2. Press F12 → Console tab
3. Try to log in
4. Look for error messages
5. Check Network tab for failed requests

**Check 4: Verify CORS Configuration**
1. In Render, check service logs
2. Look for: `[CORS] Allowing origins: ...`
3. Should include `https://fotmate.com` and `https://www.fotmate.com`

### CORS Error in Browser Console

If you see: `Access to XMLHttpRequest ... has been blocked by CORS policy`

**Solution:**
1. Verify `FRONTEND_URL` in Render includes `https://fotmate.com,https://www.fotmate.com`
2. Wait for Render to redeploy (2-3 minutes)
3. Check Render logs to confirm CORS origins

### Backend URL is Different

If your Render backend URL is NOT `https://fpl-assistant-api.onrender.com`:

1. **Find your actual backend URL:**
   - Go to Render Dashboard
   - Select your backend service
   - The URL is shown at the top (e.g., `https://fpl-assistant-api-xxxx.onrender.com`)

2. **Update Vercel environment variable:**
   - Set `NEXT_PUBLIC_API_URL` to your actual Render URL

3. **Redeploy Vercel**

## Quick Reference

### Vercel Environment Variable
```
NEXT_PUBLIC_API_URL=https://fpl-assistant-api.onrender.com
```
(Replace with your actual Render backend URL)

### Render Environment Variable
```
FRONTEND_URL=https://fotmate.com,https://www.fotmate.com
```

### Test Commands
```bash
# Test backend
curl https://fpl-assistant-api.onrender.com/health

# Test from browser console (on fotmate.com)
fetch('https://fpl-assistant-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

## Expected Result

After completing these steps:
- ✅ Site loads at https://www.fotmate.com
- ✅ Login page loads
- ✅ No "Cannot connect to backend server" error
- ✅ Login functionality works
- ✅ Dashboard loads after login

---

**Note:** If you're still having issues after following these steps, check:
1. Render service logs for CORS errors
2. Vercel deployment logs for build errors
3. Browser console for specific error messages





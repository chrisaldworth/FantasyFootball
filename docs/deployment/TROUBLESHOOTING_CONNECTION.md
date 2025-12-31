# Troubleshooting "Cannot Connect to Backend Server"

## Quick Debugging Steps

### Step 1: Check What URL Frontend is Using

Open your browser console on https://www.fotmate.com/login/ and run:

```javascript
// Check what API URL is being used
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET - using default');

// Or check the actual axios instance
// This will show in Network tab what URL requests are going to
```

**Expected:** Should show `https://fpl-companion-api.onrender.com`

**If it shows `undefined` or `NOT SET`:** The environment variable isn't being picked up.

### Step 2: Check Browser Network Tab

1. Open https://www.fotmate.com/login/
2. Press F12 → Network tab
3. Try to log in
4. Look for failed requests
5. Check:
   - **Request URL:** What URL is it trying to hit?
   - **Status Code:** What error code?
   - **CORS Error?** Look for "CORS policy" errors

### Step 3: Verify Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `NEXT_PUBLIC_API_URL` is set to: `https://fpl-companion-api.onrender.com`
3. **IMPORTANT:** Check which environments it's set for:
   - Must have ✅ Production checked
   - Should also have ✅ Preview and ✅ Development

4. **Check if deployment used the variable:**
   - Go to Deployments → Latest deployment
   - Check build logs
   - Look for environment variables being loaded

### Step 4: Verify Backend is Running

Test the backend directly:
```bash
curl https://fpl-companion-api.onrender.com/health
```

Or test in browser:
- Visit: https://fpl-companion-api.onrender.com/health
- Should return: `{"status":"healthy"}`

### Step 5: Check Backend CORS Configuration

1. Go to Render Dashboard → Your Service → Logs
2. Look for startup logs
3. Find line: `[CORS] Allowing origins: ...`
4. Verify it includes:
   - `https://fotmate.com`
   - `https://www.fotmate.com`
   - `https://fantasy-football-omega.vercel.app`

## Common Issues

### Issue 1: Environment Variable Not Set in Production

**Symptom:** Frontend uses default URL or localhost

**Fix:**
1. Go to Vercel → Settings → Environment Variables
2. Make sure `NEXT_PUBLIC_API_URL` has ✅ Production checked
3. Redeploy (must rebuild for env vars to take effect)

### Issue 2: Environment Variable Set But Not Used

**Symptom:** Variable is set but frontend still uses wrong URL

**Fix:**
- Next.js `NEXT_PUBLIC_*` vars are baked into the build
- You MUST redeploy after setting/changing them
- Go to Deployments → Latest → ⋯ → Redeploy

### Issue 3: CORS Error in Console

**Symptom:** Browser console shows "CORS policy" error

**Fix:**
1. Check Render logs for `[CORS] Allowing origins: ...`
2. Verify your domain is in the list
3. Make sure `FRONTEND_URL` in Render includes your domain
4. Wait for Render to redeploy (2-3 minutes)

### Issue 4: Backend Not Responding

**Symptom:** Requests timeout or connection refused

**Fix:**
1. Check Render dashboard - is service running?
2. Check service logs for errors
3. Test backend directly: `curl https://fpl-companion-api.onrender.com/health`
4. If backend is down, check Render for service issues

### Issue 5: Wrong Backend URL

**Symptom:** Requests going to wrong URL

**Fix:**
1. Verify actual backend URL in Render dashboard
2. Update `NEXT_PUBLIC_API_URL` in Vercel to match
3. Redeploy Vercel

## Debugging Checklist

- [ ] Backend health check works: `curl https://fpl-companion-api.onrender.com/health`
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel with ✅ Production checked
- [ ] Vercel has been redeployed after setting env var
- [ ] `FRONTEND_URL` in Render includes `https://fotmate.com,https://www.fotmate.com`
- [ ] Render service is running (check dashboard)
- [ ] Render logs show CORS origins include your domain
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows requests going to correct backend URL

## Test Commands

### Test Backend from Terminal
```bash
curl https://fpl-companion-api.onrender.com/health
```

### Test from Browser Console (on fotmate.com)
```javascript
// Test backend connection
fetch('https://fpl-companion-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Check what API URL frontend thinks it should use
// (This won't work if env var isn't set, but helps debug)
```

### Test CORS
```javascript
// From browser console on fotmate.com
fetch('https://fpl-companion-api.onrender.com/api/auth/me', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(console.log)
  .catch(err => {
    console.error('Error:', err);
    console.error('This might be a CORS issue if status is 0 or network error');
  });
```

## What to Check Next

1. **Browser Console:** What exact error message?
2. **Network Tab:** What URL are requests going to? What status code?
3. **Vercel Build Logs:** Are environment variables being loaded?
4. **Render Service Logs:** What CORS origins are configured?
5. **Backend Health:** Is the backend actually running?

Share these details and I can help pinpoint the exact issue!





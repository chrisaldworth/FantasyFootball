# CORS Fix for fotmate.com

## Problem Identified

**Error:** `Access to XMLHttpRequest at 'https://fpl-companion-api.onrender.com/api/auth/login' from origin 'https://www.fotmate.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

**Root Cause:** Backend CORS is not allowing requests from `https://www.fotmate.com`

## Solution

### Step 1: Verify FRONTEND_URL in Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (`fpl-companion-api`)
3. Go to **Environment** tab
4. Find `FRONTEND_URL` variable
5. **Verify it's set to:**
   ```
   https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com
   ```

### Step 2: Check Render Logs

1. In Render dashboard, go to **Logs** tab
2. Look for startup logs (scroll to when service started)
3. Find line: `[CORS] Allowing origins: ...`
4. **Check if it includes:**
   - `https://fotmate.com`
   - `https://www.fotmate.com`
   - `https://fantasy-football-omega.vercel.app`

**If your domains are NOT in the list:** The `FRONTEND_URL` wasn't saved correctly or Render hasn't redeployed.

### Step 3: Update FRONTEND_URL (If Needed)

1. In Render → Environment tab
2. Edit `FRONTEND_URL`
3. **Set to exactly:**
   ```
   https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com
   ```
4. **Important:** 
   - Use commas to separate (no spaces after commas)
   - Include `https://` for each URL
   - Include both `fotmate.com` and `www.fotmate.com`
5. Click **Save Changes**
6. Render will automatically redeploy (takes 2-3 minutes)

### Step 4: Wait for Redeploy and Verify

1. **Wait 2-3 minutes** for Render to redeploy
2. Check Render → Logs tab
3. Look for new startup logs
4. Find: `[CORS] Allowing origins: ...`
5. **Verify it now includes:**
   ```
   'https://fotmate.com', 'https://fotmate.com/', 'https://www.fotmate.com', 'https://www.fotmate.com/', ...
   ```

### Step 5: Test

1. Wait for deployment to complete
2. Clear browser cache or use Incognito
3. Visit: https://www.fotmate.com/login/
4. Try to log in
5. **Should work now!** ✅

## Common Issues

### Issue 1: Domains Not in CORS Logs

**Symptom:** Render logs show CORS origins but your domains aren't listed

**Fix:**
- Double-check `FRONTEND_URL` is saved correctly
- Make sure you clicked "Save Changes"
- Wait for Render to redeploy
- Check logs again after redeploy

### Issue 2: Formatting Error

**Wrong:**
```
https://fantasy-football-omega.vercel.app, https://fotmate.com, https://www.fotmate.com
```
(Spaces after commas can cause issues)

**Correct:**
```
https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com
```
(No spaces after commas)

### Issue 3: Missing https://

**Wrong:**
```
fantasy-football-omega.vercel.app,fotmate.com,www.fotmate.com
```

**Correct:**
```
https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com
```

### Issue 4: Render Not Redeploying

**Symptom:** Changed `FRONTEND_URL` but logs still show old values

**Fix:**
- Render should auto-redeploy when env vars change
- If not, manually trigger: Render → Manual Deploy → Deploy latest commit
- Or make a small code change and push to trigger redeploy

## Verification Checklist

After fixing:

- [ ] `FRONTEND_URL` in Render includes all three domains
- [ ] Render service has redeployed (check "Last Deploy" timestamp)
- [ ] Render logs show `[CORS] Allowing origins: ...` with your domains
- [ ] Browser console shows no CORS errors
- [ ] Login works on https://www.fotmate.com

## Expected CORS Log Output

After fix, Render logs should show:
```
[CORS] Allowing origins: ['http://localhost:3000', 'http://localhost:3001', ..., 'https://fantasy-football-omega.vercel.app', 'https://fantasy-football-omega.vercel.app/', 'https://fotmate.com', 'https://fotmate.com/', 'https://www.fotmate.com', 'https://www.fotmate.com/', ...]
```

---

**The fix is simple:** Make sure `FRONTEND_URL` in Render includes `https://www.fotmate.com` and wait for Render to redeploy!





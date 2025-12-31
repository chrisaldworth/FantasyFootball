# Custom Domain vs Vercel Domain - Configuration Difference

## Issue Identified

✅ **Vercel domain works:** `https://fantasy-football-omega.vercel.app/`  
❌ **Custom domain doesn't work:** `https://www.fotmate.com/login/`

This indicates the backend connection is fine, but there's a configuration difference between the two domains.

## Possible Causes

### 1. Environment Variable Not Applied to Custom Domain

Vercel environment variables can be set per environment. The custom domain might be using a different environment configuration.

**Check:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. For `NEXT_PUBLIC_API_URL`, check which environments it's set for:
   - ✅ Production (this should cover custom domain)
   - ✅ Preview (covers vercel.app domains)
   - ✅ Development

**If Production is not checked:** That's the problem! Custom domains use the Production environment.

### 2. Custom Domain Not Properly Configured in Vercel

The custom domain might not be properly linked to your Vercel project.

**Check:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Verify `fotmate.com` and `www.fotmate.com` are listed
3. Check their status - should be "Valid Configuration"
4. If not listed or showing errors, you need to add/configure them

### 3. DNS Configuration Issue

The custom domain might not be properly pointing to Vercel.

**Check:**
1. In Vercel → Settings → Domains
2. Verify DNS records are correct
3. Check if domain is verified

### 4. Different Build/Deployment

Custom domains might be pointing to an older deployment that doesn't have the environment variable.

**Fix:**
1. Go to Vercel → Deployments
2. Find the deployment for your custom domain
3. Check if it was built after you set the environment variable
4. If not, promote the latest deployment to production

## Solution Steps

### Step 1: Verify Environment Variable for Production

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXT_PUBLIC_API_URL`
3. **CRITICAL:** Make sure ✅ **Production** is checked
4. If not, edit it and check Production
5. Save

### Step 2: Verify Custom Domain Configuration

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Verify `fotmate.com` is listed
3. Verify `www.fotmate.com` is listed (if you're using www)
4. Both should show "Valid Configuration"
5. If not, follow Vercel's instructions to add/configure them

### Step 3: Redeploy Production

After ensuring Production environment variable is set:

1. Go to Vercel → Deployments
2. Find the latest successful deployment
3. Click ⋯ (three dots) → **Promote to Production**
4. Or trigger a new deployment by pushing a commit

### Step 4: Clear Cache and Test

1. Wait for deployment to complete
2. Clear browser cache or use Incognito mode
3. Visit https://www.fotmate.com/login/
4. Check browser console for `[API Config]` logs
5. Should now show the correct backend URL

## Quick Diagnostic

Run this in browser console on **both** domains:

**On fantasy-football-omega.vercel.app:**
```javascript
console.log('Vercel Domain - API URL:', process.env.NEXT_PUBLIC_API_URL);
```

**On www.fotmate.com:**
```javascript
console.log('Custom Domain - API URL:', process.env.NEXT_PUBLIC_API_URL);
```

**Expected:** Both should show `https://fpl-companion-api.onrender.com`

**If custom domain shows `undefined`:** Environment variable not set for Production environment.

## Most Likely Fix

Since the Vercel domain works, the issue is almost certainly:

**The `NEXT_PUBLIC_API_URL` environment variable is NOT set for the Production environment in Vercel.**

**Fix:**
1. Vercel Dashboard → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Make sure ✅ **Production** is checked
4. Save
5. Redeploy/Promote latest deployment to Production

---

**Note:** Next.js `NEXT_PUBLIC_*` environment variables are baked into the build at build time. If you set the variable after the build, you must rebuild/redeploy for it to take effect.





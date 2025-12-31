# Correct URLs for Deployment

## ✅ Your Actual Backend URL

Based on your Render dashboard:
- **Backend URL:** `https://fpl-companion-api.onrender.com`
- **Service Name:** `fpl-companion-api`
- **Service ID:** `srv-d4qmuc3uibrs739kst9g`

## Configuration Summary

### Backend (Render) - ✅ Already Set

**Environment Variable: `FRONTEND_URL`**
```
https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com
```

This is **CORRECT** ✅ - Your backend will allow requests from all three domains.

### Frontend (Vercel) - ⚠️ Still Needed

**Environment Variable: `NEXT_PUBLIC_API_URL`**
```
https://fpl-companion-api.onrender.com
```

**IMPORTANT:** Use `fpl-companion-api` (not `fpl-assistant-api`)

## Quick Setup Steps

### 1. Set Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://fpl-companion-api.onrender.com`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
5. **Save**
6. **Redeploy** (Deployments → Latest → ⋯ → Redeploy)

### 2. Verify Backend is Running

```bash
curl https://fpl-companion-api.onrender.com/health
```

Should return: `{"status":"healthy"}`

### 3. Test After Deployment

1. Wait for Vercel to redeploy (~1 minute)
2. Clear browser cache or use Incognito
3. Visit: https://www.fotmate.com/login/
4. Try to log in
5. Should work! ✅

## URL Reference

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | `https://fpl-companion-api.onrender.com` | ✅ Running |
| **Frontend (Vercel)** | `https://fantasy-football-omega.vercel.app` | ✅ Running |
| **Custom Domain** | `https://fotmate.com` | ✅ Configured |
| **Custom Domain (WWW)** | `https://www.fotmate.com` | ✅ Configured |

## What's Fixed

- ✅ Updated frontend code to use correct backend URL (`fpl-companion-api`)
- ✅ Backend CORS configured with all three domains
- ⚠️ Frontend environment variable still needs to be set in Vercel

## Next Step

**Set `NEXT_PUBLIC_API_URL=https://fpl-companion-api.onrender.com` in Vercel and redeploy.**

---

**Note:** I've updated the code to use the correct backend URL. The default fallback in `frontend/src/lib/api.ts` now points to `fpl-companion-api.onrender.com`.





# Fotmate.com Setup Status

## ✅ Completed

### Backend CORS Configuration (Render)
You've set `FRONTEND_URL` to:
```
https://fantasy-football-omega.vercel.app,https://fotmate.com,https://www.fotmate.com
```

This will allow requests from:
- ✅ `https://fantasy-football-omega.vercel.app`
- ✅ `https://fotmate.com`
- ✅ `https://www.fotmate.com`
- ✅ Automatically includes www/non-www variations
- ✅ Automatically includes trailing slash variations

## ⚠️ Still Needed

### Frontend Environment Variable (Vercel)

You still need to set `NEXT_PUBLIC_API_URL` in Vercel so the frontend knows where your backend is.

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (the one for fotmate.com)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://fpl-assistant-api.onrender.com` (or your actual Render backend URL)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
6. Click **Save**
7. **Redeploy** your frontend (go to Deployments → Latest → ⋯ → Redeploy)

## 🔄 Next Steps

### 1. Wait for Render to Redeploy
- Render automatically redeploys when you change environment variables
- Takes 2-3 minutes
- Check Render dashboard → Your Service → Logs
- Look for: `[CORS] Allowing origins: ...` to confirm your domains are included

### 2. Set Vercel Environment Variable
- Follow steps above to set `NEXT_PUBLIC_API_URL`
- Redeploy frontend

### 3. Verify Setup

**Test Backend:**
```bash
curl https://fpl-assistant-api.onrender.com/health
```
Should return: `{"status":"healthy"}`

**Test CORS Configuration:**
1. Go to Render → Your Service → Logs
2. Look for startup log: `[CORS] Allowing origins: ...`
3. Should include all three domains you added

**Test Frontend:**
1. Wait for both deployments to complete
2. Clear browser cache or use Incognito
3. Visit: https://www.fotmate.com/login/
4. Open browser console (F12)
5. Try to log in
6. Should see no CORS errors
7. API requests should succeed

## 📋 Checklist

- [x] Backend `FRONTEND_URL` set in Render
- [ ] Frontend `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] Render service redeployed (wait 2-3 minutes)
- [ ] Vercel frontend redeployed
- [ ] Backend health check works
- [ ] CORS logs show all domains
- [ ] Login works on fotmate.com

## 🔍 Troubleshooting

### If Still Getting "Cannot connect to backend server"

1. **Verify `NEXT_PUBLIC_API_URL` is set in Vercel**
   - Go to Vercel → Settings → Environment Variables
   - Must be set and redeployed

2. **Check Render Logs**
   - Go to Render → Your Service → Logs
   - Look for `[CORS] Allowing origins: ...`
   - Verify all three domains are listed

3. **Check Browser Console**
   - Open https://www.fotmate.com/login/
   - Press F12 → Console tab
   - Look for specific error messages
   - Check Network tab for failed API requests

4. **Verify Backend URL**
   - Make sure `NEXT_PUBLIC_API_URL` in Vercel matches your actual Render backend URL
   - Test backend: `curl https://your-backend-url.onrender.com/health`

## Expected CORS Log Output

When Render redeploys, you should see in the logs:
```
[CORS] Allowing origins: ['http://localhost:3000', 'http://localhost:3001', ..., 'https://fantasy-football-omega.vercel.app', 'https://fantasy-football-omega.vercel.app/', 'https://fotmate.com', 'https://fotmate.com/', 'https://www.fotmate.com', 'https://www.fotmate.com/', ...]
```

This confirms all your domains are configured correctly.

---

**Status:** Backend CORS configured ✅ | Frontend environment variable needed ⚠️





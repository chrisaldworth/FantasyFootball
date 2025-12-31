# Custom Domain Setup Guide

This guide explains how to configure your custom domain (hosted on SiteGround) with Vercel and connect it to your backend on Render.

## Problem: Site Loads But Can't Connect to Backend

If your custom domain loads but login/dashboard functionality doesn't work, you need to configure:

1. **Frontend (Vercel)**: Set `NEXT_PUBLIC_API_URL` to point to your backend
2. **Backend (Render)**: Set `FRONTEND_URL` to include your custom domain for CORS

## Step-by-Step Setup

### Step 1: Configure Frontend Environment Variable (Vercel)

Your frontend needs to know where your backend API is located.

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Environment Variables:**
   - Go to **Settings** → **Environment Variables**

3. **Add `NEXT_PUBLIC_API_URL`:**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://fpl-assistant-api.onrender.com` (or your actual Render backend URL)
   - **Environments:** Select all (Production, Preview, Development)

4. **Save and Redeploy:**
   - Click **Save**
   - Vercel will automatically trigger a new deployment
   - Wait for deployment to complete

### Step 2: Configure Backend CORS (Render)

Your backend needs to allow requests from your custom domain.

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Select your backend service (e.g., `fpl-assistant-api`)

2. **Navigate to Environment Variables:**
   - Click **Environment** in the left sidebar

3. **Update `FRONTEND_URL`:**
   - Find the existing `FRONTEND_URL` variable
   - **Current value might be:** `https://your-app.vercel.app`
   - **Update to include your custom domain:**
     - If you have one domain: `https://yourdomain.com`
     - If you have multiple domains (www and non-www): `https://yourdomain.com,https://www.yourdomain.com`
     - If you also want to keep Vercel URL: `https://yourdomain.com,https://www.yourdomain.com,https://your-app.vercel.app`

4. **Example Values:**
   ```
   # Single domain
   https://fotmate.com
   
   # Multiple domains (recommended)
   https://fotmate.com,https://www.fotmate.com
   
   # With Vercel URL too
   https://fotmate.com,https://www.fotmate.com,https://your-app.vercel.app
   ```

5. **Save Changes:**
   - Click **Save Changes**
   - Render will automatically redeploy your service
   - Wait for deployment to complete (usually 2-3 minutes)

### Step 3: Verify Your Custom Domain in Vercel

Make sure your custom domain is properly configured in Vercel:

1. **Go to Vercel Project Settings:**
   - Visit: https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Domains**

2. **Verify Domain Configuration:**
   - Your custom domain should be listed
   - Status should show as "Valid Configuration"
   - DNS records should be verified

3. **If Domain Not Added:**
   - Click **Add Domain**
   - Enter your domain (e.g., `fotmate.com`)
   - Follow Vercel's instructions to configure DNS

### Step 4: Verify Backend is Running

Test that your backend is accessible:

```bash
# Test backend health
curl https://fpl-assistant-api.onrender.com/health

# Should return: {"status":"healthy"}
```

### Step 5: Test the Connection

1. **Open your custom domain in browser:**
   - Visit: `https://yourdomain.com`

2. **Open Browser Developer Tools:**
   - Press `F12` or right-click → Inspect
   - Go to **Console** tab
   - Go to **Network** tab

3. **Try to Login:**
   - Attempt to log in
   - Check the Network tab for API requests
   - Look for any CORS errors or connection failures

4. **Check for Errors:**
   - **CORS Error:** Backend `FRONTEND_URL` not set correctly
   - **Connection Refused:** Backend URL incorrect in `NEXT_PUBLIC_API_URL`
   - **404 Not Found:** API endpoint path incorrect

## Troubleshooting

### Issue: "Cannot connect to backend server"

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Check the value points to your actual Render backend URL
3. Verify backend is running: `curl https://your-backend.onrender.com/health`
4. Redeploy frontend after setting environment variable

### Issue: CORS Error in Browser Console

**Error:** `Access to XMLHttpRequest at '...' from origin 'https://yourdomain.com' has been blocked by CORS policy`

**Solution:**
1. Verify `FRONTEND_URL` in Render includes your custom domain
2. Format: `https://yourdomain.com` or `https://yourdomain.com,https://www.yourdomain.com`
3. Wait for Render to redeploy (2-3 minutes)
4. Check Render logs to see CORS configuration: Look for `[CORS] Allowing origins: ...`

### Issue: Site Loads But Login Doesn't Work

**Check:**
1. Browser console for errors
2. Network tab for failed API requests
3. Verify `NEXT_PUBLIC_API_URL` is set correctly
4. Verify backend health endpoint works
5. Check if authentication endpoints are accessible

### Issue: Environment Variable Not Working

**For Vercel:**
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Must redeploy after adding/changing environment variables
- Check deployment logs to verify variable is available

**For Render:**
- Environment variables are available at runtime
- Service auto-redeploys when environment variables change
- Check service logs to see if variable is loaded

## Verification Checklist

After setup, verify:

- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- [ ] `FRONTEND_URL` includes your custom domain in Render
- [ ] Custom domain is added and verified in Vercel
- [ ] Backend health check works: `curl https://your-backend.onrender.com/health`
- [ ] Frontend loads on custom domain
- [ ] No CORS errors in browser console
- [ ] Login functionality works
- [ ] API requests succeed (check Network tab)

## Quick Reference

### Vercel Environment Variables
```
NEXT_PUBLIC_API_URL=https://fpl-assistant-api.onrender.com
```

### Render Environment Variables
```
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
```

### Test Commands
```bash
# Test backend
curl https://fpl-assistant-api.onrender.com/health

# Test frontend API connection (from browser console)
fetch('https://fpl-assistant-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

## Additional Notes

- **Multiple Domains:** You can add multiple domains to `FRONTEND_URL` by separating them with commas
- **WWW vs Non-WWW:** The backend automatically handles both www and non-www versions
- **SSL/HTTPS:** Both Vercel and Render provide SSL certificates automatically
- **DNS Propagation:** DNS changes can take up to 48 hours, but usually work within minutes

## Need Help?

If you're still having issues:

1. Check Render service logs for CORS configuration output
2. Check Vercel deployment logs for build errors
3. Check browser console for specific error messages
4. Verify both services have redeployed after environment variable changes

---

**Last Updated:** Based on current deployment configuration





# Deployment Environment Variables Guide

This guide shows how to update API keys in your deployed environments.

## 🎯 Quick Summary

- **Backend (Render)**: Add `FOOTBALL_DATA_KEY`
- **Frontend (Vercel)**: No changes needed (uses backend API)

## 📋 Required Environment Variables

### Backend (Render)

Add these environment variables in your Render dashboard:

| Variable | Value | Required |
|----------|-------|----------|
| `FOOTBALL_DATA_KEY` | `0d92c545381343f7acaf84218df76cac` | ✅ **NEW** |
| `API_FOOTBALL_KEY` | (Optional) Your API-FOOTBALL key | ⚪ Optional |
| `DATABASE_URL` | Your PostgreSQL connection string | ✅ Existing |
| `SECRET_KEY` | Your JWT secret key | ✅ Existing |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ Existing |
| `VAPID_PUBLIC_KEY` | Your VAPID public key | ✅ Existing |
| `VAPID_PRIVATE_KEY` | Your VAPID private key | ✅ Existing |
| `VAPID_EMAIL` | Your email | ✅ Existing |

### Frontend (Vercel)

No new environment variables needed. The frontend calls the backend API which handles the Football-Data.org integration.

| Variable | Value | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com` | ✅ Existing |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Your VAPID public key | ✅ Existing |

---

## 🔧 Step-by-Step Instructions

### 1. Update Render Backend Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (e.g., `fpl-assistant-api`)
3. Click on **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add the following:

   **Variable Name:** `FOOTBALL_DATA_KEY`  
   **Value:** `0d92c545381343f7acaf84218df76cac`

6. Click **Save Changes**
7. Render will automatically redeploy your service

### 2. Verify Deployment

After Render redeploys, test the API:

```bash
# Test the API key is configured
curl https://your-api.onrender.com/api/football/test

# Should return:
# {
#   "football_data_key_configured": true,
#   "api_source": "football-data"
# }
```

### 3. (Optional) Add API-FOOTBALL Key

If you want to use API-FOOTBALL for additional competitions (Champions League, FA Cup, League Cup):

1. Get your API key from [api-football.com](https://www.api-football.com/)
2. In Render dashboard, add:
   - **Variable Name:** `API_FOOTBALL_KEY`
   - **Value:** `your-api-football-key`

---

## ✅ Verification Checklist

After updating environment variables:

- [ ] `FOOTBALL_DATA_KEY` added to Render
- [ ] Render service redeployed successfully
- [ ] Test endpoint returns `football_data_key_configured: true`
- [ ] UK teams endpoint returns teams from multiple competitions
- [ ] Fixtures/results include Championship data

---

## 🔍 Testing the Deployment

### Test UK Teams Endpoint

```bash
curl https://your-api.onrender.com/api/football/teams/uk
```

Expected response should include teams from:
- Premier League (20 teams)
- Championship (24 teams)
- League One (18 teams)
- League Two (24 teams)
- Scottish Premiership (20 teams)

### Test Fixtures Endpoint

```bash
curl https://your-api.onrender.com/api/football/fixtures/upcoming?days=30
```

Should return fixtures from multiple competitions.

### Test Results Endpoint

```bash
curl https://your-api.onrender.com/api/football/results/recent?days=30
```

Should return results from multiple competitions.

---

## 🚨 Troubleshooting

### API Key Not Working

1. **Check the key is correct**: Verify `FOOTBALL_DATA_KEY` value in Render
2. **Check service restarted**: Render should auto-redeploy after env var changes
3. **Check logs**: View Render service logs for any errors
4. **Rate limiting**: Football-Data.org free tier has 10 calls/minute limit

### No UK League Data

1. Verify `FOOTBALL_DATA_KEY` is set correctly
2. Check Render logs for API errors
3. Test the API directly: `curl -H "X-Auth-Token: YOUR_KEY" https://api.football-data.org/v4/competitions/2016/teams`

### Frontend Not Showing Data

1. Verify `NEXT_PUBLIC_API_URL` points to your Render backend
2. Check browser console for API errors
3. Verify CORS is configured in backend (should allow your Vercel domain)

---

## 📝 Notes

- **API Key Security**: Never commit API keys to git (they're in `.gitignore`)
- **Rate Limits**: Football-Data.org free tier allows 10 requests/minute
- **Auto-Redeploy**: Render automatically redeploys when environment variables change
- **No Frontend Changes**: Frontend doesn't need updates - it uses the backend API

---

## 🔗 Useful Links

- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Football-Data.org API Docs](https://www.football-data.org/documentation/quickstart)
- [API-FOOTBALL Docs](https://www.api-football.com/documentation-v3)


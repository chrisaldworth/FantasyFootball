# iOS App - Cloud Backend Setup

## ✅ Updated Configuration

The iOS app is now configured to connect to your **deployed backend on Render** instead of localhost. This means it will use your cloud database automatically.

## 🔧 What Changed

1. **API URL Updated** - iOS app now uses: `https://fpl-assistant-api.onrender.com`
2. **Connects to Cloud Database** - Through your Render backend API
3. **No Local Backend Needed** - Works independently of your local development setup

## 📋 Verify Your Render Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your backend service (likely named `fpl-assistant-api`)
3. Check the URL - it should be something like:
   - `https://fpl-assistant-api.onrender.com`
   - Or `https://fpl-assistant-api-xxxx.onrender.com`

## 🔄 Update API URL (If Different)

If your Render URL is different, update it in:

**File:** `frontend/src/lib/api.ts`

Find this line (around line 18):
```typescript
const deployedBackend = 'https://fpl-assistant-api.onrender.com';
```

Change it to your actual Render URL, then:
```bash
cd frontend
npm run build
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
export LANG=en_US.UTF-8
npx cap sync ios
```

## ✅ Verify Backend is Running

Test your backend:
```bash
curl https://your-backend-url.onrender.com/health
```

Should return: `{"status":"healthy"}`

## 🔒 CORS Configuration

The backend should already allow requests from:
- Your Vercel frontend
- iOS app origins (`capacitor://localhost`)
- All origins in DEBUG mode

If you get CORS errors, check your Render backend logs and verify CORS settings in `backend/app/main.py`.

## 🚀 Rebuild and Test

1. **Rebuild the app:**
   ```bash
   cd frontend
   npm run build
   export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
   export LANG=en_US.UTF-8
   npx cap sync ios
   ```

2. **In Xcode:**
   - Clean Build Folder (Shift+Cmd+K)
   - Build and Run (Cmd+R)

3. **Test:**
   - The app should now connect to your cloud backend
   - All data will come from your cloud database
   - No local backend needed!

## 🔄 Switch Back to Localhost (For Development)

If you want to test with your local backend during development:

1. Edit `frontend/src/lib/api.ts`
2. Find the Capacitor section (around line 15)
3. Change:
   ```typescript
   // return deployedBackend;
   return 'http://localhost:8080';  // Uncomment this
   ```
4. Rebuild and sync

## 📝 Environment Variable Option

You can also set the API URL via environment variable in Xcode:

1. **Edit Scheme** (Product → Scheme → Edit Scheme)
2. **Run → Arguments → Environment Variables**
3. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`

This will override the default URL.

## ✅ Benefits

- ✅ Works on any device (no need for Mac's IP)
- ✅ Uses your cloud database
- ✅ No local backend required
- ✅ Production-ready configuration
- ✅ Works on physical devices and simulators

## 🎯 Current Status

- ✅ API URL configured for cloud backend
- ✅ Frontend rebuilt
- ✅ Capacitor synced
- ✅ Ready to test in Xcode

Just rebuild in Xcode and the app will connect to your cloud backend!


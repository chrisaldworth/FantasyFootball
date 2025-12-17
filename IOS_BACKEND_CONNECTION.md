# iOS App - Backend Connection Guide

## ✅ Fixed Issues

1. **CORS Updated** - Backend now allows:
   - `capacitor://localhost` (iOS app origin)
   - `http://localhost` (simulator)
   - `http://localhost:8080` (backend)
   - Mac's IP address origins
   - All origins in DEBUG mode

2. **API URL Configuration** - Frontend now detects Capacitor and uses appropriate URL

## 🔧 Current Setup

### Backend (Running on port 8080)
- ✅ CORS allows iOS simulator and device origins
- ✅ Running at: `http://localhost:8080`
- ✅ Health check: `http://localhost:8080/health`

### Frontend API Configuration
- Uses `http://localhost:8080` for iOS simulator
- For physical devices, may need Mac's IP address

## 📱 Testing Connection

### Option 1: iOS Simulator (Should Work Now)
The iOS simulator can access `localhost`, so this should work:
- API URL: `http://localhost:8080`

### Option 2: Physical Device (May Need IP Address)
If testing on a physical iPhone, use your Mac's IP address:
- Find your Mac's IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- API URL: `http://YOUR_MAC_IP:8080` (e.g., `http://192.168.68.152:8080`)

## 🚀 Quick Fix Steps

### If App Still Can't Connect:

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:8080/health
   # Should return: {"status":"healthy"}
   ```

2. **For iOS Simulator:**
   - The app should use `http://localhost:8080`
   - This should work automatically now

3. **For Physical Device:**
   - You may need to update the API URL to use your Mac's IP
   - Find IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Update in `frontend/src/lib/api.ts` or use environment variable

4. **Rebuild and Sync:**
   ```bash
   cd frontend
   npm run build
   export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
   export LANG=en_US.UTF-8
   npx cap sync ios
   ```

5. **In Xcode:**
   - Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
   - Rebuild and run

## 🔍 Debugging Connection Issues

### Check Backend Logs
Look for CORS errors in backend terminal:
```
[CORS] Allowing origins: [...]
```

### Check iOS Console
In Xcode, check the console for:
- Network errors
- CORS errors
- API connection failures

### Test API Directly
From your Mac, test the API:
```bash
# Test health endpoint
curl http://localhost:8080/health

# Test with CORS headers
curl -H "Origin: capacitor://localhost" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8080/api/football/test -v
```

## 📝 Environment Variables

### For Development (iOS Simulator)
No changes needed - uses `http://localhost:8080`

### For Physical Device Testing
You can set an environment variable in Xcode:
1. Edit Scheme (Product → Scheme → Edit Scheme)
2. Run → Arguments → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `http://YOUR_MAC_IP:8080`

Or update `frontend/src/lib/api.ts` to detect physical device and use IP.

## ✅ What's Fixed

- ✅ CORS allows iOS app origins
- ✅ Backend accepts requests from Capacitor
- ✅ API URL configuration updated
- ✅ Build and sync completed

## 🎯 Next Steps

1. **Rebuild in Xcode:**
   - Clean build folder
   - Build and run
   - Check console for connection

2. **If Still Failing:**
   - Check Xcode console for specific error
   - Verify backend is running
   - Test API from Mac terminal
   - Try using Mac's IP address instead of localhost

3. **For Production:**
   - Use your deployed backend URL
   - Set `NEXT_PUBLIC_API_URL` environment variable
   - Update CORS in backend to allow your app domain


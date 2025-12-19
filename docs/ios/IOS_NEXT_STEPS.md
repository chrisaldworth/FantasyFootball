# iOS App - Next Steps

## ✅ Current Status

- ✅ Xcode is installed
- ✅ Next.js build is ready
- ✅ CocoaPods dependencies installed
- ✅ iOS project structure ready
- ⏳ Need to configure Xcode command line tools

## 🚀 Quick Setup (Run These Commands)

### Step 1: Configure Xcode

You need to run these commands with sudo (you'll be prompted for your password):

```bash
# Set Xcode as the active developer directory
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Accept Xcode license
sudo xcodebuild -license accept

# Verify it worked
xcodebuild -version
```

**OR** run the automated script:

```bash
./setup_xcode.sh
```

### Step 2: Sync Capacitor

After Xcode is configured, sync the iOS project:

```bash
cd frontend
export LANG=en_US.UTF-8
npx cap sync ios
```

### Step 3: Open in Xcode

```bash
cd frontend
npm run ios:build
```

This will:
- Build the Next.js app
- Sync Capacitor
- Open Xcode automatically

### Step 4: Configure Signing in Xcode

1. In Xcode, select the **App** project in the left sidebar
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team**:
   - Use "Personal Team" (your Apple ID) for development
   - If you don't see your team, go to Xcode → Settings → Accounts and sign in

### Step 5: Build and Run

1. Select a simulator from the device dropdown (top toolbar)
   - Recommended: **iPhone 15 Pro** or **iPhone 15**
2. Click the **▶️ Play** button (or press `Cmd+R`)
3. Wait for the build to complete
4. The app will launch in the simulator! 🎉

## 📱 Testing on Physical Device (Optional)

1. Connect your iPhone via USB
2. Trust the computer on your iPhone if prompted
3. In Xcode, select your device from the device dropdown
4. You may need to:
   - Register your device in Xcode (Window → Devices and Simulators)
   - Trust your developer certificate on the device (Settings → General → VPN & Device Management)
5. Click **▶️ Play** to build and run on your device

## 🔧 Troubleshooting

### "Code signing" errors
- Make sure you've selected a Team in Signing & Capabilities
- Use "Personal Team" for development (free)
- Make sure your Apple ID is signed in (Xcode → Settings → Accounts)

### "No such module 'Capacitor'" error
- Run `cd frontend/ios/App && pod install` again
- Make sure you opened `App.xcworkspace`, NOT `App.xcodeproj`

### Build fails
- Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Rebuild

### App crashes on launch
- Check the Xcode console for error messages
- Make sure the backend API is running and accessible
- Check network permissions in Info.plist

## 📝 What's Ready

- ✅ All dependencies installed
- ✅ Project structure complete
- ✅ Build system configured
- ✅ Ready to open in Xcode

## 🎯 After App Runs Successfully

1. **Test all features:**
   - Login/Register
   - Dashboard
   - FPL team linking
   - Favorite team selection
   - Fixtures and results

2. **Configure App Icons:**
   - Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Use https://www.appicon.co/ to generate all required sizes

3. **Configure App Info:**
   - Update app name, bundle ID in Xcode
   - Set version and build number

4. **Test Push Notifications:**
   - Configure APNs certificates
   - Test on physical device (notifications don't work on simulator)

## 🚀 Quick Commands Reference

```bash
# Configure Xcode (one-time setup)
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

# Build and sync
cd frontend
npm run build
export LANG=en_US.UTF-8
npx cap sync ios

# Open in Xcode
npm run ios:build

# Or manually
cd frontend/ios/App
open App.xcworkspace
```

Good luck! 🎉










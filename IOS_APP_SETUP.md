# iPhone App Setup - Complete Guide

This guide will help you complete the setup of your Fantasy Football iPhone app.

## Current Status

✅ **Completed:**
- CocoaPods installed (v1.16.2)
- Next.js build working
- Capacitor iOS project structure exists
- Project configured for iOS 14.0+

⏳ **Remaining:**
- Install Xcode (required)
- Configure Xcode command line tools
- Install iOS dependencies
- Build and test on simulator/device

## Step 1: Install Xcode

Xcode is **required** for iOS development. It's a large download (~15GB) but essential.

### Option A: App Store (Recommended)
1. Open the **App Store** on your Mac
2. Search for "Xcode"
3. Click **Get** or **Install**
4. Wait for download to complete (this can take 30-60 minutes)
5. Once installed, open Xcode once to complete first-time setup

### Option B: Apple Developer Website
1. Go to https://developer.apple.com/xcode/
2. Download Xcode
3. Install the `.xip` file

## Step 2: Configure Xcode

After Xcode is installed, run these commands in Terminal:

```bash
# Set Xcode as the active developer directory
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Accept Xcode license (you'll need to enter your password)
sudo xcodebuild -license accept

# Verify installation
xcodebuild -version
```

You should see something like:
```
Xcode 16.x
Build version xxxxx
```

## Step 3: Fix Terminal Encoding (if needed)

Add this to your `~/.zshrc` file to fix CocoaPods encoding issues:

```bash
echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
source ~/.zshrc
```

## Step 4: Install iOS Dependencies

Once Xcode is installed and configured:

```bash
cd frontend

# Build the Next.js app
npm run build

# Install CocoaPods dependencies
cd ios/App
export LANG=en_US.UTF-8
pod install

# Go back to frontend directory
cd ../..

# Sync Capacitor
npx cap sync ios
```

## Step 5: Open in Xcode

```bash
cd frontend
npm run ios:build
```

Or manually:
```bash
cd frontend/ios/App
open App.xcworkspace
```

**Important:** Always open `App.xcworkspace`, NOT `App.xcodeproj`

## Step 6: Configure Signing in Xcode

1. In Xcode, select the **App** project in the left sidebar
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (your Apple ID)
   - If you don't have one, use "Personal Team" for development
   - You may need to sign in with your Apple ID in Xcode preferences

## Step 7: Build and Run

1. Select a simulator from the device dropdown (top toolbar)
   - Recommended: iPhone 15 Pro or iPhone 15
2. Click the **▶️ Play** button (or press `Cmd+R`)
3. Wait for the build to complete
4. The app will launch in the simulator!

## Step 8: Test on Physical Device (Optional)

1. Connect your iPhone via USB
2. Trust the computer on your iPhone if prompted
3. In Xcode, select your device from the device dropdown
4. You may need to:
   - Register your device in Xcode (Window → Devices and Simulators)
   - Trust your developer certificate on the device (Settings → General → VPN & Device Management)
5. Click **▶️ Play** to build and run on your device

## Troubleshooting

### "Code signing" errors
- Make sure you've selected a Team in Signing & Capabilities
- Use "Personal Team" for development (free)
- Make sure your Apple ID is signed in (Xcode → Settings → Accounts)

### "No such module 'Capacitor'" error
- Run `pod install` again in `frontend/ios/App`
- Make sure you opened `App.xcworkspace`, not `App.xcodeproj`

### Build fails with "Command PhaseScriptExecution failed"
- Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Rebuild

### App crashes on launch
- Check the Xcode console for error messages
- Make sure the backend API is running and accessible
- Check network permissions in Info.plist

### Pod install fails
- Make sure Xcode is installed and configured
- Set encoding: `export LANG=en_US.UTF-8`
- Try: `pod repo update` then `pod install`

## Next Steps After App Runs

1. **Test all features:**
   - Login/Register
   - Dashboard
   - FPL team linking
   - Notifications (if configured)

2. **Configure App Icons:**
   - Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Use https://www.appicon.co/ to generate all required sizes

3. **Configure App Info:**
   - Update app name, bundle ID in Xcode
   - Set version and build number

4. **Test Push Notifications:**
   - Configure APNs certificates
   - Test on physical device (notifications don't work on simulator)

5. **Prepare for App Store:**
   - Create App Store Connect account
   - Generate app screenshots
   - Prepare app description
   - Submit for review

## Quick Reference Commands

```bash
# Build and sync
cd frontend
npm run build
npx cap sync ios

# Open in Xcode
npm run ios:build

# Install pods (if needed)
cd ios/App
pod install

# Clean and rebuild
cd frontend
rm -rf .next
npm run build
npx cap sync ios
```

## Need Help?

- Check Capacitor docs: https://capacitorjs.com/docs/ios
- Xcode documentation: https://developer.apple.com/documentation/xcode
- iOS setup issues: Check the troubleshooting section above

Good luck with your iPhone app! 🚀📱










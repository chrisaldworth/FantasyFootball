# iOS App Setup Guide

## Prerequisites Completed ✅
- ✅ Xcode 16.2 installed
- ✅ Xcode Command Line Tools configured
- ✅ Xcode first launch completed

## Remaining Steps

### 1. Accept Xcode License

Open Terminal and run:
```bash
sudo xcodebuild -license accept
```
(You'll need to enter your password)

### 2. Install CocoaPods

CocoaPods is required for iOS dependencies. Install it using one of these methods:

**Option A: Using gem (requires password)**
```bash
sudo gem install cocoapods
```

**Option B: Using Homebrew (if you have it)**
```bash
brew install cocoapods
```

### 3. Sync iOS Project

Once CocoaPods is installed, sync the Capacitor project:

```bash
cd frontend
npm run build
npx cap sync ios
```

### 4. Open in Xcode

```bash
npm run ios:build
```

Or manually:
```bash
cd frontend/ios
open App.xcworkspace
```

### 5. Build & Run in Xcode

1. In Xcode, select a simulator or your connected iPhone
2. Click the ▶️ Play button to build and run
3. The app will launch on the simulator/device!

## Troubleshooting

### If CocoaPods installation fails:
- Make sure you have the latest Xcode command line tools: `xcode-select --install`
- Try using Homebrew: `brew install cocoapods`

### If you see "Code signing" errors:
- In Xcode, go to **Signing & Capabilities**
- Select your Apple Developer account (or use automatic signing)
- Or use "Personal Team" for development

### If the app won't build:
- Make sure you've run `npm run build` first
- Run `npx cap sync ios` to update native project

## Next Steps

After the app runs successfully:
1. Configure app icons and splash screens
2. Test push notifications on device
3. Prepare for App Store submission


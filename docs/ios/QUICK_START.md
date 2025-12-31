# iOS App - Quick Start Guide

## ✅ Setup Complete!

Your iOS app setup is almost done. Just one command left!

## 🚀 Final Step

Run this script to configure Xcode (it will prompt for your password):

```bash
./scripts/setup_xcode_ios.sh
```

Or manually:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

## 📱 Open in Xcode

Xcode should already be opening! If not:

```bash
cd frontend/ios/App
open App.xcworkspace
```

**Important:** Always open `App.xcworkspace`, NOT `App.xcodeproj`

## ⚙️ Configure in Xcode

1. **Select Signing Team:**
   - Click "App" project in left sidebar
   - Select "App" target
   - Go to "Signing & Capabilities" tab
   - Check "Automatically manage signing"
   - Select your Team (Personal Team for development)

2. **Select Simulator:**
   - Choose iPhone 15 Pro from device dropdown (top toolbar)

3. **Build and Run:**
   - Press `Cmd+R` or click ▶️ Play button

## 🎉 That's It!

Your app should launch in the simulator! 

## 📚 What's Ready

- ✅ All dependencies installed
- ✅ Capacitor plugins configured
- ✅ iOS project synced
- ✅ CocoaPods installed
- ✅ Network security configured
- ✅ Push notification infrastructure ready

## 🐛 Troubleshooting

**"Code signing" errors:**
- Make sure you selected a Team in Signing & Capabilities
- Use "Personal Team" for development (free)
- Sign in to Apple ID: Xcode → Settings → Accounts

**Build fails:**
- Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- Rebuild

**App crashes:**
- Check Xcode console for errors
- Make sure backend is running (if testing locally)

Happy coding! 🚀



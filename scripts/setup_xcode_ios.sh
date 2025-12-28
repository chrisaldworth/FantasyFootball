#!/bin/bash

# iOS Xcode Setup Script
# This script configures Xcode command line tools for iOS development

set -e

echo "🔧 Configuring Xcode for iOS development..."
echo ""

# Check if Xcode is installed
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode is not installed!"
    echo "   Please install Xcode from the App Store first."
    exit 1
fi

echo "✅ Xcode found at /Applications/Xcode.app"
echo ""

# Configure xcode-select
echo "📝 Configuring xcode-select..."
echo "   (This will prompt for your password)"
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Accept Xcode license
echo ""
echo "📝 Accepting Xcode license..."
echo "   (This will prompt for your password)"
sudo xcodebuild -license accept || true

# Verify configuration
echo ""
echo "✅ Verifying configuration..."
xcode-select -p

echo ""
echo "🎉 Xcode is now configured!"
echo ""
echo "Next steps:"
echo "1. Open Xcode (should already be open)"
echo "2. Select your signing team in Signing & Capabilities"
echo "3. Choose a simulator (iPhone 15 Pro recommended)"
echo "4. Press Cmd+R to build and run!"
echo ""


#!/bin/bash
# Xcode Setup Script for iOS Development
# Run this script to configure Xcode for iOS app development

echo "🔧 Configuring Xcode for iOS Development..."
echo ""

# Check if Xcode is installed
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode is not installed!"
    echo "Please install Xcode from the App Store first."
    exit 1
fi

echo "✅ Xcode found at /Applications/Xcode.app"
echo ""

# Configure xcode-select
echo "📝 Setting Xcode as active developer directory..."
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

if [ $? -eq 0 ]; then
    echo "✅ Xcode developer directory configured"
else
    echo "❌ Failed to configure Xcode (you may need to enter your password)"
    exit 1
fi

# Accept Xcode license
echo ""
echo "📝 Accepting Xcode license..."
sudo xcodebuild -license accept

if [ $? -eq 0 ]; then
    echo "✅ Xcode license accepted"
else
    echo "❌ Failed to accept license"
    exit 1
fi

# Verify installation
echo ""
echo "🔍 Verifying Xcode installation..."
xcodebuild -version

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Xcode is properly configured!"
    echo ""
    echo "Next steps:"
    echo "1. Run: cd frontend && export LANG=en_US.UTF-8 && npx cap sync ios"
    echo "2. Run: npm run ios:build"
    echo "3. Configure signing in Xcode"
    echo "4. Build and run on simulator!"
else
    echo "❌ Xcode verification failed"
    exit 1
fi


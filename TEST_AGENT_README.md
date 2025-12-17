# Test Agent - Automated Testing System

An automated testing agent that ensures all changes to the Fantasy Football app are tested, with a focus on iOS app testing.

## 🎯 Overview

The Test Agent automatically runs tests when you make changes to the codebase. It covers:
- **iOS App Tests** - UI and functionality tests
- **Backend API Tests** - Endpoint validation
- **Frontend Build Tests** - Build verification

## 🚀 Quick Start

### Run All Tests
```bash
./test_agent.sh
```

### Run Specific Test Suite
```bash
# iOS tests only
./test_agent.sh ios

# Backend tests only
./test_agent.sh backend

# Frontend build tests only
./test_agent.sh frontend
```

### Watch Mode (Auto-test on changes)
```bash
./test_agent.sh watch
```

## 📱 iOS Testing

### Prerequisites
- Xcode installed
- iOS Simulator available
- Backend running on `localhost:8080`

### Running iOS Tests

#### Option 1: Using Test Agent
```bash
./test_agent.sh ios
```

#### Option 2: Using Xcode
1. Open `frontend/ios/App/App.xcworkspace` in Xcode
2. Select a simulator (iPhone 15 Pro recommended)
3. Press `Cmd+U` to run tests
4. Or use Product → Test

#### Option 3: Command Line
```bash
cd frontend/ios/App
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  test
```

### iOS Test Files

- **`App/AppTests.swift`** - Unit tests and basic functionality tests
- **`App/UITests.swift`** - UI interaction tests

### What iOS Tests Cover

✅ **App Launch**
- Verifies app launches successfully
- Checks main UI elements exist

✅ **Navigation**
- Tests navigation between screens
- Verifies login/dashboard flows

✅ **API Connection**
- Tests backend connectivity
- Validates API endpoints work

✅ **Authentication**
- Tests login screen elements
- Validates authentication flow

✅ **Error Handling**
- Ensures app handles errors gracefully
- No crashes on invalid input

✅ **Performance**
- Measures app launch time
- Performance benchmarks

✅ **Accessibility**
- Basic accessibility checks
- Ensures UI is accessible

## 🔧 Backend Testing

### Prerequisites
- Backend running on `localhost:8080`
- Database accessible

### Running Backend Tests
```bash
./test_agent.sh backend
```

### What Backend Tests Cover

✅ **Health Check**
- `/health` endpoint responds

✅ **Authentication**
- Register endpoint works
- Login endpoint works
- Token generation works

✅ **Football API**
- Football data endpoints accessible
- API configuration valid

## 🎨 Frontend Testing

### Running Frontend Tests
```bash
./test_agent.sh frontend
```

### What Frontend Tests Cover

✅ **Build Verification**
- TypeScript compiles
- No build errors
- All pages generate correctly

## 👀 Watch Mode

Watch mode automatically runs tests when files change:

```bash
./test_agent.sh watch
```

### Requirements
- `fswatch` (install with `brew install fswatch`)
- Falls back to polling if `fswatch` not available

### What It Watches
- `frontend/src/` - Frontend source code
- `backend/app/` - Backend source code
- `frontend/ios/` - iOS project files

## 📝 Adding New Tests

### iOS Tests

1. **Unit Tests** - Add to `App/AppTests.swift`:
```swift
func testMyNewFeature() throws {
    // Your test code
    XCTAssertTrue(someCondition, "Test description")
}
```

2. **UI Tests** - Add to `App/UITests.swift`:
```swift
func testMyNewUIFeature() throws {
    // Your UI test code
    let button = app.buttons["My Button"]
    button.tap()
    XCTAssertTrue(app.waitForExistence(timeout: 2))
}
```

### Backend Tests

Add API endpoint tests to `test_agent.sh` in the `test_backend()` function:

```bash
# Test your new endpoint
if curl -s "$BACKEND_URL/api/your-endpoint" | grep -q "expected"; then
    print_success "Your endpoint: OK"
else
    print_error "Your endpoint: FAILED"
    failed=1
fi
```

## 🔍 Test Results

### Success Output
```
✅ Backend is running at http://localhost:8080
✅ Health endpoint: OK
✅ Register endpoint: OK
✅ Login endpoint: OK
✅ All backend tests passed!
```

### Failure Output
```
❌ Backend is not running at http://localhost:8080
ℹ️  Start backend with: cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8080
```

### Log Files
- iOS tests: `/tmp/ios_test_output.log`
- Frontend build: `/tmp/frontend_build.log`

## 🛠️ Troubleshooting

### iOS Tests Fail

**Problem:** `xcodebuild` not found
```bash
# Solution: Set developer directory
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
```

**Problem:** Simulator not available
```bash
# Solution: List available simulators
xcrun simctl list devices

# Or open Xcode and create a simulator
```

**Problem:** Build errors
```bash
# Solution: Clean and rebuild
cd frontend/ios/App
pod install
# Then rebuild in Xcode
```

### Backend Tests Fail

**Problem:** Backend not running
```bash
# Solution: Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8080
```

**Problem:** Port already in use
```bash
# Solution: Find and kill process
lsof -i :8080
kill -9 <PID>
```

### Watch Mode Not Working

**Problem:** `fswatch` not found
```bash
# Solution: Install fswatch
brew install fswatch
```

## 📊 Test Coverage Goals

### Current Coverage
- ✅ iOS app launch and basic UI
- ✅ Backend health and auth endpoints
- ✅ Frontend build verification

### Planned Coverage
- [ ] Full iOS UI flow tests
- [ ] Backend API comprehensive tests
- [ ] Frontend component tests
- [ ] Integration tests
- [ ] Performance benchmarks
- [ ] Accessibility compliance

## 🎯 Best Practices

1. **Run tests before committing**
   ```bash
   ./test_agent.sh
   ```

2. **Use watch mode during development**
   ```bash
   ./test_agent.sh watch
   ```

3. **Add tests for new features**
   - iOS: Add to `AppTests.swift` or `UITests.swift`
   - Backend: Add to `test_agent.sh`

4. **Keep tests fast**
   - Unit tests should be < 1 second
   - UI tests should be < 10 seconds

5. **Test error cases**
   - Invalid input
   - Network failures
   - Missing data

## 🔗 Related Documentation

- [iOS App Setup](IOS_APP_SETUP.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Xcode Testing Guide](https://developer.apple.com/documentation/xctest)

## 💡 Tips

- Run `./test_agent.sh watch` in a separate terminal while developing
- Check test logs in `/tmp/` for detailed error messages
- Use Xcode's test navigator (Cmd+6) to run individual tests
- Add `XCTAssert` statements with descriptive messages

---

**Happy Testing! 🧪**


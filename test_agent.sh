#!/bin/bash
# Test Agent - Automated Testing for Fantasy Football App
# Runs tests automatically when changes are detected
# Focus: iOS App Testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_PROJECT="$PROJECT_ROOT/frontend/ios/App"
BACKEND_URL="http://localhost:8080"
TEST_MODE="${1:-all}" # all, ios, backend, frontend, watch

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if backend is running
check_backend() {
    print_info "Checking backend health..."
    if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_success "Backend is running at $BACKEND_URL"
        return 0
    else
        print_error "Backend is not running at $BACKEND_URL"
        print_info "Start backend with: cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8080"
        return 1
    fi
}

# Run iOS tests
test_ios() {
    print_header "Running iOS App Tests"
    
    if [ ! -d "$IOS_PROJECT" ]; then
        print_error "iOS project not found at $IOS_PROJECT"
        return 1
    fi
    
    # Check if Xcode is available
    if ! command -v xcodebuild &> /dev/null; then
        print_error "xcodebuild not found. Xcode is required for iOS tests."
        return 1
    fi
    
    cd "$IOS_PROJECT"
    
    # Check if workspace exists
    if [ ! -f "App.xcworkspace/contents.xcworkspacedata" ]; then
        print_error "Xcode workspace not found"
        return 1
    fi
    
    print_info "Building iOS app for testing..."
    
    # Set developer directory if needed
    export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
    export LANG=en_US.UTF-8
    
    # Build and test
    if xcodebuild \
        -workspace App.xcworkspace \
        -scheme App \
        -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
        -configuration Debug \
        clean build test 2>&1 | tee /tmp/ios_test_output.log; then
        print_success "iOS tests passed!"
        return 0
    else
        print_error "iOS tests failed. Check /tmp/ios_test_output.log for details."
        return 1
    fi
}

# Run backend API tests
test_backend() {
    print_header "Running Backend API Tests"
    
    if ! check_backend; then
        return 1
    fi
    
    print_info "Testing backend endpoints..."
    
    local failed=0
    
    # Test health endpoint
    if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
        print_success "Health endpoint: OK"
    else
        print_error "Health endpoint: FAILED"
        failed=1
    fi
    
    # Test auth endpoints
    print_info "Testing authentication endpoints..."
    
    # Test register endpoint (should work)
    local register_response=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","username":"testuser","password":"testpass123"}')
    
    if echo "$register_response" | grep -q "email\|id"; then
        print_success "Register endpoint: OK"
    else
        print_error "Register endpoint: FAILED"
        failed=1
    fi
    
    # Test login endpoint
    local login_response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=test@test.com&password=testpass123")
    
    if echo "$login_response" | grep -q "access_token"; then
        print_success "Login endpoint: OK"
    else
        print_error "Login endpoint: FAILED"
        failed=1
    fi
    
    # Test football endpoints
    print_info "Testing football data endpoints..."
    
    if curl -s "$BACKEND_URL/api/football/test" > /dev/null; then
        print_success "Football API test endpoint: OK"
    else
        print_error "Football API test endpoint: FAILED"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        print_success "All backend tests passed!"
        return 0
    else
        print_error "Some backend tests failed"
        return 1
    fi
}

# Run frontend build test
test_frontend() {
    print_header "Running Frontend Build Tests"
    
    cd "$PROJECT_ROOT/frontend"
    
    print_info "Building frontend..."
    if npm run build > /tmp/frontend_build.log 2>&1; then
        print_success "Frontend build: OK"
        return 0
    else
        print_error "Frontend build: FAILED"
        cat /tmp/frontend_build.log | tail -20
        return 1
    fi
}

# Watch for changes and run tests
watch_mode() {
    print_header "Test Agent - Watch Mode"
    print_info "Watching for file changes. Press Ctrl+C to stop."
    print_info "Tests will run automatically when files change."
    
    # Check if fswatch is installed
    if ! command -v fswatch &> /dev/null; then
        print_error "fswatch not found. Install with: brew install fswatch"
        print_info "Falling back to polling mode..."
        watch_polling
        return
    fi
    
    # Watch for changes
    fswatch -o "$PROJECT_ROOT/frontend/src" "$PROJECT_ROOT/backend/app" "$PROJECT_ROOT/frontend/ios" | while read; do
        echo ""
        print_info "Change detected. Running tests..."
        run_all_tests
    done
}

# Polling-based watch (fallback)
watch_polling() {
    local last_check=$(find "$PROJECT_ROOT/frontend/src" "$PROJECT_ROOT/backend/app" -type f -exec stat -f "%m" {} \; | sort -n | tail -1)
    
    while true; do
        sleep 2
        local current_check=$(find "$PROJECT_ROOT/frontend/src" "$PROJECT_ROOT/backend/app" -type f -exec stat -f "%m" {} \; | sort -n | tail -1)
        
        if [ "$current_check" != "$last_check" ]; then
            echo ""
            print_info "Change detected. Running tests..."
            last_check=$current_check
            run_all_tests
        fi
    done
}

# Run all tests
run_all_tests() {
    local failed=0
    
    if [ "$TEST_MODE" = "all" ] || [ "$TEST_MODE" = "backend" ]; then
        if ! test_backend; then
            failed=1
        fi
    fi
    
    if [ "$TEST_MODE" = "all" ] || [ "$TEST_MODE" = "frontend" ]; then
        if ! test_frontend; then
            failed=1
        fi
    fi
    
    if [ "$TEST_MODE" = "all" ] || [ "$TEST_MODE" = "ios" ]; then
        if ! test_ios; then
            failed=1
        fi
    fi
    
    if [ $failed -eq 0 ]; then
        print_success "All tests passed! 🎉"
    else
        print_error "Some tests failed"
    fi
    
    return $failed
}

# Main execution
main() {
    print_header "Test Agent - Fantasy Football App"
    echo ""
    print_info "Mode: $TEST_MODE"
    print_info "Project: $PROJECT_ROOT"
    echo ""
    
    case "$TEST_MODE" in
        watch)
            watch_mode
            ;;
        ios)
            test_ios
            ;;
        backend)
            test_backend
            ;;
        frontend)
            test_frontend
            ;;
        all)
            run_all_tests
            ;;
        *)
            echo "Usage: $0 [all|ios|backend|frontend|watch]"
            echo ""
            echo "Modes:"
            echo "  all      - Run all tests (default)"
            echo "  ios      - Run iOS app tests only"
            echo "  backend  - Run backend API tests only"
            echo "  frontend - Run frontend build tests only"
            echo "  watch    - Watch for changes and run tests automatically"
            exit 1
            ;;
    esac
}

# Run main
main "$@"


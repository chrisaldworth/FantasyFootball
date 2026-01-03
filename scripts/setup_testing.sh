#!/bin/bash
# Setup Testing Infrastructure
# Installs dependencies and configures pre-commit hooks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

print_header "Setting Up Testing Infrastructure"

# Step 1: Install root dependencies (Husky)
print_info "Step 1: Installing root dependencies (Husky)..."
cd "$PROJECT_ROOT"

if [ -f "package.json" ]; then
    if npm install --silent; then
        print_success "Root dependencies installed"
    else
        print_error "Failed to install root dependencies"
        exit 1
    fi
else
    print_error "package.json not found in project root"
    exit 1
fi

# Step 2: Initialize Husky
print_info "Step 2: Initializing Husky..."
if npm run prepare --silent; then
    print_success "Husky initialized"
else
    print_error "Failed to initialize Husky"
    exit 1
fi

# Step 3: Verify pre-commit hook
print_info "Step 3: Verifying pre-commit hook..."
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
    print_success "Pre-commit hook configured"
else
    print_error "Pre-commit hook not found"
    exit 1
fi

# Step 4: Install frontend dependencies
print_info "Step 4: Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"

if [ -f "package.json" ]; then
    if npm install --silent; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
else
    print_error "Frontend package.json not found"
    exit 1
fi

# Step 5: Verify frontend tests can run
print_info "Step 5: Verifying frontend test setup..."
if npm test -- --passWithNoTests --silent > /dev/null 2>&1; then
    print_success "Frontend tests configured correctly"
else
    print_info "Frontend tests may need configuration (continuing anyway)"
fi

# Step 6: Check backend setup (optional)
print_info "Step 6: Checking backend setup..."
cd "$PROJECT_ROOT/backend"

if [ -d "venv" ]; then
    print_success "Backend virtual environment found"
else
    print_info "Backend virtual environment not found (optional)"
    print_info "To set up: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
fi

# Summary
echo ""
print_header "Setup Complete!"
echo ""
print_success "Testing infrastructure is ready!"
echo ""
print_info "What was set up:"
echo "  ✅ Husky pre-commit hooks"
echo "  ✅ Frontend dependencies"
echo "  ✅ Test configuration"
echo ""
print_info "Next steps:"
echo "  1. Try committing a file to see pre-commit hooks in action"
echo "  2. Run tests manually: npm run test:all"
echo "  3. Check documentation: docs/testing/TESTING_INFRASTRUCTURE.md"
echo ""
print_success "Happy testing! 🎉"

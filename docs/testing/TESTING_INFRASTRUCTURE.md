# Testing Infrastructure

**Last Updated**: 2025-12-19  
**Status**: ✅ **Fully Configured**

---

## Overview

This project has a comprehensive testing infrastructure that ensures code quality before commits and deployments. Tests are automatically run at multiple stages:

1. **Pre-commit** - Tests run before every commit (via Husky)
2. **CI/CD** - Tests run on every push/PR (via GitHub Actions)
3. **Manual** - Tests can be run manually at any time

---

## Testing Flow

```
Developer makes changes
         ↓
    git add <files>
         ↓
    git commit
         ↓
┌────────────────────────┐
│  Pre-commit Hook       │ ← Runs automatically
│  (Husky)               │
│  - Linting             │
│  - Unit Tests          │
│  - Build Tests         │
└────────────────────────┘
         ↓
    ✅ Pass → Commit succeeds
    ❌ Fail → Commit blocked
         ↓
    git push
         ↓
┌────────────────────────┐
│  GitHub Actions        │ ← Runs automatically
│  - Backend Tests       │
│  - Frontend Tests      │
│  - iOS Tests           │
└────────────────────────┘
         ↓
    ✅ Pass → PR can be merged
    ❌ Fail → PR blocked
```

---

## Pre-commit Hooks (Husky)

### Setup

Pre-commit hooks are automatically set up when you install dependencies:

```bash
# Install root dependencies (includes Husky)
npm install

# Or manually initialize Husky
npm run prepare
```

### What Runs on Pre-commit

The pre-commit hook (`/.husky/pre-commit`) automatically:

1. **Detects changed files** - Determines which tests to run based on staged files
2. **Runs linting** - Checks code style and catches errors
3. **Runs unit tests** - Executes relevant test suites
4. **Blocks commit if tests fail** - Prevents committing broken code

### Test Selection Logic

The pre-commit hook intelligently selects which tests to run:

- **Frontend files changed** (`frontend/*`) → Runs frontend linting + unit tests
- **Backend files changed** (`backend/*`) → Runs backend tests (if venv exists)
- **iOS files changed** (`frontend/ios/*`) → Runs iOS tests
- **No specific match** → Runs frontend + backend tests (default)

### Skipping Pre-commit Hooks

**⚠️ Not Recommended** - Only use in emergencies:

```bash
git commit --no-verify
```

---

## CI/CD Testing (GitHub Actions)

### Workflow File

Location: `.github/workflows/test.yml`

### What Runs on Push/PR

The GitHub Actions workflow runs three parallel test jobs:

#### 1. Backend Tests
- Sets up Python 3.11
- Installs dependencies
- Starts backend server
- Runs backend API tests

#### 2. Frontend Tests
- Sets up Node.js 20
- Installs dependencies
- Runs frontend unit tests (Jest)
- Runs frontend build test
- Runs frontend integration tests

#### 3. iOS Tests
- Sets up Xcode (macOS only)
- Installs CocoaPods
- Syncs Capacitor
- Builds and tests iOS app

### Viewing Test Results

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select the workflow run
4. View individual job results

---

## Manual Testing

### Run All Tests

```bash
# Using test agent script
./scripts/test_agent.sh all

# Or using npm script
npm run test:all
```

### Run Specific Test Suites

```bash
# Frontend only
cd frontend && npm test

# Backend only
cd backend && source venv/bin/activate && pytest tests/

# iOS only
./scripts/test_agent.sh ios
```

### Run Tests in Watch Mode

```bash
# Watch for changes and auto-test
./scripts/test_agent.sh watch
```

---

## Test Suites

### Frontend Tests

**Framework**: Jest + React Testing Library  
**Location**: `frontend/src/**/__tests__/**/*.test.tsx`  
**Config**: `frontend/jest.config.js`

**Run**:
```bash
cd frontend
npm test
```

**Coverage**:
- Component rendering
- User interactions
- API mocking
- Accessibility
- Edge cases

### Backend Tests

**Framework**: pytest  
**Location**: `backend/tests/`  
**Config**: `backend/pytest.ini` (if exists)

**Run**:
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

**Coverage**:
- API endpoints
- Authentication
- Data validation
- Error handling

### iOS Tests

**Framework**: XCTest  
**Location**: `frontend/ios/App/AppTests/`  
**Config**: Xcode project settings

**Run**:
```bash
./scripts/test_agent.sh ios
```

**Coverage**:
- App launch
- Navigation
- API connectivity
- UI interactions

---

## Test Configuration

### Frontend Jest Config

File: `frontend/jest.config.js`

Key settings:
- Test environment: `jsdom`
- Module mapping: `@/` → `src/`
- Coverage collection enabled
- Setup file: `jest.setup.js`

### Pre-commit Hook Config

File: `.husky/pre-commit`

Key features:
- Intelligent test selection
- Fast linting first
- Detailed error output
- Skip option for missing dependencies

### GitHub Actions Config

File: `.github/workflows/test.yml`

Key features:
- Parallel job execution
- Automatic dependency installation
- Backend server startup
- Comprehensive error reporting

---

## Troubleshooting

### Pre-commit Hook Not Running

**Problem**: Hooks not executing on commit

**Solution**:
```bash
# Reinstall Husky
npm run prepare

# Verify hook exists
ls -la .husky/pre-commit

# Make sure it's executable
chmod +x .husky/pre-commit
```

### Tests Failing in Pre-commit

**Problem**: Tests pass locally but fail in pre-commit

**Common Causes**:
1. **Missing dependencies** - Run `npm install` in frontend/
2. **Missing venv** - Set up backend virtual environment
3. **Stale cache** - Clear Jest cache: `cd frontend && npm test -- --clearCache`

**Solution**:
```bash
# Frontend
cd frontend && npm install && npm test

# Backend
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

### GitHub Actions Failing

**Problem**: CI tests failing but local tests pass

**Common Causes**:
1. **Environment differences** - CI uses clean environment
2. **Missing dependencies** - Check `package.json` and `requirements.txt`
3. **Backend not starting** - Check backend startup logs

**Solution**:
1. Check GitHub Actions logs for specific errors
2. Reproduce locally in clean environment
3. Verify all dependencies are listed in package files

### Skipping Tests Temporarily

**⚠️ Use with caution** - Only for emergencies:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip CI (add to commit message)
git commit -m "WIP: skip ci"
```

---

## Best Practices

### 1. Write Tests First (TDD)
- Write tests before implementing features
- Tests should fail initially, then pass after implementation

### 2. Keep Tests Fast
- Pre-commit hooks should complete in < 30 seconds
- Use `--bail` flag to stop on first failure
- Mock external dependencies

### 3. Test Coverage
- Aim for > 80% code coverage
- Focus on critical paths
- Test edge cases and error handling

### 4. Commit Frequently
- Small commits are easier to debug
- Pre-commit hooks catch issues early
- Don't accumulate broken code

### 5. Fix Failing Tests Immediately
- Don't commit with failing tests
- Fix or skip (with reason) before committing
- Update tests when changing code

---

## Test Commands Reference

### Root Level

```bash
# Run all tests
npm run test:all

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Lint frontend
npm run lint

# Fix linting issues
npm run lint:fix
```

### Frontend

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific test file
npm test FavoriteTeamSelector
```

### Backend

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest tests/

# Verbose output
pytest tests/ -v

# Specific test file
pytest tests/test_auth.py

# Coverage
pytest tests/ --cov=app
```

### Test Agent Script

```bash
# All tests
./scripts/test_agent.sh all

# Specific suite
./scripts/test_agent.sh frontend
./scripts/test_agent.sh backend
./scripts/test_agent.sh ios

# Watch mode
./scripts/test_agent.sh watch
```

---

## Summary

✅ **Pre-commit hooks** - Automatically run tests before commits  
✅ **CI/CD pipeline** - Automatically run tests on push/PR  
✅ **Manual testing** - Run tests anytime with simple commands  
✅ **Intelligent selection** - Only runs relevant tests  
✅ **Fast feedback** - Linting runs first, then tests  
✅ **Comprehensive coverage** - Frontend, backend, and iOS tests  

**Status**: 🟢 **Fully Operational**

---

## Next Steps

1. **Install dependencies**: `npm install` (sets up Husky)
2. **Verify hooks**: Try committing to see pre-commit in action
3. **Write tests**: Add tests for new features
4. **Monitor CI**: Check GitHub Actions for test results

---

**Questions?** Check the [Test Agent README](./TEST_AGENT_README.md) or [AI Test Agent README](./AI_TEST_AGENT_README.md) for more details.

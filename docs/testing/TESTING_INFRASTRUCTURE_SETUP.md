# Testing Infrastructure Setup Guide

**Quick Start**: Run `./scripts/setup_testing.sh` to automatically set up everything.

---

## Manual Setup

### 1. Install Root Dependencies

```bash
# Install Husky and root-level scripts
npm install
```

This will:
- Install Husky (git hooks manager)
- Run `npm run prepare` to initialize Husky
- Set up pre-commit hooks

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Verify Setup

```bash
# Check if pre-commit hook exists
ls -la .husky/pre-commit

# Test frontend tests
cd frontend && npm test -- --passWithNoTests

# Test pre-commit hook (dry run)
git add .husky/pre-commit
git commit -m "test: verify pre-commit hook"
```

---

## Verification Checklist

- [ ] Root `package.json` exists with Husky dependency
- [ ] `.husky/pre-commit` file exists and is executable
- [ ] Frontend `node_modules` installed
- [ ] Frontend tests can run: `cd frontend && npm test -- --passWithNoTests`
- [ ] Pre-commit hook runs on commit attempt

---

## Troubleshooting

### Husky Not Installing

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
npm run prepare
```

### Pre-commit Hook Not Running

```bash
# Make sure hook is executable
chmod +x .husky/pre-commit

# Reinitialize Husky
npm run prepare
```

### Frontend Tests Not Running

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm test -- --passWithNoTests
```

---

## What Gets Set Up

1. **Husky** - Git hooks manager
2. **Pre-commit hook** - Runs tests before commits
3. **Test scripts** - Root-level npm scripts for testing
4. **CI/CD** - GitHub Actions workflow (already configured)

---

**Status**: ✅ Ready to use after running setup script

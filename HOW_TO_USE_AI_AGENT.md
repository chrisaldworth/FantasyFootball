# How to Use Your AI Test Agent

A simple guide to using the AI-powered test agent.

## 🚀 Basic Usage

### 1. Run Tests on All Changes

After making changes to your code, run:

```bash
python3 ai_test_agent.py test
```

This will:
- Analyze what changed
- Determine which tests to run
- Run the relevant tests
- Provide AI suggestions if tests fail

### 2. Test Specific Files

If you want to test specific files you just changed:

```bash
python3 ai_test_agent.py test --files backend/app/api/auth.py
```

Or multiple files:

```bash
python3 ai_test_agent.py test --files backend/app/api/auth.py frontend/src/lib/api.ts
```

### 3. Watch Mode (Auto-Test While Coding)

Start watch mode to automatically test when you save files:

```bash
python3 ai_test_agent.py watch
```

Then just code normally - tests run automatically when you save!

Press `Ctrl+C` to stop watching.

### 4. Analyze Without Testing

See what tests would run for specific files:

```bash
python3 ai_test_agent.py analyze --files backend/app/api/auth.py
```

## 📝 Real-World Examples

### Example 1: You Changed iOS Code

```bash
# You edited: frontend/ios/App/App/AppDelegate.swift

# Run the agent
python3 ai_test_agent.py test --files frontend/ios/App/App/AppDelegate.swift
```

**Output:**
```
📊 Analyzing 1 changed file(s)...
  frontend/ios/App/App/AppDelegate.swift: iOS code change detected (Priority: high)

🎯 Test Plan: ios

🧪 Running ios tests...
✅ ios tests passed
```

### Example 2: You Changed Backend API

```bash
# You edited: backend/app/api/auth.py

# Run the agent
python3 ai_test_agent.py test --files backend/app/api/auth.py
```

**Output:**
```
📊 Analyzing 1 changed file(s)...
  backend/app/api/auth.py: Backend code change detected (Priority: high)

🎯 Test Plan: backend, frontend

🧪 Running backend tests...
✅ backend tests passed

🧪 Running frontend tests...
✅ frontend tests passed
```

### Example 3: You Changed Frontend Code

```bash
# You edited: frontend/src/lib/api.ts

# Run the agent
python3 ai_test_agent.py test --files frontend/src/lib/api.ts
```

**Output:**
```
📊 Analyzing 1 changed file(s)...
  frontend/src/lib/api.ts: Frontend code change detected (Priority: medium)

🎯 Test Plan: frontend, ios

🧪 Running frontend tests...
✅ frontend tests passed

🧪 Running ios tests...
✅ ios tests passed
```

### Example 4: Watch Mode During Development

```bash
# Start watch mode
python3 ai_test_agent.py watch
```

Then edit any file - tests run automatically:

```
👀 AI Test Agent - Watch Mode
Watching for changes... (Press Ctrl+C to stop)

📝 Change detected: backend/app/api/auth.py
📊 Analyzing 1 changed file(s)...
🎯 Test Plan: backend, frontend
🧪 Running backend tests...
✅ backend tests passed
```

## 🎯 Common Workflows

### Workflow 1: Before Committing Code

```bash
# Test everything before committing
python3 ai_test_agent.py test
```

### Workflow 2: While Developing

```bash
# Terminal 1: Start watch mode
python3 ai_test_agent.py watch

# Terminal 2: Code normally
# Tests run automatically when you save!
```

### Workflow 3: After Making Changes

```bash
# You just changed some files, test them:
python3 ai_test_agent.py test --files file1.py file2.ts
```

### Workflow 4: Check What Would Be Tested

```bash
# Before running tests, see what would run:
python3 ai_test_agent.py analyze --files backend/app/api/auth.py
```

## 🤖 Using AI Features (Optional)

### Enable AI for Better Suggestions

1. **Get an API key:**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. **Set the API key:**
   ```bash
   export OPENAI_API_KEY=your_key_here
   # OR
   export ANTHROPIC_API_KEY=your_key_here
   ```

3. **Install the library:**
   ```bash
   pip install openai
   # OR
   pip install anthropic
   ```

4. **Use as normal:**
   ```bash
   python3 ai_test_agent.py test
   ```

Now when tests fail, you'll get AI-powered suggestions!

**Example with AI:**
```
❌ backend tests failed

🤖 Analyzing failures with AI...

💡 AI Suggestions:
1. Root cause: Timeout error in Playwright login
2. Specific fixes:
   - Increase timeout from 30s to 60s
   - Change wait condition from 'networkidle' to 'load'
3. Prevention: Add connection health checks
```

## 🔧 Troubleshooting

### "Command not found"
```bash
# Make sure you're in the project root
cd /Users/chrisaldworth/Football/FantasyFootball

# Use python3 explicitly
python3 ai_test_agent.py test
```

### "OpenAI not available"
This is fine! The agent works without AI, just with basic analysis.

To enable AI:
```bash
pip install openai
export OPENAI_API_KEY=your_key
```

### Watch mode not detecting changes
```bash
# Install watchdog for better file watching
pip install watchdog
```

### Tests timing out
The agent has a 5-minute timeout per test suite. If you need more:
- Edit `ai_test_agent.py`
- Find `timeout=300`
- Change to `timeout=600` (10 minutes)

## 💡 Pro Tips

1. **Use watch mode during development** - It's like having a test assistant watching your code!

2. **Run before committing** - Catch issues early:
   ```bash
   python3 ai_test_agent.py test
   ```

3. **Test specific files** - Faster than testing everything:
   ```bash
   python3 ai_test_agent.py test --files file1.py file2.ts
   ```

4. **Enable AI for complex failures** - Get intelligent suggestions instead of just error logs

5. **Combine with git** - Test only changed files:
   ```bash
   python3 ai_test_agent.py test --files $(git diff --name-only)
   ```

## 📚 Quick Reference

```bash
# Basic commands
python3 ai_test_agent.py test                    # Test all
python3 ai_test_agent.py test --files file.py    # Test specific files
python3 ai_test_agent.py watch                   # Watch mode
python3 ai_test_agent.py analyze --files file.py # Analyze only

# With AI (optional)
export OPENAI_API_KEY=your_key
pip install openai
python3 ai_test_agent.py test                   # Now with AI!
```

## 🎯 What Gets Tested?

- **iOS changes** → iOS tests only
- **Backend changes** → Backend + Frontend tests
- **Frontend changes** → Frontend + iOS tests
- **Dependency changes** → All tests
- **No changes specified** → All tests

---

**That's it! Start using your AI test agent now! 🚀**










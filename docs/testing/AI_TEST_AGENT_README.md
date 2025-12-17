# AI Test Agent - Intelligent Automated Testing

An AI-powered test agent that intelligently analyzes code changes, determines which tests to run, and provides AI-generated suggestions for fixing failures.

## 🎯 Features

- **Intelligent Test Selection** - Only runs tests relevant to your changes
- **AI-Powered Analysis** - Uses AI to analyze failures and suggest fixes
- **Change Detection** - Automatically detects what changed and tests accordingly
- **Watch Mode** - Monitors files and runs tests automatically
- **Smart Suggestions** - Gets AI suggestions for fixing test failures

## 🚀 Quick Start

### Basic Usage

```bash
# Run intelligent tests (analyzes changes and runs relevant tests)
python3 ai_test_agent.py test

# Watch for changes and auto-test
python3 ai_test_agent.py watch

# Analyze specific files
python3 ai_test_agent.py analyze --files backend/app/api/auth.py frontend/src/lib/api.ts
```

### With AI Analysis (Recommended)

1. **Set up OpenAI** (optional but recommended):
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   pip install openai
   ```

2. **Or set up Anthropic Claude**:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   pip install anthropic
   ```

3. **Run with AI**:
   ```bash
   python3 ai_test_agent.py test
   ```

## 📋 How It Works

### 1. Change Analysis

The agent analyzes what files changed and determines:
- **Impact level**: iOS, backend, frontend, or dependencies
- **Tests needed**: Which test suites to run
- **Priority**: High, medium, or low

Example:
```
📊 Analyzing 2 changed file(s)...
  backend/app/api/auth.py: Backend code change detected (Priority: high)
  frontend/src/lib/api.ts: Frontend code change detected (Priority: medium)

🎯 Test Plan: backend, frontend, ios
```

### 2. Intelligent Test Execution

Only runs tests relevant to your changes:
- **iOS changes** → Runs iOS tests
- **Backend changes** → Runs backend + frontend tests (frontend depends on backend)
- **Frontend changes** → Runs frontend + iOS tests (iOS uses frontend code)
- **Dependency changes** → Runs all tests

### 3. AI-Powered Failure Analysis

When tests fail, the AI agent:
- Analyzes error logs
- Identifies root causes
- Suggests specific fixes
- Provides prevention strategies

Example output:
```
🤖 Analyzing failures with AI...

💡 AI Suggestions:
1. Root cause: Timeout error in Playwright login
2. Specific fixes:
   - Increase timeout from 30s to 60s
   - Change wait condition from 'networkidle' to 'load'
   - Add retry logic for network failures
3. Prevention: Add connection health checks before login
```

## 🎮 Modes

### Test Mode
Runs tests intelligently based on changes:

```bash
# Test all (if no changes specified)
python3 ai_test_agent.py test

# Test specific files
python3 ai_test_agent.py test --files backend/app/api/auth.py
```

### Watch Mode
Monitors files and runs tests automatically:

```bash
python3 ai_test_agent.py watch
```

Watches:
- `backend/app/` - Backend code
- `frontend/src/` - Frontend code  
- `frontend/ios/` - iOS code

### Analyze Mode
Analyzes files without running tests:

```bash
python3 ai_test_agent.py analyze --files backend/app/api/auth.py
```

Output:
```
backend/app/api/auth.py:
  Impact: backend
  Tests needed: backend, frontend
  Priority: high
  Reason: Backend code change detected
```

## 🤖 AI Providers

### OpenAI (Recommended)
```bash
export OPENAI_API_KEY=your_key
pip install openai
```

Uses GPT-4 for analysis.

### Anthropic Claude
```bash
export ANTHROPIC_API_KEY=your_key
pip install anthropic
```

Uses Claude Sonnet for analysis.

### No AI (Fallback)
Works without AI, but provides basic analysis only.

## 📊 Example Workflow

### Scenario 1: You change iOS code

```bash
# Edit a Swift file
vim frontend/ios/App/App/AppDelegate.swift

# Run AI agent
python3 ai_test_agent.py test --files frontend/ios/App/App/AppDelegate.swift
```

Output:
```
📊 Analyzing 1 changed file(s)...
  frontend/ios/App/App/AppDelegate.swift: iOS code change detected (Priority: high)

🎯 Test Plan: ios

🧪 Running ios tests...
✅ ios tests passed
```

### Scenario 2: You change backend API

```bash
# Edit backend code
vim backend/app/api/auth.py

# Run AI agent
python3 ai_test_agent.py test --files backend/app/api/auth.py
```

Output:
```
📊 Analyzing 1 changed file(s)...
  backend/app/api/auth.py: Backend code change detected (Priority: high)

🎯 Test Plan: backend, frontend

🧪 Running backend tests...
✅ backend tests passed

🧪 Running frontend tests...
❌ frontend tests failed

🤖 Analyzing failures with AI...

💡 AI Suggestions:
The frontend build failed because the API endpoint changed.
Update frontend/src/lib/api.ts to match the new endpoint signature.
```

### Scenario 3: Watch mode during development

```bash
# Start watch mode
python3 ai_test_agent.py watch
```

Then edit files - tests run automatically:
```
👀 AI Test Agent - Watch Mode
Watching for changes... (Press Ctrl+C to stop)

📝 Change detected: backend/app/api/auth.py
📊 Analyzing 1 changed file(s)...
🎯 Test Plan: backend, frontend
🧪 Running backend tests...
✅ backend tests passed
```

## 🔧 Configuration

### Environment Variables

```bash
# AI Provider (optional)
export OPENAI_API_KEY=your_key
# OR
export ANTHROPIC_API_KEY=your_key

# Project root (optional, defaults to script directory)
export PROJECT_ROOT=/path/to/project
```

### Customization

Edit `ai_test_agent.py` to:
- Adjust test timeouts
- Add custom test types
- Modify AI prompts
- Change watch directories

## 📝 Integration with Git

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
python3 ai_test_agent.py test --files $(git diff --cached --name-only)
```

### CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Run AI Test Agent
  run: |
    python3 ai_test_agent.py test
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 🎯 Best Practices

1. **Use watch mode during development**
   ```bash
   python3 ai_test_agent.py watch
   ```

2. **Run before committing**
   ```bash
   python3 ai_test_agent.py test
   ```

3. **Use AI for complex failures**
   - Set up OpenAI or Anthropic API key
   - Get intelligent suggestions for fixes

4. **Analyze before testing**
   ```bash
   python3 ai_test_agent.py analyze --files your_file.py
   ```

## 🐛 Troubleshooting

### AI not working
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Install dependencies
pip install openai  # or anthropic
```

### Watch mode not detecting changes
```bash
# Install watchdog
pip install watchdog
```

### Tests timing out
Edit `ai_test_agent.py` and increase timeout:
```python
timeout=600  # 10 minutes instead of 5
```

## 📚 Advanced Usage

### Custom Test Types

Add to `ai_test_agent.py`:

```python
def analyze_changes(self, file_path: str) -> Dict:
    # Your custom logic
    if 'custom' in str(file_path):
        return {
            'impact': 'custom',
            'tests': ['custom_tests'],
            'priority': 'high'
        }
```

### Custom AI Prompts

Modify the system prompt in `_get_openai_suggestion()` or `_get_anthropic_suggestion()`.

## 🔗 Related

- [Test Agent](TEST_AGENT_README.md) - Basic test agent (no AI)
- [iOS Testing](IOS_APP_SETUP.md) - iOS-specific testing
- [Development Guide](docs/DEVELOPMENT.md)

---

**Happy Testing with AI! 🤖🧪**


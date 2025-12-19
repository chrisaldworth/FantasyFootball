# Scripts Directory

Automation scripts for the Fantasy Football application.

## 📋 Available Scripts

### Test Agents

- **[test_agent.sh](test_agent.sh)** - Automated test runner
  - Runs iOS, backend, and frontend tests
  - Watch mode for auto-testing on changes
  - Usage: `./scripts/test_agent.sh [all|ios|backend|frontend|watch]`

- **[ai_test_agent.py](ai_test_agent.py)** - AI-powered test agent
  - Intelligent test selection based on changes
  - AI-powered failure analysis
  - Usage: `python3 scripts/ai_test_agent.py [test|watch|analyze]`

### Setup Scripts

- **[setup.sh](setup.sh)** - Automated project setup
  - Installs all dependencies
  - Configures environment
  - Usage: `./scripts/setup.sh`

- **[setup_xcode.sh](setup_xcode.sh)** - Xcode configuration
  - Configures Xcode for iOS development
  - Accepts license and sets developer directory
  - Usage: `./scripts/setup_xcode.sh`

## 🚀 Quick Usage

```bash
# Run all tests
./scripts/test_agent.sh

# Run iOS tests only
./scripts/test_agent.sh ios

# Watch for changes and auto-test
./scripts/test_agent.sh watch

# Use AI test agent
python3 scripts/ai_test_agent.py test

# Setup project
./scripts/setup.sh
```

## 📚 Documentation

- [Test Agent Guide](../docs/testing/TEST_AGENT_README.md)
- [AI Test Agent Guide](../docs/testing/AI_TEST_AGENT_README.md)
- [How to Use AI Agent](../docs/testing/HOW_TO_USE_AI_AGENT.md)










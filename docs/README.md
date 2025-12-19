# Documentation Index

Complete documentation for the Fantasy Football application.

---

## 📚 Documentation Structure

### 🚀 Getting Started
- **[Quick Start](setup/QUICK_START.md)** - Get running in 5 minutes
- **[Local Setup](setup/SETUP.md)** - Detailed setup instructions
- **[Setup Complete](setup/SETUP_COMPLETE.md)** - Post-setup verification

### 📱 iOS App Development
- **[iOS App Setup](ios/IOS_APP_SETUP.md)** - Complete iOS setup guide
- **[iOS Backend Connection](ios/IOS_BACKEND_CONNECTION.md)** - Connect iOS app to backend
- **[iOS Cloud Backend](ios/IOS_CLOUD_BACKEND_SETUP.md)** - Use cloud database
- **[iOS Next Steps](ios/IOS_NEXT_STEPS.md)** - After Xcode installation
- **[iOS Status](ios/IOS_STATUS.md)** - Current iOS setup status
- **[iOS Setup (Legacy)](ios/IOS_SETUP.md)** - Original iOS setup notes

### 🧪 Testing
- **[Test Agent Guide](testing/TEST_AGENT_README.md)** - Automated testing system
- **[AI Test Agent](testing/AI_TEST_AGENT_README.md)** - AI-powered testing
- **[How to Use AI Agent](testing/HOW_TO_USE_AI_AGENT.md)** - Quick usage guide

### 🚀 Deployment
- **[Deployment Environment Variables](deployment/DEPLOYMENT_ENV_VARS.md)** - Configure production
- **[API Setup Guide](deployment/API_SETUP_GUIDE.md)** - External API configuration

### 🔧 Development
- **[Development Guide](DEVELOPMENT.md)** - Development workflow and practices
- **[Notification Setup](NOTIFICATION_SETUP.md)** - Push notifications configuration
- **[FPL Login Troubleshooting](FPL_LOGIN_TROUBLESHOOTING.md)** - Fix login issues

### 🤖 Agents & Workflow
- **[Agent Workflow Guide](agents/WORKFLOW.md)** - Complete guide to agent workflow and automatic handoffs
- **Agent Definitions**: Located in `~/.cursor/agents/`
  - Product and Project Agent
  - UI Designer
  - Developer
  - Tester

### 📋 Project Documentation
- **[API Integration Spec](api-integration-spec.md)** - API integration specifications
- **[Business Objectives](business-objectives.md)** - Project goals and objectives
- **[Functional Requirements](functional-requirements.md)** - Feature requirements
- **[Technical Architecture](technical-architecture.md)** - System architecture
- **[MVP Roadmap](mvp-roadmap.md)** - Minimum viable product plan
- **[Monetisation Strategy](monetisation-strategy.md)** - Revenue model

### 📊 Phase 3: Analytics & Live Rank
- **[Phase 3 Requirements](phase3/phase3-requirements.md)** - Complete requirements
- **[Phase 3 Tickets](phase3/phase3-tickets.md)** - 8 Jira-ready tickets
- **[Phase 3 Status](phase3/phase3-status.md)** - Current implementation status
- **[Handoff to Tester](phase3/HANDOFF-TESTER.md)** - Testing instructions
- **[Current Tasks](phase3/current-tasks-summary.md)** - What needs to be done

---

## 🛠️ Scripts

All automation scripts are in the `scripts/` directory:

- **[test_agent.sh](../scripts/test_agent.sh)** - Automated test runner
- **[ai_test_agent.py](../scripts/ai_test_agent.py)** - AI-powered test agent
- **[phase3_test_runner.sh](../scripts/phase3_test_runner.sh)** - Phase 3 component verification
- **[setup.sh](../scripts/setup.sh)** - Automated setup script
- **[setup_xcode.sh](../scripts/setup_xcode.sh)** - Xcode configuration script

---

## 📖 Quick Links

### For New Developers
1. Start with [Quick Start](setup/QUICK_START.md)
2. Read [Development Guide](DEVELOPMENT.md)
3. Check [Technical Architecture](technical-architecture.md)

### For iOS Development
1. Follow [iOS App Setup](ios/IOS_APP_SETUP.md)
2. Configure [iOS Backend Connection](ios/IOS_BACKEND_CONNECTION.md)
3. Use [Test Agent](testing/TEST_AGENT_README.md) for testing

### For Deployment
1. Configure [Environment Variables](deployment/DEPLOYMENT_ENV_VARS.md)
2. Set up [External APIs](deployment/API_SETUP_GUIDE.md)
3. Configure [Notifications](NOTIFICATION_SETUP.md)

### For Agents
1. Read [Agent Workflow Guide](agents/WORKFLOW.md)
2. Check agent definitions in `~/.cursor/agents/`
3. Follow automatic handoff workflow

---

## 🔍 Finding Documentation

- **Setup Issues?** → [Setup Guide](setup/SETUP.md)
- **iOS Problems?** → [iOS Setup](ios/IOS_APP_SETUP.md)
- **Testing?** → [Test Agent](testing/TEST_AGENT_README.md)
- **Deployment?** → [Deployment Guide](deployment/DEPLOYMENT_ENV_VARS.md)
- **API Issues?** → [API Setup](deployment/API_SETUP_GUIDE.md)
- **Agent Workflow?** → [Agent Workflow Guide](agents/WORKFLOW.md)
- **Phase 3 Status?** → [Phase 3 Status](phase3/phase3-status.md)

---

## 📁 Documentation Organization

### Folder Structure
```
docs/
├── agents/              # Agent workflow documentation
├── phase3/              # Phase 3 feature documentation
├── testing/             # Testing documentation
├── ios/                 # iOS app documentation
├── setup/               # Setup guides
├── deployment/          # Deployment guides
└── archive/             # Archived/duplicate documents
```

---

**Main README:** [../README.md](../README.md)

# Documentation Organization

**Last Updated**: 2025-12-19  
**Status**: ✅ Organized by Agent and Feature

---

## 📁 New Structure

Documentation is now organized by **Agent** and **Feature** for easy navigation:

```
docs/
├── agents/                    # Agent workflow documentation
├── ppm/                       # Product and Project Manager documents
│   ├── README.md              # PPM folder guide
│   ├── business-objectives.md
│   ├── functional-requirements.md
│   ├── mvp-roadmap.md
│   └── monetisation-strategy.md
├── ui-designer/               # UI Designer documents
│   └── README.md              # UI Designer folder guide
├── developer/                 # Developer documents
│   ├── README.md              # Developer folder guide
│   ├── test-failures-handoff-developer.md
│   └── test-fixes-complete.md
├── tester/                    # Tester documents
│   ├── README.md              # Tester folder guide
│   ├── FANTASY_VS_TEAM_DIFFERENTIATION_TEST_REPORT.md
│   ├── FANTASY_VS_TEAM_TEST_FILES.md
│   ├── PERSONALIZED_ALERTS_TEST_REPORT.md
│   ├── PERSONALIZED_ALERTS_TEST_FILES.md
│   ├── UI_UX_OVERHAUL_TEST_REPORT.md
│   └── navigation-routes-fix-handoff-tester.md
├── features/                  # Feature-specific documentation
│   ├── dashboard-restructure/
│   │   ├── dashboard-restructure-requirements.md
│   │   ├── dashboard-restructure-handoff-ui-designer.md
│   │   ├── dashboard-restructure-handoff-developer.md
│   │   └── dashboard-restructure-design-spec.md
│   ├── fantasy-vs-team/
│   │   ├── fantasy-vs-team-differentiation-requirements.md
│   │   ├── fantasy-vs-team-differentiation-handoff-ui-designer.md
│   │   ├── fantasy-vs-team-differentiation-handoff-developer.md
│   │   ├── fantasy-vs-team-differentiation-handoff-tester.md
│   │   └── fantasy-vs-team-differentiation-design-spec.md
│   ├── news/
│   │   ├── news-display-requirements.md
│   │   ├── news-display-handoff-ui-designer.md
│   │   ├── news-display-handoff-developer.md
│   │   ├── news-display-handoff-tester.md
│   │   └── news-display-design-spec.md
│   ├── personalized-news/
│   │   ├── personalized-news-requirements.md
│   │   ├── personalized-news-handoff-ui-designer.md
│   │   ├── personalized-news-handoff-developer.md
│   │   ├── personalized-news-handoff-tester.md
│   │   └── personalized-news-design-spec.md
│   ├── personalized-alerts/
│   │   ├── personalized-alerts-requirements.md
│   │   └── personalized-alerts-handoff-tester.md
│   ├── mobile-responsiveness/
│   │   ├── mobile-responsiveness-review.md
│   │   └── mobile-responsiveness-handoff-ui-designer.md
│   └── ui-ux-overhaul/
│       ├── ui-ux-overhaul-requirements.md
│       ├── ui-ux-overhaul-roadmap.md
│       ├── ui-ux-overhaul-handoff-ui-designer.md
│       ├── ui-ux-overhaul-handoff-developer.md
│       ├── ui-ux-overhaul-design-spec-phase1.md
│       ├── ui-ux-overhaul-implementation-progress.md
│       └── ui-ux-overhaul-implementation-complete.md
├── phase3/                    # Phase 3 feature documentation
├── testing/                   # Testing infrastructure documentation
├── ios/                       # iOS app documentation
├── setup/                     # Setup guides
├── deployment/                # Deployment guides
└── archive/                   # Archived/duplicate documents
```

---

## 🎯 How Each Agent Finds Their Documents

### Product and Project Manager (PPM)
**Your Documents**: `docs/ppm/`
- Business objectives, requirements, roadmaps
- Feature requirements: `docs/features/[feature-name]/[feature-name]-requirements.md`

**When Creating Handoffs**:
- To UI Designer: `docs/features/[feature-name]/[feature-name]-handoff-ui-designer.md`
- To Developer: `docs/features/[feature-name]/[feature-name]-handoff-developer.md` (after design)
- To Tester: `docs/features/[feature-name]/[feature-name]-handoff-tester.md` (after implementation)

---

### UI Designer
**Your Documents**: `docs/ui-designer/` (mostly empty, handoffs in features/)

**Finding Your Work**:
- **Handoffs TO you**: `docs/features/[feature-name]/*handoff-ui-designer*.md`
- **Your design specs**: `docs/features/[feature-name]/[feature-name]-design-spec.md`

**When Creating Handoffs**:
- To Developer: `docs/features/[feature-name]/[feature-name]-handoff-developer.md`

---

### Developer
**Your Documents**: `docs/developer/`
- Test failures, fixes

**Finding Your Work**:
- **Handoffs TO you**: `docs/features/[feature-name]/*handoff-developer*.md`
- **Design specs**: `docs/features/[feature-name]/[feature-name]-design-spec.md`

**When Creating Handoffs**:
- To Tester: `docs/features/[feature-name]/[feature-name]-handoff-tester.md`

---

### Tester
**Your Documents**: `docs/tester/`
- Test reports, test files

**Finding Your Work**:
- **Handoffs TO you**: `docs/features/[feature-name]/*handoff-tester*.md`
- **Test reports**: `docs/tester/[feature-name]-test-report.md`

**When Creating Handoffs**:
- Bugs to Developer: `docs/features/[feature-name]/[feature-name]-bugs-[date].md`
- Design issues to UI Designer: `docs/features/[feature-name]/[feature-name]-design-issues-[date].md`
- Completion to PPM: `docs/features/[feature-name]/[feature-name]-test-report-[date].md`

---

## 📋 Document Naming Conventions

### Requirements Documents
- `[feature-name]-requirements.md` - Feature requirements (PPM creates)

### Handoff Documents
- `[feature-name]-handoff-ui-designer.md` - Handoff to UI Designer
- `[feature-name]-handoff-developer.md` - Handoff to Developer
- `[feature-name]-handoff-tester.md` - Handoff to Tester

### Design Documents
- `[feature-name]-design-spec.md` - Design specifications (UI Designer creates)

### Test Documents
- `[feature-name]-test-report.md` - Test results (Tester creates)
- `[feature-name]-test-files.md` - Test files (Tester creates)
- `[feature-name]-bugs-[date].md` - Bug reports (Tester creates)
- `[feature-name]-design-issues-[date].md` - Design issues (Tester creates)

---

## 🔍 Quick Reference

### By Agent
- **PPM** → `docs/ppm/` or `docs/features/[feature]/[feature]-requirements.md`
- **UI Designer** → `docs/features/[feature]/*handoff-ui-designer*.md`
- **Developer** → `docs/features/[feature]/*handoff-developer*.md` or `docs/developer/`
- **Tester** → `docs/features/[feature]/*handoff-tester*.md` or `docs/tester/`

### By Feature
- **Dashboard Restructure** → `docs/features/dashboard-restructure/`
- **Fantasy vs Team** → `docs/features/fantasy-vs-team/`
- **News Display** → `docs/features/news/`
- **Personalized News** → `docs/features/personalized-news/`
- **Personalized Alerts** → `docs/features/personalized-alerts/`
- **Mobile Responsiveness** → `docs/features/mobile-responsiveness/`
- **UI/UX Overhaul** → `docs/features/ui-ux-overhaul/`

---

## ✅ Benefits of This Organization

1. **Clear Agent Ownership**: Each agent knows exactly where their documents are
2. **Feature Cohesion**: All documents for a feature are in one place
3. **Easy Navigation**: Simple folder structure, easy to find documents
4. **Scalable**: Easy to add new features or agents
5. **Consistent**: Standard naming conventions across all features

---

## 📝 Main Documentation Index

See [README.md](README.md) for the complete documentation index with all links.

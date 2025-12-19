# Agent Workflow Documentation

## Overview

This project uses 4 specialized AI agents that work together in a defined workflow to ensure proper separation of concerns and efficient hand-offs.

---

## The 4 Agents

1. **Product and Project Agent** - Product + Project Management
2. **UI Designer** - UI/UX Design and Styling
3. **Developer** - Full-stack Development
4. **Tester** - Quality Assurance and Testing

---

## Standard Workflow

```
┌─────────────────────────┐
│ Product and Project     │ Creates requirements, PRD, tickets, acceptance criteria
│ Agent                   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ UI Designer             │ Creates design specs (colors, layouts, components, accessibility)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Developer               │ Implements code based on requirements + design specs
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Tester                  │ Tests implementation against acceptance criteria
└─────────────────────────┘
```

---

## Detailed Workflow Steps

### Step 1: Product and Project Agent
**Input**: Feature request, user need, business requirement  
**Output**: 
- Problem statement
- Goals & non-goals
- User journeys
- Functional & non-functional requirements
- Acceptance criteria (Given/When/Then)
- Jira-ready tickets
- RAID log

**Hands off to**: UI Designer (for design work) or Developer (for technical requirements only)

---

### Step 2: UI Designer
**Input**: Requirements from Product and Project Agent  
**Output**:
- Design specifications
- Color schemes and theming
- Layout patterns
- Component designs
- Accessibility requirements (WCAG AA)
- Responsive design patterns
- Visual consistency guidelines

**Hands off to**: Developer (when design specs are ready)

**⚠️ IMPORTANT**: UI Designer **MUST NOT** implement code. Only create design specifications.

---

### Step 3: Developer
**Input**: Requirements from Product and Project Agent + Design specs from UI Designer  
**Output**:
- Implemented code (frontend/backend)
- Following project conventions
- Error handling
- Type safety
- Documentation

**Hands off to**: Tester (when implementation is complete)

**⚠️ IMPORTANT**: Developer **MUST NOT** make design decisions. Hand off to UI Designer.

---

### Step 4: Tester
**Input**: Completed implementation from Developer  
**Output**:
- Test results
- Bug reports (if any)
- Accessibility validation
- Responsive design validation
- Acceptance criteria validation

**Hands back to**:
- **Developer**: For bugs that need fixing
- **UI Designer**: For design/accessibility issues
- **Product and Project Agent**: When acceptance criteria unclear or blockers found

---

## Hand-off Rules

### ✅ When to Hand Off

| From | To | When |
|------|-----|------|
| Product and Project Agent | UI Designer | Design work needed (new features, UX improvements) |
| Product and Project Agent | Developer | Technical requirements only (not implementation) |
| UI Designer | Developer | Design specs ready for implementation |
| Developer | Tester | Implementation complete, ready for testing |
| Tester | Developer | Bugs found that need fixing |
| Tester | UI Designer | Design/accessibility issues found |
| Any Agent | Product and Project Agent | Requirements unclear, scope changes, blockers |

### ❌ What NOT to Do

- **UI Designer**: ❌ DO NOT implement code - hand off to Developer
- **Developer**: ❌ DO NOT make design decisions - hand off to UI Designer
- **Tester**: ❌ DO NOT fix bugs yourself - report to Developer
- **Any Agent**: ❌ DO NOT skip hand-offs - follow the workflow

---

## Example: Phase 3 Feature Development

### 1. Product and Project Agent
Creates:
- `docs/phase3-requirements.md` (PRD)
- `docs/phase3-tickets.md` (Jira-ready tickets)
- `docs/phase3-handoff-ui-designer.md` (Hand-off document)

**Hands off to**: UI Designer

---

### 2. UI Designer
Receives: Phase 3 requirements  
Creates:
- Design specifications for Live Rank component
- Design specifications for Analytics Dashboard
- Color schemes and theming
- Layout patterns
- Accessibility requirements
- Responsive design patterns

**Hands off to**: Developer (with design specs)

---

### 3. Developer
Receives: Requirements + Design specs  
Implements:
- `LiveRank.tsx` component
- `AnalyticsDashboard.tsx` component
- `PointsChart.tsx` component
- `RankChart.tsx` component
- All other required components
- API integration
- Error handling

**Hands off to**: Tester (when implementation complete)

---

### 4. Tester
Receives: Completed implementation  
Tests:
- All acceptance criteria
- Accessibility (WCAG AA)
- Responsive design (mobile, tablet, desktop)
- Edge cases
- Performance

**If bugs found**: Hands back to Developer  
**If design issues found**: Hands back to UI Designer  
**If all pass**: Feature complete ✅

---

## Agent Locations

All agents are located in: `~/.cursor/agents/`

- `ppm-agent.mdc` - Product and Project Agent
- `ui-designer-agent.mdc` - UI Designer
- `developer-agent.mdc` - Developer
- `qa-agent.mdc` - Tester

---

## Activation

- **Product and Project Agent**: `alwaysApply: true` (active by default)
- **UI Designer**: `alwaysApply: false` (activate when needed)
- **Developer**: `alwaysApply: false` (activate when needed)
- **Tester**: `alwaysApply: false` (activate when needed)

To activate an agent, select it in Cursor's Agents tab (left sidebar).

---

## Best Practices

1. **Follow the workflow**: Don't skip steps or agents
2. **Clear hand-offs**: Always document what you're handing off
3. **Stay in your lane**: Don't do work that belongs to another agent
4. **Ask for clarification**: If requirements are unclear, ask PPM Agent
5. **Document decisions**: Record why you made certain choices
6. **Test thoroughly**: QA Agent should test everything before marking complete

---

## Troubleshooting

**Q: UI Designer is implementing code**  
A: Remind UI Designer to hand off to Developer. UI Designer should only create design specs.

**Q: Developer is making design decisions**  
A: Remind Developer to hand off to UI Designer. Developer should only implement based on design specs.

**Q: Requirements are unclear**  
A: Any agent can escalate to Product and Project Agent for clarification.

**Q: Workflow seems inefficient**  
A: The workflow ensures proper separation of concerns. Each agent has specialized skills. Trust the process.

---

**Last Updated**: 2025-01-27


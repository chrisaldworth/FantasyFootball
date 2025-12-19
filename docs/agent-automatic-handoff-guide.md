# Agent Automatic Handoff Guide

## Overview

Each agent should **automatically** create handoff documents and instruct the user to activate the next agent when their work is complete. This creates a seamless workflow where work flows automatically between agents.

---

## Workflow Pattern

```
Agent completes work → Creates handoff document → Tells user to activate next agent → Next agent starts work
```

---

## Handoff Document Template

Each handoff document should follow this format:

```markdown
# [Feature Name] - Handoff to [Next Agent]

**From**: [Current Agent]  
**To**: [Next Agent]  
**Date**: [Date]  
**Status**: 🚀 **READY - START WORK NOW**

---

## Overview
[Brief description of what was completed and what needs to be done next]

## What Was Completed
[List of completed work]

## What Needs to Be Done
[Clear instructions for next agent]

## Files/Resources
[Relevant files, documentation, tickets]

## Acceptance Criteria
[What needs to be validated]

## Next Steps
[Specific actions for next agent]
```

---

## Agent-Specific Handoff Procedures

### 1. Product and Project Agent → UI Designer

**When**: Requirements/tickets are complete and design work is needed

**Actions**:
1. Create: `docs/[feature]-handoff-ui-designer.md`
2. Include: Requirements, UX notes, design principles, acceptance criteria
3. **Say**: "Requirements complete. Handing off to UI Designer Agent. Please activate UI Designer Agent and review `docs/[feature]-handoff-ui-designer.md`. UI Designer Agent: Create design specifications based on these requirements."

---

### 2. UI Designer → Developer

**When**: Design specifications are complete

**Actions**:
1. Create: `docs/[feature]-handoff-developer.md`
2. Include: All design specs (colors, layouts, spacing, typography, responsive breakpoints, accessibility requirements)
3. **Say**: "Design complete. Handing off to Developer Agent. Please activate Developer Agent and review `docs/[feature]-handoff-developer.md`. Developer Agent: Implement code based on these design specifications."

---

### 3. Developer → Tester

**When**: Implementation is complete

**Actions**:
1. Create: `docs/[feature]-handoff-tester.md`
2. Include: What was implemented, test notes, edge cases, known issues, files changed, acceptance criteria reference
3. **Say**: "Implementation complete. Handing off to Tester Agent. Please activate Tester Agent and review `docs/[feature]-handoff-tester.md`. Tester Agent: Test all acceptance criteria and report findings."

---

### 4. Tester → Developer (for bugs)

**When**: Bugs are found

**Actions**:
1. Create: `docs/[feature]-bugs-[date].md`
2. Include: Steps to reproduce, expected vs actual, screenshots, priority (P0-P3)
3. **Say**: "Bugs found. Handing off to Developer Agent. Please activate Developer Agent and review `docs/[feature]-bugs-[date].md`. Developer Agent: Fix these bugs and hand back to Tester Agent for re-testing."

---

### 5. Tester → UI Designer (for design issues)

**When**: Design issues are found

**Actions**:
1. Create: `docs/[feature]-design-issues-[date].md`
2. Include: Visual inconsistencies, responsive issues, accessibility violations, color contrast issues
3. **Say**: "Design issues found. Handing off to UI Designer Agent. Please activate UI Designer Agent and review `docs/[feature]-design-issues-[date].md`. UI Designer Agent: Fix design issues and hand back to Developer Agent for implementation."

---

### 6. Tester → Product and Project Agent (completion)

**When**: All tests pass

**Actions**:
1. Create: `docs/[feature]-test-report-[date].md`
2. Include: What passed, what failed, test coverage, recommendations
3. **Say**: "Testing complete. All acceptance criteria met. Handing off to Product and Project Agent. Please review `docs/[feature]-test-report-[date].md`. Feature is ready for deployment."

---

## Key Principles

1. **Always create handoff document** - Don't just say "hand off", create the document
2. **Always tell user to activate next agent** - Make it explicit
3. **Always reference the document** - Tell them which file to review
4. **Always state what next agent should do** - Clear instructions
5. **Never skip handoffs** - Always follow the workflow

---

## Example Handoff Message

```
✅ [Your work] complete.

📁 Handoff document created: `docs/phase3-handoff-tester.md`

🎯 Next step: Please activate Tester Agent and review `docs/phase3-handoff-tester.md`

Tester Agent: Test all acceptance criteria from `docs/phase3-tickets.md` and report findings.
```

---

This ensures work flows automatically between agents without manual intervention!


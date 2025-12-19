# Agent Workflow Guide

**Complete guide to how agents work together in this project.**

---

## Overview

This project uses 4 specialized AI agents that work together in a defined workflow with automatic handoffs.

---

## The 4 Agents

1. **Product and Project Agent** - Product + Project Management
2. **UI Designer** - UI/UX Design and Styling
3. **Developer** - Full-stack Development
4. **Tester** - Quality Assurance and Testing

---

## Standard Workflow

```
Product and Project Agent → UI Designer → Developer → Tester
         ↓                      ↓              ↓          ↓
   Requirements          Design Specs    Implementation  Testing
```

---

## Automatic Handoff System

### How It Works

1. **Agent completes work** → Creates handoff document with specific filename pattern
2. **User activates next agent** → Agent automatically detects handoff document (via glob pattern)
3. **Agent reads document** → Starts work immediately
4. **Agent completes work** → Creates next handoff document
5. **Cycle repeats**

### Handoff Document Naming

**Critical**: Filenames must match agent glob patterns:

- **UI Designer**: `*-handoff-ui-designer*.md` or `*-handoff-designer*.md`
- **Developer**: `*-handoff-developer*.md` or `*-bugs*.md`
- **Tester**: `*-handoff-tester*.md` or `*-handoff-qa*.md`

### Agent Glob Patterns

- **UI Designer**: `docs/**/*handoff-ui-designer*.md`, `docs/**/*handoff-designer*.md`
- **Developer**: `docs/**/*handoff-developer*.md`, `docs/**/*bugs*.md`
- **Tester**: `docs/**/*handoff-tester*.md`, `docs/**/*handoff-qa*.md`

---

## Detailed Workflow Steps

### Step 1: Product and Project Agent
**Input**: Feature request, user need  
**Output**: Requirements, PRD, tickets, acceptance criteria  
**Hands off to**: UI Designer (for design) or Developer (for technical only)

**Handoff Document**: `docs/[feature]-handoff-ui-designer.md` or `docs/[feature]-handoff-developer.md`

---

### Step 2: UI Designer
**Input**: Requirements from Product and Project Agent  
**Output**: Design specifications (colors, layouts, components, accessibility)  
**Hands off to**: Developer

**Handoff Document**: `docs/[feature]-handoff-developer.md`

**⚠️ IMPORTANT**: UI Designer does NOT implement code - only creates design specs.

---

### Step 3: Developer
**Input**: Requirements + Design specs  
**Output**: Implemented code (frontend/backend)  
**Hands off to**: Tester

**Handoff Document**: `docs/[feature]-handoff-tester.md`

**⚠️ IMPORTANT**: Developer does NOT make design decisions - uses design specs from UI Designer.

---

### Step 4: Tester
**Input**: Completed implementation  
**Output**: Test results, bug reports, or completion report  
**Hands back to**:
- **Developer**: For bugs (`docs/[feature]-bugs-[date].md`)
- **UI Designer**: For design issues (`docs/[feature]-design-issues-[date].md`)
- **Product and Project Agent**: For completion (`docs/[feature]-test-report-[date].md`)

---

## Handoff Rules

| From | To | When | Document Pattern |
|------|-----|------|------------------|
| Product and Project Agent | UI Designer | Design work needed | `*-handoff-ui-designer*.md` |
| Product and Project Agent | Developer | Technical requirements only | `*-handoff-developer*.md` |
| UI Designer | Developer | Design specs ready | `*-handoff-developer*.md` |
| Developer | Tester | Implementation complete | `*-handoff-tester*.md` |
| Tester | Developer | Bugs found | `*-bugs*.md` |
| Tester | UI Designer | Design issues found | `*-design-issues*.md` |
| Tester | Product and Project Agent | Testing complete | `*-test-report*.md` |

---

## What NOT to Do

- ❌ **UI Designer**: DO NOT implement code - hand off to Developer
- ❌ **Developer**: DO NOT make design decisions - hand off to UI Designer
- ❌ **Tester**: DO NOT fix bugs yourself - report to Developer
- ❌ **Any Agent**: DO NOT skip handoffs - always create handoff documents

---

## Automatic Detection

When an agent is activated:
1. Cursor shows files matching the agent's glob patterns
2. Agent automatically sees handoff documents meant for them
3. Agent reads the handoff document immediately
4. Agent starts work based on the document

**No manual instructions needed** - the handoff document contains everything.

---

## User Workflow

**Minimal intervention required:**

1. **Activate next agent** (based on workflow)
2. **Agent automatically detects handoff document**
3. **Agent automatically starts work**
4. **Agent completes work and creates next handoff**
5. **Repeat**

**The user only needs to activate agents - agents handle everything else automatically.**

---

## Example: Phase 3 Workflow

```
1. Product and Project Agent creates: docs/phase3/HANDOFF-UI-DESIGNER.md
   → User activates UI Designer Agent

2. UI Designer Agent detects handoff document (glob match)
   → Automatically reads document
   → Starts creating design specs
   → Creates: docs/phase3/HANDOFF-DEVELOPER.md
   → User activates Developer Agent

3. Developer Agent detects handoff document (glob match)
   → Automatically reads document
   → Starts implementing code
   → Creates: docs/phase3/HANDOFF-TESTER.md
   → User activates Tester Agent

4. Tester Agent detects handoff document (glob match)
   → Automatically reads document
   → Starts testing
   → Creates: docs/phase3/test-report-[date].md
   → Complete!
```

---

## Benefits

1. **Automatic Detection**: Agents see handoff documents immediately
2. **No Manual Instructions**: Agents read documents and start work automatically
3. **Seamless Flow**: Work flows naturally between agents
4. **Clear Handoffs**: Document naming ensures correct agent is triggered
5. **Minimal User Intervention**: User just activates agents, agents do the rest

---

**This creates a truly automatic workflow where agents detect and start work without manual instructions!**



# Agent Auto-Detection Workflow

## How Automatic Handoffs Work

Agents are configured to **automatically detect and start work** from handoff documents using glob patterns.

---

## How It Works

### 1. Agent Glob Patterns

Each agent's `globs` field includes handoff document patterns:

- **UI Designer**: `docs/**/*handoff-ui-designer*.md`, `docs/**/*handoff-designer*.md`
- **Developer**: `docs/**/*handoff-developer*.md`, `docs/**/*bugs*.md`
- **Tester**: `docs/**/*handoff-tester*.md`, `docs/**/*handoff-qa*.md`

### 2. Automatic Detection

When an agent is activated:
1. Cursor shows files matching the agent's glob patterns
2. Agent automatically sees handoff documents meant for them
3. Agent reads the handoff document immediately
4. Agent starts work based on the document

### 3. Workflow

```
PPM Agent creates: docs/phase3-handoff-ui-designer.md
  ↓
User activates UI Designer Agent
  ↓
UI Designer Agent sees handoff document (matches glob pattern)
  ↓
UI Designer Agent automatically reads document and starts work
  ↓
UI Designer Agent creates: docs/phase3-handoff-developer.md
  ↓
User activates Developer Agent
  ↓
Developer Agent sees handoff document (matches glob pattern)
  ↓
Developer Agent automatically reads document and starts work
  ↓
...and so on
```

---

## Handoff Document Naming Convention

**Critical**: Handoff document filenames must match agent glob patterns:

- For UI Designer: `*-handoff-ui-designer*.md` or `*-handoff-designer*.md`
- For Developer: `*-handoff-developer*.md` or `*-bugs*.md`
- For Tester: `*-handoff-tester*.md` or `*-handoff-qa*.md`

**Examples**:
- ✅ `docs/phase3-handoff-ui-designer.md` → UI Designer will see it
- ✅ `docs/feature-handoff-developer.md` → Developer will see it
- ✅ `docs/phase3-handoff-tester.md` → Tester will see it
- ❌ `docs/phase3-handoff-design.md` → Won't match any agent's glob

---

## Agent Behavior on Activation

### UI Designer Agent
When activated:
1. **Automatically checks** for files matching `docs/**/*handoff-ui-designer*.md`
2. If found, **immediately reads** the document
3. **Starts creating design specifications** based on the document
4. No need to wait for instructions - work begins automatically

### Developer Agent
When activated:
1. **Automatically checks** for files matching `docs/**/*handoff-developer*.md` or `docs/**/*bugs*.md`
2. If found, **immediately reads** the document
3. **Starts implementing code** based on the document
4. No need to wait for instructions - work begins automatically

### Tester Agent
When activated:
1. **Automatically checks** for files matching `docs/**/*handoff-tester*.md`
2. If found, **immediately reads** the document
3. **Starts testing** based on the document
4. Also checks for new components in `frontend/src/components/`
5. No need to wait for instructions - work begins automatically

---

## User Workflow

**Minimal manual intervention required:**

1. **PPM Agent** creates handoff document
2. **User activates next agent** (UI Designer, Developer, or Tester)
3. **Agent automatically detects handoff document** (via glob pattern)
4. **Agent automatically starts work** (reads document and begins)
5. **Agent completes work** and creates next handoff document
6. **Repeat** for next agent

**The user only needs to activate agents - the agents handle everything else automatically.**

---

## Benefits

1. **Automatic Detection**: Agents see handoff documents immediately
2. **No Manual Instructions**: Agents read documents and start work automatically
3. **Seamless Flow**: Work flows naturally between agents
4. **Clear Handoffs**: Document naming ensures correct agent is triggered
5. **Minimal User Intervention**: User just activates agents, agents do the rest

---

## Example: Phase 3 Workflow

```
1. PPM Agent creates: docs/phase3-handoff-ui-designer.md
   → Says: "Handoff document created. Activate UI Designer Agent."

2. User activates UI Designer Agent
   → UI Designer Agent sees docs/phase3-handoff-ui-designer.md (matches glob)
   → UI Designer Agent automatically reads it
   → UI Designer Agent starts creating design specs
   → UI Designer Agent creates: docs/phase3-handoff-developer.md

3. User activates Developer Agent
   → Developer Agent sees docs/phase3-handoff-developer.md (matches glob)
   → Developer Agent automatically reads it
   → Developer Agent starts implementing code
   → Developer Agent creates: docs/phase3-handoff-tester.md

4. User activates Tester Agent
   → Tester Agent sees docs/phase3-handoff-tester.md (matches glob)
   → Tester Agent automatically reads it
   → Tester Agent starts testing
   → Tester Agent creates: docs/phase3-test-report.md

5. Complete!
```

---

**This creates a truly automatic workflow where agents detect and start work without manual instructions!**


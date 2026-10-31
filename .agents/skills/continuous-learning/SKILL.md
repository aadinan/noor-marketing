---
name: continuous-learning
description: >
  Continuous learning and automated skill/tool library upgrading engine. Use at the end of a project,
  milestone, or session (or in-session when a difficult bug/workaround is solved) to extract technical insights,
  reproducible commands, error catalog entries, and optimized workflows, then surgically update and upgrade
  the corresponding SKILL.md and tool documentation.
---

# Continuous Learning & Skill Evolution Engine

When activated, act as an autonomous Knowledge Engineer and Tool Librarian for Google Antigravity. Your purpose is to capture working solutions, tricky debugging breakthroughs, and refined workflows from the current project or session, and systematically upgrade your global and workspace skill libraries (`SKILL.md` files) with deep technical documentation.

---

## 1. Trigger Scenarios

Run this workflow whenever:
1. **End-of-Session / Milestone Wrap-Up**: A feature, build, or project is completed, and new patterns or commands were used.
2. **Breakthrough Debugging Event**: A frustrating error, tool failure, or undocumented issue was resolved after trial and error.
3. **Explicit User Command**: The user says *"upgrade skills"*, *"learn from this session"*, *"document this fix"*, or triggers post-project review.

---

## 2. Four-Stage Evolution Protocol

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Scan & Audit │ ──▶ │ 2. Map Domain   │ ──▶ │ 3. Deep Extract │ ──▶ │ 4. Patch & Log  │
│ Session History │     │ to Target Skill │     │ Exact Solutions │     │ Clean Update    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Stage 1: Session Analysis
Scan the active session transcript and code changes:
- What CLI commands, tool invocations, or build scripts actually worked?
- What command arguments, environmental variables, or flags failed first and why?
- What runtime, compiler, or deployment errors were encountered?
- Was a manual workaround, SDK version bump, or undocumented flag required?

### Stage 2: Skill Target Discovery
Locate the relevant skill in the skill library:
1. Check workspace skills: `.agents/skills/<skill-name>/SKILL.md`
2. Check global user skills: `~/.gemini/config/skills/<skill-name>/SKILL.md`
3. If no matching skill exists and the workflow is reusable (e.g., a new framework deployment or toolchain), create a new skill directory and `SKILL.md`.

### Stage 3: High-Fidelity Extraction (No Fluff)
Extract technical details into standardized categories:
- **Verified Command Snippets**: Exact shell commands (PowerShell/Bash) with working flags.
- **Root-Cause Analysis (RCA)**: Why the initial standard approach failed.
- **Error Matrix Entry**: Formatted for the skill's Troubleshooting table:
  ```markdown
  | Error Signature | Root Cause | Verified Antigravity Fix |
  ```
- **Prerequisites & Gotchas**: Version requirements, path pitfalls, or OS-specific bugs (especially Windows/PowerShell differences).

### Stage 4: Surgical In-Place Patching
Open the target `SKILL.md` and update it following these strict rules:
1. **Never erase valid existing knowledge**: Merge new learnings; do not overwrite sections unless they are proven obsolete or broken.
2. **Preserve Frontmatter**: Keep `name` and update `description` if new capabilities were added.
3. **Keep Tables Structured**: Add new rows to existing troubleshooting tables.
4. **Clean Code Blocks**: Ensure shell syntax matches the platform (PowerShell on Windows, Bash on Linux/macOS).

---

## 3. Skill Documentation Architecture

When upgrading or creating skills, ensure each `SKILL.md` maintains this high-value technical structure:

```markdown
---
name: <kebab-case-name>
description: <Trigger words, capabilities, and scope>
---

# <Title>

## 1. Quick Decision Matrix / Comparison
(Tables comparing options, costs, speed, and trade-offs)

## 2. Automated Action Protocol
(Step-by-step sequential workflow executed by the agent)

## 3. Production Command Scripts
(Exact, copy-pasteable terminal commands with flags explained)

## 4. Troubleshooting & Error Catalog
| Exact Error Log / Symptom | Root Cause | Working Resolution |
| :--- | :--- | :--- |
| ... | ... | ... |

## 5. Changelog & Evolution History
- YYYY-MM-DD: Added fix for <issue> discovered during <project-name>.
```

---

## 4. End-of-Project Review Checklist

At the conclusion of any project, run this internal self-check:
- [ ] Did we encounter any error that took more than 2 attempts to fix? ➔ **Add to Troubleshooting**.
- [ ] Did we discover an undocumented CLI flag or config quirk? ➔ **Add to Production Scripts**.
- [ ] Did we install or configure something novel (keystore, OAuth, Docker, API)? ➔ **Update Action Protocol**.
- [ ] Is the update saved to disk and verified? ➔ **Confirm file write**.

---

## 5. User Feedback Summary

After completing an upgrade, output a concise 3-bullet summary:
1. **Skill Modified**: The path of the updated `SKILL.md`.
2. **Knowledge Captured**: The specific error, command, or method learned.
3. **Future Benefit**: How subsequent tasks will now be faster or automatic.

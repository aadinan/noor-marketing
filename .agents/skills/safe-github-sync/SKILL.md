---
name: safe-github-sync
description: Safely verifies gitignore, audits secret hygiene, initializes git, and publishes to GitHub via gh CLI.
---

# Safe GitHub Synchronization Standard

When synchronizing any local repository with GitHub:

1. **Pre-Staging Secret Audit:**
   - Verify that `.gitignore` exists and excludes:
     * Secrets: `.env`, `*.key`, `*.keystore`, `*.jks`, `*.pem`, `google-services.json`
     * Databases & Binaries: `*.sqlite`, `*.sqlite-wal`, `*.bin`, `build/`, `*.apk`, `*.aab`
     * Cache & IDE: `.dart_tool/`, `.idea/`, `.vscode/`
   - Run `git status --porcelain` to verify none of these paths are tracked. If tracked, immediately run `git rm --cached <file>`.

2. **Git Initialization & Branching:**
   - Ensure the repository is initialized: `git init`.
   - Ensure the default branch is set to `main`: `git branch -M main`.

3. **Remote Management & Publication:**
   - Check existing remotes using `git remote -v`.
   - If no remote is configured:
     * Use GitHub CLI to create a private repository:
       `gh repo create $(basename "$PWD") --private --source=. --remote=origin --push`
   - If a remote already exists:
     * Stage non-ignored files: `git add .`
     * Commit with a concise Conventional Commit message: `git commit -m "feat: sync workspace changes"`
     * Push to remote: `git push -u origin main`

4. **Safety Assertion:**
   - Never push until `git status` confirms zero sensitive environment or database assets are staged.
---
name: safe-github-sync
description: Safely verifies gitignore, audits secret hygiene, initializes git, and publishes to GitHub via gh CLI.
---

# Safe GitHub Synchronization Standard

When synchronizing any local repository with GitHub:

## 1. Quick Decision Matrix / Comparison
| Scenario | Recommended Protocol | Auth Method | Notes |
| :--- | :--- | :--- | :--- |
| First-time push with GitHub Actions (`.github/workflows/`) | SSH Remote (`git@github.com:...`) | SSH Key | HTTPS push via default `gh auth token` will fail unless OAuth app has explicit `workflow` scope. |
| Standard repository without workflows | HTTPS or SSH | `gh.exe` auth / SSH | Ensure `git config user.name` and `user.email` are set. |
| Large files / installers in tree | Pre-commit purge & `.gitignore` | N/A | Exclude `*.msi`, `*.exe`, large bundles before initial staging to prevent upload hangs. |

---

## 2. Automated Action Protocol

1. **Pre-Staging Secret & Binary Audit:**
   - Verify that `.gitignore` exists and excludes:
     * **Secrets**: `.env`, `.env*`, `!.env.example`, `*.key`, `*.keystore`, `*.jks`, `*.pem`, `google-services.json`, `GoogleService-Info.plist`
     * **Databases & Installers**: `*.sqlite`, `*.sqlite-wal`, `*.bin`, `build/`, `dist/`, `*.apk`, `*.aab`, `*.msi`, `*.exe`
     * **Cache & IDE**: `.dart_tool/`, `.idea/`, `.vscode/*`, `!.vscode/extensions.json`, `node_modules/`
   - Run `git status --porcelain` and check `git status --ignored` to verify none of these paths are tracked. If accidentally staged/tracked, run `git rm --cached <file>`.

2. **Git Initialization & Identity Setup:**
   - Initialize repository: `git init`
   - Ensure default branch is set to `main`: `git branch -M main`
   - Ensure Git author details are configured locally if not set globally:
     ```powershell
     $ghUser = & "C:\Program Files\GitHub CLI\gh.exe" api user --jq "{login: .login, name: .name}" | ConvertFrom-Json
     git config user.name ($ghUser.name ?? $ghUser.login)
     git config user.email "$($ghUser.login)@users.noreply.github.com"
     ```

3. **Remote Management & Publication:**
   - Check existing remotes using `git remote -v`.
   - Ensure GitHub CLI (`gh.exe`) is located (on Windows, typically at `C:\Program Files\GitHub CLI\gh.exe` if not in user PATH).
   - If repository does not exist on remote:
     ```powershell
     & "C:\Program Files\GitHub CLI\gh.exe" repo create <repo-name> --private --source=. --remote=origin
     ```
   - For repositories containing `.github/workflows/`:
     * Use SSH remote URL (`git remote set-url origin git@github.com:<owner>/<repo>.git`) to push workflows cleanly without hitting OAuth token scope limitations.
   - Stage, commit, and push:
     ```powershell
     git add .
     git commit -m "feat: initial commit"
     git push -u origin main
     ```

---

## 3. Production Command Scripts

### Windows PowerShell gh Location & Safe Execution
```powershell
$gh = if (Get-Command gh -ErrorAction SilentlyContinue) { "gh" } elseif (Test-Path "C:\Program Files\GitHub CLI\gh.exe") { "C:\Program Files\GitHub CLI\gh.exe" } else { throw "GitHub CLI not found" }
& $gh auth status
```

### Git Object Size Audit & Purge Loose Objects
```powershell
# Identify largest files staged/committed:
git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize) %(rest)" | Where-Object { $_ -match "^blob" } | ForEach-Object { $parts = $_ -split ' ', 4; [PSCustomObject]@{ Size = [int64]$parts[2]; Path = $parts[3] } } | Sort-Object Size -Descending | Select-Object -First 10

# If a large file was committed and amended out, purge it completely from pack:
git reflog expire --expire=now --all
git repack -ad
git prune
```

---

## 4. Troubleshooting & Error Catalog

| Exact Error Log / Symptom | Root Cause | Verified Antigravity Fix |
| :--- | :--- | :--- |
| `'gh' is not recognized as the name of a cmdlet...` | GitHub CLI installed under `C:\Program Files\GitHub CLI\gh.exe` but shell environment PATH not updated in current session. | Directly invoke `& "C:\Program Files\GitHub CLI\gh.exe"` or resolve path dynamically. |
| `POST git-receive-pack (XXXXXX bytes)` hangs indefinitely during `git push` | A very large binary artifact (e.g. `node-*.msi` or `.apk` > 30MB) is in the commit pack over slow or sandboxed HTTPS uplink. | 1. Kill push task.<br>2. Untrack file: `git rm --cached <file>`.<br>3. Add pattern to `.gitignore`.<br>4. Amend commit: `git commit --amend`.<br>5. Purge pack: `git reflog expire --expire=now --all; git repack -ad; git prune`. |
| `refusing to allow an OAuth App to create or update workflow .github/workflows/... without workflow scope` | GitHub CLI token lacks the explicit `workflow` OAuth scope when pushing via HTTPS token. | Switch remote URL to SSH: `git remote set-url origin git@github.com:<owner>/<repo>.git` and push via SSH key authentication. |
| `fatal: not a git repository` | Folder has not been initialized. | Run `git init; git branch -M main`. |

---

## 5. Changelog & Evolution History
- 2026-09-23: Captured Windows GitHub CLI path resolution, SSH vs HTTPS OAuth `workflow` scope requirement when pushing `.github/workflows/`, and pack purging workflow for oversized binary files (`.msi`).

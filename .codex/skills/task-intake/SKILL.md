---
name: task-intake
description: Prepare a repository task before implementation. Use when the user asks to start, execute, pick up, or intake an issue/task, or before Codex edits files for non-trivial work in this repo. Verifies issue readiness, records intake, and creates/chooses an isolated worktree using repo-local scripts.
---

# Task Intake

## Goal

Gate implementation behind the repo issue system and isolate work before edits.

## Workflow

1. Read `AGENTS.md` and `docs/operations/issue-system.md`.
2. Identify the source issue.
   - If the user gives an issue number, use it.
   - If no issue exists and the task will change committed files, create a bounded leaf issue first.
   - Prefer Korean for issue body prose and keep the English title prefix.
3. Fetch live issue state with `gh issue view` or `gh api`.
4. Check intake requirements.
   - title convention
   - labels including type, kind, status, priority, and area
   - scope
   - non-scope
   - acceptance criteria
   - dependency notes when relevant
   - completion signal
5. If intake fails, update the issue or ask for the missing decision. Do not edit repo files.
6. If intake passes, ensure the issue has `status:ready` or update it when appropriate.
7. Create or select an isolated worktree.
   - Prefer `.codex/skills/task-intake/scripts/worktree-add.sh <path> <branch> origin/main`.
   - Set `BLOG_APP_SKIP_CODE_ADD=1` when the visible editor should not be mutated.
   - Do not implement on a dirty or unrelated branch.
8. Add an intake receipt comment to the issue.
   - issue number
   - branch
   - worktree path
   - accepted scope
   - non-scope
   - planned verification
9. Begin implementation only after the receipt is written.

## Stop Conditions

- No source issue for a committed change.
- Issue scope is ambiguous.
- Acceptance criteria are missing.
- Current worktree has unrelated local changes.
- Worktree creation would overwrite an existing path.

## Required Commands

Use repo-local scripts before raw worktree commands:

```bash
BLOG_APP_SKIP_CODE_ADD=1 .codex/skills/task-intake/scripts/worktree-add.sh ../app-issue-<n>-<slug> work/<n>-<slug> origin/main
```

Raw `git worktree add` is fallback only when the script is absent or broken, and the final workspace file must then be regenerated with:

```bash
node .codex/skills/task-intake/scripts/update-vscode-workspace.mjs
```

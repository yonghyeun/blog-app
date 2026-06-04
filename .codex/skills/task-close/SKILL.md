---
name: task-close
description: Close out a task after handoff or merge and decide workspace cleanup. Use when the user says closeout 가능, close task, cleanup workspace, remove worktree, 작업 정리, or after task-merge completes. Writes closeout receipts, verifies terminal state, and removes/keeps/pends workspaces according to policy.
---

# Task Close

## Goal

Close the operational loop without losing work: record final state, verify GitHub state, then decide whether a workspace should be removed, kept, or left pending.

## Modes

- **handoff**: PR is open and human review is waiting. Do not merge. Do not remove workspace by default.
- **merged**: PR is merged and issue should be closed. Verify post-merge checks before cleanup.
- **workspace-cleanup**: User explicitly asks to remove workspaces.

Infer the mode from the user's request and live PR/issue state. If ambiguous, choose the safer mode.

## Workflow

1. Identify issue, PR, branch, and worktree path.
2. Query live state.
   - `gh pr view`
   - `gh issue view`
   - `git status --short --branch`
   - `git worktree list`
3. Write or update a closeout receipt.
   - issue comment for issue-owned work
   - PR comment only when issue comment is not suitable
4. Include in the receipt:
   - PR URL
   - branch
   - head SHA or merge SHA
   - delivered scope
   - completed atomic commit units
   - verification commands/results
   - follow-ups or risk-resolution note
   - workspace decision
5. Decide workspace state with the policy below.
6. If removing a worktree, use repo-local script first:

```bash
.codex/skills/task-close/scripts/worktree-remove.sh <path> --yes
```

Use force only after explicit user request:

```bash
.codex/skills/task-close/scripts/worktree-remove.sh <path> --yes --force
```

7. If fallback raw `git worktree remove` was required, run:

```bash
node .codex/skills/task-close/scripts/update-vscode-workspace.mjs
git worktree prune
```

8. Verify final state:
   - worktree list contains expected paths only
   - `blog-worktrees.code-workspace` reflects the same paths
   - local git status is clean for touched worktree

## Workspace Cleanup Policy

| State                                                          | Decision                                           |
| -------------------------------------------------------------- | -------------------------------------------------- |
| PR open or review pending                                      | keep workspace                                     |
| PR merged, issue closed, post-merge CI success, worktree clean | remove by default                                  |
| PR merged, post-merge CI pending                               | keep pending                                       |
| deploy verification pending                                    | keep pending                                       |
| worktree is main repo path                                     | never remove                                       |
| worktree has modified or untracked files                       | ask before removal                                 |
| worktree has unpushed commits                                  | ask before removal                                 |
| user explicitly says force remove                              | remove with `--force` after confirming target path |

For handoff, completed coherent units should be committed before the receipt is
written. If unfinished work remains uncommitted, name the affected files and the
next action in the receipt.

## User Questions

Ask only when the state is risky or ambiguous:

- Dirty workspace: keep, stash/patch, or force remove.
- Post-merge CI/deploy pending: keep pending or remove now.
- Main-like reusable workspace: keep or remove.

## Stop Conditions

- Target path is the main repository worktree.
- Target path is not registered as a git worktree.
- Workspace is dirty and user did not explicitly request force.
- PR/issue state is inconsistent and cleanup could hide an unresolved task.

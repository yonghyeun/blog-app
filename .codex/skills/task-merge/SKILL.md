---
name: task-merge
description: Merge a ready pull request and verify the post-merge repository state. Use when the user says a PR can be merged, land it, merge 가능, PR merge 가능, or asks Codex to land completed work. Does not remove workspaces; task-close handles workspace cleanup.
---

# Task Merge

## Goal

Merge only a ready PR, then verify the authoritative GitHub and post-merge CI state.

## Argument Contract

Arguments are optional at the skill level because the agent may infer the PR
from the current branch and live GitHub state. If multiple PRs match or no PR can
be identified, stop and ask instead of guessing.

Precedence:

1. Explicit argument
2. User request
3. Live GitHub or repository state
4. Safe default

Common arguments:

| Argument               | Required | Behavior                                       |
| ---------------------- | -------- | ---------------------------------------------- |
| `--dry-run`            | no       | Check readiness and planned actions only       |
| `--issue <number>`     | no       | Use only when the issue identifies a single PR |
| `--pr <number>`        | no       | Use the given PR                               |
| `--json`               | no       | Emit machine-readable output when practical    |
| `--verbose`            | no       | Include inspected state and fallback reasons   |
| `--timeout <duration>` | no       | Bound checks or post-merge workflow waits      |

Task Merge arguments:

| Argument                         | Required | Behavior                                                     |
| -------------------------------- | -------- | ------------------------------------------------------------ |
| `--pr <number>`                  | no       | Pin merge to a specific PR                                   |
| `--dry-run`                      | no       | Verify merge readiness without merging                       |
| `--method squash\|merge\|rebase` | no       | Select merge method; default is `squash`                     |
| `--wait`                         | no       | Wait for pending checks instead of stopping immediately      |
| `--timeout <duration>`           | no       | Bound check and post-merge CI waits                          |
| `--poll-interval <seconds>`      | no       | Control polling interval while waiting                       |
| `--skip-deploy-check`            | no       | Skip deploy detection only; never skip required CI checks    |
| `--clean`                        | no       | After successful merge and post-merge CI, run cleanup policy |

Do not add `--skip-ci`; merge safety requires required checks to pass. `--clean`
is explicit cleanup intent, not the default behavior.

## Workflow

1. Identify the PR.
   - Prefer an explicit PR number.
   - Otherwise use the current branch's PR.
2. Verify merge readiness.
   - `gh pr view --json state,mergeable,mergeStateStatus,statusCheckRollup,baseRefName,headRefName,headRefOid`
   - PR state must be `OPEN`.
   - `mergeable` must be `MERGEABLE`.
   - required checks must be successful.
3. If checks are pending, wait for them.
4. If checks fail or conflicts exist, stop. Do not merge.
5. Merge with the repository's normal method.
   - Prefer `gh pr merge <number> --squash --delete-branch` unless repo policy or `--method` says otherwise.
   - Never force-push.
   - Never retry `gh pr merge` blindly after a non-zero exit. Query PR state first.
   - If local branch deletion fails because a worktree has the branch checked
     out, query PR state before deciding whether the merge succeeded.
6. Verify merge result.
   - `gh pr view <number> --json state,mergedAt,mergedBy,mergeCommit,url`
   - Record merge commit SHA.
7. Verify source issue state when the PR uses closing keywords.
8. Watch post-merge CI for the merge commit.
   - Use `gh run list --json workflowName,status,conclusion,headSha,url`.
   - Wait until the merge commit's quality workflow completes.
9. Detect deploy workflow.
   - Search `.github/workflows` for deploy/release/production/cd.
   - If `--skip-deploy-check` is set, report deploy verification skipped by explicit argument.
   - If no deploy workflow or production URL is configured, report deploy verification skipped.
10. Handle workspace cleanup.
    - Without `--clean`, do not remove any worktree or local branch. Hand off to `task-close`.
    - With `--clean`, cleanup is allowed only after merge success, source issue close verification, and post-merge CI success.
    - Reuse `task-close` policy or `.codex/skills/task-close/scripts/worktree-remove.sh`.
    - If the branch is checked out by a worktree, remove the worktree before local branch deletion.
    - Dirty or unpushed worktrees require a stop or user decision.

## Stop Conditions

- PR is not open.
- PR is not mergeable.
- CI is failing.
- Merge conflict exists.
- Merge command fails and PR remains open without auto-merge.
- Post-merge CI fails.
- `--clean` is requested but cleanup policy detects dirty or unpushed work.

## Output

Report:

- PR URL
- merge commit SHA
- issue state
- post-merge CI result
- deploy verification status
- whether `task-close` should run next

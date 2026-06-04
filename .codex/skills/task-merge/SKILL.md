---
name: task-merge
description: Merge a ready pull request and verify the post-merge repository state. Use when the user says a PR can be merged, land it, merge 가능, PR merge 가능, or asks Codex to land completed work. Does not remove workspaces; task-close handles workspace cleanup.
---

# Task Merge

## Goal

Merge only a ready PR, then verify the authoritative GitHub and post-merge CI state.

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
   - Prefer `gh pr merge <number> --squash --delete-branch` unless repo policy says otherwise.
   - Never force-push.
   - Never retry `gh pr merge` blindly after a non-zero exit. Query PR state first.
6. Verify merge result.
   - `gh pr view <number> --json state,mergedAt,mergedBy,mergeCommit,url`
   - Record merge commit SHA.
7. Verify source issue state when the PR uses closing keywords.
8. Watch post-merge CI for the merge commit.
   - Use `gh run list --json workflowName,status,conclusion,headSha,url`.
   - Wait until the merge commit's quality workflow completes.
9. Detect deploy workflow.
   - Search `.github/workflows` for deploy/release/production/cd.
   - If no deploy workflow or production URL is configured, report deploy verification skipped.
10. Do not remove any worktree. Hand off to `task-close`.

## Stop Conditions

- PR is not open.
- PR is not mergeable.
- CI is failing.
- Merge conflict exists.
- Merge command fails and PR remains open without auto-merge.
- Post-merge CI fails.

## Output

Report:

- PR URL
- merge commit SHA
- issue state
- post-merge CI result
- deploy verification status
- whether `task-close` should run next

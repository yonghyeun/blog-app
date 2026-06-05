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

Run the repo-local script before any raw `gh pr merge` command:

```bash
.codex/skills/task-merge/scripts/run.sh --pr <number> --dry-run
```

Use `--wait` when the script reports pending checks and the user wants the agent
to wait. Use the same script without `--dry-run` only after the readiness gate
passes:

```bash
.codex/skills/task-merge/scripts/run.sh --pr <number> --method squash --wait
```

Script-owned workflow:

1. Identify the PR.
   - Prefer an explicit PR number.
   - Otherwise use `--issue` or the current branch's PR.
2. Verify merge readiness through the script.
   - PR state must be `OPEN`.
   - Draft PRs fail.
   - `mergeable` must be `MERGEABLE`.
   - conflict, blocked, behind, closed, or unknown merge states fail.
   - status checks must be successful.
3. If checks are pending, the script stops unless `--wait` is set.
4. If checks fail or conflicts exist, the script exits non-zero. Do not merge.
5. Merge with the script.
   - Default method is `squash`.
   - Supported methods are `squash`, `merge`, and `rebase`.
   - Never force-push.
   - Never retry a failed merge manually. Query PR state with the script first.
6. Verify merge result through the script.
   - PR state must become `MERGED`.
   - Merge timestamp and merge commit SHA must be present.
7. Verify source issue state when the PR exposes closing issue references.
8. Watch post-merge CI for the merge commit through the script.
   - The script uses `gh run list --commit <merge-sha>`.
   - `--skip-deploy-check` never skips required CI.
9. Detect deploy workflow.
   - The script searches `.github/workflows` for deploy/release/production/cd.
   - If `--skip-deploy-check` is set, report deploy verification skipped by explicit argument.
   - If no deploy workflow is detected, report deploy verification skipped.
10. Handle workspace cleanup.
    - Without `--clean`, the script does not remove any worktree or local branch.
    - With `--clean`, cleanup is allowed only after merge success, source issue
      close verification, and post-merge CI success.
    - Cleanup delegates to `.codex/skills/task-close/scripts/worktree-remove.sh`.
    - Dirty or unpushed worktrees require `task-close` follow-up instead of raw removal.

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

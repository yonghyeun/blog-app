---
name: task-intake
description: Prepare a repository task before implementation. Use when the user asks to start, execute, pick up, or intake an issue/task, or before Codex edits files for non-trivial work in this repo. Verifies issue readiness, records intake, and creates/chooses an isolated worktree using repo-local scripts.
---

# Task Intake

## Goal

Gate implementation behind the repo issue system and isolate work before edits.

## Argument Contract

Arguments are optional at the skill level because the agent may infer issue,
branch, and worktree targets from the user request and live repository state. If
the target cannot be identified safely, stop and ask instead of guessing.

Precedence:

1. Explicit argument
2. User request
3. Live GitHub or repository state
4. Safe default

Common arguments:

| Argument               | Required | Behavior                                                        |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `--dry-run`            | no       | Report planned actions without mutating state                   |
| `--issue <number>`     | no       | Use the given source issue                                      |
| `--pr <number>`        | no       | Use only when an existing PR identifies the issue unambiguously |
| `--json`               | no       | Emit machine-readable output when practical                     |
| `--verbose`            | no       | Include inspected state and fallback reasons                    |
| `--timeout <duration>` | no       | Bound waits for external state                                  |

Task Intake arguments:

| Argument            | Required | Behavior                                                       |
| ------------------- | -------- | -------------------------------------------------------------- |
| `--issue <number>`  | no       | Pin intake to a specific issue                                 |
| `--check-only`      | no       | Check intake requirements only; do not edit issues or files    |
| `--fix-issue`       | no       | Update fixable issue metadata when intake would otherwise fail |
| `--no-fix-issue`    | no       | Stop on intake failure instead of editing the issue            |
| `--worktree <path>` | no       | Use or create the given worktree path                          |
| `--branch <name>`   | no       | Use or create the given branch                                 |
| `--base <ref>`      | no       | Use the given start point for new branches                     |
| `--no-code-add`     | no       | Do not run `code --add`; replaces `BLOG_APP_SKIP_CODE_ADD=1`   |

`--fix-issue` and `--no-fix-issue` are mutually exclusive. Do not add a
`--no-issue` escape hatch; committed changes still require issue ownership.

## Script-First Workflow

Run the repo-local gate script before any manual `gh` mutation, raw worktree
command, or repository file edit:

```bash
.codex/skills/task-intake/scripts/run.sh --issue <number> --worktree <path> --branch <name> --base origin/main --no-code-add
```

Use read-only modes when checking intake without mutation:

```bash
.codex/skills/task-intake/scripts/run.sh --issue <number> --check-only
.codex/skills/task-intake/scripts/run.sh --issue <number> --worktree <path> --branch <name> --dry-run --no-code-add
```

The script owns deterministic gate checks:

- live issue title, state, labels, relationship, and body section validation
- `status:intake` to `status:ready` sync when intake passes
- existing `worktree-add.sh` reuse for worktree preparation
- intake receipt comment creation
- dry-run output that separates remote and local planned mutations

Fallback to manual `gh` and raw `git worktree` commands only when the script is
absent or broken. Report the fallback reason on the source issue.

## Workflow

1. Read `AGENTS.md` and `docs/operations/issue-system.md`.
2. Identify the source issue.
   - If the user gives an issue number, use it.
   - If no issue exists and the task will change committed files, create a bounded leaf issue first.
   - Prefer Korean for issue body prose and keep the English title prefix.
3. Fetch live issue state with `gh issue view` or `gh api`.
4. Run the script-first gate in `--check-only` or `--dry-run` mode when you need
   to inspect planned mutations.
5. Run the script-first gate in mutation mode before implementation:
   - pass `--issue <number>`
   - pass the isolated `--worktree <path>`
   - pass the implementation `--branch <name>`
   - pass `--base origin/main`
   - pass `--no-code-add` when the visible editor should not be mutated
6. The script checks intake requirements.
   - title convention
   - labels including type, kind, status, priority, and area
   - scope
   - non-scope
   - acceptance criteria
   - dependency notes when relevant
   - completion signal
7. If intake fails, update the issue or ask for the missing decision. Do not edit repo files.
8. If intake passes, the script ensures the issue has `status:ready` when appropriate.
9. The script creates or selects an isolated worktree through `worktree-add.sh`.
   - Existing positional form remains supported by `worktree-add.sh`, but agents
     should call `run.sh` first.
   - Do not implement on a dirty or unrelated branch.
10. The script adds an intake receipt comment to the issue.

- issue number
- branch
- worktree path
- accepted scope
- non-scope
- planned verification

11. Plan the first atomic commit before editing.

- Non-trivial work must be committed in versionable atomic units as it
  progresses.
- Do not save all repository changes for one final catch-all commit.
- Each completed commit should have one reviewable intent and be
  understandable to the next agent from its subject and diff.

12. Begin implementation only after the script succeeds and the receipt is written.

## Stop Conditions

- No source issue for a committed change.
- Issue scope is ambiguous.
- Acceptance criteria are missing.
- Current worktree has unrelated local changes.
- Worktree creation would overwrite an existing path.

## Required Commands

Use the script-first gate before raw issue or worktree commands:

```bash
.codex/skills/task-intake/scripts/run.sh --issue <number> --worktree ../app-issue-<n>-<slug> --branch work/<n>-<slug> --base origin/main --no-code-add
```

`run.sh` delegates worktree creation to:

```bash
.codex/skills/task-intake/scripts/worktree-add.sh --path ../app-issue-<n>-<slug> --branch work/<n>-<slug> --base origin/main --no-code-add
```

Legacy positional form remains valid:

```bash
BLOG_APP_SKIP_CODE_ADD=1 .codex/skills/task-intake/scripts/worktree-add.sh ../app-issue-<n>-<slug> work/<n>-<slug> origin/main
```

Raw `git worktree add` is fallback only when the script is absent or broken, and the final workspace file must then be regenerated with:

```bash
node .codex/skills/task-intake/scripts/update-vscode-workspace.mjs
```

## Script Metadata

| Field        | Value                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script Path  | `scripts/run.sh`                                                                                                                                                                        |
| Test Path    | `scripts/run.test.sh`                                                                                                                                                                   |
| Purpose      | Validate intake readiness, sync issue status, prepare the isolated worktree, and write the intake receipt.                                                                              |
| Inputs       | `--issue`, `--worktree`, `--branch`, `--base`, `--check-only`, `--dry-run`, `--fix-issue`, `--no-fix-issue`, `--no-code-add`; optional `TASK_INTAKE_WORKTREE_ADD_SH` for focused tests. |
| Side Effects | Remote mutation: issue status label update and receipt comment. Local mutation: worktree creation through `worktree-add.sh`. Read-only with `--check-only` or `--dry-run`.              |
| Exit Codes   | `0` success, `1` runtime or external state failure, `2` invalid arguments, `3` intake or policy failure.                                                                                |
| Error Style  | Next-action error messages.                                                                                                                                                             |

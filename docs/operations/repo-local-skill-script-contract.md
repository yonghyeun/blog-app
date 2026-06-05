# Repo-Local Skill Script Contract

This contract defines how scripts under repo-local Codex skills are authored in
this repository.

It applies to scripts under:

```text
.codex/skills/<skill-name>/scripts/
```

It extends the repo-local skill structure contract:

- [Repo-Local Skill Contract](./repo-local-skill-contract.md)

## Purpose

Skill scripts exist to make repeated operational behavior deterministic.

They must be:

- narrow enough to review from the script name and metadata
- explicit about local and remote side effects
- safe to run from the repository root
- predictable for agents and humans
- covered by colocated tests unless a documented exception applies
- clear about failure cause and the next action

## When To Create A Script

Create a script when the skill needs behavior that is easier to verify as code
than as prose.

Use a script for:

- repeatable command orchestration
- worktree, branch, issue, PR, or file bookkeeping that must stay consistent
- argument validation with predictable error output
- deterministic formatting or artifact generation
- remote API calls whose request shape should not be rewritten every time
- safety checks before local or remote mutation

Do not create a script for:

- one-off commands that are clearer inline in `SKILL.md`
- judgment-heavy review or planning steps
- behavior that depends on interactive agent reasoning
- broad wrappers that hide unrelated side effects
- replacing a documented repo contract with duplicated logic

If a command is simple but risky, prefer a script. Risky behavior benefits from
consistent validation, dry-run handling, and next-action error messages.

## Placement And Naming

Scripts must live under the owning skill:

```text
.codex/skills/<skill-name>/scripts/<action>.sh
```

Rules:

- Use action-oriented names such as `worktree-add.sh` or
  `read-comments.sh`.
- Keep one primary operation per script.
- Do not place shared helpers in `.codex/skills/scripts`.
- Do not make scripts depend on another skill's private `scripts/` directory.
- If behavior becomes shared across multiple skills, create a separate follow-up
  issue before adding shared tooling.

## Shell Style

Shell scripts must be Bash unless the issue explains why another runtime is
needed.

Required shell baseline:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

Style rules:

- quote variable expansions unless word splitting is intentional
- parse flags with an explicit loop or a small deterministic parser
- keep usage text in a `usage()` function
- validate required args before mutation
- resolve repository paths from `git rev-parse --show-toplevel` when the script
  touches repo files
- prefer `printf` for computed output
- write errors to stderr
- keep stdout for success output or machine-readable output
- avoid hidden global state when args or env vars can make behavior explicit
- avoid broad shell globs for mutation
- do not use aliases or shell options that only exist in interactive shells

Avoid:

- implicit current-directory assumptions outside the documented preconditions
- unquoted command substitution in mutating paths
- silent fallback after failed validation
- catch-all success messages when partial work failed
- destructive cleanup without confirmation or a documented force flag

## Inputs

Scripts may accept positional args, flags, environment variables, or stdin.

Document every input in the owning `SKILL.md` command table or in a linked
script metadata section.

### Required Args

Required args must:

- be validated before side effects
- fail with exit code `2` when missing or invalid
- name the missing input in the error
- provide the next action

Example:

```text
Missing issue number. Pass --issue <number> or provide an issue URL.
```

### Optional Args

Optional args must:

- have documented defaults
- be visible in `--help` output when the script has help output
- avoid changing mutation scope unless the option name makes that clear

Use explicit flags for behavior-changing options.

Examples:

```text
--dry-run
--no-code-add
--base origin/main
--worktree <path>
```

### Environment Variables

Use environment variables only for:

- credentials or tokens already expected by a CLI
- compatibility with existing repo-local behavior
- opt-out behavior that should not clutter normal command usage

Rules:

- document every supported env var
- avoid env vars for required business inputs
- prefer flags over env vars for reviewable workflow decisions
- never echo secrets

### Stdin

Use stdin only when the script processes streamed content or when a CLI contract
requires it.

Rules:

- document whether stdin is required or optional
- fail fast when required stdin is absent
- avoid mixing stdin with unrelated positional content

## Side Effects

Every script must classify side effects as local mutation, remote mutation, or
read-only behavior.

Local mutation examples:

- creating, editing, or deleting files
- creating worktrees
- updating workspace files
- creating commits
- changing local branches

Remote mutation examples:

- editing GitHub issues or PRs
- creating comments
- pushing branches
- changing labels
- calling a write API

Read-only examples:

- fetching issue state
- listing labels
- printing a planned command
- validating local file structure

Rules:

- document side effects before the script is used in a skill workflow
- separate read-only checks from mutation when practical
- name remote writes in success output
- do not hide remote mutation behind a read-only command name

## Exit Codes

Scripts must keep exit codes predictable.

Use this baseline:

| Exit Code | Meaning                                    |
| --------- | ------------------------------------------ |
| `0`       | Success.                                   |
| `1`       | Runtime failure or unmet external state.   |
| `2`       | Usage error, invalid args, or invalid env. |
| `3`       | Intake, policy, or precondition failure.   |
| `4`       | Destructive action requires confirmation.  |

Rules:

- document any script-specific exit code beyond this baseline
- do not return `0` after a failed required mutation
- preserve meaningful exit codes from child validators when the script is only
  forwarding validation result

## Error Messages

Scripts must emit next-action error messages.

Pattern:

```text
<problem>. <next action>.
```

Examples:

```text
Worktree path already exists. Choose --worktree <path> or run task-close first.
```

```text
GitHub issue is missing acceptance criteria. Update the issue body before intake.
```

```text
GitHub API request failed. Re-run with GH_DEBUG=api and check token permissions.
```

Rules:

- include the failing target when useful
- keep the next action concrete
- do not expose tokens, file keys, or secrets
- avoid vague messages such as `Failed`, `Invalid input`, or
  `Something went wrong`

## Dry Run, Confirmation, And Destructive Actions

Scripts that mutate local or remote state should support `--dry-run` when the
planned action can be represented accurately.

Dry-run rules:

- print what would change
- do not write files
- do not edit issues, PRs, labels, or comments
- do not create branches, worktrees, or commits
- make the output distinguish local and remote planned mutations

Confirmation is required for destructive actions unless the user explicitly
requested the destructive action in the current task and the script is designed
for that action.

Destructive examples:

- deleting a worktree
- removing files
- closing issues
- changing issue ownership labels
- force-updating a branch

Confirmation rules:

- use an explicit `--yes` or similarly named flag
- fail with exit code `4` when confirmation is required but missing
- print the exact next command or flag needed
- prefer repo-local cleanup scripts over raw destructive commands

## Colocated Tests

Script tests must be colocated with the script they test.

Examples:

```text
scripts/worktree-add.sh
scripts/worktree-add.test.sh
```

```text
scripts/update-vscode-workspace.mjs
scripts/update-vscode-workspace.test.mjs
```

Rules:

- preserve the script basename and add `.test` before the extension
- test argument parsing failures
- test dry-run behavior when supported
- test important side-effect boundaries with temporary directories or mocked
  commands
- test next-action error messages for common failures
- document an exception when a script is trivial or not practically testable

An exception must name:

- why no colocated test exists
- what verification command or manual check covers the script instead
- which follow-up issue will add coverage when the exception is temporary

## Script Metadata

Every skill with scripts must document script metadata.

Minimum schema:

| Field        | Required | Meaning                                      |
| ------------ | -------- | -------------------------------------------- |
| Script Path  | yes      | Path under `scripts/`.                       |
| Test Path    | yes      | Colocated test path or documented exception. |
| Purpose      | yes      | Deterministic behavior the script owns.      |
| Inputs       | yes      | Args, env vars, or stdin.                    |
| Side Effects | yes      | Local or remote mutation.                    |
| Exit Codes   | yes      | Important exit code meanings.                |
| Error Style  | yes      | Whether next-action errors are followed.     |

Keep metadata in `SKILL.md` when it is short. Move detailed metadata to a
skill-local `references/` file only when it would make `SKILL.md` hard to scan.

## Follow-Up Boundaries

This contract does not implement enforcement.

Follow-up leaf work owns:

- validator implementation
- CI quality gate integration
- migration of existing skill scripts
- adding missing colocated tests for existing scripts
- changing the repo-local skill location from `.codex/skills` to another path

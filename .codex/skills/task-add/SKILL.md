---
name: task-add
description: "Create a GitHub umbrella, leaf, or standalone issue for the repo task graph. Use required `--kind` arguments to choose parent tracking, child work, or standalone bounded work."
---

# Task Add

## Goal

Create one GitHub issue in the repo task graph.

This skill owns remote issue graph creation only. It does not create a worktree,
edit repository files, open a PR, close issues, or run implementation. Use
`task-intake` after a leaf or standalone issue is ready for implementation.

## Required Arguments

`--kind` is required.

Accepted forms:

```text
task-add --kind umbrella
task-add --kind leaf --parent #<umbrella>
task-add --kind standalone
```

Fail immediately when:

- `task-add` is invoked without arguments.
- `--kind` is missing.
- `--kind` is not `umbrella`, `leaf`, or `standalone`.
- `--kind leaf` is used without `--parent #<umbrella>`.
- `--kind standalone` is used with `--parent`.
- `--kind umbrella` is used with a required executable result that should be a
  leaf or standalone issue.

## Shared Workflow

1. Read `AGENTS.md` and `docs/operations/issue-system.md`.
2. Confirm the requested issue kind from `--kind`.
3. Prefer Korean prose in the title summary and body.
4. Keep the English title prefix, such as `chore:`, `feat:`, or `docs:`.
5. Apply labels for all axes: `type:*`, `kind:*`, `status:intake`,
   `priority:*`, and one or more `area:*`.
6. Include scope, non-scope, acceptance criteria, dependencies when relevant, and
   completion signal.
7. Run `.codex/skills/task-add/scripts/create-issue.sh` for issue creation.
8. Report the issue URL, labels, relationship notes, and next action.

Do not call `gh issue create` directly for `task-add` work unless the script is
missing or broken. The script owns label-axis validation, title/type alignment,
kind/label alignment, leaf parent validation, issue creation, leaf sub-issue
registration, and optional parent tracking comments.

## Commands

| Command                                          | When                                          | Required Args                                                                                                       | Optional Args                         | Preconditions                                                                                                            | Side Effects                                                                                                                                                            | Output                                                | Failure / Next Action                                                                                                                                                                            |
| ------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.codex/skills/task-add/scripts/create-issue.sh` | Every issue creation mutation for this skill. | `--kind`, `--title`, `--body-file`, one `--label` for each required axis. `--parent` is required for `--kind leaf`. | `--parent-comment-file`, `--dry-run`. | `AGENTS.md` and `docs/operations/issue-system.md` read; body file already drafted; labels chosen from the repo taxonomy. | Remote mutation: creates one GitHub issue. For leaf issues, registers the issue as a GitHub sub-issue. When `--parent-comment-file` is present, comments on the parent. | Created issue URL and sub-issue registration summary. | Fix the reported argument, label, parent, or GitHub API problem before retrying. Do not fall back to direct `gh` mutation unless the script itself is broken and the degraded state is reported. |

Script metadata:

- Script Path: `.codex/skills/task-add/scripts/create-issue.sh`
- Test Path: `.codex/skills/task-add/scripts/create-issue.test.sh`
- Purpose: deterministic `task-add` issue creation and relationship mutation.
- Inputs: flags, a Markdown issue body file, optional parent comment file.
- Side Effects: GitHub issue creation, sub-issue registration, optional parent
  comment.
- Exit Codes: `0` success, `1` runtime/GitHub failure, `2` invalid usage,
  `3` issue contract/precondition failure.
- Error Style: next-action errors.

## `--kind umbrella`

Use this mode for a parent control-plane issue that owns a multi-leaf outcome.

The umbrella tracks:

- why the group exists now
- shared context
- likely leaf sequence
- cross-leaf decisions
- closeout signal

Workflow:

1. Build enough context to write a bounded umbrella.
2. Confirm the issue will own sequencing, shared decisions, and closeout status.
3. Draft a Markdown body file.
4. Include these sections:
   - `Intended labels`
   - `Context`
   - `Goal`
   - `Scope`
   - `Non-Scope`
   - `Leaf Sequence`
   - `Acceptance Criteria`
   - `Completion Signal`
5. Create the GitHub issue through the script:

```bash
.codex/skills/task-add/scripts/create-issue.sh \
  --kind umbrella \
  --title "<type>: <summary>" \
  --body-file <body.md> \
  --label type:<type> \
  --label kind:umbrella \
  --label status:intake \
  --label priority:<p0|p1|p2|p3> \
  --label area:<area>
```

6. Add or initialize the tracking surface.
   - The issue body may hold the first tracking surface.
   - If the plan is likely to change, add a tracking comment and say it is the
     current execution surface.
7. Report the intended first leaf, if known.

## `--kind leaf --parent #<umbrella>`

Use this mode for one bounded executable issue under an existing umbrella.

Workflow:

1. Fetch live parent state with:

```bash
gh api repos/:owner/:repo/issues/<parent>
```

2. Verify the parent is open and labeled `kind:umbrella`.
3. Build the leaf issue body around exactly one executable result.
4. Add relationship notation:
   - `Parent: #<umbrella>`
   - `Sub-issue of: #<umbrella>`
   - `Related: #<issue>` for informational context only
   - `Depends on: #<issue>` when planned order matters
   - `Blocked by: #<issue>` only when work is actually stuck
   - `Blocks: #<issue>` when this leaf must finish before another issue
5. Draft a parent tracking comment file when the parent should be updated in the
   same mutation path. The comment file may use `{{issue_number}}` and
   `{{issue_url}}` placeholders.
6. Create the GitHub issue and register it as a sub-issue through the script:

```bash
.codex/skills/task-add/scripts/create-issue.sh \
  --kind leaf \
  --parent #<umbrella> \
  --title "<type>: <summary>" \
  --body-file <body.md> \
  --label type:<type> \
  --label kind:leaf \
  --label status:intake \
  --label priority:<p0|p1|p2|p3> \
  --label area:<area> \
  --parent-comment-file <comment.md>
```

The script validates the parent, creates the issue, fetches the created leaf id,
and registers it with:

```bash
gh api repos/:owner/:repo/issues/<parent>/sub_issues -X POST -F sub_issue_id=<leaf_issue_id>
```

7. If `--parent-comment-file` was not used, update the umbrella tracking surface
   manually and report the degraded reason.
8. Report whether `task-intake` should run next.

## `--kind standalone`

Use this mode for one bounded executable issue without umbrella progress
tracking.

Standalone issues are for work that:

- is executable as one issue
- has no parent sequencing surface
- carries its own context, scope, non-scope, acceptance criteria, dependencies,
  and completion signal
- can close without advancing an umbrella

Workflow:

1. Confirm the requested work does not need umbrella sequencing, shared
   decisions, or parent closeout tracking.
2. Build the standalone issue body around exactly one bounded outcome.
3. Add relationship notation:
   - `Related: #<issue>` for informational context only
4. Do not add `Parent` or `Sub-issue of` notation.
5. Create the GitHub issue through the script:

```bash
.codex/skills/task-add/scripts/create-issue.sh \
  --kind standalone \
  --title "<type>: <summary>" \
  --body-file <body.md> \
  --label type:<type> \
  --label kind:standalone \
  --label status:intake \
  --label priority:<p0|p1|p2|p3> \
  --label area:<area>
```

6. Do not register the issue as a GitHub sub-issue.
7. Report whether `task-intake` should run next.

## Relationship Rules

- An umbrella should not have a parent issue by default.
- A leaf has exactly one umbrella parent.
- A leaf may have N related issues.
- A standalone issue has no parent issue.
- A standalone issue must not be registered as a sub-issue.
- A standalone issue may reference related issues for context only.
- `Related` never means parent, dependency, or execution order.
- `Depends on` and `Blocked by` are order or readiness signals, not ownership.
- Shared context belongs on the umbrella tracking surface, not duplicated into
  every leaf.
- Every executable leaf under an umbrella must be registered as a GitHub
  sub-issue when the API is available.
- If the sub-issue API is unavailable, record the relationship in both issue
  bodies or comments and report the degraded state.
- Keep the umbrella open while required leaf work remains active.

## Stop Conditions

- Required arguments are missing or invalid.
- The requested umbrella has one bounded executable result. Use
  `task-add --kind leaf --parent #<umbrella>`.
- The requested standalone issue needs parent sequencing, shared decisions, or
  parent closeout tracking. Use an umbrella and leaf issue instead.
- The requested standalone issue includes a parent issue or sub-issue
  registration requirement.
- The requested leaf has no parent umbrella.
- The requested leaf parent is closed.
- The requested leaf parent is not labeled `kind:umbrella`.
- The labels fail `.codex/skills/task-add/scripts/create-issue.sh` validation.
- The requested leaf spans multiple executable outcomes. Split it first.
- Scope, non-scope, acceptance criteria, or completion signal is missing.
- The sub-issue registration fails and no fallback relationship note is recorded.

## Verification

Run the colocated script test after changing this skill:

```bash
bash .codex/skills/task-add/scripts/create-issue.test.sh
```

For command-shape checks without remote mutation, run the script with
`--dry-run`.

## Output

Report:

- issue URL
- kind and labels
- relationship notes
- tracking surface update, if any
- next recommended skill or command

---
name: task-add
description: "Create a GitHub umbrella or leaf issue for the repo task graph. Use with required arguments: `--kind umbrella` for parent tracking issues, or `--kind leaf --parent #N` for bounded executable work registered as a GitHub sub-issue."
---

# Task Add

## Goal

Create one GitHub issue in the repo task graph.

This skill owns remote issue graph creation only. It does not create a worktree,
edit repository files, open a PR, close issues, or run implementation. Use
`task-intake` after a leaf is ready for implementation.

## Required Arguments

`--kind` is required.

Accepted forms:

```text
task-add --kind umbrella
task-add --kind leaf --parent #<umbrella>
```

Fail immediately when:

- `task-add` is invoked without arguments.
- `--kind` is missing.
- `--kind` is not `umbrella` or `leaf`.
- `--kind leaf` is used without `--parent #<umbrella>`.
- `--kind umbrella` is used with a required executable result that should be a
  leaf.

## Shared Workflow

1. Read `AGENTS.md` and `docs/operations/issue-system.md`.
2. Confirm the requested issue kind from `--kind`.
3. Prefer Korean prose in the title summary and body.
4. Keep the English title prefix, such as `chore:`, `feat:`, or `docs:`.
5. Apply labels for all axes: `type:*`, `kind:*`, `status:intake`,
   `priority:*`, and one or more `area:*`.
6. Include scope, non-scope, acceptance criteria, dependencies when relevant, and
   completion signal.
7. Report the issue URL, labels, relationship notes, and next action.

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
3. Create the GitHub issue with `kind:umbrella`.
4. Include these sections:
   - `Intended labels`
   - `Context`
   - `Goal`
   - `Scope`
   - `Non-Scope`
   - `Leaf Sequence`
   - `Acceptance Criteria`
   - `Completion Signal`
5. Add or initialize the tracking surface.
   - The issue body may hold the first tracking surface.
   - If the plan is likely to change, add a tracking comment and say it is the
     current execution surface.
6. Report the intended first leaf, if known.

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
5. Create the GitHub issue with `kind:leaf`.
6. Register the leaf as a GitHub sub-issue of the parent.
   - Fetch the created leaf issue id.
   - Use the REST endpoint with an integer field.
   - The command must use `-F`, not `-f`, so `sub_issue_id` is sent as an
     integer.

```bash
gh api repos/:owner/:repo/issues/<parent>/sub_issues -X POST -F sub_issue_id=<leaf_issue_id>
```

7. Update the umbrella tracking surface.
   - Add the leaf to the current sequence or add a new tracking comment.
   - Include summary, bounded scope, non-scope, AC summary, and dependency notes.
8. Report whether `task-intake` should run next.

## Relationship Rules

- An umbrella should not have a parent issue by default.
- A leaf has exactly one umbrella parent.
- A leaf may have N related issues.
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
- The requested leaf has no parent umbrella.
- The requested leaf parent is closed.
- The requested leaf parent is not labeled `kind:umbrella`.
- The requested leaf spans multiple executable outcomes. Split it first.
- Scope, non-scope, acceptance criteria, or completion signal is missing.
- The sub-issue registration fails and no fallback relationship note is recorded.

## Output

Report:

- issue URL
- kind and labels
- relationship notes
- tracking surface update, if any
- next recommended skill or command

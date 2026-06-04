---
name: task-leaf-add
description: Create a bounded GitHub leaf issue under an existing umbrella and link it as a GitHub sub-issue. Use when the user wants to add executable work to a slice, umbrella, roadmap container, or parent issue while preserving parent ownership, related issue notes, dependencies, and tracking comments.
---

# Task Leaf Add

## Goal

Create one executable leaf issue under exactly one umbrella issue.

This skill owns remote issue graph creation only. It does not create a worktree,
edit repository files, open a PR, or close the issue. Use `task-intake` after the
leaf is ready for implementation.

## Workflow

1. Read `AGENTS.md` and `docs/operations/issue-system.md`.
2. Identify the parent umbrella.
   - A parent issue number is required.
   - Fetch live parent state with `gh api repos/:owner/:repo/issues/<parent>`.
   - Parent must be open and labeled `kind:umbrella`.
3. Build the leaf issue body.
   - Prefer Korean prose in the title summary and body.
   - Keep the English title prefix, such as `chore:`, `feat:`, or `docs:`.
   - The leaf must own one bounded executable result.
4. Add relationship notation.
   - `Parent: #<umbrella>`
   - `Sub-issue of: #<umbrella>`
   - `Related: #<issue>` for informational context only
   - `Depends on: #<issue>` when planned order matters
   - `Blocked by: #<issue>` only when work is actually stuck
   - `Blocks: #<issue>` when this leaf must finish before another issue
5. Create the GitHub issue.
   - Apply labels for all axes: `type:*`, `kind:leaf`, `status:intake`,
     `priority:*`, and one or more `area:*`.
   - Include scope, non-scope, acceptance criteria, dependencies, and completion
     signal.
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
8. Report the result.
   - parent issue URL
   - leaf issue URL
   - sub-issue registration result
   - related and dependency notes
   - next action, usually `task-intake`

## Relationship Rules

- A leaf has exactly one umbrella parent.
- A leaf may have N related issues.
- `Related` never means parent, dependency, or execution order.
- `Depends on` and `Blocked by` are order or readiness signals, not ownership.
- Every executable leaf under an umbrella must be registered as a GitHub
  sub-issue when the API is available.
- If the sub-issue API is unavailable, record the relationship in both issue
  bodies or comments and report the degraded state.

## Stop Conditions

- No parent umbrella issue is provided.
- Parent issue is closed.
- Parent issue is not labeled `kind:umbrella`.
- The requested work spans multiple executable outcomes. Split it first.
- Scope, non-scope, acceptance criteria, or completion signal is missing.
- The sub-issue registration fails and no fallback relationship note is recorded.

## Output

Report:

- leaf issue URL
- parent issue URL
- sub-issue registration status
- labels
- related issues
- dependencies
- umbrella tracking surface update
- whether `task-intake` should run next

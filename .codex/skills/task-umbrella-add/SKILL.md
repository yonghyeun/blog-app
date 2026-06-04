---
name: task-umbrella-add
description: Create a new GitHub umbrella issue for a multi-leaf repo task group. Use when the user wants to add a new slice, workstream, roadmap container, risk-resolution group, or other parent issue that will own sequencing and tracking for future leaf issues.
---

# Task Umbrella Add

## Goal

Create an umbrella issue that owns a multi-leaf outcome.

This skill only creates the parent control-plane issue. It does not create leaf
issues, start implementation, create a worktree, or open a PR.

## Workflow

1. Read `AGENTS.md` and `docs/operations/issue-system.md`.
2. Build enough context to write a bounded umbrella.
   - affected slice or workstream
   - why the group exists now
   - shared context
   - likely leaf sequence
   - known non-scope
   - closeout signal
3. Confirm this is an umbrella, not a leaf.
   - Use this skill when the issue will own sequencing, shared decisions, and
     closeout status.
   - Use `task-leaf-add` instead when the issue has one executable outcome under
     an existing umbrella.
4. Create the GitHub issue.
   - Prefer Korean prose in the title summary and body.
   - Keep the English title prefix, such as `chore:`, `feat:`, or `docs:`.
   - Apply labels for all axes: `type:*`, `kind:umbrella`, `status:intake`,
     `priority:*`, and one or more `area:*`.
5. Include the required body sections.
   - `Intended labels`
   - `Context`
   - `Goal`
   - `Scope`
   - `Non-Scope`
   - `Leaf Sequence`
   - `Acceptance Criteria`
   - `Completion Signal`
6. Add or initialize the tracking surface.
   - The issue body may hold the first tracking surface.
   - If the plan is likely to change, add a tracking comment and say it is the
     current execution surface.
7. Report the result.
   - umbrella issue URL
   - labels
   - intended first leaf, if known
   - next action, usually `task-leaf-add`

## Relationship Rules

- An umbrella should not have a parent issue by default.
- An umbrella may reference related issues, but related issues are not owners.
- Shared context belongs on the umbrella tracking surface, not duplicated into
  every leaf.
- Keep the umbrella open while required leaf work remains active.

## Stop Conditions

- The requested issue has one bounded executable result. Use `task-leaf-add`.
- The requested issue needs implementation immediately. Create the umbrella first,
  then create a leaf, then run `task-intake`.
- Required scope, non-scope, or completion signal is missing.
- The requested labels do not fit the repo label taxonomy.

## Output

Report:

- umbrella issue URL
- title and labels
- tracking surface location
- leaf sequence status
- next recommended skill

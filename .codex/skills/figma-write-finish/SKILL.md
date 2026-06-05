---
name: figma-write-finish
description: Finish a Figma MCP write by inspecting the result and recording delivered nodes. Use after a Figma MCP write; it never merges a branch into main.
---

# Figma Write Finish

## Goal

Close the Figma MCP write loop without promoting unreviewed changes to the main
Figma file.

This skill records what changed, prepares review, and leaves branch merge as a
separate explicit step.

## Required Reading

1. `AGENTS.md`
2. `docs/design/figma-mcp-usage.md`
3. Source issue body and comments when `--issue <number>` is provided
4. The matching `Figma Write Target` issue comment, assistant message, or
   private operator note

## Arguments

Default behavior is ad-hoc.

Use `--issue <number>` only when the matching Figma write target was tracked on
a GitHub issue.

Examples:

```text
figma-write-finish
figma-write-finish --issue 32
```

## Inputs

- optional source issue number from `--issue <number>`
- matching ad-hoc target record when no issue is provided
- write mode from `figma-write-start`
- target branch, duplicate, or main-checkpoint reference
- delivered page, frame, component, and node names
- post-write checkpoint name when applicable

## Workflow

1. Re-read the matching `Figma Write Target` record.
2. Inspect the target Figma surface after the write.
3. Verify the result stays inside the expected page, frame, or component scope.
4. Check for obvious contract drift:
   - wrong page
   - raw colors or untracked styles
   - detached final instances
   - unexpected new components
   - layer names that do not match the design contract
   - concrete Figma key or URL leakage in tracked files
5. If the mode is `main-checkpoint`, confirm a named post-write checkpoint:

```text
After issue-<number>-<short-scope>
```

6. Record the result.

For issue-backed work, add a source issue comment. Use issue-backed mode only
when `--issue <number>` is provided:

```text
## Figma Write Result

- Issue: #<number>
- Tracking: issue-backed
- Mode: branch | duplicate | main-checkpoint
- Target: <redacted branch/file URL or local-only reference>
- Delivered nodes: <page/frame/component names and node ids>
- Post-write checkpoint: <name or not applicable>
- Review status: pending | accepted | abandoned
- Merge-back notes: <branch merge, manual copy, or none>
```

For ad-hoc work, report or save this record without posting to GitHub:

```text
## Figma Write Result

- Issue: none
- Tracking: ad-hoc
- Mode: branch | duplicate | main-checkpoint
- Target: <redacted branch/file URL or local-only reference>
- Delivered nodes: <page/frame/component names and node ids>
- Post-write checkpoint: <name or not applicable>
- Review status: pending | accepted | abandoned
- Merge-back notes: <branch merge, manual copy, or none>
```

7. If the work is on a branch, leave review status as `pending` unless an
   explicit review decision already exists.
8. If the work is on a duplicate, record that merge-back is manual.
9. If the work is abandoned, record why and whether the branch or duplicate
   should be archived.

## Output

Report:

- source issue when provided
- tracking mode
- write mode
- delivered nodes
- review status
- issue comment URL or ad-hoc result record
- whether `figma-branch-merge` is eligible later

## Stop Conditions

- no matching `Figma Write Target` record
- target surface cannot be inspected
- delivered nodes are unknown
- write appears to have modified the wrong Figma surface
- post-write checkpoint is missing for `main-checkpoint` mode
- branch work is being asked to merge during finish

## Merge Boundary

Do not merge a Figma branch into main in this skill.

Use `figma-branch-merge` only after the user explicitly asks to merge an
accepted Figma branch.

## Non-Goals

- Figma branch merge
- manual duplicate-to-main promotion
- changing Figma plan, seat, or sharing settings
- performing further Figma MCP write work

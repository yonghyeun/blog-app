---
name: figma-branch-merge
description: Coordinate an explicitly approved Figma branch merge into the main design file. Use only when the user says a Figma branch can be merged.
---

# Figma Branch Merge

## Goal

Promote reviewed Figma branch work to the main Figma file with an explicit
approval boundary.

This skill is separate from `figma-write-finish` because the main Figma file is
the design source of truth.

## Trigger

Use only when the user explicitly says the Figma branch can be merged, landed, or
promoted to main.

Do not infer merge approval from write completion.

## Required Reading

1. `AGENTS.md`
2. `docs/design/figma-mcp-usage.md`
3. Source issue body and comments when `--issue <number>` is provided
4. Matching `Figma Write Target` and `Figma Write Result` records

## Arguments

Default behavior is ad-hoc.

Use `--issue <number>` only when the matching Figma write was tracked on a
GitHub issue.

Examples:

```text
figma-branch-merge
figma-branch-merge --issue 32
```

## Inputs

- optional source issue number from `--issue <number>`
- matching ad-hoc result record when no issue is provided
- branch reference
- review approval signal
- delivered page, frame, component, and node names
- known conflicts or pending concerns

## Environment

Use the current repo-local Figma environment keys from `.env.local`:

```text
FIGMA_MAIN_FILE_KEY
FIGMA_ACCESS_TOKEN
```

Use `FIGMA_MAIN_FILE_KEY` to identify the main file. Use
`FIGMA_ACCESS_TOKEN` only when an approved tool or workflow explicitly needs
Figma API authentication.

Never print, commit, or post concrete values.

## Workflow

1. Verify the user explicitly requested merge in the current task.
2. Verify the work mode is `branch`.
3. Verify the write result exists and is not `abandoned`.
4. Verify review status is `accepted` or the current user request clearly
   supplies acceptance.
5. Inspect the branch and main file before merge when Figma access is available.
6. Check that no concrete private Figma key or branch key is committed.
7. Confirm there is a recoverable version-history boundary before merge.
   Figma creates branch and merge checkpoints, but the operator should still
   confirm the branch and main state before proceeding.
8. Merge through Figma's branch review and merge flow.
   - Do not attempt raw or invented API calls.
   - If an MCP tool explicitly supports Figma branch merge in the current
     environment, use it only after confirming the target branch and main file.
   - Otherwise, guide the human/operator to merge in Figma and continue with
     post-merge verification.
9. Inspect the main file after merge when access is available.
10. Record the merge result.

For issue-backed work, add a source issue comment. Use issue-backed mode only
when `--issue <number>` is provided:

```text
## Figma Branch Merge Result

- Issue: #<number>
- Tracking: issue-backed
- Branch: <redacted branch URL or local-only reference>
- Main file: FIGMA_MAIN_FILE_KEY
- Merged nodes: <page/frame/component names and node ids>
- Merge status: merged | blocked | abandoned
- Verification: <main file inspected, human-confirmed, or blocked reason>
- Follow-up: <none or required action>
```

For ad-hoc work, report or save this record without posting to GitHub:

```text
## Figma Branch Merge Result

- Issue: none
- Tracking: ad-hoc
- Branch: <redacted branch URL or local-only reference>
- Main file: FIGMA_MAIN_FILE_KEY
- Merged nodes: <page/frame/component names and node ids>
- Merge status: merged | blocked | abandoned
- Verification: <main file inspected, human-confirmed, or blocked reason>
- Follow-up: <none or required action>
```

## Output

Report:

- source issue when provided
- tracking mode
- merge status
- verification status
- issue comment URL or ad-hoc merge record
- follow-up or blocker

## Stop Conditions

- merge was not explicitly requested
- write mode is not `branch`
- branch reference is missing
- write result is missing or abandoned
- review acceptance is missing
- target branch or main file identity is ambiguous
- branch has unresolved conflicts or Figma reports incomplete merge/update risk
- only available merge path requires exposing concrete private Figma keys in
  tracked files or public issue text

## Non-Goals

- finishing a Figma write
- merging duplicate files
- deciding Figma plan or seat changes
- implementing custom Figma branch automation

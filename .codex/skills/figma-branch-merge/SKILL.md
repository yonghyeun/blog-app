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
3. Source issue body and comments
4. Matching `Figma Write Target` and `Figma Write Result` comments

## Inputs

- source issue number
- branch reference
- review approval signal
- delivered page, frame, component, and node names
- known conflicts or pending concerns

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
10. Add a source issue comment:

```text
## Figma Branch Merge Result

- Issue: #<number>
- Branch: <redacted branch URL or local-only reference>
- Main file: FIGMA_VERTICAL_SLICE_V1_FILE_KEY
- Merged nodes: <page/frame/component names and node ids>
- Merge status: merged | blocked | abandoned
- Verification: <main file inspected, human-confirmed, or blocked reason>
- Follow-up: <none or required action>
```

## Output

Report:

- source issue
- merge status
- verification status
- issue comment URL
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

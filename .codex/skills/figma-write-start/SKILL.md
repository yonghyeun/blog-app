---
name: figma-write-start
description: Prepare a Figma MCP write by choosing the isolation surface and recording the write target. Use before any Figma MCP write for this repo.
---

# Figma Write Start

## Goal

Prevent accidental writes to the Figma main file.

This skill chooses the target surface for a Figma MCP write and records the
decision before any design mutation happens.

## Required Reading

1. `AGENTS.md`
2. `docs/design/figma-mcp-usage.md`
3. Source issue body and comments

## Inputs

- source issue number
- intended Figma write scope
- target page, frame, or component names
- current Figma access mode when known
- branch URL, duplicate URL, or checkpoint name when already prepared

## Environment

Read Figma values from the current worktree's `.env.local`.

Current repo-local Figma environment keys:

```text
FIGMA_VERTICAL_SLICE_V1_FILE_KEY
FIGMA_ACCESS_TOKEN
```

Use `FIGMA_VERTICAL_SLICE_V1_FILE_KEY` as the main file key. Use
`FIGMA_ACCESS_TOKEN` only when an approved tool or workflow explicitly needs
Figma API authentication.

Do not print, commit, or paste either value into issue comments, PR bodies, logs,
or tracked docs. `.env.example` documents key names only; it is not a source for
real values.

## Workflow

1. Verify the source issue passed intake.
2. Read the current repo-local Figma environment keys from `.env.local`.
3. Confirm `FIGMA_VERTICAL_SLICE_V1_FILE_KEY` is present when no explicit local
   target was provided.
4. Confirm no concrete Figma file key, branch key, or access token will be
   committed or posted.
5. Choose the isolation mode using this order:

```text
branch -> duplicate -> main-checkpoint
```

6. Use `branch` when Figma branching is available and the actor can create or
   edit a branch.
7. Use `duplicate` when branch access is unavailable or blocked.
8. Use `main-checkpoint` only when branch and duplicate isolation are unsuitable.
9. For `main-checkpoint`, require a named pre-write checkpoint:

```text
Before issue-<number>-<short-scope>
```

10. Add a source issue comment before the write:

```text
## Figma Write Target

- Issue: #<number>
- Mode: branch | duplicate | main-checkpoint
- Reason: <why this mode is used>
- Main file: FIGMA_VERTICAL_SLICE_V1_FILE_KEY
- Target: <redacted branch/file URL or local-only reference>
- Pre-write checkpoint: <name or not applicable>
- Expected write surface: <page/frame/component names>
```

11. Return the exact target surface the next Figma MCP call should use.

## Output

Report:

- source issue
- selected mode
- target surface
- expected page/frame/component names
- issue comment URL
- whether the next step may call Figma MCP write tools

## Stop Conditions

- no source issue
- source issue has not passed intake
- target surface is unknown
- the current worktree lacks `.env.local` and no explicit local target is
  provided
- `.env.local` lacks `FIGMA_VERTICAL_SLICE_V1_FILE_KEY` and no explicit local
  target is provided
- branch mode is requested but no branch target exists or can be created by the
  human/operator
- main-checkpoint mode is selected without a named pre-write checkpoint
- the only available target would expose a concrete private Figma key in tracked
  files or public issue text

## Non-Goals

- creating Figma branches automatically
- merging Figma branches
- performing the Figma MCP write
- deciding Figma plan or seat changes

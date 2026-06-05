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

- source issue number, or explicit ad-hoc request
- intended Figma write scope
- target page, frame, or component names
- current Figma access mode when known
- branch URL, duplicate URL, or checkpoint name when already prepared

## Tracking Modes

Prefer `issue-backed` mode for Figma work that will become an implementation
handoff or design source-of-truth change.

Use `ad-hoc` mode when the user explicitly asks to explore, test, or create a
Figma branch without a source issue.

```text
issue-backed -> record on the source issue
ad-hoc -> record in the assistant response or a private operator note
```

Ad-hoc mode may create or target a Figma branch or duplicate, but it still must
not write directly to the main file unless the user explicitly chooses
`main-checkpoint`.

Do not silently convert ad-hoc Figma work into issue-backed work. Create an issue
only when the user asks for one or when repo files will be changed.

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

1. Choose tracking mode:
   - use `issue-backed` when a source issue is provided
   - use `ad-hoc` when the user explicitly requests no-issue exploration
2. For `issue-backed`, verify the source issue passed intake.
3. For `ad-hoc`, record the user's explicit request text or a short local
   purpose statement.
4. Read the current repo-local Figma environment keys from `.env.local`.
5. Confirm `FIGMA_VERTICAL_SLICE_V1_FILE_KEY` is present when no explicit local
   target was provided.
6. Confirm no concrete Figma file key, branch key, or access token will be
   committed or posted.
7. Choose the isolation mode using this order:

```text
branch -> duplicate -> main-checkpoint
```

8. Use `branch` when Figma branching is available and the actor can create or
   edit a branch.
9. Use `duplicate` when branch access is unavailable or blocked.
10. Use `main-checkpoint` only when branch and duplicate isolation are unsuitable
    or explicitly chosen by the user.
11. For `main-checkpoint`, require a named pre-write checkpoint:

```text
Before issue-<number>-<short-scope>
```

12. Record the write target.

For `issue-backed`, add a source issue comment:

```text
## Figma Write Target

- Issue: #<number>
- Tracking: issue-backed
- Mode: branch | duplicate | main-checkpoint
- Reason: <why this mode is used>
- Main file: FIGMA_VERTICAL_SLICE_V1_FILE_KEY
- Target: <redacted branch/file URL or local-only reference>
- Pre-write checkpoint: <name or not applicable>
- Expected write surface: <page/frame/component names>
```

For `ad-hoc`, report or save this record without posting to GitHub:

```text
## Figma Write Target

- Issue: none
- Tracking: ad-hoc
- Reason: <explicit user request or local purpose>
- Main file: FIGMA_VERTICAL_SLICE_V1_FILE_KEY
- Target: <redacted branch/file URL or local-only reference>
- Pre-write checkpoint: <name or not applicable>
- Expected write surface: <page/frame/component names>
```

13. Return the exact target surface the next Figma MCP call should use.

## Output

Report:

- source issue
- tracking mode
- selected mode
- target surface
- expected page/frame/component names
- issue comment URL or ad-hoc target record
- whether the next step may call Figma MCP write tools

## Stop Conditions

- no source issue and no explicit ad-hoc request
- source issue has not passed intake in `issue-backed` mode
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

# Agent Routing

This file routes agents to the repo contracts they must read before changing the
repository.

## Default Workflow

For any non-trivial change, follow this lifecycle:

```text
Context Build
-> Issue First
-> Issue Intake
-> Implementation
-> PR
-> Slice Review
-> Risk Resolution / System Upgrade
-> Next Issue
```

Do not start implementation before the source issue passes intake.

## Task Lifecycle Skills

Use these repo-local skills for task lifecycle work:

- Use `task-intake` before implementing a non-trivial issue or task.
- Use `task-merge` when the user says a PR can be merged or landed.
- Use `task-close` when the user asks for closeout, task cleanup, or workspace
  cleanup.

`task-merge` must not remove workspaces. `task-close` owns workspace cleanup
decisions and must prefer `.codex/skills/task-close/scripts/worktree-remove.sh`
over raw `git worktree remove`.

## Required Reading

Before creating or executing issues:

- Read `docs/operations/issue-system.md`.

Before architecture-sensitive work:

- Read `docs/architecture/README.md`.
- Then read the specific architecture contract for the touched surface.

Before creating or changing Storybook stories, Storybook configuration, reusable UI
components, or component fixtures:

- Read `docs/architecture/storybook-ui-surface.md`.
- Keep Storybook focused on browser-safe reusable component states.
- Do not import `src/app` route files or private content repository data into stories.
- Run `npm run storybook:build` before review.

Before using Figma MCP:

- Read `docs/design/figma-mcp-usage.md`.
- Read `FIGMA_VERTICAL_SLICE_V1_FILE_KEY` from `.env.local`; do not commit
  concrete Figma file keys in this public repository.
- Use `figma-write-start` before any Figma MCP write.
  - Use issue-backed mode when a source issue exists.
  - Use ad-hoc mode only when the user explicitly requests no-issue Figma
    exploration.
- Reuse existing Figma variables, text styles, and components before creating
  new assets.
- Use `figma-write-finish` after any Figma MCP write.
- Use `figma-branch-merge` only when the user explicitly approves merging an
  accepted Figma branch into the main file.
- Record Figma file, page, frame, and node references on the source issue or
  umbrella tracking surface.

Before PR or review:

- Read the `Quality Gate` section in `README.md`.
- Run the listed checks unless the issue scope explicitly says otherwise.

## Issue Work

When creating or executing issue work:

- Prefer Korean for issue title summaries and user-facing issue body prose.
- Keep the English title prefix such as `chore:`, `feat:`, or `fix:`.
- Use intended labels from `docs/operations/issue-system.md`.
- Follow the commit-unit policy in `docs/operations/issue-system.md`.
- Keep umbrella context on the umbrella tracking surface.
- Keep leaf work bounded to one executable outcome.
- Record dependency changes in the issue or umbrella tracking comment.

## Slice Review

After a slice or leaf completes, check whether the work exposed a repeated
engineering risk.

Create or propose a risk-resolution issue when the bottleneck would make the next
slice slower, riskier, or harder to trace.

Do not convert every annoyance into system work. Promote only the highest-leverage
recurring bottleneck.

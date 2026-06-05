# Local Git Hooks

This repository keeps local safety hooks under:

```text
.githooks/
```

## Install Or Update

Run this command in each clone or worktree that should use the repo-local hooks:

```bash
npm run hooks:install
```

The command sets this local git configuration:

```bash
git config core.hooksPath .githooks
```

Git hook configuration is local to a clone or worktree. It is not transferred by
`git clone`, so new local checkouts must run the install command once.

## Main Commit Guard

`.githooks/pre-commit` blocks direct commits on the local `main` branch.

Allowed:

- commit on issue worktrees or task branches
- commit while detached from a branch

Blocked:

- commit while the current branch is exactly `main`

The guard prints a short reminder to create an issue worktree or task branch.

## Emergency Bypass

Use bypass only for local repair work that cannot reasonably move to a task
branch:

```bash
BYPASS_MAIN_COMMIT_GUARD=1 git commit ...
```

Prefer creating an issue worktree before using the bypass.

## Verification

Run:

```bash
npm run test:githooks
```

The test creates a temporary git repository and checks:

- `main` fails
- a non-main branch passes
- the explicit bypass passes

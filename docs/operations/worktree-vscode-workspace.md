# Worktree VS Code Workspace

This guide defines the local worktree wrapper flow for this repository.

The goal is to keep CLI-driven issue worktrees visible in one VS Code
multi-root workspace without manually adding or removing folders each time.

## Generated Workspace

The generated file is:

```text
blog-worktrees.code-workspace
```

It is local-only and ignored by git because it contains machine-specific absolute
paths.

Regenerate it from the current git worktree list:

```bash
npm run worktree:workspace
```

The npm wrapper delegates to the task lifecycle skill script at
`.codex/skills/task-close/scripts/update-vscode-workspace.mjs`.

The workspace includes watcher and search excludes for heavy generated folders:

- `node_modules`
- `.next`
- `storybook-static`
- `playwright-report`
- `test-results`
- `dist`
- `build`
- `out`

## Add Worktree

Use the repo wrapper instead of calling `git worktree add` directly:

```bash
npm run worktree:add -- ../app-issue-56 work/56-worktree-vscode-workspace origin/main
```

The npm wrapper delegates to
`.codex/skills/task-intake/scripts/worktree-add.sh`.

Arguments:

- first argument: target worktree path
- second argument: branch name
- third argument: optional start point, defaults to `HEAD`

Behavior:

- creates the worktree
- creates the branch when it does not already exist
- regenerates `blog-worktrees.code-workspace`
- runs `code --add <path>` when the VS Code CLI is available

Skip the live `code --add` step when needed:

```bash
BLOG_APP_SKIP_CODE_ADD=1 npm run worktree:add -- ../app-issue-56 work/56-worktree-vscode-workspace origin/main
```

## Remove Worktree

Use the repo wrapper instead of calling `git worktree remove` directly:

```bash
npm run worktree:remove -- ../app-issue-56
```

The npm wrapper delegates to
`.codex/skills/task-close/scripts/worktree-remove.sh`.

For non-interactive execution:

```bash
npm run worktree:remove -- ../app-issue-56 --yes
```

Behavior:

- requires an explicit registered worktree path
- refuses to remove the main repository worktree
- asks for confirmation unless `--yes` is passed
- removes the worktree
- regenerates `blog-worktrees.code-workspace`
- leaves the branch untouched

Use `--force` only when git refuses a normal worktree removal and the target path
is known to be disposable:

```bash
npm run worktree:remove -- ../app-issue-56 --yes --force
```

## Open VS Code

Open the generated workspace file, not only the repository folder:

```bash
code <repo-root>/blog-worktrees.code-workspace
```

For Linux, keep the absolute local path in your shell config instead of this
repository:

```bash
alias blogcode='code <repo-root>/blog-worktrees.code-workspace'
```

Replace `<repo-root>` with the local absolute path to this repository.

## Agent Use

For this repository, agents should use these wrappers for issue worktree
creation and removal.

Preferred sequence:

```text
issue intake passed
-> npm run worktree:add -- <path> <branch> [start-point]
-> work in the dedicated worktree
-> npm run worktree:remove -- <path> --yes
```

Do not add concrete local worktree paths to committed documentation. Keep those
paths in local shell aliases, generated workspace files, or issue comments when
needed for live execution.

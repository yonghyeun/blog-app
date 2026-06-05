# Operations

Repo operating contracts.

## Contracts

- [Issue System Contract](./issue-system.md)
- [Local Git Hooks](./local-git-hooks.md)
- [Repo-Local Skill Contract](./repo-local-skill-contract.md)
- [Repo-Local Skill Script Contract](./repo-local-skill-script-contract.md)
- [Worktree VS Code Workspace](./worktree-vscode-workspace.md)

## Entry Points

- Use the issue system contract before creating or executing issues.
- Use the repo-local skill contract before creating or changing
  `.codex/skills/*`.
- Use the repo-local skill script contract before creating or changing scripts
  under `.codex/skills/*/scripts/`.
- Use the issue forms under `.github/ISSUE_TEMPLATE/` when filing GitHub issues.
- Use the local git hooks guide when installing or verifying repo-local hooks.
- Use `AGENTS.md` for agent-facing routing.
- Use the root `README.md` for human-facing project setup and quality gates.
- Use the worktree VS Code workspace guide when creating or removing local
  issue worktrees for this repository.

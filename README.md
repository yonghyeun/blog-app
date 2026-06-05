# Blog App

개인 기록용 블로그 Application Project.

## Foundation

This repository starts with the `Engineering Scaffold v0` baseline:

- Next.js App Router
- TypeScript
- `src/app` route composition
- `@/*` imports mapped to `src/*`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run start
npm run storybook
npm run storybook:build
npm test
npm run test:storybook
npm run test:e2e
npm run typecheck
npm run hooks:install
npm run test:githooks
npm run validate:skills
npm run test:skills-validator
```

## Quality Gate

Foundation work should pass these commands before review:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run storybook:build
npm run test:storybook
npm run test:e2e
git diff --check
```

## Operations

- [Issue System Contract](./docs/operations/issue-system.md)
- [Agent Writing Style](./docs/operations/agent-writing-style.md)
- [Local Git Hooks](./docs/operations/local-git-hooks.md)
- [Repo-Local Skill Contract](./docs/operations/repo-local-skill-contract.md)
- [Repo-Local Skill Script Contract](./docs/operations/repo-local-skill-script-contract.md)
- [Worktree VS Code Workspace](./docs/operations/worktree-vscode-workspace.md)
- [Operations Index](./docs/operations/README.md)
- [Agent Routing](./AGENTS.md)

## Product

- [Vertical Slice v1 Requirements](./docs/product/vertical-slice-v1-requirements.md)

## Design

- [Blog Design Direction](./docs/design/blog-design-direction.md)
- [Design System v1](./docs/design/design-system-v1.md)

## Architecture

- [Foundation Architecture Contract](./docs/architecture/foundation-architecture.md)
- [TDD And Test Surface Contract](./docs/architecture/tdd-test-surface.md)
- [Architecture Index](./docs/architecture/README.md)

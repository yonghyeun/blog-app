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
npm test
npm run typecheck
```

## Quality Gate

Foundation work should pass these commands before review:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
git diff --check
```

## Operations

- [Issue System Contract](./docs/operations/issue-system.md)
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

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

## Architecture

- [Foundation Architecture Contract](./docs/architecture/foundation-architecture.md)
- [TDD And Test Surface Contract](./docs/architecture/tdd-test-surface.md)

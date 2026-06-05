# Playwright E2E Surface Contract

## Context

Playwright is the browser-visible route and user-flow test surface.

Vitest owns pure module behavior. Storybook owns reusable component states. Playwright
owns behavior that must be proven through a real browser.

## Default Workflow

Use Playwright when behavior crosses a route boundary or depends on browser-visible
rendering.

```text
start app -> navigate route -> assert visible behavior -> keep fixtures public-safe
```

## Coverage Rules

Add Playwright coverage when a change:

- adds or changes an app route
- changes route-level loading, empty, error, or not-found behavior
- changes browser-visible navigation
- changes local image rendering or asset paths
- validates a user flow across more than one component

Do not use Playwright for:

- pure parsing or validation logic
- component-only visual states
- private `blog-post` repository access
- server/build internals that are better covered by module tests

## Accessibility Boundary

Read [Frontend Accessibility Guide](./frontend-accessibility-guide.md) before
changing route-level UI, keyboard/focus behavior, navigation behavior, or visible
empty/error/not-found states.

Playwright owns accessibility checks that require the real app shell:

- route-level landmarks and visible heading expectations
- keyboard navigation across page sections
- focus behavior after route navigation when the route defines it
- visible empty, error, or not-found states
- local image rendering and asset path behavior

Storybook remains the owner for isolated reusable component states.

## Test Location

Place E2E tests under:

```text
tests/e2e
```

Use `*.spec.ts` filenames.

Keep test descriptions in Korean and describe route behavior with a concrete trigger and
visible result.

Example:

```ts
test("초기 경로를 열면 프로젝트 제목과 설명을 렌더링한다", async ({ page }) => {
  // ...
});
```

## Baseline Route Test

`tests/e2e/home.spec.ts` is the minimal smoke test.

It proves:

- Playwright can start the Next.js app through `webServer`
- the initial route loads in Chromium
- route-level assertions are independent from private content access

It does not implement #2 blog list or detail behavior.

## Required Command

```bash
npm run test:e2e
```

The Playwright config starts `npm run dev` automatically when no reusable local server
exists.

## Quality Gate

Future route or user-flow leaves should run:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run test:e2e
git diff --check
```

Run `npm run build` when the change touches production build behavior, Next config,
package versions, or generated route output.

## Out Of Scope For This Contract

- #2 post list E2E tests
- #2 post detail E2E tests
- deployment smoke tests
- private repository checkout tests

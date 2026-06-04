# CI Quality Gate Contract

## Context

GitHub Actions runs the foundation quality gate for pull requests and pushes to `main`.

The workflow is not a deployment pipeline. It only proves that the public `blog-app`
foundation still builds and tests without private `blog-post` access.

## Workflow

The workflow file is:

```text
.github/workflows/quality-gate.yml
```

It runs on:

- `pull_request`
- `push` to `main`

It uses two job groups:

- `standard-gate`
- `playwright-e2e`

`standard-gate` runs lint, formatting, typecheck, Vitest, Next build, and Storybook
build.

`playwright-e2e` runs a matrix of public-safe Playwright suites. Each matrix entry runs
one suite script:

- `npm run test:e2e:default`
- `npm run test:e2e:empty`
- `npm run test:e2e:missing-env`

The E2E matrix uses `fail-fast: false` so one suite failure does not hide failures in the
other route states.

## Commands

The standard gate job runs:

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run storybook:build
```

The Playwright E2E matrix runs:

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:e2e:<suite>
```

## Cache Strategy

CI minimizes repeated install work with two caches.

### npm cache

`actions/setup-node` enables npm package download caching in both job groups.

The cache is keyed by `package-lock.json`.

This does not cache `node_modules`. `npm ci` still creates a clean dependency tree for
each job.

### Playwright browser cache

`actions/cache` caches:

```text
~/.cache/ms-playwright
```

The cache key uses:

- runner OS
- `package-lock.json` hash

This refreshes the browser cache when the Playwright version changes through
`package-lock.json`.

`npx playwright install --with-deps chromium` still runs so Linux browser dependencies
stay available on the GitHub runner. When the browser cache is restored, the large browser
download should be skipped.

The browser cache is only configured in `playwright-e2e`, because standard lint, module
test, build, and Storybook checks do not need a browser install.

## E2E Parallel Policy

CI parallelizes E2E by suite matrix, not by adding more browser projects.

Current rationale:

- all E2E coverage targets Chromium smoke behavior
- the suites need different fixture and environment-variable setups
- splitting suites avoids repeatedly starting every route state in one serial job
- `npm run test:e2e` remains the local aggregate command and stays runnable without CI
  matrix support
- Playwright `fullyParallel` remains enabled so tests inside a suite can run in parallel as
  coverage grows

Adding browser projects such as Firefox or WebKit is future work unless a leaf issue needs
cross-browser behavior.

## Scope

Allowed:

- public app build checks
- lint, format, and type checks
- Vitest module tests
- Storybook production build
- Playwright Chromium smoke tests

Not allowed:

- deployment
- production canary checks
- private `blog-post` checkout
- deploy key or secret handling
- #2 product behavior implementation

## Failure Policy

A CI failure blocks merging the PR until the failing command is fixed or the contract is
explicitly changed in a follow-up issue.

Storybook Vite chunk-size warnings are acceptable when `npm run storybook:build` exits
successfully.

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

It uses one job so dependencies are installed once per workflow run.

## Commands

The CI job runs:

```bash
npm ci
npx playwright install --with-deps chromium
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run storybook:build
npm run test:storybook
npm run test:e2e
```

## Cache Strategy

CI minimizes repeated install work with two caches.

### npm cache

`actions/setup-node` enables npm package download caching.

The cache is keyed by `package-lock.json`.

This does not cache `node_modules`. `npm ci` still creates a clean dependency tree for
each run.

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

## Scope

Allowed:

- public app build checks
- lint, format, and type checks
- Vitest module tests
- Storybook production build
- Storybook story smoke, interaction, and accessibility tests
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

Storybook UI test failures block merging when a story fails to render, a story `play`
function assertion fails, or an accessibility violation fails a story with
`parameters.a11y.test = "error"`.

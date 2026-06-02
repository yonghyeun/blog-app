# TDD And Test Surface Contract

## Context

This contract defines how future leaf issues choose a test surface.

The current leaf only configures Vitest and the module-test contract. Storybook and
Playwright are mapped here for handoff, but they are configured by later leaves.

## Default Workflow

Use TDD for logic that can be expressed as inputs and outputs.

```text
write failing module test -> implement pure logic -> pass test -> run quality gate
```

For documentation-only changes, run the quality gate without adding tests unless the
change introduces executable behavior.

## Test Locations

Prefer module-adjacent tests.

Examples:

```text
src/shared/project.ts
src/shared/project.test.ts

src/entities/post/slug.ts
src/entities/post/slug.test.ts
```

Rules:

- test files live next to the module they verify
- use `*.test.ts` or `*.test.tsx`
- import cross-layer modules through `@/*`
- use same-folder relative imports only for tightly local helpers
- do not create broad fixture directories by default

## Test Data

Prefer test-local constants and small factories.

Allowed:

- inline constants inside a test file
- tiny factory functions local to the test file
- table tests for slug, frontmatter, and path cases

Avoid:

- shared fixture files for simple objects
- global mutable test data
- checked-in generated output snapshots unless a later issue proves they are needed

Fixture files are exceptional. Use them only for file-tree behavior, generated-output
validation, or cases where inline data makes the test harder to read.

## Test Names

Write Vitest `describe` and `it` names in Korean.

Reason:

- the primary maintainer is a Korean-language user
- test output should explain behavior without translating English test prose
- failure messages should be readable during local TDD loops

Rules:

- `describe` names should state the module or behavior group in Korean
- `it` names should state the expected behavior in Korean
- keep imported symbol names and code identifiers unchanged
- use English only when quoting an external API, package name, or literal value

Example:

```ts
describe("프로젝트 요약", () => {
  it("공유 프로젝트 기본 정보를 제공한다", () => {
    // ...
  });
});
```

## Surface Mapping

| Surface    | Owns                                                       | Examples for this project                                         |
| ---------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Vitest     | pure module logic, parsing, validation, transforms         | slug validation, frontmatter parsing, image path rewrite, sorting |
| Storybook  | reusable component review and visual component states      | shared UI primitive, post card, tag pill                          |
| Playwright | route-level behavior and browser-visible user flows        | post list route, post detail route, local image rendering         |
| Manual     | one-off checks before a test surface exists or is too soon | first scaffold smoke before Playwright exists                     |

## Vitest Contract

Vitest is the default module-test runner.

Required command:

```bash
npm test
```

Vitest must resolve `@/*` imports. The baseline test imports `@/shared/project` to prove
that behavior.

## Quality Gate

Future implementation leaves should run:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
git diff --check
```

Run `npm run build` when the change touches app routes, Next config, package versions, or
rendered behavior.

## Out Of Scope For This Contract

- Storybook configuration
- Playwright configuration
- #2 content parser implementation
- #2 renderer route tests
- broad coverage targets

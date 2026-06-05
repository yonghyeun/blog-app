# Storybook UI Surface Guide

## Context

Storybook is the component review surface for reusable UI units.

This guide keeps UI review separate from route-level behavior. Route flows belong to
Playwright once route-level browser testing is configured.

Storybook must remain useful even before production routes, loaders, or private content
integration exist. Treat it as the executable design-system and component-state guide for
the public renderer.

## Source Basis

This guide follows the official Storybook and Next.js operating model:

- Storybook stories render components in isolation through args, decorators, parameters,
  and fixtures.
- Next.js app routes and server components can import server-only modules. Do not import
  route files directly into stories when they contain server data loading or Node-only
  dependencies. Extract the pure UI component and write stories against that component.
- `next/font` self-hosts Google font assets at build time. Storybook must receive the
  same font variables as the Next app, otherwise visual review will not match the app.

Reference sources:

- Storybook Next.js framework docs:
  <https://storybook.js.org/docs/get-started/frameworks/nextjs>
- Storybook args docs:
  <https://storybook.js.org/docs/writing-stories/args>
- Storybook decorators docs:
  <https://storybook.js.org/docs/writing-stories/decorators>
- Storybook essentials docs:
  <https://storybook.js.org/docs/essentials/index>
- Storybook accessibility testing docs:
  <https://storybook.js.org/docs/writing-tests/accessibility-testing>
- Storybook interaction testing docs:
  <https://storybook.js.org/docs/writing-tests/interaction-testing>
- Storybook visual testing docs:
  <https://storybook.js.org/docs/8/writing-tests/visual-testing>
- Next font docs:
  <https://nextjs.org/docs/pages/api-reference/components/font>

## Default Workflow

Use Storybook when a component becomes reusable or needs visual states outside a full
route.

```text
define component state -> add story -> review in Storybook -> run quality gate
```

For Figma-backed UI work, use this stricter sequence:

```text
inspect Figma component or frame
-> define component ownership layer
-> create fixture data
-> implement pure component
-> add story for default and important states
-> run storybook:build
-> run route/e2e checks only if app routes changed
```

## Coverage Rules

Add Storybook coverage when a component:

- lives in `src/shared/ui`
- lives in `src/widgets`
- has multiple visual states
- accepts user-visible props that change layout, tone, density, or empty states
- will be reused by public renderer slices

Storybook coverage is optional when a component:

- is a route-only composition in `src/app`
- contains no reusable UI responsibility
- only wires server data into already-covered components

Do not add Storybook coverage when the only thing to test is:

- content repository IO
- Markdown file reading
- git history lookup
- deploy secret handling
- route-level navigation flow
- server-only validation with no reusable visual state

Those belong to Vitest, Playwright, or build-time checks depending on the behavior.

## Layer Rules

Stories should import cross-layer modules through `@/*`.

Allowed:

```ts
import { FoundationBadge } from "@/shared/ui/foundation-badge";
```

Rules:

- `shared` stories must not import `entities`, `features`, `widgets`, or `app`
- `widgets` stories may compose lower layers according to the architecture contract
- stories must not read private `blog-post` content
- stories must not introduce future renderer behavior outside the source issue
- stories must not import `src/app` route files
- stories must not mock private content access by checking in private content samples
- stories may use small local fixture objects for public-safe display data

## Story Shape

Use Component Story Format with typed `Meta` and `StoryObj`.

```ts
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ExampleComponent } from "@/shared/ui/example-component";

const meta = {
  title: "shared/ExampleComponent",
  component: ExampleComponent,
  tags: ["autodocs"],
  args: {
    tone: "default",
  },
  argTypes: {
    tone: {
      control: "radio",
      options: ["default", "muted"],
    },
  },
} satisfies Meta<typeof ExampleComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

Rules:

- keep story titles aligned with the FSD layer path
- add `tags: ["autodocs"]` to every story meta
- use `args` for component props that should be inspected interactively
- use `argTypes` for bounded option sets such as state, viewport, tone, density, or weight
- use local `render` only when a state matrix or composed specimen is clearer than a
  single component render
- avoid story-only prop shapes that do not exist in production components
- avoid screenshots or pasted Figma code as stories

## Autodocs

Autodocs is required for every Storybook story file.

Rules:

- keep `@storybook/addon-docs` enabled in `.storybook/main.ts`
- add `tags: ["autodocs"]` to each CSF meta object
- rely on component props, `args`, and `argTypes` for generated documentation
- do not create separate MDX docs for simple component states unless a component needs
  long-form explanation
- keep docs generated from browser-safe fixtures only

## State Coverage

Stories should make state ownership explicit.

Required state stories for interactive components:

- `Default`
- `Hover`
- `FocusVisible`
- `Active`
- `Visited` when link history can affect presentation

Required state stories for responsive components:

- `Desktop`
- `Mobile`

Required state stories for renderer shell components:

- `Default`
- `Empty`
- `NotFound`

Do not create fake state variants for static document surfaces. Static metadata, tag text,
separators, and state copy stay static unless a product requirement makes them
interactive.

## Fixtures

Stories use public-safe fixture data.

Allowed:

- inline object literals for one-story examples
- small co-located fixture constants for repeated component examples
- Korean display text when it reflects the actual product language
- fake public post metadata

Avoid:

- private `blog-post` Markdown source
- broad global fixture directories for simple examples
- generated snapshots as the source of truth
- fixtures that imply future product behavior such as tag pages, search, RSS, comments,
  or related posts

## Decorators And App Context

Use decorators for rendering context that components need but do not own.

Global decorators in `.storybook/preview.ts` may provide:

- global CSS import
- Next font variables
- theme or design-token context
- app-level providers that are pure browser-safe providers

Component or story decorators may provide:

- bounded width such as `720px` desktop content columns
- mobile viewport width such as `342px`
- background surface
- review padding

Decorators must not hide layout defects. If a component only works when padded or wrapped,
make that wrapper part of the story name or component contract.

## Fonts

Storybook typography must match the Next app.

Rules:

- load fonts in the app through `next/font`
- apply the same font CSS variables to Storybook through `.storybook/preview.ts`
- keep `globals.css` as the shared token layer consumed by both app and Storybook
- verify font application with browser computed styles when typography changes

Do not rely on local machine fonts. The system may not have `Noto Sans KR`,
`IBM Plex Sans KR`, or `IBM Plex Mono` installed. Build output should self-host the
fonts.

## Controls And Essentials

Use Storybook Essentials intentionally.

Recommended use:

- Controls for props with visible rendering impact
- Viewport for desktop/mobile review
- Backgrounds only when the component surface requires contrast verification
- Measure and outline for spacing or alignment inspection
- Actions for callback props only when the callback is part of the component contract

Do not use Controls to simulate server state that the component does not own.

## Accessibility

Accessibility coverage should grow with UI maturity.

Read [Frontend Accessibility Guide](./frontend-accessibility-guide.md) before
creating or changing reusable UI components, component fixtures, visual states, or
Storybook stories. That guide owns the pass/fail checklist. This section only defines
Storybook's verification boundary.

Recommended progression:

1. Add semantic markup in the component itself.
2. Add stories for keyboard-visible states such as `FocusVisible`.
3. Add `@storybook/addon-a11y` when multiple reusable components exist.
4. Set `parameters.a11y.test = "error"` only after existing violations are resolved or
   explicitly triaged.

Accessibility findings from Storybook should be fixed in the component, not suppressed in
the story, unless the story fixture is intentionally invalid.

## Interaction Tests

Use interaction tests for component-owned browser behavior.

Good candidates:

- menu open and close
- keyboard focus movement
- toggle state
- form validation copy
- row selection if a widget owns that interaction

Poor candidates:

- route navigation between pages
- file system reads
- private content repository access
- Markdown parser correctness

Route flows remain Playwright coverage.

## Visual Regression

Use visual regression only after the component surface is stable enough that snapshots
represent intended design, not exploration.

Recommended path:

1. Keep `npm run storybook:build` as the first non-interactive gate.
2. Add screenshot or Chromatic-style visual testing only for stable shared components and
   widgets.
3. Review diffs against Figma or the design contract.
4. Do not bless visual changes without tying them to the source issue.

Storybook Vite chunk-size warnings are acceptable when the build exits successfully,
unless a later performance issue defines stricter limits.

## Baseline Primitive

`src/shared/ui/foundation-badge.tsx` is a minimal proof component.

It exists to prove:

- Storybook can render a shared UI primitive
- Storybook resolves `@/*` imports
- global app CSS can load through `.storybook/preview.ts`

It is not the final design system.

## Required Commands

```bash
npm run storybook
npm run storybook:build
npm run test:storybook
```

Use `npm run storybook` for local component review.

Use `npm run storybook:build` for non-interactive validation.

Use `npm run test:storybook` for story render smoke tests, story `play` function
interaction tests, and accessibility checks configured by Storybook parameters.

## Quality Gate

Future UI foundation or reusable component leaves should run:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run storybook:build
npm run test:storybook
git diff --check
```

Run `npm run build` when the change touches Next routes, rendered app behavior, package
versions, or production build assumptions.

Run `npm run test:e2e` when the change touches route-level visible behavior.

## Out Of Scope For This Contract

- private content rendering
- route data loader correctness
- route navigation behavior
- deploy-key handling
- publish script behavior

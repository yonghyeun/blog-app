# Storybook UI Surface Contract

## Context

Storybook is the component review surface for reusable UI units.

This contract keeps UI review separate from route-level behavior. Route flows belong to
Playwright once #9 configures it.

## Default Workflow

Use Storybook when a component becomes reusable or needs visual states outside a full
route.

```text
define component state -> add story -> review in Storybook -> run quality gate
```

## Coverage Rules

Add Storybook coverage when a component:

- lives in `src/shared/ui`
- lives in `src/widgets`
- has multiple visual states
- accepts user-visible props that change layout, tone, density, or empty states
- will be reused by #2 or later product slices

Storybook coverage is optional when a component:

- is a route-only composition in `src/app`
- contains no reusable UI responsibility
- only wires server data into already-covered components

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
- stories must not introduce #2 renderer behavior

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
```

Use `npm run storybook` for local component review.

Use `npm run storybook:build` for non-interactive validation.

## Quality Gate

Future UI foundation or reusable component leaves should run:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run storybook:build
git diff --check
```

Run `npm run build` when the change touches Next routes, rendered app behavior, package
versions, or production build assumptions.

## Out Of Scope For This Contract

- final visual design system
- Figma MCP workflow
- Playwright configuration
- #2 blog list or detail UI
- private content rendering

# Foundation Architecture Contract

## Context

This repository is the public `blog-app` renderer.

The private `blog-post` repository owns publishable Markdown source content. This
repository must not contain private post content, deploy private keys, or client-side
secret access.

This contract defines where code belongs before the first product slice starts.

## Layer Model

The app follows a small Feature-Sliced Design style structure.

```text
src/
  app/
  shared/
  entities/
  features/
  widgets/
```

Only `app` and `shared` exist in the current scaffold. Add other layers when a leaf issue
needs them.

## Layer Responsibilities

### `src/app`

Owns routing and route composition.

Allowed:

- Next.js route files
- route metadata
- page-level composition
- calling server-only loaders from lower layers

Not allowed:

- domain parsing rules hidden inside route components
- private `blog-post` checkout logic in client components
- Markdown transformation logic inside page components

### `src/shared`

Owns project-wide primitives.

Allowed:

- shared constants
- pure helpers
- low-level UI primitives when #8 introduces Storybook
- environment readers that expose validated public-safe values

Not allowed:

- post-specific domain behavior
- page-specific orchestration
- private repository side effects in browser code

### `src/entities`

Owns domain entities.

Expected future examples:

- post metadata types
- slug value rules
- tag value rules
- content asset references

Entity code should prefer pure functions and explicit inputs.

### `src/features`

Owns user-facing actions or flows.

Expected future examples:

- post search interaction
- tag filtering interaction
- publication preview flow, if the public app ever needs one

Features may compose entities and shared primitives. They should not own route files.

### `src/widgets`

Owns composed UI sections.

Expected future examples:

- post list section
- post detail header
- tag navigation section

Widgets may compose features, entities, and shared primitives. They should not own raw
content IO.

## Import Rules

Prefer absolute imports through `@/*`.

Allowed examples:

```ts
import { projectSummary } from "@/shared/project";
```

Layer direction:

```text
app -> widgets -> features -> entities -> shared
```

Rules:

- `app` may import any lower layer.
- `widgets` may import `features`, `entities`, and `shared`.
- `features` may import `entities` and `shared`.
- `entities` may import `shared`.
- `shared` must not import `entities`, `features`, `widgets`, or `app`.
- Same-folder relative imports are allowed for tightly local files.
- Avoid deep relative imports such as `../../../shared/...`.

## Functional Direction

Prefer functional code for parsing, validation, transformation, and indexing.

Use this split:

```text
IO boundary -> pure transformation -> rendered composition
```

Examples:

- read files at the server/build boundary
- parse frontmatter with explicit input strings
- validate slug values with pure functions
- sort post metadata with immutable array transforms
- keep route components focused on composition

Avoid:

- hidden mutable module state
- class-first domain models without a framework reason
- route components that both read private content and transform domain data
- browser code that depends on server-only secrets

## Public App And Private Content Boundary

`blog-app` is public.

`blog-post` is private.

Rules:

- Do not commit private Markdown source content into `blog-app`.
- Do not commit deploy private keys.
- Do not expose private content access variables to client components.
- Build-time or server-only `blog-post` access must stay outside browser bundles.
- Local development may point at a sibling `blog-post` checkout.
- Deployment must use platform secrets, not committed files.

## Environment Contract

Use `.env.local` for local secrets and machine-specific paths.

Use `.env.example` for variable names only.

Current foundation variables:

```text
BLOG_POST_REPO_PATH
BLOG_POST_ASSET_URL_PREFIX
BLOG_POST_REPO_URL
BLOG_POST_DEPLOY_KEY_PATH
```

Rules:

- `BLOG_POST_REPO_PATH` is for local sibling checkout workflows.
- `BLOG_POST_ASSET_URL_PREFIX` is the public URL prefix for resolved post attachment
  images.
- `BLOG_POST_REPO_URL` is for future server/build checkout workflows.
- `BLOG_POST_DEPLOY_KEY_PATH` must never be exposed to client code.
- Variables prefixed with `NEXT_PUBLIC_` are browser-visible and must not contain secrets.

This leaf defines names and boundaries only. It does not implement private repo checkout.

## Validation Checklist

- `src/app` owns routing and composition.
- `src/shared/project.ts` stays valid as a shared primitive.
- `@/*` imports are used for cross-layer imports.
- `.env`, `.env.local`, and `.env.*.local` are ignored.
- `.env.example` contains names only, not values.
- Tooling commands still pass after doc changes.

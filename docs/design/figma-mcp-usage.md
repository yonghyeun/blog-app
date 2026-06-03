# Figma MCP Usage Contract

## Purpose

This document defines how agents must use Figma MCP for vertical slice v1 design
work.

It prevents screen-frame work from creating untracked styles, detached component
copies, or layer names that do not map back to the repo architecture.

## Required Context

Before using Figma MCP for this repository, read:

- `docs/design/blog-design-direction.md`
- `docs/design/design-system-v1.md`
- `docs/architecture/foundation-architecture.md`
- `docs/product/vertical-slice-v1-requirements.md`

Use the Figma file key from local environment:

```text
FIGMA_VERTICAL_SLICE_V1_FILE_KEY
```

This repository is public. Do not commit concrete Figma file keys or file URLs
unless the file is intentionally public. Store concrete values in `.env.local`.

## Operating Order

Use this order for Figma MCP work:

1. Confirm the source issue passed intake.
2. Read this contract and the required context files.
3. Read `FIGMA_VERTICAL_SLICE_V1_FILE_KEY` from `.env.local`.
4. Inspect the Figma file before writing.
5. Reuse existing variables, text styles, and components.
6. Create new Figma assets only when the issue explicitly owns them.
7. Record Figma file, page, frame, and node URLs on the issue tracking surface.

Do not start screen-frame generation from memory or from an isolated prompt.

## Design Hierarchy

Figma work must use existing design assets in this order:

```text
variables -> text styles -> shared components -> feature components -> screen frames
```

Use Figma variables first for:

- color
- spacing
- border

Use Figma text styles first for:

- `Type/Heading/*`
- `Type/Body/*`
- `Type/Metadata/*`
- `Type/Label/*`
- `Type/Code/*`

Current #32 typography decision:

```text
Type/Body/*: Noto Sans KR
Type/Code/*: IBM Plex Mono
Type/Heading/*: IBM Plex Sans KR
Type/Metadata/*: IBM Plex Sans KR
Type/Label/*: IBM Plex Sans KR
```

Do not create raw colors, ad hoc spacing, raw border values, or unstyled text
unless the issue explicitly owns a foundation update.

## New Asset Rules

Create a new variable only when:

- the current issue explicitly owns a foundation update, or
- an existing variable cannot express the requirement, and the issue tracking
  surface records the reason.

Create a new text style only when:

- the current issue explicitly owns typography work, or
- the role is missing and cannot be represented by the current `Type/*` styles.

Create a new component only when:

- the current issue explicitly owns component work, or
- a screen-frame issue discovers repeated structure that cannot be assembled from
  the existing shared and feature components.

If a new asset is created, record:

- asset name
- owning issue
- Figma page
- node URL
- reason for creation

Detached instances are not acceptable as final handoff assets. If detaching is
needed for exploration, mark the frame as exploratory and do not use it as the
implementation handoff.

## Figma Layer Model

Figma uses a design-layer model that must remain compatible with the repo's FSD
architecture contract.

```text
00 Foundations -> design tokens and usage samples
01 Components  -> reusable shared and feature-level design assets
02 Screens     -> route or state frames assembled from components
```

Current Figma metadata may expose only `00 Foundations` until later leaves create
additional pages. If `01 Components` or `02 Screens` is missing when an issue
needs it, create the page as part of that issue and record the change.

## Component Architecture

The `01 Components` page must follow the layer model in
`docs/architecture/foundation-architecture.md`.

This means design components are not a flat visual inventory. They must be
grouped by the same architectural ownership used by the repo:

```text
shared -> entities -> features -> widgets -> app/screens
```

Use these component sections inside `01 Components`:

```text
Shared Components
Entity Components
Feature Components
Widget Components
```

Use `02 Screens` for app/page-level route composition. Do not place route-level
screen frames inside `01 Components`.

Use this mapping when translating Figma assets into implementation planning:

| Figma surface      | Design ownership                    | Repo architecture mapping                                              |
| ------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| `00 Foundations`   | color, typography, spacing, border  | design contract first; CSS tokens only in a later implementation issue |
| `Shared - *`       | low-level reusable primitives       | `src/shared`                                                           |
| `Entity - *`       | domain object display or data shape | `src/entities`                                                         |
| `Feature - *`      | user-facing actions or flows        | `src/features`                                                         |
| `Widget - *`       | composed UI sections                | `src/widgets`                                                          |
| `Screen/*`         | route or state composition          | `src/app` route composition plus lower layers                          |
| exploratory frames | temporary thinking surface          | no implementation mapping until promoted                               |

Figma names do not directly decide source-code paths. The implementation issue
must still apply the repo import direction:

```text
app -> widgets -> features -> entities -> shared
```

Design dependency direction must mirror the same rule:

```text
Screen -> Widget -> Feature -> Entity -> Shared -> Foundations
```

Rules:

- shared components may use foundations only.
- entity components may use shared components and foundations.
- feature components may use entity, shared, and foundation assets.
- widget components may compose feature, entity, shared, and foundation assets.
- screen frames may compose widget, feature, entity, shared, and foundation
  assets.
- lower layers must not depend on higher layers.
- screen frames must not introduce reusable components without promoting them to
  the correct component section first.

## File And Page Rules

Use the #32 Figma file unless a new issue explicitly creates a different file.

Page names:

```text
00 Foundations
01 Components
02 Screens
```

Do not use `00 System` for new work. Older docs may mention it as a generic
example, but #32 uses `00 Foundations`.

## Naming Rules

Use stable, functional names.

Foundation frames:

```text
Foundation / <Name>
```

Component frames:

```text
Shared - <Name>
Entity - <Name>
Feature - <Name>
Widget - <Name>
```

Screen frames:

```text
Screen/<RouteOrArea>/<State>/<Viewport>
```

Required Leaf 3 screen names:

```text
Screen/Home/Default/Desktop
Screen/Home/Default/Mobile
Screen/Home/Empty/Desktop
Screen/Home/Empty/Mobile
Screen/PostDetail/Default/Desktop
Screen/PostDetail/Default/Mobile
Screen/PostDetail/NotFound/Desktop
Screen/PostDetail/NotFound/Mobile
```

Viewport names are only:

```text
Desktop
Mobile
```

State names must use product states such as:

```text
Default
Empty
NotFound
```

Do not add `Loading` frames for vertical slice v1.

## URL Recording

Every Figma handoff must record:

- file URL
- page name
- frame or component name
- node id
- node URL when available

Use this node URL shape:

```text
https://www.figma.com/design/<fileKey>/<fileName>?node-id=<node-id-with-dash>
```

Example:

```text
https://www.figma.com/design/$FIGMA_VERTICAL_SLICE_V1_FILE_KEY/<fileName>?node-id=22-2
```

Record these links on the source issue or umbrella tracking comment, not inside
repo docs as remote ownership claims.

## Leaf 3 Checklist

Before creating #32 Leaf 3 screen frames:

- Confirm #42, #43, #44, and this contract are complete.
- Inspect the Figma file with Figma MCP.
- Confirm `00 Foundations` exists.
- Confirm `01 Components` exists or create it in the owning issue.
- Confirm `02 Screens` exists or create it in the owning issue.
- Reuse #44 shared and feature assets.
- Do not introduce new tag chip, card, decorative state, or metadata category
  treatment.
- Keep missing metadata and missing assets as build or parsing failures, not
  user-facing screen states.
- Record every delivered screen frame node URL on #32 or the source leaf issue.

## Conflict Rules

If sources conflict, use this order:

1. `docs/product/vertical-slice-v1-requirements.md` for product states and user
   requirements.
2. `docs/design/blog-design-direction.md` for design direction.
3. `docs/design/design-system-v1.md` and this document for design-system and
   Figma usage rules.
4. `docs/architecture/foundation-architecture.md` for implementation layer
   mapping.
5. Figma file contents as the current design artifact state.

When the Figma file conflicts with repo docs, do not silently normalize the
difference. Record the mismatch on the issue tracking surface and update the
owning artifact in a reviewable change.

# Design System v1

## Version Surface

- Depends on: [Blog Design Direction](./blog-design-direction.md)

## Purpose

This document defines the minimum design-system criteria for vertical slice v1.

It is not a complete token package or component library. It is the shared
reference for Figma frames and UI implementation.

## Design-System Principles

- Design follows function.
- Use Cold Document white-scale brutalist minimalism.
- Prefer structure over decoration.
- Prefer metadata over ornamental labels.
- Prefer document surfaces over cards.
- Use color only after typography, spacing, border, and contrast cannot express
  the needed distinction.

## Typography

The typography system uses three font families:

| Role                         | Typeface         |
| ---------------------------- | ---------------- |
| Long-form Korean body text   | Noto Sans KR     |
| Headings                     | IBM Plex Sans KR |
| Navigation, labels, metadata | IBM Plex Sans KR |
| Code and inline code         | IBM Plex Mono    |

Typography rules:

- Body text must remain comfortable for long Korean reading.
- Headings and metadata should feel cold, technical, and system-like.
- Do not introduce display-only decorative typefaces.
- Use size, weight, alignment, and spacing for hierarchy.
- Keep letter spacing at the default value.
- Keep the font stack to these three families plus system fallbacks.

Recommended initial type roles:

```text
body: Noto Sans KR
heading: IBM Plex Sans KR
ui-label: IBM Plex Sans KR
metadata: IBM Plex Sans KR
code: IBM Plex Mono
```

## Color

The color system is Cold Document white-scale first.

Routine UI should not use saturated accent colors. Links, tags, metadata,
separators, and states should remain monochrome.

The base scale avoids pure `#ffffff`. Use near-white layers to separate the page
canvas, document surfaces, muted surfaces, and borders while preserving a cold
technical impression.

Recommended token candidates:

```css
--color-background: #f9faf9;
--color-surface: #f2f4f3;
--color-surface-muted: #e8ebe9;
--color-text: #111111;
--color-text-muted: #5f6562;
--color-border: #d7dcda;
--color-border-strong: #111111;
--color-inverse-background: #111111;
--color-inverse-text: #f9faf9;
```

Color rules:

- Avoid `#ffffff` as the default background or surface.
- Avoid pastel tag colors.
- Avoid tag-specific random colors.
- Avoid purple or blue gradients.
- Avoid glassmorphism.
- Avoid using surface color as the primary hierarchy mechanism.
- Use inverse treatment only for exceptional states or strong interaction
  feedback.

## Spacing

Spacing uses a conventional 4px-based rem scale.

Brutalist character comes from document rhythm, exposed alignment, separators,
and reduced surfaces rather than unusual spacing values.

Recommended token candidates:

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-12: 3rem;
--space-16: 4rem;
--space-24: 6rem;
```

Recommended application:

```text
page inline padding: 1rem mobile / 2rem desktop
desktop screen content column: centered, 720px recommended max width
section gap: 3rem to 4rem
list row padding: 1rem 0
metadata gap: 0.5rem to 1rem
article paragraph gap: 1rem
article block gap: 1.5rem
article max width: 42rem to 48rem
detail layout gap: 1.5rem to 3rem
```

Desktop blog screens should not stretch primary reading or list content across
the full viewport. Keep index lists and article reading surfaces centered in a
bounded column. Post detail metadata belongs directly under the article title in
v1.

## Surface And Border

Surfaces should feel like documents, not cards.

Borders are used to expose structure: list rows, section boundaries, and metadata
rails. Heavy borders may appear at major section boundaries, while routine
separators should stay thin.

Surface rules:

- Avoid card grids for the post list.
- Avoid nested cards.
- Avoid rounded card-heavy composition.
- Use row separators for post index items.
- Separators must resize with their parent width; Figma separator line nodes use
  horizontal stretch constraints.
- `Shared - Separator` is a Figma component set with a `Weight` variant property:
  `Thin` and `Strong`.
- Do not introduce a right metadata rail for post detail v1.
- Use strong borders only at major section boundaries.
- Use inverse blocks only for exceptional states such as empty or not-found when
  the added contrast helps comprehension.

Recommended token candidates:

```css
--border-thin: 1px solid var(--color-border);
--border-strong: 1px solid var(--color-border-strong);
```

## Link Treatment

Links remain monochrome.

Body links use visible underlines instead of color. Hover, focus, and active
states use stronger underline and Cold Document surface shifts.

Rules:

- Do not use default blue links.
- Body links must be visibly underlined.
- Hover may strengthen underline or use `Color/Surface/Muted`.
- `focus-visible` must be clearly visible.
- Tags remain plain metadata in v1 unless tag pages exist.
- Metadata links use bracket-style treatment only when a current navigation
  requirement exists.

## Component State Scope

Vertical slice v1 keeps component state narrow.

Only interactive or navigational components need hover, focus, or active states.
Static document and metadata components should not gain visual states just
because they are reusable components.

State requirements:

| Component                     | State need | v1 state scope                                 |
| ----------------------------- | ---------- | ---------------------------------------------- |
| `Shared - TextLink`           | Required   | inline/body links only                         |
| `Feature - PostNotFoundState` | Not needed | nested back-link consumes `TextLink` state     |
| `Widget - PostIndexItem`      | Required   | whole post row owns link state                 |
| `Widget - ArticleContent`     | Not needed | Markdown anchors consume `TextLink` state      |
| `Shared / Separator`          | Not needed | static structural divider                      |
| `Shared - StateText`          | Not needed | static state copy                              |
| `Entity - PostMetadataPair`   | Not needed | metadata is not navigable in v1                |
| `Entity - PostTagList`        | Not needed | tags are plain metadata; no chip or link state |
| `Feature - EmptyArchiveState` | Not needed | static archive state                           |
| `Widget - ArticleHeader`      | Not needed | static title and metadata                      |
| `Widget - MetadataRail`       | Removed    | not used by post detail v1 screens             |

Do not add hover or active states to rows, tags, metadata, or state containers
unless the product requirement makes the whole element interactive.

Stateful Figma components use a `State` variant property with these values:

```text
Default
Hover
FocusVisible
Active
Visited
```

Each stateful component's specimen slot must show the visible component set plus
external state labels. This keeps variant selection usable while making the
state-by-state appearance inspectable on the component page.

In vertical slice v1, `Shared - TextLink` owns inline link states and
`Widget - PostIndexItem` owns post-row link states. Higher-level static
containers remain stateless.

Concrete link-state styles:

| State           | Surface token           | Text token           | Treatment                           |
| --------------- | ----------------------- | -------------------- | ----------------------------------- |
| Default         | `Color/Surface/Default` | `Color/Text/Default` | visible underline                   |
| Hover           | `Color/Surface/Muted`   | `Color/Text/Default` | stronger underline                  |
| `focus-visible` | `Color/Surface/Muted`   | `Color/Text/Default` | muted surface plus strong underline |
| Active          | `Color/Surface/Default` | `Color/Text/Default` | strongest underline                 |
| Visited         | `Color/Surface/Default` | `Color/Text/Muted`   | muted visible underline             |

The link-state component set is the source for:

- explicit navigation links
- back-to-index links
- Markdown body anchors

`Widget - PostIndexItem` is itself the post navigation link. It uses `Viewport`
and `State` variant properties. `Viewport` supports `Desktop` and `Mobile`.
`State` supports `Default`, `Hover`, `FocusVisible`, `Active`, and `Visited`.
Do not implement the title as a nested `TextLink`; the title is the primary text
label inside the row. `PostIndexItem` variants must not contain `TextLink`
instances, because that would model a nested-link system. `PostIndexItem` title
text should not use underline; the row state itself owns the interaction
affordance.

Post row states must not change row dimensions. Keep all `PostIndexItem` state
variants within the same viewport the same width and height so hover, keyboard
focus, active press, and visited rendering do not shift the archive list. Use
Cold Document surface shifts for hover, a stable focus indicator for
`FocusVisible`, and muted title text for `Visited`. The `FocusVisible` indicator
must be a fixed overlay, not an auto-layout child that can push the row content.

`Widget - PostIndexItem` should keep post metadata in a single metadata row
inside the content column. `PublishedAt` appears before tags in that row. The
date should not remain as a separate left column in v1.

Figma component state documentation should use this layout inside each component
specimen:

1. Convert the component itself into a component set only when the component
   itself owns interaction state.
2. Use `State` as the interaction variant property name.
3. Keep `Default` first.
4. Place state labels outside the component set, aligned with the visible
   variants.
5. Keep static components as single components with no fake state property.

Do not put annotation text or spec rows inside the component set. Component sets
should contain only variants so the asset remains usable from Figma's Assets tab
and instance property controls.

## Tags And Metadata

Tags are plain metadata in v1.

The current product requirements do not define tag roles, tag pages, or graph
navigation. The design system must not create role-coded tag treatment ahead of
the product requirement.

Rules:

- Render tags as scannable text metadata.
- Do not use colored chips.
- Do not use role-coded borders or patterns.
- Do not make tags look navigable until tag navigation exists.
- Keep dates and tags aligned where viewport width allows.

## State Design

State design remains minimal and functional.

User-facing states:

- empty post list
- not-found post detail

Content-integrity failures:

- missing required metadata
- missing local asset referenced by Markdown

Rules:

- Empty state should look like part of the archive, not a marketing panel.
- Not-found state should provide a clear path back to the index.
- Missing assets should fail before rendering instead of showing broken visual
  placeholders.
- Invalid metadata is a content integrity failure, not a user-facing decorative
  error state.
- Do not use illustrations, gradients, or decorative cards for states.

Recommended examples:

```text
01 Index
────────────────────────
No published posts.
```

```text
404
Post not found.

← Back to index
```

## Figma Structure And Naming

Figma should separate foundations, architecture-layered components, and screens.

Detailed Figma MCP operating rules live in
[Figma MCP Usage Contract](./figma-mcp-usage.md).

Recommended file/page structure:

```text
00 Foundations
01 Components
02 Screens
```

Frame naming pattern:

```text
<scope>/<name>/<state>/<viewport>
```

Examples:

```text
Foundation / Typography
Foundation / Color
Foundation / Spacing

Shared - MetadataPair
Entity - PostMetadata
Feature - PostIndexItem
Widget - PostDetailHeader

Screen/Home/Default/Desktop
Screen/Home/Empty/Desktop
Screen/PostDetail/Default/Desktop
Screen/PostDetail/NotFound/Desktop
```

Naming rules:

- Names describe functional ownership, not decoration.
- Component groups follow the repo FSD layer model in
  `docs/architecture/foundation-architecture.md`.
- Component names use PascalCase after their layer prefix.
- Design dependency direction is
  `Screen -> Widget -> Feature -> Entity -> Shared -> Foundations`.
- Screen names follow route or user experience ownership.
- State names use clear product states such as `Default`, `Empty`, and
  `NotFound`.
- Viewport names use `Desktop` and `Mobile`.
- Do not add `Loading` frames for v1.

Screen page arrangement:

- Arrange existing `02 Screens` frames in user-flow order before route inventory
  order.
- Do not create extra flow layers, lane labels, or arrow annotations on the
  screen page.
- Place the normal archive-to-article path first:
  `Home/Default -> PostDetail/Default`.
- Place the no-posts home state after the normal reading path:
  `Home/Empty`.
- Place the invalid post URL recovery state last:
  `PostDetail/NotFound`.
- Keep desktop and mobile variants next to the matching flow step when space
  allows.

Screen prototype connections:

- Use Figma prototype interactions on existing screen content, not extra flow
  annotation layers.
- `Home/Default` post rows navigate to the matching `PostDetail/Default`
  viewport.
- `PostDetail/Default` back links navigate to the matching `Home/Default`
  viewport.
- `PostDetail/NotFound` recovery links navigate to the matching `Home/Default`
  viewport.
- Keep desktop and mobile prototype starting points on their respective
  `Home/Default` frames.

## Non-Goals

This document does not implement:

- CSS custom properties
- Tailwind configuration
- component code
- Storybook stories
- Figma high-fidelity mockups
- tag-role taxonomy
- graph navigation

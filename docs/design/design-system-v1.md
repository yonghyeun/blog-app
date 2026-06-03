# Design System v1

## Version Surface

- Depends on: [Blog Design Direction](./blog-design-direction.md)

## Purpose

This document defines the minimum design-system criteria for vertical slice v1.

It is not a complete token package or component library. It is the shared
reference for Figma frames and UI implementation.

## Design-System Principles

- Design follows function.
- Use grayscale brutalist minimalism.
- Prefer structure over decoration.
- Prefer metadata over ornamental labels.
- Prefer document surfaces over cards.
- Use color only after typography, spacing, border, and contrast cannot express
  the needed distinction.

## Typography

The typography system uses three font families:

| Role                         | Typeface         |
| ---------------------------- | ---------------- |
| Long-form Korean body text   | SUIT             |
| Headings                     | IBM Plex Sans KR |
| Navigation, labels, metadata | IBM Plex Sans KR |
| Code and inline code         | D2Coding         |

Typography rules:

- Body text must remain comfortable for long Korean reading.
- Headings and metadata should feel cold, technical, and system-like.
- Do not introduce display-only decorative typefaces.
- Use size, weight, alignment, and spacing for hierarchy.
- Keep letter spacing at the default value.
- Keep the font stack to these three families plus system fallbacks.

Recommended initial type roles:

```text
body: SUIT
heading: IBM Plex Sans KR
ui-label: IBM Plex Sans KR
metadata: IBM Plex Sans KR
code: D2Coding
```

## Color

The color system is grayscale-first.

Routine UI should not use saturated accent colors. Links, tags, metadata,
separators, and states should remain monochrome.

Recommended token candidates:

```css
--color-background: #f7f7f5;
--color-surface: #ffffff;
--color-text: #111111;
--color-text-muted: #666666;
--color-border: #d8d8d4;
--color-border-strong: #111111;
--color-inverse-background: #111111;
--color-inverse-text: #f7f7f5;
```

Color rules:

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
section gap: 3rem to 4rem
list row padding: 1rem 0
metadata gap: 0.5rem to 1rem
article paragraph gap: 1rem
article block gap: 1.5rem
article max width: 42rem to 48rem
detail layout gap: 3rem
```

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
- Use a thin structural border for the metadata rail.
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

Body links use visible underlines instead of color. Hover and focus states may
use stronger underline, outline, or inverse treatment.

Rules:

- Do not use default blue links.
- Body links must be visibly underlined.
- Hover may strengthen underline or use inverse treatment.
- `focus-visible` must be clearly visible.
- Tags remain plain metadata in v1 unless tag pages exist.
- Metadata links use bracket-style treatment only when a current navigation
  requirement exists.

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

## Non-Goals

This document does not implement:

- CSS custom properties
- Tailwind configuration
- component code
- Storybook stories
- Figma high-fidelity mockups
- tag-role taxonomy
- graph navigation

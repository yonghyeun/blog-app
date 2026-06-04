# Frontend Accessibility Guide

## Purpose

This guide is the repo-local accessibility checklist for frontend UI work.

Read it before changing:

- reusable UI components
- component fixtures or Storybook stories
- route-level UI composition
- keyboard, focus, link, or navigation behavior
- color, typography, spacing, or visual state rules that affect readability

This guide does not replace WCAG. It fixes the minimum pass/fail standard for this
blog app so UI slices do not re-decide accessibility from scratch.

## Source Contracts

Use this guide together with:

- [Design System v1](../design/design-system-v1.md)
- [Storybook UI Surface Guide](./storybook-ui-surface.md)
- [Playwright E2E Surface Contract](./playwright-e2e-surface.md)

When a visual preference conflicts with this guide, accessibility wins unless the
source issue explicitly records the exception and its risk.

## Baseline Standard

Every frontend UI change should pass these checks:

- semantic element first
- keyboard path present for every interactive control
- visible `:focus-visible` treatment
- readable contrast in default and stateful variants
- text remains readable at supported responsive widths
- Storybook or Playwright owns the right verification surface

Do not add ARIA to compensate for avoidable non-semantic markup. Prefer native
HTML behavior first.

## Semantic HTML

Pass:

- Use `<a>` for navigation with a real `href`.
- Use `<button>` for actions that mutate UI state or submit intent.
- Use heading levels in document order.
- Use lists for repeated index rows when the list structure matters.
- Use `<time dateTime="...">` for visible dates.
- Use `<article>`, `<main>`, `<nav>`, `<header>`, and `<footer>` when they describe
  the page structure.
- Give icon-only controls an accessible name.
- Keep link text meaningful without relying on surrounding layout.

Fail:

- Clickable `<div>` or `<span>` used instead of a native control.
- Link used as a button when no navigation occurs.
- Button used as a link when navigation occurs.
- Heading level chosen only for visual size.
- ARIA role added where a native element would provide the role.
- Empty or repeated accessible names for controls with different outcomes.

## Keyboard And Focus

Pass:

- Every interactive element is reachable by `Tab`.
- Keyboard order follows the visual reading order.
- `Enter` activates links and buttons through native behavior.
- `Space` activates buttons through native behavior.
- `:focus-visible` is clearly visible against the component surface.
- Focus indicators do not change component dimensions.
- Focus is not trapped unless the component owns a modal or menu pattern.
- Disabled controls are not focusable unless a documented pattern requires it.

Fail:

- Hover-only affordance.
- Focus state hidden with `outline: none` and no replacement.
- Keyboard focus moves into hidden content.
- State changes are available only through pointer interaction.
- Focus indicator relies only on a subtle color shift.
- Layout shifts when focus, hover, active, or visited states appear.

## Contrast And Color

Pass:

- Body and UI text must be readable on the actual background token.
- Link affordance must not rely on color alone.
- Error, empty, active, selected, and focus states need a non-color cue when color is
  used.
- Inverse blocks use the design-system inverse tokens and stay readable.
- Muted metadata remains legible at the intended size.

Fail:

- Default blue links that bypass the design-system link treatment.
- Pastel or random tag colors used as the only distinction.
- Text placed on surfaces with insufficient contrast.
- Focus, hover, or active state expressed only through a low-contrast surface shift.
- Disabled or muted styles reused for active content.

Use the design-system Cold Document palette first. Add a new color only when the
source issue records why typography, spacing, border, underline, or surface treatment
cannot express the state.

## Text Sizing And Readability

Pass:

- Body text remains comfortable for long Korean reading.
- UI labels remain readable without viewport-width font scaling.
- Letter spacing stays at the default value unless the design contract changes.
- Text wraps inside its container at mobile and desktop widths.
- Long labels, slugs, dates, and metadata do not overlap neighboring content.
- Button and link hit areas are stable across state changes.

Fail:

- Text clipped by a fixed-height container.
- UI label only fits at the current fixture width.
- Font size scales directly with viewport width.
- Negative letter spacing.
- Hover or focus state changes text size, line height, or row height.

## Images And Media

Pass:

- Informative images have useful `alt` text.
- Decorative images use empty `alt=""`.
- Local post images preserve visible size constraints across responsive widths.
- Image failure or missing image behavior is covered by the owning issue when changed.

Fail:

- Filename, slug, or generic text used as `alt` for informative content.
- Decorative image announced to assistive technology.
- Image dimensions cause cumulative layout shift in route-visible UI.

## Storybook Responsibility

Storybook owns reusable component accessibility before the component reaches a route.

Use Storybook for:

- semantic component states
- hover, focus-visible, active, visited, disabled, empty, and responsive variants
- component fixtures that expose text wrapping and contrast issues
- future `@storybook/addon-a11y` checks for isolated components

Storybook pass criteria:

- important state variants are visible as stories
- `FocusVisible` story exists for interactive reusable components
- fixtures use realistic Korean and metadata lengths when layout can break
- accessibility findings are fixed in the component, not hidden in story code

Storybook does not own:

- route navigation
- app-level focus order across route sections
- private content repository access
- build-time content validation

## Playwright Responsibility

Playwright owns browser-visible route and user-flow accessibility.

Use Playwright for:

- route-level landmarks and visible heading expectations
- keyboard navigation across page sections
- focus behavior after navigation when the route defines it
- visible not-found, empty, or error states
- image rendering and asset path behavior
- checks that require the actual Next app shell

Playwright pass criteria:

- user-visible route behavior can be reached without pointer-only interaction
- assertions describe the visible result, not implementation internals
- route fixtures stay public-safe
- failures identify the route behavior that regressed

Playwright does not own:

- isolated component visual matrices
- private `blog-post` repository access
- pure parsing or validation logic

## Reusable Component Checklist

Before implementation:

- [ ] The component's semantic element is known.
- [ ] Interactive behavior is link, button, form control, or static content.
- [ ] Required states are listed.
- [ ] Storybook or Playwright ownership is chosen.
- [ ] Realistic text length and responsive width risks are known.

During implementation:

- [ ] Native HTML behavior is used before ARIA.
- [ ] Keyboard interaction works without custom key handlers when native behavior is
      enough.
- [ ] `:focus-visible` is visible and does not shift layout.
- [ ] Color is not the only state cue.
- [ ] Text wraps or truncates by explicit product choice.

Before review:

- [ ] Storybook stories exist for reusable visual states when required.
- [ ] Playwright covers route-level behavior when a route changed.
- [ ] `npm run storybook:build` ran when Storybook or reusable UI changed.
- [ ] `npm run test:e2e` ran when route-level visible behavior changed.
- [ ] The source issue records any accepted accessibility exception.

## Review Questions

Use these questions when reviewing UI work:

- Can the UI be understood from the HTML element choices?
- Can a keyboard user reach and activate every interactive element?
- Is focus visible in the Cold Document palette?
- Does text remain readable in Korean at mobile and desktop widths?
- Does the test surface match the behavior being verified?
- Did the change preserve the design-system state rules?

If any answer is no, fix the UI before treating the slice as review-ready.

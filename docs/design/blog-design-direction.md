# Blog Design Direction

## Version Surface

- Product requirement input:
  [Vertical Slice v1 Requirements](../product/vertical-slice-v1-requirements.md)

## Purpose

This document defines the design philosophy, information hierarchy, and layout
direction for vertical slice v1.

It exists so Figma frames and UI implementation can make the same design
judgments from the committed repository artifact.

## Core Principle

Design follows function.

Visual decisions must reveal the archive structure, reading flow, and current
metadata relationships instead of decorating the page. If a visual element does
not help reading, navigation, or hierarchy, it should be removed.

## Product Character

The blog should look like quiet developer notes and behave like a public
technical archive.

Obsidian remains the private knowledge graph and authoring workspace. The public
blog renders selected publishable nodes from that graph without exposing private
drafts, private links, or private notes.

Vertical slice v1 focuses on readable post list and post detail screens.

## Visual Language

The visual language is Cold Document white-scale brutalist minimalism with a
document-first archive structure.

The interface should expose hierarchy through typography, spacing, borders,
section labels, and link treatment before using color. It should avoid decorative
color coding, card-heavy composition, gradients, glass effects, and ornamental
icons.

Cold Document uses near-white surfaces instead of pure white. The intended
surface impression is crisp, quiet, and technical without relying on `#ffffff` as
the default canvas.

The target impression is cold, minimal, modern, and structural.

## Information Hierarchy

Vertical slice v1 has two primary user-facing surfaces:

- post list
- post detail

The product requirements define the visible metadata:

- title
- description
- published date
- tags
- rendered Markdown body on detail pages

These fields are the information hierarchy for v1. The design should not create
extra visual categories that the product requirements do not define.

## Post List Direction

The post list is a metadata index, not a card grid.

Each post item should be indexed by real metadata such as date, tags, title, and
description. Individual posts should not receive decorative serial numbers. A
section label may use a numbered archive convention, but the number belongs to
the section structure, not to individual post identity.

Recommended structure:

```text
01 Index

2026.06.02   blog   개발용 블로그를 만드는 이유
                    개인 기록을 공개 가능한 블로그로 연결하는 실험
```

Design implications:

- Use row rhythm and separators instead of cards.
- Keep metadata scannable.
- Prefer aligned columns where viewport width allows.
- Preserve a simple stacked layout on mobile.
- Avoid colored tag chips.

## Post Detail Direction

Post detail pages use a centered article column on desktop.

Post metadata is part of the title context. It appears directly below the title
as a horizontal metadata row rather than as a separate right rail.

Desktop direction:

```text
title
published date / tags
body
```

Mobile direction:

- Preserve the article-first reading flow.
- Keep metadata close to the title.
- Do not duplicate metadata in a way that slows reading.

## Tags

Tags are rendered as plain metadata.

The current product requirements define tags as visible metadata. They do not
define tag role, tag type, role-coded tag treatment, tag pages, or graph
navigation. The design should not introduce role-based tag categories.

Tag presentation should support scanning without looking like colored chips or
decorative labels.

## States

The design distinguishes user-facing states from content-integrity failures.

User-facing states:

- empty post list
- not-found post detail

Content-integrity failures:

- missing required metadata
- missing local asset referenced by Markdown

Empty and not-found states should use plain text, archive separators, and clear
navigation. Missing assets and invalid metadata should fail before rendering
rather than appearing as decorative error placeholders.

## Non-Goals

This document does not define:

- final visual polish
- Figma high-fidelity mockups
- reusable UI component implementation
- typography, color, and spacing tokens
- tag-role taxonomy
- backlink or graph rendering behavior

Those are outside this document's current ownership.

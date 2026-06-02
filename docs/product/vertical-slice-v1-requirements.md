# Vertical Slice v1 Requirements

## Status

- Current revision: minimum feature requirements fixed.
- Traceability: use the commit that changes this file as the dependency surface.

## Purpose

This document is the repo-tracked product requirements source of truth for
vertical slice v1.

It exists so design and implementation work can reference one stable document
instead of restating requirements across separate tracking surfaces.

## Document Path

```text
docs/product/vertical-slice-v1-requirements.md
```

## Reference Rules

- This file is the repo artifact for vertical slice v1 product requirements.
- The current committed file contents define the requirement state.
- Downstream work should depend on this file path plus the commit SHA that
  introduced the relevant requirement revision.
- Tracking surfaces may link to this file, but this file should not depend on
  remote tracking surfaces for ownership or validity.
- Requirement changes after implementation starts should update this file in a
  reviewable commit before dependent code changes.

### User Goal

Visitors must be able to:

- choose a post from the post list
- read a post detail page
- confirm the post title, published date, and tags
- read a post that contains local images without broken content

### Post List Requirements

The post list must show every valid post.

Each post item must show:

- title
- published date
- tags
- description

The list must sort posts by `publishedAt` descending.

### Post Detail Requirements

The post detail page must be reachable by slug.

The detail page must show:

- title
- published date
- tags
- rendered Markdown body
- rendered local images referenced by the body

`updatedAt` may exist as computed metadata, but it is not shown in the v1 UI.

### Content Metadata Requirements

Authors must provide this frontmatter:

```yaml
slug: dev-blog-os
title: 개발용 블로그를 만드는 이유
description: 개인 기록을 공개 가능한 블로그로 연결하는 실험을 정리한다.
tags:
  - blog
```

Required author-provided fields:

- `slug`
- `title`
- `description`
- `tags`

System-computed fields:

- `publishedAt`
- `updatedAt`

Date rules:

- `publishedAt` is computed from the first commit date for the post path in the
  content repository.
- `updatedAt` is computed from the latest commit date for the post path in the
  content repository.
- Local preview may use file `mtime` as a fallback when git history is
  unavailable.

`type` is not required for v1.

### Required States

The renderer and content loading flow must handle these states:

- empty post list
- missing slug
- missing asset
- invalid or incomplete metadata

State requirements:

- Empty post list: show an empty state instead of a broken page.
- Missing or unknown slug: return a not-found state.
- Missing required metadata: fail build or parsing.
- Missing image file referenced by Markdown: fail build or parsing.
- Invalid generated date metadata: fail build or parsing.

The exact implementation of build/parsing failure belongs to later implementation
work.

### Scope

Vertical slice v1 includes:

- post list
- post detail
- Markdown body rendering
- local image rendering
- metadata validation
- git history based `publishedAt` and `updatedAt` calculation
- empty list handling
- not-found handling
- missing metadata failure
- missing image failure

### Non-Scope

Vertical slice v1 does not include:

- tag pages
- search
- related posts
- SEO or AEO work
- OG image generation
- comments
- RSS
- pagination
- Markdown extension syntax
- Obsidian wiki link or image syntax

### Acceptance Criteria

- The post list shows every valid post.
- The post list shows title, published date, tags, and description for each post.
- The post list sorts posts by `publishedAt` descending.
- The post detail page is reachable by slug.
- The post detail page shows title, published date, tags, and rendered Markdown
  body.
- The post detail page renders local images referenced by the body.
- An unknown slug returns a not-found state.
- Zero valid posts shows an empty state.
- Missing required frontmatter fails build or parsing.
- A Markdown-referenced local image that does not exist fails build or parsing.
- `publishedAt` is computed from content repository git history.
- `updatedAt` is computed from content repository git history.
- Local preview can fall back to file `mtime` when git history is unavailable.

### Completion Signal

The product requirement artifact has enough detail for downstream design and
implementation work to create bounded work items without redefining the v1 feature
scope.

## Out Of Scope For This Shape Revision

- Markdown parser decisions
- Next.js route implementation
- Publish script implementation
- Figma frame production
- Design system decisions

---
slug: route-integration
title: 라우트 통합 기록
description: loader와 renderer route를 연결하는 vertical slice 기록이다.
tags:
  - renderer
  - e2e
---

# 본문 섹션

라우트는 `PostContentNode` AST를 직접 렌더링한다.

```ts
const route = "integration";
```

- 목록 렌더링
- 상세 렌더링

![[route-diagram.svg|320x180]]

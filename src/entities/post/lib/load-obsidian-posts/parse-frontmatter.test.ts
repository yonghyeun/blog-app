import { describe, expect, it } from "vitest";

import { parseFrontmatter } from "./parse-frontmatter";

describe("Obsidian frontmatter 파서", () => {
  it("frontmatter와 body를 분리하면 닫는 delimiter 이후 본문을 원문 줄 그대로 반환한다", () => {
    const result = parseFrontmatter({
      path: "/vault/posts/first.md",
      content: [
        "---",
        "slug: first-post",
        "title: 첫 번째 글",
        "description: 첫 번째 글 설명",
        "tags:",
        "  - blog",
        "  - test",
        "---",
        "",
        "첫 문단",
        "---",
        "본문의 구분선",
      ].join("\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: {
        frontmatter: {
          slug: "first-post",
          title: "첫 번째 글",
          description: "첫 번째 글 설명",
          tags: ["blog", "test"],
        },
        body: "첫 문단\n---\n본문의 구분선",
        bodyLineStart: 10,
      },
    });
  });

  it("YAML subset을 읽으면 문자열 scalar와 block list를 frontmatter 값으로 반환한다", () => {
    const result = parseFrontmatter({
      path: "/vault/posts/yaml-subset.md",
      content: [
        "---",
        "slug: yaml-subset",
        "title: YAML subset",
        "description: 기본 subset",
        "type: essay",
        "tags:",
        "  - archive",
        "  - obsidian",
        "---",
        "본문",
      ].join("\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: {
        frontmatter: {
          slug: "yaml-subset",
          title: "YAML subset",
          description: "기본 subset",
          type: "essay",
          tags: ["archive", "obsidian"],
        },
        body: "본문",
        bodyLineStart: 10,
      },
    });
  });

  it("닫는 delimiter가 없으면 frontmatter parse issue를 반환한다", () => {
    const result = parseFrontmatter({
      path: "/vault/posts/broken.md",
      content: ["---", "slug: broken-post", "title: 닫히지 않은 글"].join("\n"),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "missing-frontmatter-delimiter",
          path: "/vault/posts/broken.md",
        }),
      ],
    });
  });

  it("CRLF 줄바꿈으로 저장된 frontmatter도 delimiter로 인식한다", () => {
    const result = parseFrontmatter({
      path: "/vault/posts/crlf.md",
      content: [
        "---",
        "slug: crlf-post",
        "title: CRLF 글",
        "description: CRLF 설명",
        "tags:",
        "  - blog",
        "---",
        "",
        "본문",
      ].join("\r\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: {
        frontmatter: {
          slug: "crlf-post",
          title: "CRLF 글",
          description: "CRLF 설명",
          tags: ["blog"],
        },
        body: "본문",
        bodyLineStart: 9,
      },
    });
  });

  it("YAML subset으로 해석할 수 없는 줄이 있으면 frontmatter parse issue를 반환한다", () => {
    const result = parseFrontmatter({
      path: "/vault/posts/malformed.md",
      content: ["---", "slug first-post", "title: 깨진 글", "---", "본문"].join("\n"),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-frontmatter-syntax",
          path: "/vault/posts/malformed.md",
          raw: "slug first-post",
        }),
      ],
    });
  });
});

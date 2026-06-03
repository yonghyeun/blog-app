import { describe, expect, it } from "vitest";

import { parseObsidianContent } from "./parse-obsidian-content";

describe("Obsidian content AST 파서", () => {
  it("heading과 paragraph를 source 위치가 포함된 AST node로 반환한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/ast.md",
      content: ["# 큰 제목", "", "본문 `code` 문단"].join("\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "heading",
          depth: 1,
          children: [
            {
              type: "text",
              value: "큰 제목",
            },
          ],
          source: {
            raw: "# 큰 제목",
            lineStart: 1,
            lineEnd: 1,
          },
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "본문 ",
            },
            {
              type: "inlineCode",
              value: "code",
            },
            {
              type: "text",
              value: " 문단",
            },
          ],
          source: {
            raw: "본문 `code` 문단",
            lineStart: 3,
            lineEnd: 3,
          },
        },
      ],
    });
  });

  it("h1 h2 h3만 heading node로 반환하고 더 깊은 heading은 paragraph로 유지한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/headings.md",
      content: ["# H1", "## H2", "### H3", "#### H4"].join("\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: [
        expect.objectContaining({
          type: "heading",
          depth: 1,
        }),
        expect.objectContaining({
          type: "heading",
          depth: 2,
        }),
        expect.objectContaining({
          type: "heading",
          depth: 3,
        }),
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "#### H4",
            },
          ],
          source: {
            raw: "#### H4",
            lineStart: 4,
            lineEnd: 4,
          },
        },
      ],
    });
  });

  it("image embed를 image node로 반환하고 크기 suffix와 source 위치를 보존한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/image.md",
      content: "![not-obsidian](x.png)\n![[dir/foo.png|300x200]]",
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "![not-obsidian](x.png)",
            },
          ],
          source: {
            raw: "![not-obsidian](x.png)",
            lineStart: 1,
            lineEnd: 1,
          },
        },
        {
          type: "image",
          target: "dir/foo.png",
          width: 300,
          height: 200,
          source: {
            raw: "![[dir/foo.png|300x200]]",
            lineStart: 2,
            lineEnd: 2,
          },
        },
      ],
    });
  });

  it("fenced code block을 language와 raw source 위치가 포함된 codeBlock node로 반환한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/code.md",
      content: ["```ts", "const value = 1;", "```"].join("\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "codeBlock",
          language: "ts",
          code: "const value = 1;",
          source: {
            raw: ["```ts", "const value = 1;", "```"].join("\n"),
            lineStart: 1,
            lineEnd: 3,
          },
        },
      ],
    });
  });

  it("연속된 unordered list와 ordered list를 각각 flat list node로 반환한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/list.md",
      content: ["- 첫 번째", "- 두 번째 `code`", "", "1. 하나", "2. 둘"].join("\n"),
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "list",
          ordered: false,
          items: [
            {
              children: [
                {
                  type: "text",
                  value: "첫 번째",
                },
              ],
              source: {
                raw: "- 첫 번째",
                lineStart: 1,
                lineEnd: 1,
              },
            },
            {
              children: [
                {
                  type: "text",
                  value: "두 번째 ",
                },
                {
                  type: "inlineCode",
                  value: "code",
                },
              ],
              source: {
                raw: "- 두 번째 `code`",
                lineStart: 2,
                lineEnd: 2,
              },
            },
          ],
          source: {
            raw: ["- 첫 번째", "- 두 번째 `code`"].join("\n"),
            lineStart: 1,
            lineEnd: 2,
          },
        },
        {
          type: "list",
          ordered: true,
          items: [
            {
              children: [
                {
                  type: "text",
                  value: "하나",
                },
              ],
              source: {
                raw: "1. 하나",
                lineStart: 4,
                lineEnd: 4,
              },
            },
            {
              children: [
                {
                  type: "text",
                  value: "둘",
                },
              ],
              source: {
                raw: "2. 둘",
                lineStart: 5,
                lineEnd: 5,
              },
            },
          ],
          source: {
            raw: ["1. 하나", "2. 둘"].join("\n"),
            lineStart: 4,
            lineEnd: 5,
          },
        },
      ],
    });
  });

  it("body line offset을 받으면 원본 Markdown 파일 기준 source 위치를 반환한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/offset.md",
      content: ["# 제목", "", "![[foo.png]]"].join("\n"),
      lineStart: 8,
    });

    expect(result).toEqual({
      ok: true,
      data: [
        expect.objectContaining({
          type: "heading",
          source: {
            raw: "# 제목",
            lineStart: 8,
            lineEnd: 8,
          },
        }),
        expect.objectContaining({
          type: "image",
          source: {
            raw: "![[foo.png]]",
            lineStart: 10,
            lineEnd: 10,
          },
        }),
      ],
    });
  });

  it("잘못된 Obsidian image embed는 paragraph가 아니라 invalid image embed issue로 반환한다", () => {
    const result = parseObsidianContent({
      path: "/vault/posts/invalid-image.md",
      content: "![[foo.png|bad-size]]",
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-image-embed",
          raw: "![[foo.png|bad-size]]",
          path: "/vault/posts/invalid-image.md",
        }),
      ],
    });
  });
});

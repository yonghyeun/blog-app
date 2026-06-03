import { describe, expect, it } from "vitest";

import { parseInlineContent } from "./parse-inline-content";

describe("Obsidian inline content 파서", () => {
  it("일반 텍스트를 입력하면 text inline node 하나를 반환한다", () => {
    const result = parseInlineContent("본문 텍스트");

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "text",
          value: "본문 텍스트",
        },
      ],
    });
  });

  it("inline code가 섞인 문장을 입력하면 text와 inlineCode node 순서를 보존한다", () => {
    const result = parseInlineContent("본문 `const value = 1` 다음");

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "text",
          value: "본문 ",
        },
        {
          type: "inlineCode",
          value: "const value = 1",
        },
        {
          type: "text",
          value: " 다음",
        },
      ],
    });
  });

  it("일반 wiki link는 v1에서 text node로 유지한다", () => {
    const result = parseInlineContent("관련 글 [[다른 글]]");

    expect(result).toEqual({
      ok: true,
      data: [
        {
          type: "text",
          value: "관련 글 [[다른 글]]",
        },
      ],
    });
  });
});

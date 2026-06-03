import { describe, expect, it } from "vitest";

import { validateFrontmatter } from "./validate-frontmatter";

const validFrontmatter = () => ({
  slug: "first-post",
  title: "첫 번째 글",
  description: "첫 번째 글 설명",
  tags: ["blog", "test"],
});

describe("Obsidian 게시글 frontmatter 검증", () => {
  it.each([["slug"], ["title"], ["description"], ["tags"]] as const)(
    "%s 값이 없으면 missing frontmatter issue를 반환한다",
    (field) => {
      const frontmatter: Record<string, unknown> = validFrontmatter();

      delete frontmatter[field];

      expect(validateFrontmatter(frontmatter)).toEqual({
        ok: false,
        error: [
          expect.objectContaining({
            code: "missing-frontmatter-field",
            field,
          }),
        ],
      });
    },
  );

  it("tags 값이 배열이 아니면 invalid frontmatter issue를 반환한다", () => {
    expect(
      validateFrontmatter({
        ...validFrontmatter(),
        tags: "blog",
      }),
    ).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-frontmatter-field",
          field: "tags",
        }),
      ],
    });
  });

  it.each([["slug"], ["title"], ["description"], ["type"]] as const)(
    "%s 값이 문자열이 아니면 invalid frontmatter issue를 반환한다",
    (field) => {
      expect(
        validateFrontmatter({
          ...validFrontmatter(),
          [field]: ["not", "scalar"],
        }),
      ).toEqual({
        ok: false,
        error: [
          expect.objectContaining({
            code: "invalid-frontmatter-field",
            field,
          }),
        ],
      });
    },
  );

  it("tags 배열 안에 문자열이 아닌 값이 있으면 invalid frontmatter issue를 반환한다", () => {
    expect(
      validateFrontmatter({
        ...validFrontmatter(),
        tags: ["blog", 1],
      }),
    ).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-frontmatter-field",
          field: "tags",
        }),
      ],
    });
  });

  it("type 값이 없으면 v1 frontmatter로 허용한다", () => {
    expect(validateFrontmatter(validFrontmatter())).toEqual({
      ok: true,
      data: validFrontmatter(),
    });
  });

  it("type 값이 있으면 선택 metadata로 함께 반환한다", () => {
    expect(
      validateFrontmatter({
        ...validFrontmatter(),
        type: "essay",
      }),
    ).toEqual({
      ok: true,
      data: {
        ...validFrontmatter(),
        type: "essay",
      },
    });
  });

  it.each([["publishedAt"], ["updatedAt"]] as const)(
    "%s 값이 author frontmatter에 있으면 reserved field issue를 반환한다",
    (field) => {
      expect(
        validateFrontmatter({
          ...validFrontmatter(),
          [field]: "2026-01-01T00:00:00.000Z",
        }),
      ).toEqual({
        ok: false,
        error: [
          expect.objectContaining({
            code: "reserved-frontmatter-field",
            field,
          }),
        ],
      });
    },
  );
});

import { describe, expect, it } from "vitest";

import { buildPostLookup } from "./build-post-lookup";

describe("게시글 slug lookup 생성", () => {
  it("known slug와 unknown slug를 구분하는 lookup 함수를 Result로 반환한다", () => {
    const firstPost = {
      slug: "first-post",
      title: "첫 번째 글",
    };
    const result = buildPostLookup([firstPost]);

    expect(result.ok).toBe(true);
    expect(result).toEqual({
      ok: true,
      data: expect.any(Function),
    });

    if (!result.ok) {
      return;
    }

    expect(result.data("first-post")).toEqual({
      status: "known",
      post: firstPost,
    });
    expect(result.data("missing-post")).toEqual({
      status: "unknown",
      slug: "missing-post",
    });
  });

  it("중복 slug가 있으면 duplicate slug issue를 반환한다", () => {
    expect(
      buildPostLookup([
        {
          slug: "duplicate-post",
          title: "첫 번째 글",
        },
        {
          slug: "duplicate-post",
          title: "두 번째 글",
        },
      ]),
    ).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "duplicate-slug",
          slug: "duplicate-post",
        }),
      ],
    });
  });
});

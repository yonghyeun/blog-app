import { describe, expect, it } from "vitest";

import { sortPosts } from "./sort-posts";

describe("게시글 정렬", () => {
  it("게시글 목록을 publishedAt 내림차순 Result로 반환한다", () => {
    const oldPost = {
      slug: "old-post",
      publishedAt: "2026-05-01T00:00:00.000Z",
    };
    const newPost = {
      slug: "new-post",
      publishedAt: "2026-05-03T00:00:00.000Z",
    };
    const middlePost = {
      slug: "middle-post",
      publishedAt: "2026-05-02T00:00:00.000Z",
    };

    expect(sortPosts([oldPost, newPost, middlePost])).toEqual({
      ok: true,
      data: [newPost, middlePost, oldPost],
    });
  });
});

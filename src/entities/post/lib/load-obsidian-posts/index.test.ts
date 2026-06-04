import { describe, expect, it } from "vitest";

import { loadObsidianPosts } from "@/entities/post/lib/load-obsidian-posts";

const attachmentRoot = "/vault/posts/_attachments";
const assetUrlPrefix = "/post-assets";

type TestPostSource = {
  path: string;
  content: string;
  mtime?: Date;
};

type TestAttachmentSource = {
  path: string;
};

type TestSources = {
  posts: TestPostSource[];
  attachments: TestAttachmentSource[];
};

type TestDateProviderResult = {
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type LoadedPost = {
  slug: string;
  content: unknown[];
};

const loadFrom = (sources: TestSources) => async () => sources;

const dateProvider =
  (resultsByPath: Record<string, TestDateProviderResult>) => async (source: TestPostSource) =>
    resultsByPath[source.path] ?? null;

const attachment = (name: string): TestAttachmentSource => ({
  path: `${attachmentRoot}/${name}`,
});

const post = ({
  path,
  slug,
  title,
  body = "본문",
}: {
  path: string;
  slug: string;
  title: string;
  body?: string;
}): TestPostSource => ({
  path,
  content: markdown(
    {
      slug,
      title,
      description: `${title} 설명`,
      tags: ["blog", "test"],
    },
    body,
  ),
});

const markdown = (frontmatter: Record<string, unknown>, body: string) => {
  const lines = Object.entries(frontmatter).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return [key + ":", ...value.map((item) => `  - ${item}`)];
    }

    return [`${key}: ${value}`];
  });

  return ["---", ...lines, "---", "", body].join("\n");
};

describe("Obsidian 게시글 로더 public API", () => {
  it("유효한 source를 로드하면 AST content, 최신순 정렬, slug lookup을 Result로 반환한다", async () => {
    const oldPath = "/vault/posts/old.md";
    const newPath = "/vault/posts/new.md";

    const result = await loadObsidianPosts({
      loadSources: loadFrom({
        posts: [
          post({
            path: oldPath,
            slug: "old-post",
            title: "오래된 글",
          }),
          post({
            path: newPath,
            slug: "new-post",
            title: "새 글",
            body: ["# 새 글", "", "대표 이미지 `inline`", "", "![[foo.png]]"].join("\n"),
          }),
        ],
        attachments: [attachment("foo.png")],
      }),
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: dateProvider({
        [oldPath]: {
          publishedAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
        [newPath]: {
          publishedAt: "2026-05-02T00:00:00.000Z",
          updatedAt: "2026-05-02T00:00:00.000Z",
        },
      }),
    });

    expect(result.ok).toBe(true);
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        posts: expect.any(Array),
        findBySlug: expect.any(Function),
      }),
    });

    if (!result.ok) {
      return;
    }

    expect(result.data.posts.map((item: LoadedPost) => item.slug)).toEqual([
      "new-post",
      "old-post",
    ]);
    expect(result.data.posts[0].content).toEqual([
      {
        type: "heading",
        depth: 1,
        children: [
          {
            type: "text",
            value: "새 글",
          },
        ],
        source: {
          raw: "# 새 글",
          lineStart: 10,
          lineEnd: 10,
        },
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "대표 이미지 ",
          },
          {
            type: "inlineCode",
            value: "inline",
          },
        ],
        source: {
          raw: "대표 이미지 `inline`",
          lineStart: 12,
          lineEnd: 12,
        },
      },
      {
        type: "image",
        target: "foo.png",
        attachmentPath: "/vault/posts/_attachments/foo.png",
        assetPath: "foo.png",
        assetUrl: "/post-assets/foo.png",
        source: {
          raw: "![[foo.png]]",
          lineStart: 14,
          lineEnd: 14,
        },
      },
    ]);
    expect(result.data.findBySlug("new-post")).toEqual({
      status: "known",
      post: result.data.posts[0],
    });
    expect(result.data.findBySlug("missing-post")).toEqual({
      status: "unknown",
      slug: "missing-post",
    });
  });

  it("필수 frontmatter가 없으면 전체 pipeline이 missing frontmatter issue Result를 반환한다", async () => {
    const result = await loadObsidianPosts({
      loadSources: loadFrom({
        posts: [
          {
            path: "/vault/posts/invalid.md",
            content: markdown(
              {
                slug: "invalid-post",
                title: "유효하지 않은 글",
                description: "태그가 없는 글",
              },
              "본문",
            ),
          },
        ],
        attachments: [],
      }),
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: dateProvider({
        "/vault/posts/invalid.md": {
          publishedAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "missing-frontmatter-field",
          field: "tags",
          path: "/vault/posts/invalid.md",
        }),
      ],
    });
  });

  it("본문 image embed가 attachment로 해소되지 않으면 missing asset issue Result를 반환한다", async () => {
    const result = await loadObsidianPosts({
      loadSources: loadFrom({
        posts: [
          post({
            path: "/vault/posts/missing-image.md",
            slug: "missing-image-post",
            title: "이미지가 없는 글",
            body: "![[missing.png]]",
          }),
        ],
        attachments: [],
      }),
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: dateProvider({
        "/vault/posts/missing-image.md": {
          publishedAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "missing-obsidian-asset",
          reference: "missing.png",
          path: "/vault/posts/missing-image.md",
        }),
      ],
    });
  });

  it("중복 slug가 있으면 duplicate slug issue Result를 반환한다", async () => {
    const result = await loadObsidianPosts({
      loadSources: loadFrom({
        posts: [
          post({
            path: "/vault/posts/first.md",
            slug: "duplicate-post",
            title: "첫 번째 글",
          }),
          post({
            path: "/vault/posts/second.md",
            slug: "duplicate-post",
            title: "두 번째 글",
          }),
        ],
        attachments: [],
      }),
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: dateProvider({
        "/vault/posts/first.md": {
          publishedAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
        "/vault/posts/second.md": {
          publishedAt: "2026-05-02T00:00:00.000Z",
          updatedAt: "2026-05-02T00:00:00.000Z",
        },
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "duplicate-slug",
          slug: "duplicate-post",
        }),
      ],
    });
  });

  it("loadSources가 예외를 던지면 load source failure issue Result를 반환한다", async () => {
    const thrown = new Error("source failed");
    const result = await loadObsidianPosts({
      loadSources: () => {
        throw thrown;
      },
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: dateProvider({}),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "load-sources-failed",
          cause: thrown,
        }),
      ],
    });
  });

  it("dateProvider가 예외를 던지면 전체 pipeline이 date provider failure issue Result를 반환한다", async () => {
    const thrown = new Error("git log failed");
    const result = await loadObsidianPosts({
      loadSources: loadFrom({
        posts: [
          post({
            path: "/vault/posts/date-provider-failure.md",
            slug: "date-provider-failure",
            title: "날짜 조회 실패 글",
          }),
        ],
        attachments: [],
      }),
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: () => {
        throw thrown;
      },
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "date-provider-failed",
          path: "/vault/posts/date-provider-failure.md",
          cause: thrown,
        }),
      ],
    });
  });

  it("dateProvider가 유효하지 않은 날짜를 반환하면 invalid date metadata issue Result를 반환한다", async () => {
    const path = "/vault/posts/invalid-date.md";
    const result = await loadObsidianPosts({
      loadSources: loadFrom({
        posts: [
          post({
            path,
            slug: "invalid-date",
            title: "날짜가 유효하지 않은 글",
          }),
        ],
        attachments: [],
      }),
      attachmentRoot,
      assetUrlPrefix,
      dateProvider: dateProvider({
        [path]: {
          publishedAt: "not-a-date",
          updatedAt: "2026-05-01T00:00:00.000Z",
        },
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-date-metadata",
          field: "publishedAt",
          path,
        }),
      ],
    });
  });
});

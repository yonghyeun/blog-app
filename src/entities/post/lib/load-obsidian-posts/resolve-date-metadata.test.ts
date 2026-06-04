import { describe, expect, it } from "vitest";

import { resolveDateMetadata } from "./resolve-date-metadata";

const source = {
  path: "/vault/posts/first.md",
  content: "본문",
  mtime: new Date("2026-04-01T12:00:00.000Z"),
};

describe("Obsidian 게시글 날짜 metadata 생성", () => {
  it("dateProvider가 날짜를 제공하면 source mtime보다 우선 사용한다", async () => {
    const result = await resolveDateMetadata(source, {
      dateProvider: () => ({
        publishedAt: "2026-03-01T09:00:00.000Z",
        updatedAt: new Date("2026-03-04T10:30:00.000Z"),
      }),
    });

    expect(result).toEqual({
      ok: true,
      data: {
        publishedAt: "2026-03-01T09:00:00.000Z",
        updatedAt: "2026-03-04T10:30:00.000Z",
      },
    });
  });

  it("dateProvider가 null을 반환하면 source mtime으로 publishedAt과 updatedAt을 만든다", async () => {
    const result = await resolveDateMetadata(source, {
      dateProvider: () => null,
    });

    expect(result).toEqual({
      ok: true,
      data: {
        publishedAt: "2026-04-01T12:00:00.000Z",
        updatedAt: "2026-04-01T12:00:00.000Z",
      },
    });
  });

  it("dateProvider 날짜가 유효하지 않으면 invalid date metadata issue를 반환한다", async () => {
    const result = await resolveDateMetadata(source, {
      dateProvider: () => ({
        publishedAt: "not-a-date",
        updatedAt: "2026-03-04T10:30:00.000Z",
      }),
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-date-metadata",
          field: "publishedAt",
          path: "/vault/posts/first.md",
        }),
      ],
    });
  });

  it("dateProvider와 source mtime이 모두 없으면 missing date metadata issue를 반환한다", async () => {
    const result = await resolveDateMetadata(
      {
        path: "/vault/posts/missing-date.md",
        content: "본문",
      },
      {
        dateProvider: () => null,
      },
    );

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "missing-date-metadata",
          field: "publishedAt",
          path: "/vault/posts/missing-date.md",
        }),
      ],
    });
  });

  it("dateProvider가 예외를 던지면 date provider failure issue를 반환한다", async () => {
    const thrown = new Error("git failed");
    const result = await resolveDateMetadata(source, {
      dateProvider: () => {
        throw thrown;
      },
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "date-provider-failed",
          path: "/vault/posts/first.md",
          cause: thrown,
        }),
      ],
    });
  });
});

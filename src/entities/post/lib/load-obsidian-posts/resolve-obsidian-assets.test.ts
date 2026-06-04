import { describe, expect, it } from "vitest";

import { resolveObsidianAssets } from "./resolve-obsidian-assets";

const attachmentRoot = "/vault/posts/_attachments";
const assetUrlPrefix = "/post-assets";

const imageNode = (target: string) => ({
  type: "image" as const,
  target,
  source: {
    raw: `![[${target}]]`,
    lineStart: 1,
    lineEnd: 1,
  },
});

const attachment = (path: string) => ({
  path: `${attachmentRoot}/${path}`,
});

describe("Obsidian asset 해소", () => {
  it("image node target을 attachmentRoot의 asset으로 해소하면 renderer URL metadata를 추가한다", () => {
    const result = resolveObsidianAssets([imageNode("foo.png")], {
      attachmentRoot,
      assetUrlPrefix,
      attachments: [attachment("foo.png")],
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          ...imageNode("foo.png"),
          attachmentPath: "/vault/posts/_attachments/foo.png",
          assetPath: "foo.png",
          assetUrl: "/post-assets/foo.png",
        },
      ],
    });
  });

  it("basename 참조가 유일한 nested attachment와 일치하면 해당 asset으로 해소한다", () => {
    const result = resolveObsidianAssets([imageNode("foo.png")], {
      attachmentRoot,
      assetUrlPrefix,
      attachments: [attachment("daily/foo.png")],
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          ...imageNode("foo.png"),
          attachmentPath: "/vault/posts/_attachments/daily/foo.png",
          assetPath: "daily/foo.png",
          assetUrl: "/post-assets/daily/foo.png",
        },
      ],
    });
  });

  it("경로 포함 참조는 attachmentRoot 기준 상대 경로와 일치하는 asset으로 해소한다", () => {
    const result = resolveObsidianAssets([imageNode("dir/foo.png")], {
      attachmentRoot,
      assetUrlPrefix,
      attachments: [attachment("dir/foo.png"), attachment("other/foo.png")],
    });

    expect(result).toEqual({
      ok: true,
      data: [
        {
          ...imageNode("dir/foo.png"),
          attachmentPath: "/vault/posts/_attachments/dir/foo.png",
          assetPath: "dir/foo.png",
          assetUrl: "/post-assets/dir/foo.png",
        },
      ],
    });
  });

  it("image node target이 attachmentRoot에서 해소되지 않으면 missing asset issue를 반환한다", () => {
    const result = resolveObsidianAssets([imageNode("missing.png")], {
      attachmentRoot,
      assetUrlPrefix,
      attachments: [],
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "missing-obsidian-asset",
          reference: "missing.png",
          raw: "![[missing.png]]",
          lineStart: 1,
          lineEnd: 1,
        }),
      ],
    });
  });

  it("basename 참조와 일치하는 attachment가 여러 개이면 ambiguous asset issue를 반환한다", () => {
    const result = resolveObsidianAssets([imageNode("foo.png")], {
      attachmentRoot,
      assetUrlPrefix,
      attachments: [attachment("daily/foo.png"), attachment("archive/foo.png")],
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "ambiguous-obsidian-asset",
          reference: "foo.png",
          raw: "![[foo.png]]",
          lineStart: 1,
          lineEnd: 1,
          matches: [
            "/vault/posts/_attachments/daily/foo.png",
            "/vault/posts/_attachments/archive/foo.png",
          ],
        }),
      ],
    });
  });

  it("attachmentRoot 밖의 attachment는 image node 해소 후보에서 제외한다", () => {
    const result = resolveObsidianAssets([imageNode("foo.png")], {
      attachmentRoot,
      assetUrlPrefix,
      attachments: [{ path: "/vault/other/foo.png" }],
    });

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "missing-obsidian-asset",
          reference: "foo.png",
          raw: "![[foo.png]]",
          lineStart: 1,
          lineEnd: 1,
        }),
      ],
    });
  });
});

import { describe, expect, it } from "vitest";

import { parseObsidianImageEmbed } from "./parse-obsidian-image-embed";

describe("Obsidian image embed 파서", () => {
  it("파일명 embed를 읽으면 target과 원문을 반환한다", () => {
    const result = parseObsidianImageEmbed("![[foo.png]]");

    expect(result).toEqual({
      ok: true,
      data: {
        raw: "![[foo.png]]",
        target: "foo.png",
      },
    });
  });

  it("경로와 단일 width suffix가 있는 embed를 읽으면 width를 숫자로 반환한다", () => {
    const result = parseObsidianImageEmbed("![[dir/foo.png|300]]");

    expect(result).toEqual({
      ok: true,
      data: {
        raw: "![[dir/foo.png|300]]",
        target: "dir/foo.png",
        width: 300,
      },
    });
  });

  it("width와 height suffix가 있는 embed를 읽으면 두 크기를 숫자로 반환한다", () => {
    const result = parseObsidianImageEmbed("![[foo.png|300x200]]");

    expect(result).toEqual({
      ok: true,
      data: {
        raw: "![[foo.png|300x200]]",
        target: "foo.png",
        width: 300,
        height: 200,
      },
    });
  });

  it("image embed 형식이 아니면 invalid image embed issue를 반환한다", () => {
    const result = parseObsidianImageEmbed("[[foo.png]]");

    expect(result).toEqual({
      ok: false,
      error: [
        expect.objectContaining({
          code: "invalid-image-embed",
          raw: "[[foo.png]]",
        }),
      ],
    });
  });
});

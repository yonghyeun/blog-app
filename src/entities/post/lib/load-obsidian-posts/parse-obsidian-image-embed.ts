import { failure, success } from "./result";
import type { PostLoadResult } from "./types";

export type ParsedObsidianImageEmbed = {
  raw: string;
  target: string;
  width?: number;
  height?: number;
};

/**
 * Obsidian image embed syntax를 target과 optional size metadata로 파싱한다.
 */
export const parseObsidianImageEmbed = (raw: string): PostLoadResult<ParsedObsidianImageEmbed> => {
  const match = /^!\[\[([^\]]+)\]\]$/.exec(raw);

  if (!match) {
    return invalidImageEmbed(raw);
  }

  const [targetPart, sizePart] = match[1].split("|");
  const target = targetPart.trim();

  if (target === "") {
    return invalidImageEmbed(raw);
  }

  if (sizePart === undefined) {
    return success({
      raw,
      target,
    });
  }

  const widthOnlyMatch = /^(\d+)$/.exec(sizePart);

  if (widthOnlyMatch) {
    return success({
      raw,
      target,
      width: Number(widthOnlyMatch[1]),
    });
  }

  const widthHeightMatch = /^(\d+)x(\d+)$/.exec(sizePart);

  if (widthHeightMatch) {
    return success({
      raw,
      target,
      width: Number(widthHeightMatch[1]),
      height: Number(widthHeightMatch[2]),
    });
  }

  return invalidImageEmbed(raw);
};

/**
 * image embed syntax 오류를 표준 PostLoad issue로 만든다.
 */
const invalidImageEmbed = (raw: string): PostLoadResult<never> =>
  failure([
    {
      code: "invalid-image-embed",
      message: `Obsidian 이미지 임베드 문법이 올바르지 않습니다. 받은 값: ${raw}. 지원 형식: ![[파일명]], ![[파일명|300]], ![[파일명|300x200]]`,
      raw,
    },
  ]);

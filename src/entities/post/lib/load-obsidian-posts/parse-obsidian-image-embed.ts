import { failure, success } from "./result";
import type { PostLoadResult } from "./types";

export type ParsedObsidianImageEmbed = {
  raw: string;
  target: string;
  width?: number;
  height?: number;
};

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

const invalidImageEmbed = (raw: string): PostLoadResult<never> =>
  failure([
    {
      code: "invalid-image-embed",
      raw,
    },
  ]);

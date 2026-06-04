import { failure, success } from "./result";
import type { ParsedFrontmatter, PostLoadResult, PostSource } from "./types";

type ParseFrontmatterData = {
  frontmatter: ParsedFrontmatter;
  body: string;
  bodyLineStart: number;
};

/**
 * Markdown source에서 YAML frontmatter와 body를 분리하고 body의 원본 시작 line을 보존한다.
 */
export const parseFrontmatter = (
  source: Pick<PostSource, "path" | "content">,
): PostLoadResult<ParseFrontmatterData> => {
  const lines = source.content.split("\n").map((line) => line.replace(/\r$/, ""));

  if (lines[0] !== "---") {
    return failure([
      {
        code: "missing-frontmatter-delimiter",
        path: source.path,
      },
    ]);
  }

  const closeIndex = lines.findIndex((line, index) => index > 0 && line === "---");

  if (closeIndex === -1) {
    return failure([
      {
        code: "missing-frontmatter-delimiter",
        path: source.path,
      },
    ]);
  }

  const frontmatterResult = parseYamlSubset(lines.slice(1, closeIndex), source.path);

  if (!frontmatterResult.ok) {
    return failure(frontmatterResult.error);
  }

  const hasBlankLineBeforeBody = lines[closeIndex + 1] === "";
  const bodyLines = lines.slice(closeIndex + 1);

  if (hasBlankLineBeforeBody) {
    bodyLines.shift();
  }

  return success({
    frontmatter: frontmatterResult.data,
    body: bodyLines.join("\n"),
    bodyLineStart: closeIndex + 2 + (hasBlankLineBeforeBody ? 1 : 0),
  });
};

/**
 * v1에서 허용하는 scalar와 block list만 읽는 제한된 YAML frontmatter parser다.
 */
const parseYamlSubset = (lines: string[], path: string): PostLoadResult<ParsedFrontmatter> => {
  const frontmatter: ParsedFrontmatter = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim() === "") {
      continue;
    }

    const scalarMatch = /^([^:\s][^:]*):(?:\s*(.*))?$/.exec(line);

    if (!scalarMatch) {
      return failure([
        {
          code: "invalid-frontmatter-syntax",
          path,
          raw: line,
          lineStart: index + 2,
          lineEnd: index + 2,
        },
      ]);
    }

    const key = scalarMatch[1].trim();
    const rawValue = scalarMatch[2] ?? "";

    if (rawValue !== "") {
      frontmatter[key] = rawValue;
      continue;
    }

    const items: string[] = [];
    let listIndex = index + 1;

    while (listIndex < lines.length) {
      const itemMatch = /^\s*-\s+(.*)$/.exec(lines[listIndex]);

      if (!itemMatch) {
        break;
      }

      items.push(itemMatch[1]);
      listIndex += 1;
    }

    frontmatter[key] = items;
    index = listIndex - 1;
  }

  return success(frontmatter);
};

import { parseInlineContent } from "./parse-inline-content";
import { parseObsidianImageEmbed } from "./parse-obsidian-image-embed";
import { failure, success } from "./result";
import type {
  ListNode,
  PostContentNode,
  PostLoadResult,
  PostSource,
  SourceLocation,
} from "./types";

/**
 * Obsidian Markdown body를 renderer가 바로 소비할 수 있는 PostContentNode AST로 변환한다.
 */
export const parseObsidianContent = (
  source: Pick<PostSource, "path" | "content"> & { lineStart?: number },
): PostLoadResult<PostContentNode[]> => {
  const lines = source.content.split("\n");
  const nodes: PostContentNode[] = [];
  const lineOffset = (source.lineStart ?? 1) - 1;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const lineNumber = lineOffset + index + 1;

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeBlockResult = parseCodeBlock(lines, index, lineOffset);

      if (!codeBlockResult.ok) {
        return failure(codeBlockResult.error);
      }

      nodes.push(codeBlockResult.data.node);
      index = codeBlockResult.data.nextIndex;
      continue;
    }

    const listKind = getListKind(line);

    if (listKind !== null) {
      const listResult = parseList(lines, index, listKind, lineOffset);

      if (!listResult.ok) {
        return failure(listResult.error);
      }

      nodes.push(listResult.data.node);
      index = listResult.data.nextIndex;
      continue;
    }

    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("![[") && trimmedLine.endsWith("]]")) {
      const imageEmbedResult = parseObsidianImageEmbed(trimmedLine);

      if (!imageEmbedResult.ok) {
        return failure(
          imageEmbedResult.error.map((issue) => ({
            ...issue,
            path: issue.path ?? source.path,
          })),
        );
      }

      nodes.push({
        type: "image",
        target: imageEmbedResult.data.target,
        ...(imageEmbedResult.data.width === undefined
          ? {}
          : { width: imageEmbedResult.data.width }),
        ...(imageEmbedResult.data.height === undefined
          ? {}
          : { height: imageEmbedResult.data.height }),
        source: sourceLocation(trimmedLine, lineNumber, lineNumber),
      });
      index += 1;
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line);

    if (headingMatch) {
      const inlineResult = parseInlineContent(headingMatch[2]);

      if (!inlineResult.ok) {
        return failure(inlineResult.error);
      }

      nodes.push({
        type: "heading",
        depth: headingMatch[1].length as 1 | 2 | 3,
        children: inlineResult.data,
        source: sourceLocation(line, lineNumber, lineNumber),
      });
      index += 1;
      continue;
    }

    const inlineResult = parseInlineContent(line);

    if (!inlineResult.ok) {
      return failure(inlineResult.error);
    }

    nodes.push({
      type: "paragraph",
      children: inlineResult.data,
      source: sourceLocation(line, lineNumber, lineNumber),
    });
    index += 1;
  }

  return success(nodes);
};

type ParsedBlock<TNode> = {
  node: TNode;
  nextIndex: number;
};

/**
 * fenced code block 범위를 읽고 codeBlock node와 다음 parsing index를 반환한다.
 */
const parseCodeBlock = (
  lines: string[],
  startIndex: number,
  lineOffset: number,
): PostLoadResult<ParsedBlock<PostContentNode>> => {
  const openingLine = lines[startIndex];
  const language = openingLine.slice(3).trim();
  let closeIndex = startIndex + 1;

  while (closeIndex < lines.length && lines[closeIndex] !== "```") {
    closeIndex += 1;
  }

  const endIndex = closeIndex < lines.length ? closeIndex : lines.length - 1;
  const rawLines = lines.slice(startIndex, endIndex + 1);
  const codeLines =
    closeIndex < lines.length
      ? lines.slice(startIndex + 1, closeIndex)
      : lines.slice(startIndex + 1);

  return success({
    node: {
      type: "codeBlock",
      ...(language === "" ? {} : { language }),
      code: codeLines.join("\n"),
      source: sourceLocation(
        rawLines.join("\n"),
        lineOffset + startIndex + 1,
        lineOffset + endIndex + 1,
      ),
    },
    nextIndex: endIndex + 1,
  });
};

/**
 * 연속된 flat ordered/unordered list line들을 하나의 list node로 묶는다.
 */
const parseList = (
  lines: string[],
  startIndex: number,
  ordered: boolean,
  lineOffset: number,
): PostLoadResult<ParsedBlock<ListNode>> => {
  const items: ListNode["items"] = [];
  const rawLines: string[] = [];
  let index = startIndex;

  while (index < lines.length && getListKind(lines[index]) === ordered) {
    const raw = lines[index];
    const itemText = ordered ? raw.replace(/^\d+\.\s+/, "") : raw.replace(/^-\s+/, "");
    const inlineResult = parseInlineContent(itemText);

    if (!inlineResult.ok) {
      return failure(inlineResult.error);
    }

    items.push({
      children: inlineResult.data,
      source: sourceLocation(raw, lineOffset + index + 1, lineOffset + index + 1),
    });
    rawLines.push(raw);
    index += 1;
  }

  return success({
    node: {
      type: "list",
      ordered,
      items,
      source: sourceLocation(rawLines.join("\n"), lineOffset + startIndex + 1, lineOffset + index),
    },
    nextIndex: index,
  });
};

/**
 * 현재 line이 v1에서 지원하는 flat list marker인지 판별한다.
 */
const getListKind = (line: string): boolean | null => {
  if (/^-\s+/.test(line)) {
    return false;
  }

  if (/^\d+\.\s+/.test(line)) {
    return true;
  }

  return null;
};

/**
 * 원본 Markdown 추적을 위해 raw text와 line range를 SourceLocation으로 묶는다.
 */
const sourceLocation = (raw: string, lineStart: number, lineEnd: number): SourceLocation => ({
  raw,
  lineStart,
  lineEnd,
});

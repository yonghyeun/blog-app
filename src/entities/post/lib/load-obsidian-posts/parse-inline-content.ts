import { success } from "./result";
import type { InlineContentNode, PostLoadResult } from "./types";

/**
 * inline Markdown text를 text node와 inlineCode node의 flat sequence로 변환한다.
 */
export const parseInlineContent = (text: string): PostLoadResult<InlineContentNode[]> => {
  const nodes: InlineContentNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const openIndex = remaining.indexOf("`");

    if (openIndex === -1) {
      pushText(nodes, remaining);
      break;
    }

    const closeIndex = remaining.indexOf("`", openIndex + 1);

    if (closeIndex === -1) {
      pushText(nodes, remaining);
      break;
    }

    pushText(nodes, remaining.slice(0, openIndex));
    nodes.push({
      type: "inlineCode",
      value: remaining.slice(openIndex + 1, closeIndex),
    });
    remaining = remaining.slice(closeIndex + 1);
  }

  return success(nodes);
};

/**
 * 빈 문자열은 버리고 실제 text segment만 inline node 배열에 추가한다.
 */
const pushText = (nodes: InlineContentNode[], value: string) => {
  if (value === "") {
    return;
  }

  nodes.push({
    type: "text",
    value,
  });
};

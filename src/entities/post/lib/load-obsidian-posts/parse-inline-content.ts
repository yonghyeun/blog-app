import { success } from "./result";
import type { InlineContentNode, PostLoadResult } from "./types";

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

const pushText = (nodes: InlineContentNode[], value: string) => {
  if (value === "") {
    return;
  }

  nodes.push({
    type: "text",
    value,
  });
};

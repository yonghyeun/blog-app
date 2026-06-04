import { Fragment } from "react";

import type { InlineContentNode } from "@/entities/post/types";
import { ArticleInlineCode } from "@/entities/post/ui/article-inline-code";

type ArticleInlineContentProps = {
  nodes: InlineContentNode[];
};

export function ArticleInlineContent({ nodes }: ArticleInlineContentProps) {
  return nodes.map((node, index) => {
    if (node.type === "text") {
      return <Fragment key={index}>{node.value}</Fragment>;
    }

    if (node.type === "inlineCode") {
      return <ArticleInlineCode key={index}>{node.value}</ArticleInlineCode>;
    }

    const exhaustive: never = node;
    return exhaustive;
  });
}

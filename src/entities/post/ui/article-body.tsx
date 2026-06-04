import type { Key, ReactNode } from "react";

import type { PostContentNode } from "@/entities/post/types";
import { ArticleCodeBlock } from "@/entities/post/ui/article-code-block";
import { ArticleHeading } from "@/entities/post/ui/article-heading";
import { ArticleImage } from "@/entities/post/ui/article-image";
import { ArticleList } from "@/entities/post/ui/article-list";
import { ArticleParagraph } from "@/entities/post/ui/article-paragraph";

type ArticleBodyProps = {
  nodes: PostContentNode[];
};

type ArticleRendererMap = {
  [TType in PostContentNode["type"]]: (
    node: Extract<PostContentNode, { type: TType }>,
    key: Key,
  ) => ReactNode;
};

const articleRenderers = {
  heading: (node, key) => <ArticleHeading key={key} node={node} />,
  paragraph: (node, key) => <ArticleParagraph key={key} node={node} />,
  image: (node, key) => <ArticleImage key={key} node={node} />,
  codeBlock: (node, key) => <ArticleCodeBlock key={key} node={node} />,
  list: (node, key) => <ArticleList key={key} node={node} />,
} satisfies ArticleRendererMap;

export function ArticleBody({ nodes }: ArticleBodyProps) {
  return <div className="space-y-8">{nodes.map(renderArticleNode)}</div>;
}

const renderArticleNode = (node: PostContentNode, key: Key) => {
  const render = articleRenderers[node.type] as (node: PostContentNode, key: Key) => ReactNode;

  return render(node, key);
};

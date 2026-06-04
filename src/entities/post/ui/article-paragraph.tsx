import type { ParagraphNode } from "@/entities/post/types";
import { ArticleInlineContent } from "@/entities/post/ui/article-inline-content";

type ArticleParagraphProps = {
  node: ParagraphNode;
};

export function ArticleParagraph({ node }: ArticleParagraphProps) {
  return (
    <p className="font-sans text-[1.0625rem] leading-[1.8125rem] text-text">
      <ArticleInlineContent nodes={node.children} />
    </p>
  );
}

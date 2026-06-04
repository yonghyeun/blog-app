import type { HeadingNode } from "@/entities/post/types";
import { ArticleInlineContent } from "@/entities/post/ui/article-inline-content";

type ArticleHeadingProps = {
  node: HeadingNode;
};

const headingClassNameByDepth = {
  1: "font-heading text-[2rem] font-semibold leading-[2.625rem]",
  2: "font-heading text-[1.375rem] font-semibold leading-[1.875rem]",
  3: "font-heading text-[1.0625rem] font-semibold leading-[1.8125rem]",
} satisfies Record<HeadingNode["depth"], string>;

export function ArticleHeading({ node }: ArticleHeadingProps) {
  const className = `${headingClassNameByDepth[node.depth]} text-text`;

  if (node.depth === 1) {
    return (
      <h2 className={className}>
        <ArticleInlineContent nodes={node.children} />
      </h2>
    );
  }

  if (node.depth === 2) {
    return (
      <h3 className={className}>
        <ArticleInlineContent nodes={node.children} />
      </h3>
    );
  }

  return (
    <h4 className={className}>
      <ArticleInlineContent nodes={node.children} />
    </h4>
  );
}

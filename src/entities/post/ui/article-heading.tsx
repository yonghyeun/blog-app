import type { HeadingNode } from "@/entities/post/types";
import { ArticleInlineContent } from "@/entities/post/ui/article-inline-content";

type ArticleHeadingProps = {
  node: HeadingNode;
};

const headingClassNameByDepth = {
  1: "font-heading text-[32px] font-semibold leading-[42px]",
  2: "font-heading text-[22px] font-semibold leading-[30px]",
  3: "font-heading text-[17px] font-semibold leading-[29px]",
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

import type { ListItemNode } from "@/entities/post/types";
import { ArticleInlineContent } from "@/entities/post/ui/article-inline-content";

type ArticleListItemProps = {
  node: ListItemNode;
};

export function ArticleListItem({ node }: ArticleListItemProps) {
  return (
    <li className="pl-1 font-sans text-[1.0625rem] leading-[1.8125rem] text-text">
      <ArticleInlineContent nodes={node.children} />
    </li>
  );
}

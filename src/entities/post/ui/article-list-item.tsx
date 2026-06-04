import type { ReactNode } from "react";

import type { ListItemNode } from "@/entities/post/types";
import { ArticleInlineContent } from "@/entities/post/ui/article-inline-content";

type ArticleListItemProps = {
  children?: ReactNode;
  node: ListItemNode;
};

export function ArticleListItem({ children, node }: ArticleListItemProps) {
  return (
    <li className="pl-1 font-sans text-[1.0625rem] leading-[1.8125rem] text-text">
      <ArticleInlineContent nodes={node.children} />
      {children ? <div className="mt-2">{children}</div> : null}
    </li>
  );
}

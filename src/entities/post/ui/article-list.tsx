import type { ListNode } from "@/entities/post/types";
import { ArticleListItem } from "@/entities/post/ui/article-list-item";

type ArticleListProps = {
  node: ListNode;
};

export function ArticleList({ node }: ArticleListProps) {
  const ListTag = node.ordered ? "ol" : "ul";

  return (
    <ListTag className={["space-y-2 pl-6", node.ordered ? "list-decimal" : "list-disc"].join(" ")}>
      {node.items.map((item, index) => (
        <ArticleListItem key={index} node={item}>
          {item.nestedLists?.map((nestedList, nestedIndex) => (
            <ArticleList key={nestedIndex} node={nestedList} />
          ))}
        </ArticleListItem>
      ))}
    </ListTag>
  );
}

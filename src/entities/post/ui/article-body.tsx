import type { PostContentNode } from "@/entities/post/types";
import { ArticleCodeBlock } from "@/entities/post/ui/article-code-block";
import { ArticleHeading } from "@/entities/post/ui/article-heading";
import { ArticleImage } from "@/entities/post/ui/article-image";
import { ArticleList } from "@/entities/post/ui/article-list";
import { ArticleParagraph } from "@/entities/post/ui/article-paragraph";

type ArticleBodyProps = {
  nodes: PostContentNode[];
};

export function ArticleBody({ nodes }: ArticleBodyProps) {
  return (
    <div className="space-y-8">
      {nodes.map((node, index) => {
        if (node.type === "heading") {
          return <ArticleHeading key={index} node={node} />;
        }

        if (node.type === "paragraph") {
          return <ArticleParagraph key={index} node={node} />;
        }

        if (node.type === "image") {
          return <ArticleImage key={index} node={node} />;
        }

        if (node.type === "codeBlock") {
          return <ArticleCodeBlock key={index} node={node} />;
        }

        if (node.type === "list") {
          return <ArticleList key={index} node={node} />;
        }

        const exhaustive: never = node;
        return exhaustive;
      })}
    </div>
  );
}

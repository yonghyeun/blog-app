import type { PostContentNode } from "@/entities/post/types";
import { ArticleBody } from "@/entities/post/ui/article-body";
import { ArticleHeader } from "@/widgets/post-detail/article-header";

type PostDetailArticleProps = {
  title: string;
  publishedAt: string;
  tags: string[];
  nodes: PostContentNode[];
};

export function PostDetailArticle({ nodes, publishedAt, tags, title }: PostDetailArticleProps) {
  return (
    <article className="mx-auto w-full max-w-[720px] space-y-12">
      <ArticleHeader title={title} publishedAt={publishedAt} tags={tags} />
      <ArticleBody nodes={nodes} />
    </article>
  );
}

import { PostIndexItem } from "@/widgets/post-index/post-index-item";
import type { PostIndexItemProps } from "@/widgets/post-index/post-index-item";

export type PostIndexListPost = Omit<PostIndexItemProps, "className">;

type PostIndexListProps = {
  posts: PostIndexListPost[];
  sectionLabel?: string;
};

export function PostIndexList({ posts, sectionLabel = "Index" }: PostIndexListProps) {
  return (
    <section className="w-full" aria-labelledby="post-index-title">
      <p id="post-index-title" className="mb-6 font-heading text-[12px] leading-[18px] text-muted">
        {sectionLabel}
      </p>
      <div className="border-b border-border">
        {posts.map((post) => (
          <PostIndexItem key={post.href} {...post} />
        ))}
      </div>
    </section>
  );
}

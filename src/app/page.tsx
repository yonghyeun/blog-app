import { getRendererPostsOrThrow } from "@/entities/post/lib/load-renderer-posts";
import { EmptyArchiveState } from "@/features/archive-empty/empty-archive-state";
import { PostIndexList } from "@/widgets/post-index/post-index-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { posts } = await getRendererPostsOrThrow();

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-[45rem] space-y-10">
        <header className="border-b border-border pb-6">
          <h1 className="font-heading text-[2rem] font-semibold leading-[2.625rem] text-text">
            Dev Blog
          </h1>
        </header>
        {posts.length === 0 ? (
          <EmptyArchiveState label="게시글 없음" message="아직 공개된 문서가 없습니다." />
        ) : (
          <PostIndexList
            posts={posts.map(({ description, publishedAt, slug, tags, title }) => ({
              description,
              href: `/posts/${slug}`,
              publishedAt,
              tags,
              title,
            }))}
          />
        )}
      </div>
    </main>
  );
}

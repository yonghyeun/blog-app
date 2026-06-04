import Link from "next/link";

import { getRendererPostsOrThrow } from "@/entities/post/lib/load-renderer-posts";
import { PostNotFoundState } from "@/features/post-not-found/post-not-found-state";
import { PostDetailArticle } from "@/widgets/post-detail/post-detail-article";

type PostDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const { findBySlug } = await getRendererPostsOrThrow();
  const postResult = findBySlug(slug);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-[45rem] space-y-10">
        <header className="border-b border-border pb-6">
          <Link
            href="/"
            className="font-heading text-[2rem] font-semibold leading-[2.625rem] text-text transition-colors hover:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-strong"
          >
            Dev Blog
          </Link>
        </header>
        {postResult.status === "known" ? (
          <PostDetailArticle
            nodes={postResult.post.content}
            publishedAt={postResult.post.publishedAt}
            tags={postResult.post.tags}
            title={postResult.post.title}
          />
        ) : (
          <PostNotFoundState
            backHref="/"
            backLabel="Index로 돌아가기"
            label="문서를 찾을 수 없음"
            message="요청한 게시글을 찾을 수 없습니다."
          />
        )}
      </div>
    </main>
  );
}

import { failure, success } from "./result";
import type { PostLoadResult, PostLookup } from "./types";

/**
 * slug 중복을 검증하고 slug로 post를 찾는 lookup 함수를 생성한다.
 */
export const buildPostLookup = <TPost extends { slug: string }>(
  posts: TPost[],
): PostLoadResult<PostLookup<TPost>> => {
  const postsBySlug = new Map<string, TPost>();

  for (const post of posts) {
    if (postsBySlug.has(post.slug)) {
      return failure([
        {
          code: "duplicate-slug",
          message: `slug lookup 생성 중 중복 slug를 발견했습니다. slug: ${post.slug}`,
          slug: post.slug,
        },
      ]);
    }

    postsBySlug.set(post.slug, post);
  }

  return success((slug: string) => {
    const post = postsBySlug.get(slug);

    if (post === undefined) {
      return {
        status: "unknown",
        slug,
      };
    }

    return {
      status: "known",
      post,
    };
  });
};

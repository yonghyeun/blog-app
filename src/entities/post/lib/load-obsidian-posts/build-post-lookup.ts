import { failure, success } from "./result";
import type { PostLoadResult, PostLookup } from "./types";

export const buildPostLookup = <TPost extends { slug: string }>(
  posts: TPost[],
): PostLoadResult<PostLookup<TPost>> => {
  const postsBySlug = new Map<string, TPost>();

  for (const post of posts) {
    if (postsBySlug.has(post.slug)) {
      return failure([
        {
          code: "duplicate-slug",
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

import { success } from "./result";
import type { PostLoadResult } from "./types";

export const sortPosts = <TPost extends { publishedAt: string }>(
  posts: TPost[],
): PostLoadResult<TPost[]> =>
  success(
    [...posts].sort(
      (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
    ),
  );

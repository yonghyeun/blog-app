import { success } from "./result";
import type { PostLoadResult } from "./types";

/**
 * post 배열을 변경하지 않고 publishedAt 최신순으로 정렬한 새 배열을 반환한다.
 */
export const sortPosts = <TPost extends { publishedAt: string }>(
  posts: TPost[],
): PostLoadResult<TPost[]> =>
  success(
    [...posts].sort(
      (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
    ),
  );

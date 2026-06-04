import { buildPostLookup } from "./build-post-lookup";
import { parseFrontmatter } from "./parse-frontmatter";
import { parseObsidianContent } from "./parse-obsidian-content";
import { failure, success } from "./result";
import { resolveDateMetadata } from "./resolve-date-metadata";
import { resolveObsidianAssets } from "./resolve-obsidian-assets";
import { sortPosts } from "./sort-posts";
import { validateFrontmatter } from "./validate-frontmatter";
import type {
  LoadedObsidianPosts,
  LoadedPost,
  LoadObsidianPostsOptions,
  ObsidianSources,
  PostLoadResult,
  PostSource,
} from "./types";

type PostLoadSuccess<T> = Extract<PostLoadResult<T>, { ok: true }>;
type PostLoadFailure<T> = Extract<PostLoadResult<T>, { ok: false }>;

/**
 * Obsidian-authored post sources를 로드하고, frontmatter validation, content AST parsing,
 * asset/date resolution, sorting, slug lookup 생성을 하나의 Result 흐름으로 조립한다.
 */
export const loadObsidianPosts = async ({
  attachmentRoot,
  assetUrlPrefix,
  dateProvider,
  loadSources,
}: LoadObsidianPostsOptions): Promise<PostLoadResult<LoadedObsidianPosts>> => {
  const sourcesResult = await loadPostSources(loadSources);

  if (!sourcesResult.ok) {
    return failure(sourcesResult.error);
  }

  const postResults = await Promise.all(
    sourcesResult.data.posts.map((source) =>
      loadPost(source, {
        attachmentRoot,
        assetUrlPrefix,
        attachments: sourcesResult.data.attachments,
        dateProvider,
      }),
    ),
  );
  const failedPostResult = postResults.find(isPostLoadFailure);

  if (failedPostResult) {
    return failure(failedPostResult.error);
  }

  const posts = postResults.filter(isPostLoadSuccess).map(({ data }) => data);
  const sortedPostsResult = sortPosts(posts);

  if (!sortedPostsResult.ok) {
    return failure(sortedPostsResult.error);
  }

  const postLookupResult = buildPostLookup(sortedPostsResult.data);

  if (!postLookupResult.ok) {
    return failure(postLookupResult.error);
  }

  return success({
    posts: sortedPostsResult.data,
    findBySlug: postLookupResult.data,
  });
};

type LoadPostOptions = Pick<
  LoadObsidianPostsOptions,
  "attachmentRoot" | "assetUrlPrefix" | "dateProvider"
> & {
  attachments: ObsidianSources["attachments"];
};

/**
 * 단일 Markdown source를 검증된 post metadata와 resolved content AST를 가진 LoadedPost로 변환한다.
 */
const loadPost = async (
  source: PostSource,
  { attachmentRoot, assetUrlPrefix, attachments, dateProvider }: LoadPostOptions,
): Promise<PostLoadResult<LoadedPost>> => {
  const frontmatterResult = parseFrontmatter(source);

  if (!frontmatterResult.ok) {
    return failure(frontmatterResult.error);
  }

  const validatedFrontmatterResult = validateFrontmatter(frontmatterResult.data.frontmatter, {
    path: source.path,
  });

  if (!validatedFrontmatterResult.ok) {
    return failure(validatedFrontmatterResult.error);
  }

  const contentResult = parseObsidianContent({
    path: source.path,
    content: frontmatterResult.data.body,
    lineStart: frontmatterResult.data.bodyLineStart,
  });

  if (!contentResult.ok) {
    return failure(contentResult.error);
  }

  const resolvedContentResult = resolveObsidianAssets(contentResult.data, {
    attachmentRoot,
    assetUrlPrefix,
    attachments,
    path: source.path,
  });

  if (!resolvedContentResult.ok) {
    return failure(resolvedContentResult.error);
  }

  const dateMetadataResult = await resolveDateMetadata(source, {
    dateProvider,
  });

  if (!dateMetadataResult.ok) {
    return failure(dateMetadataResult.error);
  }

  return success({
    ...validatedFrontmatterResult.data,
    ...dateMetadataResult.data,
    path: source.path,
    content: resolvedContentResult.data,
  });
};

/**
 * 외부 source acquisition 함수의 예외를 loader Result issue로 변환한다.
 */
const loadPostSources = async (
  loadSources: LoadObsidianPostsOptions["loadSources"],
): Promise<PostLoadResult<ObsidianSources>> => {
  try {
    const sources = await loadSources();

    return success(sources);
  } catch (error) {
    return failure([
      {
        code: "load-sources-failed",
        message:
          "loadSources() 실행 중 예외가 발생해 게시글 원본과 attachment 목록을 불러오지 못했습니다.",
        cause: error,
      },
    ]);
  }
};

/**
 * PostLoadResult 배열에서 성공 Result만 좁히기 위한 type guard다.
 */
const isPostLoadSuccess = <T>(result: PostLoadResult<T>): result is PostLoadSuccess<T> => result.ok;

/**
 * PostLoadResult 배열에서 실패 Result만 좁히기 위한 type guard다.
 */
const isPostLoadFailure = <T>(result: PostLoadResult<T>): result is PostLoadFailure<T> =>
  !result.ok;

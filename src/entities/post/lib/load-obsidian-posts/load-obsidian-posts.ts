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
} from "./types";

export const loadObsidianPosts = async (
  options: LoadObsidianPostsOptions,
): Promise<PostLoadResult<LoadedObsidianPosts>> => {
  const sourcesResult = await loadSources(options);

  if (!sourcesResult.ok) {
    return failure(sourcesResult.error);
  }

  const posts: LoadedPost[] = [];

  for (const source of sourcesResult.data.posts) {
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
      attachmentRoot: options.attachmentRoot,
      assetUrlPrefix: options.assetUrlPrefix,
      attachments: sourcesResult.data.attachments,
      path: source.path,
    });

    if (!resolvedContentResult.ok) {
      return failure(resolvedContentResult.error);
    }

    const dateMetadataResult = await resolveDateMetadata(source, {
      dateProvider: options.dateProvider,
    });

    if (!dateMetadataResult.ok) {
      return failure(dateMetadataResult.error);
    }

    posts.push({
      ...validatedFrontmatterResult.data,
      ...dateMetadataResult.data,
      path: source.path,
      content: resolvedContentResult.data,
    });
  }

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

const loadSources = async (
  options: LoadObsidianPostsOptions,
): Promise<PostLoadResult<ObsidianSources>> => {
  try {
    const sources = await options.loadSources();

    return success(sources);
  } catch (error) {
    return failure([
      {
        code: "load-sources-failed",
        cause: error,
      },
    ]);
  }
};

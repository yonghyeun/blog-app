import {
  loadObsidianPosts,
  type LoadedObsidianPosts,
  type PostLoadIssue,
  type PostLoadResult,
} from "@/entities/post/lib/load-obsidian-posts";
import {
  loadLocalObsidianSources,
  resolveAttachmentRoot,
} from "@/entities/post/lib/load-local-obsidian-sources";
import { readBlogPostAssetUrlPrefix, readBlogPostRepoPath } from "@/shared/env/server-env";

export const loadRendererPosts = (): Promise<PostLoadResult<LoadedObsidianPosts>> => {
  const contentRoot = readBlogPostRepoPath();

  return loadObsidianPosts({
    assetUrlPrefix: readBlogPostAssetUrlPrefix(),
    attachmentRoot: resolveAttachmentRoot({ contentRoot }),
    dateProvider: () => null,
    loadSources: () => loadLocalObsidianSources({ contentRoot }),
  });
};

export const getRendererPostsOrThrow = async (): Promise<LoadedObsidianPosts> => {
  let postsResult: PostLoadResult<LoadedObsidianPosts>;

  try {
    postsResult = await loadRendererPosts();
  } catch (error) {
    throw new Error(formatRendererLoadError(error), {
      cause: error,
    });
  }

  if (!postsResult.ok) {
    throw new Error(formatPostLoadIssues(postsResult.error));
  }

  return postsResult.data;
};

const formatPostLoadIssues = (issues: PostLoadIssue[]) =>
  issues.map((issue) => issue.message).join("\n");

const formatRendererLoadError = (error: unknown) => {
  if (error instanceof Error) {
    return `Renderer post source configuration failed: ${error.message}`;
  }

  return "Renderer post source configuration failed.";
};

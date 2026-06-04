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
  const postsResult = await loadRendererPosts();

  if (!postsResult.ok) {
    throw new Error(formatPostLoadIssues(postsResult.error));
  }

  return postsResult.data;
};

const formatPostLoadIssues = (issues: PostLoadIssue[]) =>
  issues.map((issue) => issue.message).join("\n");

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

const assetUrlPrefix = "/post-assets";

export const loadRendererPosts = (): Promise<PostLoadResult<LoadedObsidianPosts>> => {
  const contentRoot = process.env.BLOG_POST_REPO_PATH;

  return loadObsidianPosts({
    assetUrlPrefix,
    attachmentRoot: contentRoot ? resolveAttachmentRoot({ contentRoot }) : "",
    dateProvider: () => null,
    loadSources: () =>
      contentRoot
        ? loadLocalObsidianSources({ contentRoot })
        : {
            attachments: [],
            posts: [],
          },
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

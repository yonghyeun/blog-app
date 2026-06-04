export type RequiredServerEnvName = "BLOG_POST_REPO_PATH" | "BLOG_POST_ASSET_URL_PREFIX";

export const readRequiredServerEnv = (name: RequiredServerEnvName): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
};

export const readBlogPostRepoPath = () => readRequiredServerEnv("BLOG_POST_REPO_PATH");

export const readBlogPostAssetUrlPrefix = () => readRequiredServerEnv("BLOG_POST_ASSET_URL_PREFIX");

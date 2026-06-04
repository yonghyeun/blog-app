import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import type { AttachmentSource, ObsidianSources, PostSource } from "@/entities/post/types";

export type LocalObsidianSourceOptions = {
  contentRoot: string;
  postDirectory?: string;
  attachmentDirectory?: string;
};

const defaultPostDirectory = "posts";
const defaultAttachmentDirectory = "attachments";

export const resolveContentRoot = (contentRoot: string) =>
  path.isAbsolute(contentRoot)
    ? contentRoot
    : path.resolve(/*turbopackIgnore: true*/ process.cwd(), contentRoot);

export const resolveAttachmentRoot = ({
  attachmentDirectory = defaultAttachmentDirectory,
  contentRoot,
}: Pick<LocalObsidianSourceOptions, "attachmentDirectory" | "contentRoot">) =>
  path.join(/*turbopackIgnore: true*/ resolveContentRoot(contentRoot), attachmentDirectory);

export const loadLocalObsidianSources = async ({
  attachmentDirectory = defaultAttachmentDirectory,
  contentRoot,
  postDirectory = defaultPostDirectory,
}: LocalObsidianSourceOptions): Promise<ObsidianSources> => {
  const root = resolveContentRoot(contentRoot);
  const postRoot = path.join(/*turbopackIgnore: true*/ root, postDirectory);
  const attachmentRoot = path.join(/*turbopackIgnore: true*/ root, attachmentDirectory);

  const [postPaths, attachmentPaths] = await Promise.all([
    listFiles(postRoot, (filePath) => filePath.endsWith(".md")),
    listFiles(attachmentRoot, (filePath) => !path.basename(filePath).startsWith(".")),
  ]);
  const posts = await Promise.all(postPaths.map(toPostSource));
  const attachments = attachmentPaths.map<AttachmentSource>((attachmentPath) => ({
    path: attachmentPath,
  }));

  return {
    attachments,
    posts,
  };
};

const toPostSource = async (postPath: string): Promise<PostSource> => {
  const [content, postStat] = await Promise.all([readFile(postPath, "utf8"), stat(postPath)]);

  return {
    content,
    mtime: postStat.mtime,
    path: postPath,
  };
};

const listFiles = async (
  directory: string,
  shouldInclude: (filePath: string) => boolean,
): Promise<string[]> => {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .filter(shouldInclude)
    .sort();
};

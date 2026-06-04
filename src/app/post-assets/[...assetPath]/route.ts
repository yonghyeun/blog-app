import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  resolveAttachmentRoot,
  resolveContentRoot,
} from "@/entities/post/lib/load-local-obsidian-sources";

type PostAssetRouteContext = {
  params: Promise<{
    assetPath: string[];
  }>;
};

export async function GET(_request: Request, { params }: PostAssetRouteContext) {
  const contentRoot = process.env.BLOG_POST_REPO_PATH;

  if (!contentRoot) {
    return new Response(null, { status: 404 });
  }

  const { assetPath } = await params;
  const attachmentRoot = resolveAttachmentRoot({
    contentRoot: resolveContentRoot(contentRoot),
  });
  const targetPath = path.resolve(/*turbopackIgnore: true*/ attachmentRoot, ...assetPath);

  if (!isInsideDirectory(targetPath, attachmentRoot)) {
    return new Response(null, { status: 404 });
  }

  try {
    const file = await readFile(targetPath);

    return new Response(file, {
      headers: {
        "content-type": contentTypeFor(targetPath),
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}

const isInsideDirectory = (targetPath: string, root: string) => {
  const relativePath = path.relative(root, targetPath);

  return relativePath !== "" && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
};

const contentTypeFor = (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".svg") {
    return "image/svg+xml";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "application/octet-stream";
};

import { failure, success } from "./result";
import type { AttachmentSource, ImageNode, PostContentNode, PostLoadResult } from "./types";

type ResolveObsidianAssetsOptions = {
  attachmentRoot: string;
  assetUrlPrefix: string;
  attachments: AttachmentSource[];
  path?: string;
};

export const resolveObsidianAssets = (
  nodes: PostContentNode[],
  options: ResolveObsidianAssetsOptions,
): PostLoadResult<PostContentNode[]> => {
  const { path } = options;
  const resolvedNodes: PostContentNode[] = [];
  const attachmentIndex = createAttachmentIndex(options);

  for (const node of nodes) {
    if (node.type !== "image") {
      resolvedNodes.push(node);
      continue;
    }

    const assetResult = resolveImageNode(node, {
      path,
      attachmentIndex,
      assetUrlPrefix: options.assetUrlPrefix,
    });

    if (!assetResult.ok) {
      return failure(assetResult.error);
    }

    resolvedNodes.push(assetResult.data);
  }

  return success(resolvedNodes);
};

const resolveImageNode = (
  node: ImageNode,
  {
    assetUrlPrefix,
    attachmentIndex,
    path,
  }: {
    assetUrlPrefix: string;
    attachmentIndex: AttachmentIndex;
    path?: string;
  },
): PostLoadResult<ImageNode> => {
  const matches = node.target.includes("/")
    ? (attachmentIndex.byAssetPath.get(node.target) ?? [])
    : (attachmentIndex.byBasename.get(node.target) ?? []);

  if (matches.length === 0) {
    return failure([
      {
        code: "missing-obsidian-asset",
        reference: node.target,
        path,
        raw: node.source.raw,
        lineStart: node.source.lineStart,
        lineEnd: node.source.lineEnd,
      },
    ]);
  }

  if (matches.length > 1) {
    return failure([
      {
        code: "ambiguous-obsidian-asset",
        reference: node.target,
        matches: matches.map((match) => match.path),
        path,
        raw: node.source.raw,
        lineStart: node.source.lineStart,
        lineEnd: node.source.lineEnd,
      },
    ]);
  }

  const [match] = matches;
  const trimmedAssetUrlPrefix = trimTrailingSlash(assetUrlPrefix);

  return success({
    ...node,
    attachmentPath: match.path,
    assetPath: match.assetPath,
    assetUrl: `${trimmedAssetUrlPrefix}/${match.assetPath}`,
  });
};

type IndexedAttachment = {
  path: string;
  assetPath: string;
};

type AttachmentIndex = {
  byAssetPath: Map<string, IndexedAttachment[]>;
  byBasename: Map<string, IndexedAttachment[]>;
};

const createAttachmentIndex = ({
  attachmentRoot: rawAttachmentRoot,
  attachments,
}: ResolveObsidianAssetsOptions): AttachmentIndex => {
  const attachmentRoot = trimTrailingSlash(rawAttachmentRoot);
  const byAssetPath = new Map<string, IndexedAttachment[]>();
  const byBasename = new Map<string, IndexedAttachment[]>();

  for (const attachment of attachments) {
    if (!isInsideRoot(attachment.path, attachmentRoot)) {
      continue;
    }

    const indexedAttachment = {
      path: attachment.path,
      assetPath: relativeToRoot(attachment.path, attachmentRoot),
    };

    pushIndexValue(byAssetPath, indexedAttachment.assetPath, indexedAttachment);
    pushIndexValue(byBasename, basename(indexedAttachment.assetPath), indexedAttachment);
  }

  return {
    byAssetPath,
    byBasename,
  };
};

const pushIndexValue = (
  map: Map<string, IndexedAttachment[]>,
  key: string,
  value: IndexedAttachment,
) => {
  map.set(key, [...(map.get(key) ?? []), value]);
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const isInsideRoot = (path: string, root: string) => path.startsWith(`${root}/`);

const relativeToRoot = (path: string, root: string) => {
  if (path === root) {
    return "";
  }

  if (path.startsWith(`${root}/`)) {
    return path.slice(root.length + 1);
  }

  return path;
};

const basename = (path: string) => path.split("/").at(-1) ?? path;

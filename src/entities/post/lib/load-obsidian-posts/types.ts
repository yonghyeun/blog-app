import type { PostLoadIssue } from "./issues";
import type { Result } from "./result";
import type { ObsidianSources, PostSource } from "../../types";

export type FrontmatterValue = string | string[];
export type ParsedFrontmatter = Record<string, FrontmatterValue>;

export type DateProviderResult = {
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type LoadObsidianPostsOptions = {
  loadSources: () => Promise<ObsidianSources> | ObsidianSources;
  attachmentRoot: string;
  assetUrlPrefix: string;
  dateProvider: (
    source: PostSource,
  ) => Promise<DateProviderResult | null> | DateProviderResult | null;
};

export type PostLoadResult<T> = Result<T, PostLoadIssue[]>;

export type {
  AttachmentSource,
  CodeBlockNode,
  DateMetadata,
  HeadingNode,
  ImageNode,
  InlineContentNode,
  ListItemNode,
  ListNode,
  LoadedObsidianPosts,
  LoadedPost,
  ObsidianSources,
  ParagraphNode,
  PostContentNode,
  PostLookup,
  PostSource,
  SourceLocation,
  ValidPostFrontmatter,
} from "../../types";

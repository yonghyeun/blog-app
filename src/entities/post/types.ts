export type PostSource = {
  path: string;
  content: string;
  mtime?: Date;
};

export type AttachmentSource = {
  path: string;
};

export type ObsidianSources = {
  posts: PostSource[];
  attachments: AttachmentSource[];
};

export type ValidPostFrontmatter = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  type?: string;
};

export type SourceLocation = {
  raw: string;
  lineStart: number;
  lineEnd: number;
};

export type InlineContentNode =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "inlineCode";
      value: string;
    };

export type HeadingNode = {
  type: "heading";
  depth: 1 | 2 | 3;
  children: InlineContentNode[];
  source: SourceLocation;
};

export type ParagraphNode = {
  type: "paragraph";
  children: InlineContentNode[];
  source: SourceLocation;
};

export type ImageNode = {
  type: "image";
  target: string;
  width?: number;
  height?: number;
  attachmentPath?: string;
  assetPath?: string;
  assetUrl?: string;
  source: SourceLocation;
};

export type CodeBlockNode = {
  type: "codeBlock";
  language?: string;
  code: string;
  source: SourceLocation;
};

export type ListItemNode = {
  children: InlineContentNode[];
  nestedLists?: ListNode[];
  source: SourceLocation;
};

export type ListNode = {
  type: "list";
  ordered: boolean;
  items: ListItemNode[];
  source: SourceLocation;
};

export type PostContentNode = HeadingNode | ParagraphNode | ImageNode | CodeBlockNode | ListNode;

export type DateMetadata = {
  publishedAt: string;
  updatedAt: string;
};

export type LoadedPost = ValidPostFrontmatter &
  DateMetadata & {
    path: string;
    content: PostContentNode[];
  };

export type PostLookup<TPost extends { slug: string }> = (
  slug: string,
) => { status: "known"; post: TPost } | { status: "unknown"; slug: string };

export type LoadedObsidianPosts = {
  posts: LoadedPost[];
  findBySlug: PostLookup<LoadedPost>;
};

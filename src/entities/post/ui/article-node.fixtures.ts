import type {
  CodeBlockNode,
  HeadingNode,
  ImageNode,
  InlineContentNode,
  ListItemNode,
  ListNode,
  ParagraphNode,
} from "@/entities/post/types";

export const articleNodeSource = {
  raw: "",
  lineStart: 1,
  lineEnd: 1,
};

export const headingNodes = {
  depth1: {
    type: "heading",
    depth: 1,
    children: [{ type: "text", value: "렌더러 경계 설계" }],
    source: articleNodeSource,
  },
  depth2: {
    type: "heading",
    depth: 2,
    children: [{ type: "text", value: "AST 기반 UI props" }],
    source: articleNodeSource,
  },
  depth3: {
    type: "heading",
    depth: 3,
    children: [{ type: "text", value: "inline node 처리" }],
    source: articleNodeSource,
  },
} satisfies Record<string, HeadingNode>;

export const inlineContentNodes = [
  { type: "text", value: "본문은 " },
  { type: "inlineCode", value: "PostContentNode[]" },
  { type: "text", value: "를 순서대로 소비한다." },
] satisfies InlineContentNode[];

export const paragraphNode = {
  type: "paragraph",
  children: inlineContentNodes,
  source: articleNodeSource,
} satisfies ParagraphNode;

export const codeBlockNode = {
  type: "codeBlock",
  language: "tsx",
  code: "export function ArticleBody({ nodes }) {\n  return nodes.map(renderNode);\n}",
  source: articleNodeSource,
} satisfies CodeBlockNode;

export const imageNode = {
  type: "image",
  target: "renderer-boundary.png",
  assetUrl:
    "data:image/svg+xml,%3Csvg width='960' height='540' viewBox='0 0 960 540' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='960' height='540' fill='%23f7f7f5'/%3E%3Crect x='80' y='80' width='800' height='380' fill='%23ffffff' stroke='%23d8d8d4'/%3E%3Ctext x='120' y='150' font-family='monospace' font-size='28' fill='%23111111'%3Erenderer-boundary.png%3C/text%3E%3Ctext x='120' y='210' font-family='monospace' font-size='20' fill='%23666666'%3Epublic fixture image%3C/text%3E%3C/svg%3E",
  width: 960,
  height: 540,
  source: articleNodeSource,
} satisfies ImageNode;

export const missingImageNode = {
  type: "image",
  target: "missing-local-image.png",
  source: articleNodeSource,
} satisfies ImageNode;

export const listItemNode = {
  children: inlineContentNodes,
  source: articleNodeSource,
} satisfies ListItemNode;

export const unorderedListNode = {
  type: "list",
  ordered: false,
  items: [
    {
      children: [{ type: "text", value: "loader는 AST만 반환한다" }],
      source: articleNodeSource,
    },
    {
      children: [{ type: "text", value: "UI는 AST node를 props로 소비한다" }],
      source: articleNodeSource,
    },
  ],
  source: articleNodeSource,
} satisfies ListNode;

export const orderedListNode = {
  ...unorderedListNode,
  ordered: true,
} satisfies ListNode;

import type { PostContentNode } from "@/entities/post/types";

const source = {
  raw: "",
  lineStart: 1,
  lineEnd: 1,
};

export const postDetailFixture = {
  title: "렌더러 경계 설계",
  publishedAt: "2026-06-03",
  tags: ["architecture", "renderer"],
  nodes: [
    {
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: "AST를 UI의 props로 둔다" }],
      source,
    },
    {
      type: "paragraph",
      children: [
        { type: "text", value: "UI는 loader를 호출하지 않고 " },
        { type: "inlineCode", value: "PostContentNode[]" },
        { type: "text", value: "만 소비한다." },
      ],
      source,
    },
    {
      type: "codeBlock",
      language: "tsx",
      code: '<ArticleBody nodes={post.content} />',
      source,
    },
    {
      type: "list",
      ordered: false,
      items: [
        {
          children: [{ type: "text", value: "children은 React slot에만 사용" }],
          source,
        },
        {
          children: [{ type: "text", value: "node와 nodes가 AST renderer props" }],
          source,
        },
      ],
      source,
    },
  ] satisfies PostContentNode[],
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { PostContentNode } from "@/entities/post/types";
import { ArticleBody } from "@/entities/post/ui/article-body";

const source = {
  raw: "",
  lineStart: 1,
  lineEnd: 1,
};

const nodes = [
  {
    type: "heading",
    depth: 1,
    children: [{ type: "text", value: "렌더러 경계" }],
    source,
  },
  {
    type: "paragraph",
    children: [
      { type: "text", value: "본문은 " },
      { type: "inlineCode", value: "PostContentNode[]" },
      { type: "text", value: "를 순서대로 소비한다." },
    ],
    source,
  },
  {
    type: "codeBlock",
    language: "ts",
    code: "const content = post.content;",
    source,
  },
  {
    type: "image",
    target: "renderer-boundary.png",
    source,
  },
  {
    type: "list",
    ordered: false,
    items: [
      {
        children: [{ type: "text", value: "flat list만 v1 범위" }],
        source,
      },
      {
        children: [{ type: "text", value: "tag는 plain metadata" }],
        source,
      },
    ],
    source,
  },
] satisfies PostContentNode[];

const meta = {
  title: "entities/post/ArticleBody",
  component: ArticleBody,
  tags: ["autodocs"],
  args: {
    nodes,
  },
  decorators: [
    (Story) => (
      <article className="w-[45rem] bg-background p-8">
        <Story />
      </article>
    ),
  ],
} satisfies Meta<typeof ArticleBody>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: ({ canvasElement }) => {
    const text = canvasElement.textContent ?? "";

    if (!text.includes("렌더러 경계")) {
      throw new Error("ArticleBody heading was not rendered.");
    }

    if (!text.includes("PostContentNode[]")) {
      throw new Error("ArticleBody inline code text was not rendered.");
    }

    if (!text.includes("renderer-boundary.png")) {
      throw new Error("ArticleBody image fallback was not rendered.");
    }
  },
};

export const OrderedList: Story = {
  args: {
    nodes: [
      {
        type: "list",
        ordered: true,
        items: [
          {
            children: [{ type: "text", value: "원천 Markdown을 읽는다" }],
            source,
          },
          {
            children: [{ type: "text", value: "AST로 변환한다" }],
            source,
          },
          {
            children: [{ type: "text", value: "headless UI가 소비한다" }],
            source,
          },
        ],
        source,
      },
    ],
  },
  play: ({ canvasElement }) => {
    const orderedList = canvasElement.querySelector("ol");

    if (!orderedList) {
      throw new Error("ArticleBody ordered list was not rendered.");
    }
  },
};

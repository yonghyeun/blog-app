import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleList } from "@/entities/post/ui/article-list";
import {
  mixedChildrenNestedListNode,
  nestedListNode,
  orderedListNode,
  unorderedListNode,
} from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleList",
  component: ArticleList,
  tags: ["autodocs"],
  args: {
    node: unorderedListNode,
  },
  decorators: [
    (Story) => (
      <article className="w-[45rem] bg-background p-8">
        <Story />
      </article>
    ),
  ],
} satisfies Meta<typeof ArticleList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unordered: Story = {};

export const Ordered: Story = {
  args: {
    node: orderedListNode,
  },
};

export const Nested: Story = {
  args: {
    node: nestedListNode,
  },
  play: ({ canvasElement }) => {
    const nestedLists = canvasElement.querySelectorAll("li ul, li ol");

    if (nestedLists.length === 0) {
      throw new Error("ArticleList nested list was not rendered.");
    }
  },
};

export const NestedMixedChildren: Story = {
  args: {
    node: mixedChildrenNestedListNode,
  },
  play: ({ canvasElement }) => {
    const nestedOrderedList = canvasElement.querySelector("li ol");
    const nestedUnorderedList = canvasElement.querySelector("li ul");
    const inlineCodes = canvasElement.querySelectorAll("code");
    const text = canvasElement.textContent ?? "";

    if (!nestedOrderedList || !nestedUnorderedList) {
      throw new Error("ArticleList mixed nested ordered/unordered lists were not rendered.");
    }

    if (inlineCodes.length < 3) {
      throw new Error("ArticleList mixed inlineCode children were not rendered.");
    }

    if (!text.includes("root item with inlineCode child")) {
      throw new Error("ArticleList root mixed children text was not rendered.");
    }
  },
};

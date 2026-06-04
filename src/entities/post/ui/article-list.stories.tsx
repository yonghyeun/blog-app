import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleList } from "@/entities/post/ui/article-list";
import { orderedListNode, unorderedListNode } from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleList",
  component: ArticleList,
  tags: ["autodocs"],
  args: {
    node: unorderedListNode,
  },
  decorators: [
    (Story) => (
      <article className="w-[720px] bg-background p-8">
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

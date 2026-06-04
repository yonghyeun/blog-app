import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleHeading } from "@/entities/post/ui/article-heading";
import { headingNodes } from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleHeading",
  component: ArticleHeading,
  tags: ["autodocs"],
  args: {
    node: headingNodes.depth1,
  },
  decorators: [
    (Story) => (
      <article className="w-[720px] bg-background p-8">
        <Story />
      </article>
    ),
  ],
} satisfies Meta<typeof ArticleHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Depth1: Story = {};

export const Depth2: Story = {
  args: {
    node: headingNodes.depth2,
  },
};

export const Depth3: Story = {
  args: {
    node: headingNodes.depth3,
  },
};

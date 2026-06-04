import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleImage } from "@/entities/post/ui/article-image";
import { imageNode, missingImageNode } from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleImage",
  component: ArticleImage,
  tags: ["autodocs"],
  args: {
    node: imageNode,
  },
  decorators: [
    (Story) => (
      <article className="w-[720px] bg-background p-8">
        <Story />
      </article>
    ),
  ],
} satisfies Meta<typeof ArticleImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Resolved: Story = {};

export const MissingFallback: Story = {
  args: {
    node: missingImageNode,
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleInlineContent } from "@/entities/post/ui/article-inline-content";
import { inlineContentNodes } from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleInlineContent",
  component: ArticleInlineContent,
  tags: ["autodocs"],
  args: {
    nodes: inlineContentNodes,
  },
  decorators: [
    (Story) => (
      <p className="w-[45rem] bg-background p-8 font-sans text-[1.0625rem] leading-[1.8125rem] text-text">
        <Story />
      </p>
    ),
  ],
} satisfies Meta<typeof ArticleInlineContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

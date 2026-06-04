import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleCodeBlock } from "@/entities/post/ui/article-code-block";
import { codeBlockNode } from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleCodeBlock",
  component: ArticleCodeBlock,
  tags: ["autodocs"],
  args: {
    node: codeBlockNode,
  },
  decorators: [
    (Story) => (
      <article className="w-[720px] bg-background p-8">
        <Story />
      </article>
    ),
  ],
} satisfies Meta<typeof ArticleCodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLanguage: Story = {
  args: {
    node: {
      ...codeBlockNode,
      language: undefined,
    },
  },
};

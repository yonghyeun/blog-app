import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { paragraphNode } from "@/entities/post/ui/article-node.fixtures";
import { ArticleParagraph } from "@/entities/post/ui/article-paragraph";

const meta = {
  title: "entities/post/ArticleParagraph",
  component: ArticleParagraph,
  tags: ["autodocs"],
  args: {
    node: paragraphNode,
  },
  decorators: [
    (Story) => (
      <article className="w-[720px] bg-background p-8">
        <Story />
      </article>
    ),
  ],
} satisfies Meta<typeof ArticleParagraph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

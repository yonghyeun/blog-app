import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleInlineCode } from "@/entities/post/ui/article-inline-code";

const meta = {
  title: "entities/post/ArticleInlineCode",
  component: ArticleInlineCode,
  tags: ["autodocs"],
  args: {
    children: "PostContentNode[]",
  },
  decorators: [
    (Story) => (
      <p className="w-[45rem] bg-background p-8 font-sans text-[1.0625rem] leading-[1.8125rem] text-text">
        <Story />
      </p>
    ),
  ],
} satisfies Meta<typeof ArticleInlineCode>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

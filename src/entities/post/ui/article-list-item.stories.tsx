import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArticleListItem } from "@/entities/post/ui/article-list-item";
import { listItemNode } from "@/entities/post/ui/article-node.fixtures";

const meta = {
  title: "entities/post/ArticleListItem",
  component: ArticleListItem,
  tags: ["autodocs"],
  args: {
    node: listItemNode,
  },
  decorators: [
    (Story) => (
      <ul className="w-[45rem] list-disc bg-background p-8 pl-14">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof ArticleListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

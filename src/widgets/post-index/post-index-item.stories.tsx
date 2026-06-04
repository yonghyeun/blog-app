import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { postIndexFixture } from "@/widgets/post-index/post-index.fixtures";
import { PostIndexItem } from "@/widgets/post-index/post-index-item";

const meta = {
  title: "widgets/post-index/PostIndexItem",
  component: PostIndexItem,
  tags: ["autodocs"],
  args: postIndexFixture[0],
  decorators: [
    (Story) => (
      <main className="w-[720px] bg-background p-8">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof PostIndexItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  args: {
    className: "bg-surface",
  },
};

export const FocusVisible: Story = {
  args: {
    className: "bg-surface outline outline-2 outline-offset-4 outline-strong",
  },
};

export const Active: Story = {
  args: {
    className: "bg-surface-muted",
  },
};

export const Visited: Story = {
  args: {
    className: "text-muted",
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { postDetailFixture } from "@/widgets/post-detail/post-detail.fixtures";
import { PostDetailArticle } from "@/widgets/post-detail/post-detail-article";

const meta = {
  title: "widgets/post-detail/PostDetailArticle",
  component: PostDetailArticle,
  tags: ["autodocs"],
  args: postDetailFixture,
  decorators: [
    (Story) => (
      <main className="bg-background p-8">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof PostDetailArticle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  play: ({ canvasElement }) => {
    const text = canvasElement.textContent ?? "";

    if (!text.includes(postDetailFixture.title)) {
      throw new Error("Post detail title was not rendered.");
    }

    if (!text.includes(postDetailFixture.tags.join(", "))) {
      throw new Error("Post detail tags were not rendered as plain metadata.");
    }

    if (text.includes("updatedAt")) {
      throw new Error("Post detail should not render updatedAt in v1.");
    }
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <main className="w-[342px] bg-background p-5">
        <Story />
      </main>
    ),
  ],
};

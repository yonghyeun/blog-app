import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { postIndexFixture } from "@/widgets/post-index/post-index.fixtures";
import { PostIndexList } from "@/widgets/post-index/post-index-list";

const listMeta = {
  title: "widgets/post-index/PostIndexList",
  component: PostIndexList,
  tags: ["autodocs"],
  args: {
    posts: postIndexFixture,
    sectionLabel: "Index",
  },
  decorators: [
    (Story) => (
      <main className="w-[720px] bg-background p-8">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof PostIndexList>;

export default listMeta;

type ListStory = StoryObj<typeof listMeta>;

export const Desktop: ListStory = {};

export const Mobile: ListStory = {
  decorators: [
    (Story) => (
      <main className="w-[342px] bg-background p-5">
        <Story />
      </main>
    ),
  ],
};

export const Empty: ListStory = {
  args: {
    posts: [],
  },
};

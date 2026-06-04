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
      <main className="w-[45rem] bg-background p-8">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof PostIndexList>;

export default listMeta;

type ListStory = StoryObj<typeof listMeta>;

export const Desktop: ListStory = {
  play: ({ canvasElement }) => {
    const links = canvasElement.querySelectorAll("a");
    const text = canvasElement.textContent ?? "";

    if (links.length !== postIndexFixture.length) {
      throw new Error("Post index list did not render one row link per post.");
    }

    if (!text.includes(postIndexFixture[0].tags.join(", "))) {
      throw new Error("Post index list tags were not rendered as plain metadata.");
    }
  },
};

export const Mobile: ListStory = {
  decorators: [
    (Story) => (
      <main className="w-[21.375rem] bg-background p-5">
        <Story />
      </main>
    ),
  ],
};

export const Empty: ListStory = {
  args: {
    posts: [],
  },
  play: ({ canvasElement }) => {
    const links = canvasElement.querySelectorAll("a");

    if (links.length !== 0) {
      throw new Error("Post index empty state should not render post row links.");
    }
  },
};

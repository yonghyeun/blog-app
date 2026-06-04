import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PostNotFoundState } from "@/features/post-not-found/post-not-found-state";

const meta = {
  title: "features/PostNotFoundState",
  component: PostNotFoundState,
  tags: ["autodocs"],
  args: {
    label: "404",
    message: "문서를 찾을 수 없음",
    backHref: "/",
    backLabel: "목록으로 돌아가기",
  },
  decorators: [
    (Story) => (
      <div className="w-[45rem] bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostNotFoundState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NotFound: Story = {
  play: ({ canvasElement }) => {
    const link = canvasElement.querySelector('a[href="/"]');
    const text = canvasElement.textContent ?? "";

    if (!text.includes("문서를 찾을 수 없음")) {
      throw new Error("Post not-found message was not rendered.");
    }

    if (!link) {
      throw new Error("Post not-found back link was not rendered.");
    }
  },
};

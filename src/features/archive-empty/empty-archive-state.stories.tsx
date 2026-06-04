import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyArchiveState } from "@/features/archive-empty/empty-archive-state";

const meta = {
  title: "features/EmptyArchiveState",
  component: EmptyArchiveState,
  tags: ["autodocs"],
  args: {
    label: "Archive",
    message: "게시글 없음",
  },
  decorators: [
    (Story) => (
      <main className="w-[45rem] bg-background p-8">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof EmptyArchiveState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: ({ canvasElement }) => {
    const text = canvasElement.textContent ?? "";

    if (!text.includes("게시글 없음")) {
      throw new Error("Empty archive state message was not rendered.");
    }
  },
};

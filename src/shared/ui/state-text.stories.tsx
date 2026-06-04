import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StateText } from "@/shared/ui/state-text";

const meta = {
  title: "shared/StateText",
  component: StateText,
  tags: ["autodocs"],
  args: {
    children: "게시글 없음",
  },
} satisfies Meta<typeof StateText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

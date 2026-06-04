import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TextLink } from "@/shared/ui/text-link";

const meta = {
  title: "shared/TextLink",
  component: TextLink,
  tags: ["autodocs"],
  args: {
    href: "/",
    children: "목록으로 돌아가기",
  },
} satisfies Meta<typeof TextLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  args: {
    className: "text-muted decoration-strong",
  },
};

export const FocusVisible: Story = {
  args: {
    className: "outline outline-2 outline-offset-4 outline-strong",
  },
};

export const Active: Story = {
  args: {
    className: "text-text",
  },
};

export const Visited: Story = {
  args: {
    className: "text-muted",
  },
};

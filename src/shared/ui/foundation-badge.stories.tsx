import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FoundationBadge } from "@/shared/ui/foundation-badge";

const meta = {
  title: "shared/FoundationBadge",
  component: FoundationBadge,
  args: {
    label: "Foundation ready",
    tone: "neutral",
  },
  argTypes: {
    tone: {
      control: "radio",
      options: ["neutral", "success"],
    },
  },
} satisfies Meta<typeof FoundationBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Configured: Story = {
  args: {
    label: "Storybook configured",
    tone: "success",
  },
};

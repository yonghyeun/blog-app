import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Separator } from "@/shared/ui/separator";

const meta = {
  title: "shared/Separator",
  component: Separator,
  tags: ["autodocs"],
  args: {
    weight: "thin",
  },
  argTypes: {
    weight: {
      control: "radio",
      options: ["thin", "strong"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[560px] bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Thin: Story = {};

export const Strong: Story = {
  args: {
    weight: "strong",
  },
};

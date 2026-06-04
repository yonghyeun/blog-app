import type { Preview } from "@storybook/nextjs-vite";
import { createElement } from "react";

import { fontClassName } from "../src/shared/ui/fonts";

import "../src/app/globals.css";

const preview: Preview = {
  decorators: [(Story) => createElement("div", { className: fontClassName }, createElement(Story))],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

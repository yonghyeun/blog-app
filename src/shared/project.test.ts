import { describe, expect, it } from "vitest";

import { projectSummary } from "@/shared/project";

describe("projectSummary", () => {
  it("describes the scaffold as a shared project primitive", () => {
    expect(projectSummary).toEqual({
      name: "Developer Growth Blog Operating System",
      description: "A public renderer for a private Markdown publishing workflow.",
      foundation: "Engineering Scaffold v0",
    });
  });
});

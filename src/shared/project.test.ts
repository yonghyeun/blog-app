import { describe, expect, it } from "vitest";

import { projectSummary } from "@/shared/project";

describe("프로젝트 요약", () => {
  it("공유 프로젝트 기본 정보를 제공한다", () => {
    expect(projectSummary).toEqual({
      name: "Developer Growth Blog Operating System",
      description: "A public renderer for a private Markdown publishing workflow.",
      foundation: "Engineering Scaffold v0",
    });
  });
});

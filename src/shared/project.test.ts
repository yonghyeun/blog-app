import { describe, expect, it } from "vitest";

import { projectSummary } from "@/shared/project";

describe("프로젝트 요약", () => {
  it("프로젝트 요약을 읽으면 이름, 설명, foundation 값을 반환한다", () => {
    expect(projectSummary).toEqual({
      name: "Developer Growth Blog Operating System",
      description: "A public renderer for a private Markdown publishing workflow.",
      foundation: "Engineering Scaffold v0",
    });
  });
});

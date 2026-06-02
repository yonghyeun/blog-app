import { expect, test } from "@playwright/test";

test("초기 경로를 열면 프로젝트 제목과 설명을 렌더링한다", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Developer Growth Blog Operating System" }),
  ).toBeVisible();
  await expect(
    page.getByText("A public renderer for a private Markdown publishing workflow."),
  ).toBeVisible();
});

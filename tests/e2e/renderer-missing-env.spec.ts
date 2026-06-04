import { expect, test } from "@playwright/test";

test("필수 env가 누락되면 renderer error boundary를 렌더링한다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "렌더러 설정 오류" })).toBeVisible();
  await expect(page.getByText("게시글 원천을 불러올 수 없습니다.")).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible();
});

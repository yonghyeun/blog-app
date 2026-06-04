import { expect, test } from "@playwright/test";

test("게시글 source가 비어 있으면 empty archive state를 렌더링한다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("게시글 없음")).toBeVisible();
  await expect(page.getByText("아직 공개된 문서가 없습니다.")).toBeVisible();
  await expect(page.locator('a[href^="/posts/"]')).toHaveCount(0);
});

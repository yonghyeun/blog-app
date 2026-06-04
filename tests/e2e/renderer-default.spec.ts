import { expect, test } from "@playwright/test";
import { utimes } from "node:fs/promises";
import path from "node:path";

const fixtureRoot = path.resolve(__dirname, "fixtures/blog-post-default");

test.beforeAll(async () => {
  await utimes(
    path.join(fixtureRoot, "posts/route-integration.md"),
    new Date("2026-06-04T00:00:00.000Z"),
    new Date("2026-06-04T00:00:00.000Z"),
  );
  await utimes(
    path.join(fixtureRoot, "posts/older-note.md"),
    new Date("2026-05-01T00:00:00.000Z"),
    new Date("2026-05-01T00:00:00.000Z"),
  );
});

test("초기 경로를 열면 게시글 목록을 날짜 내림차순으로 렌더링한다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Dev Blog" })).toBeVisible();

  const rows = page.locator('a[href^="/posts/"]');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("라우트 통합 기록");
  await expect(rows.nth(0)).toContainText("2026-06-04T00:00:00.000Z");
  await expect(rows.nth(0)).toContainText("renderer, e2e");
  await expect(rows.nth(0)).toContainText(
    "loader와 renderer route를 연결하는 vertical slice 기록이다.",
  );
  await expect(rows.nth(1)).toContainText("오래된 문서");
  await expect(page.locator('a[href^="/tags/"]')).toHaveCount(0);
});

test("게시글 row를 클릭하면 slug 기반 상세 route로 이동한다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /라우트 통합 기록/ }).click();

  await expect(page).toHaveURL(/\/posts\/route-integration$/);
  await expect(page.getByRole("heading", { level: 1, name: "라우트 통합 기록" })).toBeVisible();
});

test("상세 경로를 열면 본문 AST와 local image를 렌더링한다", async ({ page }) => {
  await page.goto("/posts/route-integration");

  await expect(page.getByRole("heading", { level: 1, name: "라우트 통합 기록" })).toBeVisible();
  await expect(page.getByText("2026-06-04T00:00:00.000Z")).toBeVisible();
  await expect(page.getByText("renderer, e2e")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "본문 섹션" })).toBeVisible();
  await expect(page.getByText("PostContentNode")).toBeVisible();
  await expect(page.getByText('const route = "integration";')).toBeVisible();
  await expect(page.getByText("목록 렌더링")).toBeVisible();
  await expect(page.getByText(/updatedAt|수정|Updated/)).toHaveCount(0);

  const image = page.getByRole("img", { name: "route-diagram.svg" });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", /\/post-assets\/route-diagram\.svg$/);
  await expect
    .poll(async () => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
});

test("알 수 없는 slug를 열면 not-found state와 index 복귀 링크를 렌더링한다", async ({ page }) => {
  await page.goto("/posts/unknown-slug");

  await expect(page.getByText("문서를 찾을 수 없음")).toBeVisible();
  await expect(page.getByText("요청한 게시글을 찾을 수 없습니다.")).toBeVisible();

  await page.getByRole("link", { name: "Index로 돌아가기" }).click();

  await expect(page).toHaveURL(/\/$/);
});

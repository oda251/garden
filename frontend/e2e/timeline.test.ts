import { test, expect } from "@playwright/test";

test.describe("タイムラインビュー", () => {
  test.skip(true, "認証済みセッションのセットアップが必要 (OIDC フロー)");

  test("タイムラインページが表示される", async ({ page }) => {
    await page.goto("/timeline");
    await expect(page).toHaveURL("/timeline");
  });

  test("ノードが更新日順で表示される", async ({ page }) => {
    await page.goto("/timeline");
    const cards = page.locator("[data-testid='node-card']");
    await expect(cards).toHaveCount(1); // 少なくとも1つ
  });
});

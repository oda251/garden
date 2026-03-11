import { test, expect } from "@playwright/test";

// 認証済みセッションが必要なテスト
// CI 実行時は auth.setup.ts で認証状態を事前に構築する
test.describe("グラフビュー", () => {
  test.skip(true, "認証済みセッションのセットアップが必要 (OIDC フロー)");

  test("グラフページが表示される", async ({ page }) => {
    await page.goto("/graph");
    await expect(page).toHaveURL("/graph");
    await expect(page.locator("[data-testid='graph']")).toBeVisible();
  });

  test("ノード作成ダイアログが開ける", async ({ page }) => {
    await page.goto("/graph");
    await page.getByRole("button", { name: /ノードを作成/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("サイドバーにタグ一覧が表示される", async ({ page }) => {
    await page.goto("/graph");
    await expect(page.getByText("タグ")).toBeVisible();
  });
});

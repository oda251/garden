import { test, expect } from "@playwright/test";

test.describe("管理画面", () => {
  test.skip(true, "admin ロールの認証済みセッションが必要 (OIDC フロー)");

  test("管理画面にユーザー一覧が表示される", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("ユーザーロールを変更できる", async ({ page }) => {
    await page.goto("/admin");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.getByRole("button", { name: /admin/ }).click();
    await expect(page.getByText("ロールを変更しました")).toBeVisible();
  });
});

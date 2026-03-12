import { test, expect } from "@playwright/test";

test.describe("ログインページ", () => {
  test("未認証ユーザーはログインページにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/graph");
    await expect(page).toHaveURL(/\/login/);
  });

  test("ログインページにソーシャルログインボタンが表示される", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /GitHub/ })).toBeVisible();
  });
});

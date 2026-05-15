import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("app shell loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("smot-app-shell")).toBeVisible();
  });

  test("onboarding page loads", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Analisi sistema")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-chat").click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-page")).toBeVisible();
  });

  test("upload page loads", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText("Carica")).toBeVisible();
  });
});

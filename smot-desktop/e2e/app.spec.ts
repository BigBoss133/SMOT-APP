import { expect, test } from "@playwright/test";

test.describe("SMOT Desktop App", () => {
  test("should load the app shell", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="smot-app-shell"]')).toBeVisible();
  });

  test("should show main content area", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="main-content-area"]')).toBeVisible();
  });

  test("should navigate to settings", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
  });

  test("should show settings title", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator('[data-testid="settings-title"]')).toBeVisible();
  });

  test("should navigate to upload page", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.locator("text=Carica")).toBeVisible();
  });
});

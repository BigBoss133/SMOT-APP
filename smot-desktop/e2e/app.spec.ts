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

  test("should show topbar navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="main-topbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="topbar-search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="language-toggle-button"]')).toBeVisible();
  });

  test("should show sidebar with all navigation items", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
  });

  test("dashboard shows stats and quick actions", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-stats-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-upload-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-chat-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-graph-button"]')).toBeVisible();
  });

  test("language toggle works", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator('[data-testid="language-toggle-button"]');
    const value = page.locator('[data-testid="language-toggle-value"]');
    await expect(value).toHaveText("IT");
    await toggle.click();
    await expect(value).toHaveText("EN");
    await toggle.click();
    await expect(value).toHaveText("IT");
  });

  test("search input accepts text", async ({ page }) => {
    await page.goto("/");
    const search = page.locator('[data-testid="topbar-search-input"]');
    await search.fill("test document");
    await expect(search).toHaveValue("test document");
  });

  test("should show status bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="status-bar"]')).toBeVisible();
  });
});

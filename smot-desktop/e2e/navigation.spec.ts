import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("dashboard page loads with all sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-hero-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-quick-actions-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-recent-documents-card"]')).toBeVisible();
  });

  test("onboarding page loads with wizard", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByTestId("wizard-progress")).toBeVisible();
    await expect(page.getByText("Analisi sistema")).toBeVisible();
  });

  test("sidebar navigation to chat", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-chat").click();
    await expect(page).toHaveURL(/\/chat/);
    await expect(page.getByTestId("chat-page")).toBeVisible();
  });

  test("sidebar navigation to graph", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-graph").click();
    await expect(page).toHaveURL(/\/graph/);
    await expect(page.getByTestId("graph-page")).toBeVisible();
  });

  test("sidebar navigation to settings", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-settings").click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId("settings-page")).toBeVisible();
  });

  test("settings page shows all sections", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-main-card")).toBeVisible();
    await expect(page.getByTestId("settings-mode-group")).toBeVisible();
    await expect(page.getByTestId("model-management-section")).toBeVisible();
    await expect(page.getByTestId("settings-save-button")).toBeVisible();
  });

  test("upload page loads with dropzone", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByTestId("upload-page")).toBeVisible();
    await expect(page.getByTestId("upload-dropzone")).toBeVisible();
    await expect(page.getByTestId("upload-selected-files-card")).toBeVisible();
  });

  test("viewer page loads", async ({ page }) => {
    await page.goto("/viewer");
    await expect(page.getByTestId("viewer-page")).toBeVisible();
    await expect(page.getByTestId("viewer-main-card")).toBeVisible();
  });

  test("graph page loads", async ({ page }) => {
    await page.goto("/graph");
    await expect(page.getByTestId("graph-page")).toBeVisible();
    await expect(page.getByTestId("graph-panel")).toBeVisible();
  });

  test("indexing page with demo jobId shows idle state", async ({ page }) => {
    await page.goto("/indexing/demo");
    await expect(page.getByTestId("indexing-demo-state-card")).toBeVisible();
  });

  test("navigate from upload back to dashboard", async ({ page }) => {
    await page.goto("/upload");
    await page.getByTestId("upload-cancel-button").click();
    await expect(page).toHaveURL("/");
  });
});

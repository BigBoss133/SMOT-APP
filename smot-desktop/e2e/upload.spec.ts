import { test, expect } from "@playwright/test";

test.describe("Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/upload");
  });

  test("upload page loads with all elements", async ({ page }) => {
    await expect(page.getByTestId("upload-page")).toBeVisible();
    await expect(page.getByTestId("upload-dropzone")).toBeVisible();
    await expect(page.getByTestId("upload-page-title")).toBeVisible();
    await expect(page.getByTestId("upload-dropzone-title")).toBeVisible();
    await expect(page.getByTestId("upload-dropzone-hint")).toBeVisible();
    await expect(page.getByTestId("upload-supported-formats")).toBeVisible();
    await expect(page.getByTestId("upload-file-picker-label")).toBeVisible();
  });

  test("shows empty selected files message", async ({ page }) => {
    await expect(page.getByTestId("upload-selected-files-empty")).toBeVisible();
  });

  test("shows action row with cancel and start buttons", async ({ page }) => {
    await expect(page.getByTestId("upload-action-row")).toBeVisible();
    await expect(page.getByTestId("upload-cancel-button")).toBeVisible();
    await expect(page.getByTestId("upload-start-indexing-button")).toBeVisible();
  });

  test("start indexing button is disabled when no files selected", async ({ page }) => {
    const startBtn = page.getByTestId("upload-start-indexing-button");
    await expect(startBtn).toBeDisabled();
  });

  test("cancel button navigates to dashboard", async ({ page }) => {
    await page.getByTestId("upload-cancel-button").click();
    await expect(page).toHaveURL("/");
  });

  test("shows file picker input", async ({ page }) => {
    await expect(page.getByTestId("upload-file-picker-input")).toBeVisible();
  });
});

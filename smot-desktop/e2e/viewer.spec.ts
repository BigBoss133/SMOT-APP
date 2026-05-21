import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Viewer Page Navigation', () => {
  test('should navigate to viewer page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navviewer').click();
    await expect(page).toHaveURL(/\/viewer/);
  });

  test('should display viewer content area', async ({ page }) => {
    await page.goto('/viewer');
    const viewerContent = page.locator('.viewer-text, [class*="viewer"], .viewer-head');
    await expect(viewerContent.first()).toBeVisible();
  });

  test('should show page navigation controls', async ({ page }) => {
    await page.goto('/viewer');
    const navControls = page.locator('[class*="page-nav"], button:has-text("Pagina"), .viewer-nav');
    await expect(navControls.first()).toBeVisible();
  });

  test('should display document info', async ({ page }) => {
    await page.goto('/viewer');
    const docInfo = page.locator('.viewer-head, [class*="viewer-head"]');
    await expect(docInfo.first()).toBeVisible();
  });

  test('should complete viewer navigation flow', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navviewer').click();
    await expect(page).toHaveURL(/\/viewer/);

    await page.getByTestId('nav-link-navdashboard').click();
    await expect(page).toHaveURL(/\/$/);
  });
});

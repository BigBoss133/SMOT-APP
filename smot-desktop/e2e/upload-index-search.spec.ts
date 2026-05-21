import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Upload → Indexing → Search', () => {
  test('should navigate to upload page and see upload zone', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navupload').click();
    await expect(page).toHaveURL(/\/upload/);
    await expect(page.getByText('Carica documenti')).toBeVisible();
  });

  test('should show file list when files are selected', async ({ page }) => {
    await page.goto('/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content'),
    });
    await expect(page.getByText('test-document.pdf')).toBeVisible();
  });

  test('should navigate to indexing page from upload', async ({ page }) => {
    await page.goto('/upload');
    await page.getByTestId('nav-link-navindexing').click();
    await expect(page).toHaveURL(/\/indexing/);
  });

  test('should show indexing progress UI', async ({ page }) => {
    await page.goto('/indexing/demo');
    await expect(page.getByText('Indicizzazione')).toBeVisible();
  });

  test('should search for documents from topbar', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByTestId('topbar-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('contratto');
    await expect(searchInput).toHaveValue('contratto');
  });

  test('should complete full upload-to-search flow', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navupload').click();
    await expect(page).toHaveURL(/\/upload/);

    await page.getByTestId('nav-link-navindexing').click();
    await expect(page).toHaveURL(/\/indexing/);

    await page.getByTestId('nav-link-navdashboard').click();
    await expect(page).toHaveURL(/\/$/);

    const searchInput = page.getByTestId('topbar-search-input');
    await expect(searchInput).toBeVisible();
  });
});

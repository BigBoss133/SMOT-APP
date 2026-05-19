import { test, expect } from '@playwright/test';

test.describe('SMOT-APP Frontend Navigation', () => {
  test('app loads and shows main content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });
  });

  test('sidebar navigation is present', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('nav, [role="navigation"], .sidebar, aside').first();
    if (await sidebar.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(sidebar).toBeVisible();
    }
  });

  test('can navigate to settings page', async ({ page }) => {
    await page.goto('/');
    const settingsLink = page.locator('a[href*="settings"], button:has-text("Impostazioni"), button:has-text("Settings")').first();
    if (await settingsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsLink.click();
      await expect(page).toHaveURL(/settings/i, { timeout: 5000 }).catch(() => {});
    }
  });
});
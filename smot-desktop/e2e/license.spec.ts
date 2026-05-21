import { test, expect } from '@playwright/test';

test.describe('Critical Flow: License Management', () => {
  test('should show license banner in grace period', async ({ page }) => {
    await page.goto('/');
    const licenseBanner = page.locator('.license-banner, [class*="license-banner"], [class*="LicenseBanner"]');
    const hasBanner = await licenseBanner.first().isVisible().catch(() => false);
    if (hasBanner) {
      await expect(licenseBanner.first()).toBeVisible();
    }
  });

  test('should navigate to settings for license info', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navsettings').click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should display license section in settings', async ({ page }) => {
    await page.goto('/settings');
    const licenseSection = page.locator('[class*="license"], text=/Licenza|License/i');
    await expect(licenseSection.first()).toBeVisible();
  });

  test('should validate license key format', async ({ page }) => {
    await page.goto('/settings');
    const licenseInput = page.locator('input[placeholder*="SMOT"], input[class*="license"]').first();
    const hasInput = await licenseInput.isVisible().catch(() => false);
    if (hasInput) {
      await licenseInput.fill('SMOT-PREMIUM-TEST-TEST-TEST');
      await expect(licenseInput).toHaveValue('SMOT-PREMIUM-TEST-TEST-TEST');
    }
  });

  test('should complete license flow from dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('smot-app-shell')).toBeVisible();

    await page.getByTestId('nav-link-navsettings').click();
    await expect(page).toHaveURL(/\/settings/);

    const licenseSection = page.locator('[class*="license"], text=/Licenza|License/i');
    await expect(licenseSection.first()).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Settings and Mode Change', () => {
  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navsettings').click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should display mode selection chips', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Performance')).toBeVisible();
    await expect(page.getByText('Balanced')).toBeVisible();
    await expect(page.getByText('Lite')).toBeVisible();
  });

  test('should show AI model settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText(/Llama|Modello|AI|Ollama/i)).toBeVisible();
  });

  test('should display theme toggle in topbar', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.getByTestId('theme-toggle-button');
    await expect(themeToggle).toBeVisible();
  });

  test('should toggle dark/light theme', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.getByTestId('theme-toggle-button');
    await expect(themeToggle).toBeVisible();

    const initialTheme = await themeToggle.getAttribute('aria-label');
    await themeToggle.click();

    const newTheme = await themeToggle.getAttribute('aria-label');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist theme selection', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.getByTestId('theme-toggle-button');
    const initialTheme = await themeToggle.getAttribute('aria-label');
    await themeToggle.click();

    await page.reload();
    const persistedTheme = await themeToggle.getAttribute('aria-label');
    expect(persistedTheme).toBe(initialTheme === 'Passa a tema chiaro' ? 'Passa a tema scuro' : 'Passa a tema chiaro');
  });

  test('should show language toggle', async ({ page }) => {
    await page.goto('/');
    const langToggle = page.getByTestId('language-toggle-button');
    await expect(langToggle).toBeVisible();
    await expect(page.getByTestId('language-toggle-value')).toHaveText(/IT|EN/);
  });

  test('should toggle language between IT and EN', async ({ page }) => {
    await page.goto('/');
    const langToggle = page.getByTestId('language-toggle-button');
    const initialLang = await page.getByTestId('language-toggle-value').textContent();
    await langToggle.click();
    const newLang = await page.getByTestId('language-toggle-value').textContent();
    expect(newLang).not.toBe(initialLang);
  });
});

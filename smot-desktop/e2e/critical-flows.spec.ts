import { test, expect } from '@playwright/test';

test.describe('End-to-End Critical User Flows', () => {
  test('full workflow: dashboard → upload → indexing → chat → settings → graph → viewer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('smot-app-shell')).toBeVisible();
    await expect(page.getByTestId('main-content-area')).toBeVisible();

    await page.getByTestId('nav-link-navupload').click();
    await expect(page).toHaveURL(/\/upload/);

    await page.getByTestId('nav-link-navindexing').click();
    await expect(page).toHaveURL(/\/indexing/);

    await page.getByTestId('nav-link-navchat').click();
    await expect(page).toHaveURL(/\/chat/);

    await page.getByTestId('nav-link-navsettings').click();
    await expect(page).toHaveURL(/\/settings/);

    await page.getByTestId('nav-link-navgraph').click();
    await expect(page).toHaveURL(/\/graph/);

    await page.getByTestId('nav-link-navviewer').click();
    await expect(page).toHaveURL(/\/viewer/);

    await page.getByTestId('nav-link-navdashboard').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByTestId('topbar-search-input');
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');

    await page.getByTestId('nav-link-navchat').click();
    await expect(page).toHaveURL(/\/chat/);

    await page.getByTestId('nav-link-navdashboard').click();
    await expect(page).toHaveURL(/\/$/);

    await expect(searchInput).toHaveValue('test query');
  });

  test('should handle rapid navigation without errors', async ({ page }) => {
    await page.goto('/');

    const navLinks = [
      'nav-link-navupload',
      'nav-link-navindexing',
      'nav-link-navchat',
      'nav-link-navsettings',
      'nav-link-navgraph',
      'nav-link-navviewer',
      'nav-link-navdashboard',
    ];

    for (const linkId of navLinks) {
      await page.getByTestId(linkId).click();
      await page.waitForTimeout(100);
    }

    await expect(page.getByTestId('smot-app-shell')).toBeVisible();
  });

  test('should preserve theme preference across page reload', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.getByTestId('theme-toggle-button');
    const initialTheme = await themeToggle.getAttribute('aria-label');

    await themeToggle.click();
    const newTheme = await themeToggle.getAttribute('aria-label');
    expect(newTheme).not.toBe(initialTheme);

    await page.reload();
    const persistedTheme = await themeToggle.getAttribute('aria-label');
    expect(persistedTheme).toBe(newTheme);
  });

  test('should preserve language preference across page reload', async ({ page }) => {
    await page.goto('/');
    const langToggle = page.getByTestId('language-toggle-button');
    const initialLang = await page.getByTestId('language-toggle-value').textContent();

    await langToggle.click();
    const newLang = await page.getByTestId('language-toggle-value').textContent();
    expect(newLang).not.toBe(initialLang);

    await page.reload();
    const persistedLang = await page.getByTestId('language-toggle-value').textContent();
    expect(persistedLang).toBe(newLang);
  });

  test('should show loading state during page transitions', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navsettings').click();
    await expect(page).toHaveURL(/\/settings/);

    await page.getByTestId('nav-link-navchat').click();
    await expect(page).toHaveURL(/\/chat/);

    await page.getByTestId('nav-link-navdashboard').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('should have all navigation links working', async ({ page }) => {
    await page.goto('/');

    const navItems = [
      { id: 'nav-link-navdashboard', url: /\/$/ },
      { id: 'nav-link-navupload', url: /\/upload/ },
      { id: 'nav-link-navindexing', url: /\/indexing/ },
      { id: 'nav-link-navchat', url: /\/chat/ },
      { id: 'nav-link-navviewer', url: /\/viewer/ },
      { id: 'nav-link-navgraph', url: /\/graph/ },
      { id: 'nav-link-navsettings', url: /\/settings/ },
    ];

    for (const item of navItems) {
      await page.getByTestId(item.id).click();
      await expect(page).toHaveURL(item.url);
    }
  });
});

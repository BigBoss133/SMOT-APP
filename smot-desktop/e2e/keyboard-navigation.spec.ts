import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Keyboard Navigation and Accessibility', () => {
  test('should have skip link for keyboard users', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByTestId('skip-link');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main-content-area');
  });

  test('should navigate with Tab key', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
  });

  test('should focus search with Ctrl+K', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const searchInput = page.getByTestId('topbar-search-input');
    await expect(searchInput).toBeFocused();
  });

  test('should focus search with Cmd+K', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+k');
    const searchInput = page.getByTestId('topbar-search-input');
    await expect(searchInput).toBeFocused();
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.getByTestId('main-left-sidebar');
    await expect(sidebar).toHaveAttribute('aria-label', 'Navigazione principale');
  });

  test('should have ARIA labels on main content', async ({ page }) => {
    await page.goto('/');
    const mainContent = page.getByTestId('main-content-area');
    await expect(mainContent).toHaveAttribute('role', 'main');
    await expect(mainContent).toHaveAttribute('id', 'main-content-area');
  });

  test('should complete keyboard navigation flow', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Control+k');
    const searchInput = page.getByTestId('topbar-search-input');
    await expect(searchInput).toBeFocused();

    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');

    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeFocused();
  });
});

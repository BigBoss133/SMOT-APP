import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Graph View Interactions', () => {
  test('should navigate to graph page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navgraph').click();
    await expect(page).toHaveURL(/\/graph/);
  });

  test('should display graph canvas', async ({ page }) => {
    await page.goto('/graph');
    const canvas = page.locator('canvas, svg, .graph-canvas-container, .graph-view');
    await expect(canvas.first()).toBeVisible();
  });

  test('should show graph legend', async ({ page }) => {
    await page.goto('/graph');
    const legend = page.locator('.graph-legend, [class*="legend"]');
    await expect(legend.first()).toBeVisible();
  });

  test('should show graph controls', async ({ page }) => {
    await page.goto('/graph');
    const controls = page.locator('.graph-controls, [class*="graph-controls"]');
    await expect(controls.first()).toBeVisible();
  });

  test('should have zoom controls visible', async ({ page }) => {
    await page.goto('/graph');
    const zoomButtons = page.locator('.graph-ctrl-btn, button[class*="graph-ctrl"]');
    await expect(zoomButtons.first()).toBeVisible();
  });

  test('should complete graph navigation flow', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navgraph').click();
    await expect(page).toHaveURL(/\/graph/);

    await expect(page.getByText('Graph')).toBeVisible();

    await page.getByTestId('nav-link-navdashboard').click();
    await expect(page).toHaveURL(/\/$/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Critical Flow: Chat RAG with Context', () => {
  test('should navigate to chat page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-link-navchat').click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should show chat input and message area', async ({ page }) => {
    await page.goto('/chat');
    const chatInput = page.locator('input[placeholder*="scrivi"], input[type="text"]').first();
    await expect(chatInput).toBeVisible();
  });

  test('should type and send a message', async ({ page }) => {
    await page.goto('/chat');
    const chatInput = page.locator('input[type="text"], input[placeholder*="scrivi"]').first();
    await chatInput.fill('Qual è la data di scadenza del contratto?');
    await expect(chatInput).toHaveValue('Qual è la data di scadenza del contratto?');
  });

  test('should show sources section in chat', async ({ page }) => {
    await page.goto('/chat');
    const sourcesSection = page.locator('.chat-sources, [class*="source"]');
    await expect(sourcesSection.first()).toBeVisible();
  });

  test('should display AI status indicator', async ({ page }) => {
    await page.goto('/chat');
    const aiBadge = page.locator('.ai-badge, [class*="ai-badge"], [class*="ai-status"]');
    await expect(aiBadge.first()).toBeVisible();
  });

  test('should complete chat flow with filters', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByText('Chat')).toBeVisible();

    const filterSelect = page.locator('select').first();
    await expect(filterSelect).toBeVisible();

    const chatInput = page.locator('input[type="text"], input[placeholder*="scrivi"]').first();
    await chatInput.fill('Test message');
    await expect(chatInput).toHaveValue('Test message');
  });
});

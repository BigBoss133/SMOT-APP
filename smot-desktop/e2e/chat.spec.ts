import { test, expect } from "@playwright/test";

test.describe("Chat Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("chat page loads with all sections", async ({ page }) => {
    await expect(page.getByTestId("chat-page")).toBeVisible();
    await expect(page.getByTestId("chat-filters-sidebar")).toBeVisible();
    await expect(page.getByTestId("chat-main-panel")).toBeVisible();
    await expect(page.getByTestId("chat-sources-panel")).toBeVisible();
  });

  test("chat has filter options", async ({ page }) => {
    await expect(page.getByTestId("chat-filter-tutti")).toBeVisible();
    await expect(page.getByTestId("chat-filter-lavoro")).toBeVisible();
    await expect(page.getByTestId("chat-filter-studio")).toBeVisible();
    await expect(page.getByTestId("chat-filter-personale")).toBeVisible();
  });

  test("shows empty state initially", async ({ page }) => {
    await expect(page.getByTestId("chat-empty-state-message")).toBeVisible();
  });

  test("input field accepts text", async ({ page }) => {
    const input = page.getByTestId("chat-question-input");
    await input.fill("What is SMOT?");
    await expect(input).toHaveValue("What is SMOT?");
  });

  test("send button is enabled with text", async ({ page }) => {
    const input = page.getByTestId("chat-question-input");
    const sendBtn = page.getByTestId("chat-send-button");
    await expect(sendBtn).toBeDisabled();
    await input.fill("test question");
    await expect(sendBtn).toBeEnabled();
  });

  test("can send a question and receive response", async ({ page }) => {
    const input = page.getByTestId("chat-question-input");
    const sendBtn = page.getByTestId("chat-send-button");

    await input.fill("What documents do I have?");
    await sendBtn.click();

    await expect(page.getByTestId("chat-message-user-0")).toBeVisible();

    const sources = page.getByTestId("chat-sources-panel");
    await expect(sources).toBeVisible();
  });

  test("clear chat button works", async ({ page }) => {
    const input = page.getByTestId("chat-question-input");
    const sendBtn = page.getByTestId("chat-send-button");

    await input.fill("test question");
    await sendBtn.click();

    await page.waitForTimeout(1000);

    const clearBtn = page.getByTestId("chat-clear-button");
    await clearBtn.click();

    await expect(page.getByTestId("chat-empty-state-message")).toBeVisible();
  });

  test("filter click changes active state", async ({ page }) => {
    const lavoroFilter = page.getByTestId("chat-filter-lavoro");
    await lavoroFilter.click();
    await expect(lavoroFilter).toHaveClass(/active/);
  });
});

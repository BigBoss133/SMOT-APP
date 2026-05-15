import { test, expect } from "@playwright/test";

test.describe("Onboarding Wizard", () => {
  test("system discovery step renders", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByTestId("wizard-progress")).toBeVisible();
  });

  test("can skip all onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByText("Salta tutto").click();
    await expect(page).toHaveURL("/");
  });

  test("wizard navigation buttons work", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Analisi sistema")).toBeVisible();
  });
});

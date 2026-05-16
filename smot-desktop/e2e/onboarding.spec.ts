import { test, expect } from "@playwright/test";

test.describe("Onboarding Wizard", () => {
  test("system discovery step renders with wizard progress", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByTestId("wizard-progress")).toBeVisible();
    await expect(page.getByText("Analisi sistema")).toBeVisible();
  });

  test("skip all navigates to dashboard", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByText("Salta tutto").click();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("wizard has back and next navigation buttons", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Avanti")).toBeVisible();
    await expect(page.getByText("Salta tutto")).toBeVisible();
  });

  test("wizard progress shows correct step labels", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Scan sistema")).toBeVisible();
    await expect(page.getByText("Licenza")).toBeVisible();
    await expect(page.getByText("Modello AI")).toBeVisible();
    await expect(page.getByText("Documento")).toBeVisible();
    await expect(page.getByText("Fine")).toBeVisible();
  });

  test("onboarding page has fullscreen layout", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.locator('[data-testid="smot-app-shell"]')).toHaveCount(0);
  });
});

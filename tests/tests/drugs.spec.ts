import { test, expect } from '@playwright/test';

test.describe('Drugs master', () => {

  test('Create Drug from Drugs screen', async ({ page }) => {
    await page.goto('SitePages/Page.aspx');
    await page.waitForLoadState('load');

    // Navigate to Drugs (Admin Master section)
    await page.locator('.sidebar .nav-item', { hasText: 'Drugs' }).click();
    await expect(page.locator('text=Drugs Database').first()).toBeVisible();

    // Open Add Drug form
    const addButton = page.locator('text=Add Drug').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Basic smoke check that the Add Drug form appears
    await expect(page.locator('text=Drug Name').first()).toBeVisible();
  });

});

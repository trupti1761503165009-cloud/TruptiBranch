import { test, expect } from '@playwright/test';

test.describe('Documents workflow entry', () => {

  test('Navigate to All Documents and open Add Document', async ({ page }) => {
    await page.goto('SitePages/Page.aspx');
    await page.waitForLoadState('load');

    // Click All Documents in sidebar (Admin)
    await page.locator('.sidebar .nav-item', { hasText: 'All Documents' }).click();

    // Header and summary cards should be visible
    await expect(page.locator('text=Manage Documents').first()).toBeVisible();
    await expect(page.locator('text=Total Documents').first()).toBeVisible();

    // Add Document button
    const addButton = page.locator('text=Add Document').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Confirm wizard/form surface
    await expect(page.locator('text=Create Document').first()).toBeVisible();
  });

});

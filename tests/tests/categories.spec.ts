import { test, expect } from '@playwright/test';

test('Open Categories Page', async ({ page }) => {

    await page.goto('SitePages/Page.aspx');

    await page.waitForLoadState('load');

    // Click Manage Categories in sidebar
    await page.locator('.nav-item', { hasText: 'Manage Categories' }).click();

    // Check Header
    await expect(page.locator('text=Manage Categories').first()).toBeVisible();

    // Check Add Category Button
    const addButton = page.locator('text=Add Category').first();
    await expect(addButton).toBeVisible();

    // Click Add Category
    await addButton.click();

    // Check Modal Opens
    await expect(page.locator('text=Category Name')).toBeVisible();

});

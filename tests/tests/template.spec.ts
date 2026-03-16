import { test, expect } from '@playwright/test';

test('Open Template Page', async ({ page }) => {

    await page.goto('SitePages/Page.aspx');

    await page.waitForLoadState('load');

    // Click Manage Templates in sidebar
    await page.locator('.nav-item', { hasText: 'Manage Templates' }).click();

    // Check Add Template Button
    const addButton = page.locator('text=Add Template').first();
    await expect(addButton).toBeVisible();

    // Click Add Template
    await addButton.click();

    // Check Modal Opens
    await expect(page.locator('text=Template Name').first()).toBeVisible();

});
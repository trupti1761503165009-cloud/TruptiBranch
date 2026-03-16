import { test, expect } from '@playwright/test';

test('Open Create CTD Folder Page', async ({ page }) => {

    await page.goto('SitePages/Page.aspx');

    await page.waitForLoadState('load');

    // Click Create CTD Folder in sidebar
    await page.locator('.nav-item', { hasText: 'Create CTD Folder' }).click();

    // Check Header
    await expect(page.locator('text=Create CTD Folder').first()).toBeVisible();

    // Check for a specific element in the CTD folder creation UI
    await expect(page.locator('text=CTD Structure').first()).toBeVisible();

});

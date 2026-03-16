import { test, expect } from '@playwright/test';

test('Open Reports Page', async ({ page }) => {

    await page.goto('SitePages/Page.aspx');

    await page.waitForLoadState('load');

    // Click Reports in sidebar
    await page.locator('.nav-item', { hasText: 'Reports' }).click();

    // Check Header
    await expect(page.locator('text=Reports').first()).toBeVisible();

    // Check basic content
    await expect(page.locator('text=Total Documents').first()).toBeVisible();

});

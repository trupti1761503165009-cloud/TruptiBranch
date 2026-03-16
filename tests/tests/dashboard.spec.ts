import { test, expect } from '@playwright/test';

test('Open Dashboard Page', async ({ page }) => {

    await page.goto('SitePages/Page.aspx');

    await page.waitForLoadState('load');

    // Click Dashboard in sidebar
    await page.locator('.nav-item', { hasText: 'Dashboard' }).click();

    // Check Header
    await expect(page.locator('h1:has-text("Admin Dashboard"), .page-title:has-text("Admin Dashboard")').first()).toBeVisible();

    // Check Summary Cards
    await expect(page.locator('.summary-card__title:has-text("Total Categories")').first()).toBeVisible();

});

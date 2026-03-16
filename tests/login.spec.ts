import { test, expect } from '@playwright/test';

test.describe('Drug Management System - Login & Shell', () => {

  test('User can open DMS host page and see shell', async ({ page }) => {
    // NOTE: baseURL should be configured in Playwright config; this path is relative.
    await page.goto('SitePages/Page.aspx');

    // Wait for the web part shell to render
    await page.waitForLoadState('load');

    // Validate app chrome
    await expect(page.locator('.app .header-title')).toBeVisible();
    await expect(page.locator('.sidebar .nav-item', { hasText: 'Dashboard' }).first()).toBeVisible();
  });

});
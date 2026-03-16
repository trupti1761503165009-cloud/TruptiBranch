import { test, expect } from '@playwright/test';

test('Open Users & Permissions Page', async ({ page }) => {

    await page.goto('SitePages/Page.aspx');

    await page.waitForLoadState('load');

    // Click Users & Permissions in sidebar
    await page.locator('.nav-item', { hasText: 'Users & Permissions' }).click();

    // Check Header
    await expect(page.locator('text=User Permissions').first()).toBeVisible();

    // Check Add User Button
    const addButton = page.locator('text=Add User').first();
    await expect(addButton).toBeVisible();

    // Click Add User
    await addButton.click();

    // Check Modal Opens
    await expect(page.locator('text=User Email').first()).toBeVisible();

});

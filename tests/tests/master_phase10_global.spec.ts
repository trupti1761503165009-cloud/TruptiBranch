import { test, expect } from '@playwright/test';

test.describe('Phase 10: Global UI & Architecture Validation', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');
    });

    test('Architecture Check: Consistent Layout Patterns', async ({ page }) => {
        const modules = ['Templates', 'Categories', 'Drugs Database', 'Documents', 'Reports & Analytics'];

        for (const moduleName of modules) {
            console.log(`Checking Global UI Standards for: ${moduleName}`);
            const sidebarItem = page.locator('nav.sidebar .nav-label').filter({ hasText: moduleName }).first();
            await sidebarItem.click();
            await page.waitForTimeout(500); // Allow render

            // 1. Breadcrumb Presence
            await expect(page.locator('.breadcrumb-nav, .ms-Breadcrumb').first()).toBeVisible();

            // 2. Main Title (Fluent UI style)
            await expect(page.locator('.mainTitle, .page-title, h1, h2').filter({ hasText: moduleName }).first()).toBeVisible();

            // 3. Container Consistency (boxCard / table-card)
            // We check for our standard card containers
            await expect(page.locator('.boxCard, .table-card, .form-card, .ms-Grid').first()).toBeVisible();

            // 4. Action Button Placement
            // Most pages have a primary action button at the top right header area
            const actionBtn = page.locator('.page-header').getByRole('button');
            if (await actionBtn.count() > 0) {
                await expect(actionBtn.first()).toBeVisible();
            }
        }
    });

    test('Architecture Check: Fluent UI and Standard Components', async ({ page }) => {
        // Navigate to a page with a grid
        await page.locator('nav.sidebar .nav-label').filter({ hasText: 'Templates' }).first().click();

        // 1. Check for ms-DetailsList (standard grid)
        await expect(page.locator('.ms-DetailsList').first()).toBeVisible();

        // 2. Check for ms-Grid (standard layout)
        await expect(page.locator('.ms-Grid').first()).toBeVisible();

        // 3. Check for specific icons (FontAwesome / Fabric)
        await expect(page.locator('.ms-Icon, svg[data-icon]').first()).toBeVisible();
    });
});

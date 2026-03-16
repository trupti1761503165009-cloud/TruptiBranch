import { test, expect } from '@playwright/test';

test.describe('Phase 1: Login & Role Validation', () => {

    test('Admin Login & Dashboard Validation', async ({ page }) => {
        try {
            // Navigate to the main page
            await page.goto('SitePages/Page.aspx');
            await page.waitForLoadState('load');
            await page.screenshot({ path: 'test-results/debug_after_goto.png' });

            // 1. Verify Admin Dashboard loads
            console.log('Verifying Admin Dashboard header...');
            const dashboardHeader = page.locator('text=Admin Dashboard').first();
            await expect(dashboardHeader).toBeVisible({ timeout: 15000 });
            await page.screenshot({ path: 'test-results/debug_dashboard_header.png' });

            // 2. Verify summary tiles
            console.log('Checking summary tiles...');
            const tiles = [
                'Total Documents',
                'Templates',
                'Categories',
                'Users',
                'Review Pending',
                'Approved Documents'
            ];

            for (const tile of tiles) {
                console.log(`Checking tile: ${tile}`);
                await expect(page.getByText(tile, { exact: false }).first()).toBeVisible();
            }
            await page.screenshot({ path: 'test-results/debug_tiles_checked.png' });

            // 3. Validate presence of Admin specific sidebar items
            console.log('Checking sidebar items...');
            // Labels must match the new sidebar in DrugManagementSystem.tsx
            const adminSidebarItems = [
                'Dashboard',
                'Templates',
                'Categories',
                'Manage Users',
                'Roles & Permissions'
            ];

            for (const item of adminSidebarItems) {
                console.log(`Checking sidebar item: ${item}`);
                // Use the specific Sidebar structure found in DrugManagementSystem.tsx
                const sidebarItem = page.locator('nav.sidebar .nav-label').filter({ hasText: item }).first();
                await expect(sidebarItem).toBeVisible({ timeout: 10000 });
            }
            await page.screenshot({ path: 'test-results/debug_sidebar_checked.png' });

            // 4. Verify User Name in Header
            console.log('Checking user name in header...');
            // In Header from DrugManagementSystem.tsx, user-name is a specific class
            await expect(page.locator('.user-name').first()).toBeVisible();

            // Check for Role label if possible
            await expect(page.locator('.user-role').first()).toContainText('Admin');

            console.log('Phase 1 Admin validation passed!');
            await page.screenshot({ path: 'test-results/debug_phase1_passed.png' });

        } catch (error) {
            console.error('Test failed with error:', error);
            await page.screenshot({ path: 'test-results/debug_failure.png' });
            throw error;
        }
    });

    // Author and Approver tests are skipped for now until credentials are provided
    test.skip('Author Role Validation', async ({ page }) => {
        // Logic for Author login and UI validation
    });

    test.skip('Approver Role Validation', async ({ page }) => {
        // Logic for Approver login and UI validation
    });
});

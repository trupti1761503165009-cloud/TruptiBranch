import { test, expect } from '@playwright/test';

test.describe('Phase 7: Reports Module Testing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');

        // Navigate to Reports & Analytics
        const sidebarReports = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Reports & Analytics' }).first();
        await sidebarReports.click();
        await expect(page.locator('h1, h2', { hasText: 'Reports & Analytics' }).first()).toBeVisible();
    });

    test('Verify KPIs and Chart Rendering', async ({ page }) => {
        // 1. Verify Summary Cards
        console.log('Verifying KPI summary cards...');
        await expect(page.locator('.ms-DetailsList').count()).toBeFalsy(); // It's not a grid initially
        const cards = page.locator('.summary-card');
        await expect(cards).toHaveCount(6); // Total, Draft, Pending, Approved, Rejected, Rate

        const totalDocMatch = await page.locator('.summary-card').filter({ hasText: 'Total Documents' }).locator('.summary-card__count').innerText();
        console.log(`Reported Total Documents: ${totalDocMatch}`);

        // 2. Tab Navigation
        console.log('Testing Pivot tab navigation...');
        await page.getByRole('tab', { name: 'Trends' }).click();
        await expect(page.locator('.recharts-area-chart')).toBeVisible();

        await page.getByRole('tab', { name: 'Workflow' }).click();
        await expect(page.locator('text=Approval Success Rate')).toBeVisible();

        await page.getByRole('tab', { name: 'Overview' }).click();
        await expect(page.locator('.recharts-bar-chart')).toBeVisible();

        // 3. View Toggle (Chart vs Table)
        console.log('Testing View Toggle...');
        await page.getByRole('button', { name: 'Table View' }).click();
        await expect(page.locator('table.modern-table')).toBeVisible();
        await expect(page.locator('th', { hasText: 'CATEGORY' })).toBeVisible();

        await page.getByRole('button', { name: 'Chart View' }).click();
        await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
    });

    test('Export and Filter Interaction', async ({ page }) => {
        // 1. Change Filter and check if cards exist
        await page.locator('.ms-Grid-col', { hasText: 'Category' }).locator('.react-select__control').first().click();
        await page.locator('.react-select__menu').locator('.react-select__option').nth(1).click();

        // 2. Export Button Presence
        await expect(page.getByRole('button', { name: 'Export Excel' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();

        // 3. Trigger Export
        console.log('Testing export button trigger...');
        await page.getByRole('button', { name: 'Export Excel' }).click();
        // The component shows a toast "Exporting to EXCEL..."
        await expect(page.locator('text=Exporting to EXCEL')).toBeVisible();
    });
});

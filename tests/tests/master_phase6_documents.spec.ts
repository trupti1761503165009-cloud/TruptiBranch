import { test, expect } from '@playwright/test';

test.describe('Phase 6: Document Creation & Workflow Testing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');

        // Navigate to Documents
        const sidebarDocs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first();
        await sidebarDocs.click();
        await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();
    });

    test('Bulk Create Documents - Full CRUD Workflow', async ({ page }) => {
        for (let i = 1; i <= 3; i++) {
            // 1. Click Create Document
            console.log(`Phase 6: Creating Document #${i}...`);
            await page.getByRole('button', { name: 'Create Document' }).first().click();
            await expect(page.locator('.form-card__title', { hasText: 'Create Document' })).toBeVisible();

            // 2. Cascading Selection Robust Helper
            const selectOption = async (label: string, isCascading: boolean = false) => {
                console.log(`Selecting ${label}...`);
                const container = page.locator('.form-field', { hasText: label }).filter({
                    has: page.locator('.react-select__control')
                }).first();

                if (isCascading) {
                    // Wait for hint to disappear if it's cascading
                    await expect(container.locator('.cascading-dropdown-hint')).not.toBeVisible({ timeout: 10000 });
                }

                await container.locator('.react-select__control').click();
                const menu = page.locator('.react-select__menu');
                await expect(menu).toBeVisible();

                // For Documents, labels often have -- Select ... -- as first option, so we pick nth(1)
                await menu.locator('.react-select__option').nth(1).click();
                await expect(menu).not.toBeVisible();
            };

            await selectOption('Drug');
            await selectOption('Country', true);
            await selectOption('Template', true);
            await selectOption('Approver');

            await page.getByPlaceholder('Add comment...').fill(`Automated bulk entry ${i}`);

            // 3. Submit
            await page.getByRole('button', { name: 'Create Document' }).click();

            // The success might be a message dialog or a redirect
            await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible({ timeout: 30000 });
            console.log(`Phase 6: Document #${i} created.`);
        }

        // 4. Verify Grid and View in My Documents (sidebar nav)
        console.log('Verifying in My Documents view...');
        const myDocsNav = page.locator('nav.sidebar .nav-item', { hasText: 'My Documents' }).first();
        await myDocsNav.click();
        await expect(page.locator('h1, h2', { hasText: 'My Documents' }).first()).toBeVisible();

        const rows = page.locator('.ms-DetailsRow');
        const docsCount = await rows.count();
        expect(docsCount).toBeGreaterThanOrEqual(1);

        const iterations = Math.min(docsCount, 3);

        for (let i = 0; i < iterations; i++) {
            const firstRow = page.locator('.ms-DetailsRow').first();
            await expect(firstRow).toBeVisible();

            // View
            console.log(`Testing Document View panel for row ${i}...`);
            await firstRow.locator('.btnView').first().click();
            await expect(page.locator('text=Document Details')).toBeVisible();
            await page.getByRole('button', { name: 'Close' }).last().click();

            // Edit
            console.log(`Testing Document Edit for row ${i}...`);
            await firstRow.locator('.btnGreen, .fa-pen-to-square').first().click();
            await expect(page.locator('text=Edit Document')).toBeVisible();
            await page.getByRole('button', { name: 'Save Changes' }).click();
            await expect(page.locator('text=updated successfully')).toBeVisible();

            await page.waitForTimeout(1000); // Wait for grid to refresh
        }
    });

    test('Document Navigation and Filters', async ({ page }) => {
        // 1. Navigate via sidebar between All Documents, Pending Approval, and My Documents
        console.log('Navigating to All Documents...');
        const allDocsNav = page.locator('nav.sidebar .nav-item', { hasText: 'All Documents' }).first();
        await allDocsNav.click();
        await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();

        console.log('Navigating to Pending Approval...');
        const pendingNav = page.locator('nav.sidebar .nav-item', { hasText: 'Pending Approval' }).first();
        await pendingNav.click();
        await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();

        console.log('Navigating to My Documents...');
        const myDocsNav = page.locator('nav.sidebar .nav-item', { hasText: 'My Documents' }).first();
        await myDocsNav.click();
        await expect(page.locator('h1, h2', { hasText: 'My Documents' }).first()).toBeVisible();

        // 2. Global Search (on Drug Folders) in All Documents
        await allDocsNav.click();
        await page.getByPlaceholder('Search by drug name...').fill('Paracetamol');
        await page.waitForTimeout(500); // Debounce

        const drugRows = page.locator('.folder-row-clickable');
        if (await drugRows.count() > 0) {
            await expect(drugRows.first()).toBeVisible();
        }
    });
});

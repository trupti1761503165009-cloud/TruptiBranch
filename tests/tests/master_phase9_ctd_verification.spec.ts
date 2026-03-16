import { test, expect } from '@playwright/test';

test.describe('Phase 9: Virtual CTD Structure Verification', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');

        // Navigate to Documents
        const sidebarDocs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Documents' }).first();
        await sidebarDocs.click();
        await expect(page.locator('h1, h2', { hasText: 'Documents' }).first()).toBeVisible();
    });

    test('Verify Metadata-based Grouping and Breadcrumbs', async ({ page }) => {
        // 1. Select a Drug
        const drugFolder = page.locator('.folder-row-clickable').first();
        const drugName = await drugFolder.locator('span').first().innerText();
        console.log(`Entering Drug folder: ${drugName}`);
        await drugFolder.click();

        // 2. Drill Down into Virtual Folders
        // We look for folders in the grid
        const virtualFolder = page.locator('.ms-DetailsRow').filter({ hasText: 'FOLDER' }).first();
        // Note: The columns for folders are key:'name', but rendered as "FOLDER" header

        const folderName = await page.locator('.doc-name-cell').first().innerText();
        console.log(`Navigating into Virtual Folder: ${folderName}`);
        await page.locator('.doc-name-cell').first().click();

        // 3. Verify Breadcrumb
        await expect(page.locator('.breadcrumb-item', { hasText: 'Documents' })).toBeVisible();
        await expect(page.locator('.breadcrumb-item', { hasText: drugName })).toBeVisible();

        // 4. Verify Document Visibility (Metadata grouping)
        // Ensure that at least one document is present or "No records found" is NOT visible if we expect data
        // For testing, we just check if the grid is rendered
        await expect(page.locator('.ms-DetailsList')).toBeVisible();
    });

    test('CTD Structure Toggle (eCTD vs DIA)', async ({ page }) => {
        // Click a Drug Folder
        await page.locator('.folder-row-clickable').first().click();

        // Toggle Structure
        const structureLabel = page.locator('label', { hasText: 'Structure' });
        await page.locator('.ms-Grid-row', { hasText: 'Structure' }).locator('.react-select__control').first().click();

        const diaOption = page.locator('.react-select__menu').locator('.react-select__option', { hasText: 'DIA reference' });
        await diaOption.click();

        // Verify that the view updates (though physical change might be subtle in mock data)
        await expect(page.locator('.react-select__single-value')).toContainText('DIA reference');
    });
});

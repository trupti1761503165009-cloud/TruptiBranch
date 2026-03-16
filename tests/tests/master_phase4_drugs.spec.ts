import { test, expect } from '@playwright/test';

test.describe('Phase 4: Drug Module Testing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');

        // Navigate to Drugs Database
        const sidebarDrugs = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Drugs Database' }).first();
        await sidebarDrugs.click();
        await expect(page.locator('h1, h2', { hasText: 'Drugs Database' }).first()).toBeVisible();
    });

    test('Bulk Add Drugs - Full CRUD', async ({ page }) => {
        const selectOption = async (label: string, optionText?: string) => {
            console.log(`Selecting option for label: ${label}...`);
            const field = page.locator('.form-field', { hasText: label }).first();
            await expect(field).toBeVisible({ timeout: 10000 });

            await field.locator('.react-select__control').first().click();
            const menu = page.locator('.react-select__menu');
            await expect(menu).toBeVisible({ timeout: 10000 });

            const options = menu.locator('.react-select__option');
            if (optionText) {
                await options.filter({ hasText: optionText }).first().click();
            } else {
                const firstOptionText = await options.first().innerText();
                if (firstOptionText.startsWith('--') && (await options.count()) > 1) {
                    await options.nth(1).click();
                } else {
                    await options.first().click();
                }
            }
            await expect(menu).not.toBeVisible();
        };

        for (let i = 1; i <= 3; i++) {
            const timestamp = Date.now();
            const drugName = `Bulk Drug ${i} - ${timestamp}`;
            const drugCat = `Test Category`;
            const drugDesc = `Bulk drug entry ${i} description`;

            // 1. Click Add Drug
            console.log(`Phase 4: Adding Drug #${i}...`);
            await page.getByRole('button', { name: 'Add Drug' }).first().click();
            await expect(page.locator('h1, h2, .form-card__title', { hasText: 'Add New Drug' }).first()).toBeVisible();

            // 2. Validation Check: Try to save empty
            if (i === 1) {
                console.log('Testing empty form validation...');
                await page.getByRole('button', { name: 'Add Drug' }).last().click();
                await expect(page.locator('text=Please complete all required fields')).toBeVisible();
                await page.getByRole('button', { name: 'OK' }).click(); // Close validation dialog
            }

            // 3. Fill Form
            await page.getByLabel('Drug Name').fill(drugName);
            await page.getByLabel('Category').fill(drugCat);

            // Robust Dropdown Selection
            console.log('Selecting Status: Active...');
            await selectOption('Status', 'Active');

            await page.getByLabel('Description').fill(drugDesc);

            // 4. Save
            await page.getByRole('button', { name: 'Add Drug' }).last().click();

            // 5. Verify Success
            await expect(page.locator('text=has been added successfully')).toBeVisible();
            const okBtn = page.getByRole('button', { name: 'OK' });
            await expect(okBtn).toBeVisible();
            await okBtn.click();
            await page.waitForTimeout(1000); // Allow modal overlay to fade out
            console.log(`Phase 4: Drug #${i} created.`);
        }

        // Final Verify Grid
        const count = await page.locator('.ms-DetailsRow').count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('View/Preview Drug Details', async ({ page }) => {
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        const iterations = Math.min(count, 3);

        for (let i = 0; i < iterations; i++) {
            const row = rows.nth(i);
            await expect(row).toBeVisible();

            // Click View/Eye icon
            console.log(`Testing Drug View panel for row ${i}...`);
            await row.locator('.btnView').first().click();
            await expect(page.locator('h1, h2, div', { hasText: 'Drug Details' }).first()).toBeVisible();

            const closeBtn = page.getByRole('button', { name: 'Close' });
            // Wait a moment for animation if any
            if (await closeBtn.last().isVisible()) {
                await closeBtn.last().click();
            } else {
                await page.getByText('Back').first().click();
            }
        }
    });

    test('Edit and Delete Drug', async ({ page }) => {
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        const iterations = Math.min(count, 3);

        for (let i = 0; i < iterations; i++) {
            const targetRow = page.locator('.ms-DetailsRow').first();
            await expect(targetRow).toBeVisible();

            // 1. Edit
            console.log(`Testing Drug Edit for item ${i}...`);
            await targetRow.locator('.btncal').first().click(); // Edit button
            await expect(page.locator('h1, h2, div', { hasText: 'Edit Drug' }).first()).toBeVisible();
            await page.getByLabel('Drug Name').fill(`Edited Drug ${Date.now()}`);
            await page.getByRole('button', { name: 'Update Drug' }).click();
            await expect(page.locator('text=has been updated successfully')).toBeVisible();

            const okBtn = page.getByRole('button', { name: 'OK' });
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            // 2. Delete
            console.log(`Testing Drug Delete for item ${i}...`);
            await targetRow.locator('.deleticon').first().click();
            await expect(page.locator('text=Are you sure you want to delete this drug?')).toBeVisible({ timeout: 5000 });
            await page.getByRole('button', { name: 'Delete' }).click();
            await expect(page.locator('text=deleted successfully')).toBeVisible();
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            await page.waitForTimeout(1000); // Wait for grid to refresh
        }
    });

    test('Global Search and Filter Validation', async ({ page }) => {
        // 1. Search for a known drug or part of a name
        await page.getByPlaceholder('Search', { exact: true }).first().fill('Drug');
        await page.waitForTimeout(1000); // Wait for debounce

        const rowCount = await page.locator('.ms-DetailsRow').count();
        console.log(`Found ${rowCount} drugs after searching for "Drug"`);

        // 2. Filter by status
        await page.locator('.react-dropdown-container').filter({ hasText: 'All Status' }).locator('.react-select__control').first().click();
        await page.locator('.react-select__menu').locator('text=Active').last().click();

        // Verify all rows show "Active"
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        for (let i = 0; i < Math.min(count, 3); i++) {
            await expect(rows.nth(i)).toContainText('Active');
        }
    });
});

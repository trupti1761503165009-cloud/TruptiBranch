import { test, expect } from '@playwright/test';

test.describe('Phase 5: CTD Folder Module Testing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');

        const sidebarCTD = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Create CTD Folder' }).first();
        await sidebarCTD.click();
        await expect(page.locator('h1, h2', { hasText: 'Create CTD Folder' }).first()).toBeVisible();
    });

    test('Bulk Add Root Folders and CRUD', async ({ page }) => {
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
            const rootCode = `B${i}${timestamp}`;
            const rootName = `Bulk Root ${i}`;

            console.log(`Phase 5: Adding Root Folder #${i}...`);
            await page.getByRole('button', { name: /Create Root Module|Create Folder/ }).first().click();
            await expect(page.locator('h1, h2, .form-section-header', { hasText: /Create Root Module|Folder Information/ }).first()).toBeVisible();

            // 1. Validation Check: Try to save empty
            if (i === 1) {
                console.log('Testing empty form validation...');
                await page.getByRole('button', { name: 'Create Folder' }).last().click();
                // Check if MessageDialog or inline error appears
                const errorMsg = page.locator('text=Folder code is required');
                await expect(errorMsg).toBeVisible();
                const okBtn = page.getByRole('button', { name: 'OK' });
                if (await okBtn.isVisible()) await okBtn.click();
            }

            // 2. Add Root Folder
            await page.getByLabel('Folder Code').fill(rootCode);
            await page.getByLabel('Folder Name').fill(rootName);
            await page.getByRole('button', { name: 'Create Folder' }).last().click();
            await expect(page.locator('text=Folder created successfully')).toBeVisible();

            const okBtn = page.getByRole('button', { name: 'OK' });
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            // 3. Add a Subfolder for the first one to test dropdown and hierarchy
            if (i === 1) {
                console.log('Adding a Subfolder for the first root...');
                // Find the first row's Add Subfolder button (.btnGreen)
                await page.locator('.ms-DetailsRow').first().locator('.btnGreen').click();
                await expect(page.locator('h1, h2', { hasText: 'Create Subfolder' }).first()).toBeVisible();

                // Verify Parent Folder dropdown is set (robust check)
                const parentField = page.locator('.form-field', { hasText: 'Parent Folder' });
                await expect(parentField).toContainText(rootCode);

                await page.getByLabel('Folder Code').fill(`${rootCode}.1`);
                await page.getByLabel('Folder Name').fill(`Subfolder 1`);
                await page.getByRole('button', { name: 'Create Folder' }).last().click();
                await expect(page.locator('text=Folder created successfully')).toBeVisible();
                await expect(okBtn).toBeVisible();
                await okBtn.click();

                // Go back up to root if needed (breadcrumb)
                await page.locator('.breadcrumb-item', { hasText: 'CTD/eCTD Folders' }).click();
            }
        }

        // Verify Grid
        const count = await page.locator('.ms-DetailsRow').count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('View Virtual Folder Details', async ({ page }) => {
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        const iterations = Math.min(count, 3);

        for (let i = 0; i < iterations; i++) {
            const row = rows.nth(i);
            await expect(row).toBeVisible();

            // Click View (Eye icon)
            console.log(`Testing CTD View panel for row ${i}...`);
            await row.locator('.btnView').first().click();
            await expect(page.locator('h1, h2, div', { hasText: 'Folder Details' }).first()).toBeVisible();

            const closeBtn = page.getByRole('button', { name: 'Close' });
            if (await closeBtn.last().isVisible()) {
                await closeBtn.last().click();
            } else {
                await page.getByText('Back').first().click();
            }
        }
    });

    test('Edit and Delete Virtual Folder', async ({ page }) => {
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        const iterations = Math.min(count, 3);

        for (let i = 0; i < iterations; i++) {
            const targetRow = page.locator('.ms-DetailsRow').first();
            await expect(targetRow).toBeVisible();

            // 1. Edit
            console.log(`Testing CTD Edit for item ${i}...`);
            await targetRow.locator('.btncal').first().click(); // Edit button
            await expect(page.locator('h1, h2', { hasText: 'Edit Folder' }).first()).toBeVisible();

            await page.getByLabel('Folder Name').fill(`Updated Folder Name ${Date.now()}`);
            await page.getByRole('button', { name: 'Update Folder' }).click();
            await expect(page.locator('text=Folder updated successfully')).toBeVisible();

            const okBtn = page.getByRole('button', { name: 'OK' });
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            // 2. Delete
            console.log(`Testing delete flow for item ${i}...`);
            await targetRow.locator('.deleticon').first().click();
            await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();
            await page.getByRole('button', { name: 'Delete' }).click();
            await expect(page.locator('text=Folder deleted successfully')).toBeVisible();
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            await page.waitForTimeout(1000); // Wait for grid to refresh
        }
    });
});

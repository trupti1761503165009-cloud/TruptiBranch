import { test, expect } from '@playwright/test';

test.describe('Phase 3: Category Module Testing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');

        // Navigate to Manage Categories
        const sidebarCategories = page.locator('nav.sidebar .nav-label').filter({ hasText: 'Manage Categories' }).first();
        await sidebarCategories.click();
        await expect(page.locator('h1, h2', { hasText: 'Manage Categories' }).first()).toBeVisible();
    });

    test('Bulk Add Category Items - Full Hierarchy', async ({ page }) => {
        const selectOption = async (label: string, optionText?: string) => {
            console.log(`Selecting option for label: ${label}...`);
            const field = page.locator('.form-field', { hasText: label }).first();
            await expect(field).toBeVisible({ timeout: 10000 });

            await field.locator('.react-select__control').first().click();
            const menu = page.locator('.react-select__menu');
            await expect(menu).toBeVisible({ timeout: 10000 });

            const options = menu.locator('.react-select__option');
            const count = await options.count();
            console.log(`Dropdown for ${label} has ${count} options.`);

            if (optionText) {
                const target = options.filter({ hasText: optionText }).first();
                if (await target.count() > 0) {
                    await target.click();
                } else {
                    console.warn(`Option "${optionText}" not found for ${label}. Available: ${await options.allInnerTexts()}`);
                    // Fallback to first non-placeholder if possible
                    if (count > 1) await options.nth(1).click();
                    else await options.first().click();
                }
            } else {
                if (count > 1) {
                    const firstOptionText = await options.first().innerText();
                    if (firstOptionText.includes('Select') || firstOptionText.startsWith('--')) {
                        await options.nth(1).click();
                    } else {
                        await options.first().click();
                    }
                } else if (count === 1) {
                    await options.first().click();
                } else {
                    throw new Error(`Dropdown for ${label} is empty!`);
                }
            }
            await expect(menu).not.toBeVisible();
        };

        for (let i = 1; i <= 3; i++) {
            const timestamp = Date.now();
            const itemName = `Bulk Cat ${i} - ${timestamp}`;

            // 1. Click Add Category
            console.log(`Phase 3: Adding Category Item #${i}...`);
            await page.getByRole('button', { name: 'Add Category' }).first().click();
            await expect(page.locator('h1, h2, .form-card__title', { hasText: 'Add New Category' }).first()).toBeVisible({ timeout: 15000 });

            // 2. Validation Check: Try to save empty
            if (i === 1) {
                console.log('Testing empty form validation...');
                await page.getByRole('button', { name: 'Add Category' }).last().click();
                // Fluent UI error message class
                await expect(page.locator('.ms-TextField-errorMessage').first()).toBeVisible({ timeout: 10000 });
                console.log('Validation message confirmed.');
            }

            // 3. Add Item
            console.log(`Filling category name: ${itemName}`);
            await page.getByPlaceholder('Enter category name').fill(itemName);

            console.log('Selecting cascading dropdowns...');
            await selectOption('Document Category');
            await selectOption('Status', 'Active');

            // 4. Save
            console.log('Clicking Add Category button (Save)...');
            await page.getByRole('button', { name: 'Add Category' }).last().click();

            // 5. Verify Success
            console.log('Waiting for success message...');
            await expect(page.locator('text=Category created successfully')).toBeVisible({ timeout: 20000 });

            // Close dialog
            const okBtn = page.getByRole('button', { name: 'OK' });
            await expect(okBtn).toBeVisible();
            await okBtn.click();
        }

        // Verify Grid has items
        const count = await page.locator('.ms-DetailsRow').count();
        expect(count).toBeGreaterThanOrEqual(3);
    });

    test('View Category Details', async ({ page }) => {
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        const iterations = Math.min(count, 3);

        for (let i = 0; i < iterations; i++) {
            const row = rows.nth(i);
            await expect(row).toBeVisible();

            // Click View (Eye icon)
            console.log(`Testing Category View for row ${i}...`);
            await row.locator('.btnView').first().click();
            await expect(page.locator('h1, h2, div', { hasText: 'Category Details' }).first()).toBeVisible();

            const closeBtn = page.getByRole('button', { name: 'Close' }).last();
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
            } else {
                const backBtn = page.getByText('Back').first();
                if (await backBtn.isVisible()) await backBtn.click();
                else await page.goBack();
            }
        }
    });

    test('Cascading Dropdown Validation', async ({ page }) => {
        await page.getByRole('button', { name: 'Add Category' }).first().click();

        // Select Group
        const groupField = page.locator('.form-field', { hasText: 'Group' });
        await groupField.locator('.react-select__control').first().click();
        const groupOptions = page.locator('.react-select__menu').locator('.react-select__option');
        if (await groupOptions.count() > 1) {
            await groupOptions.nth(1).click(); // Skip placeholder
        } else {
            await groupOptions.first().click();
        }

        // Now SubGroup should have options
        const subGroupField = page.locator('.form-field', { hasText: 'SubGroup' });
        await subGroupField.locator('.react-select__control').first().click();
        await expect(page.locator('.react-select__menu').locator('.react-select__option').first()).toBeVisible();
    });

    test('Edit and Delete Category', async ({ page }) => {
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        const iterations = Math.min(count, 3);

        for (let i = 0; i < iterations; i++) {
            const targetRow = page.locator('.ms-DetailsRow').first();
            await expect(targetRow).toBeVisible();

            // 1. Edit
            console.log(`Testing category edit for item ${i}...`);
            await targetRow.locator('.btncal').first().click();
            await expect(page.locator('h1, h2, div', { hasText: 'Edit Category' }).first()).toBeVisible();

            await page.getByPlaceholder('Enter category description').fill('Updated via test ' + Date.now());
            await page.getByRole('button', { name: 'Save Changes' }).click();
            await expect(page.locator('text=Category updated successfully')).toBeVisible({ timeout: 15000 });

            const okBtn = page.getByRole('button', { name: 'OK' });
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            // 2. Delete
            console.log(`Testing category delete for item ${i}...`);
            await targetRow.locator('.deleticon').first().click();
            await expect(page.locator('h1, h2, div', { hasText: 'Confirm Delete' }).first()).toBeVisible();
            await page.getByRole('button', { name: 'Delete' }).click();
            await expect(page.locator('text=Category deleted successfully')).toBeVisible();
            await expect(okBtn).toBeVisible();
            await okBtn.click();

            await page.waitForTimeout(1000); // Wait for grid to refresh
        }
    });
});

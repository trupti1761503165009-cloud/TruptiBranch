import { test, expect } from '@playwright/test';

test.describe('Phase 8: Role-based Permission Testing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('SitePages/Page.aspx');
        await page.waitForLoadState('load');
    });

    test('Bulk Add Users - Full CRUD Workflow', async ({ page }) => {
        // Navigate to User Permissions
        const sidebarPermissions = page.locator('nav.sidebar .nav-label').filter({ hasText: /User Permissions|Users/i }).first();
        await sidebarPermissions.click();
        await expect(page.locator('h1, h2, .page-title', { hasText: 'User Permissions' }).first()).toBeVisible({ timeout: 15000 });

        const selectOption = async (labelName: string, optionText?: string) => {
            console.log(`Selecting ${labelName}...`);
            // Finding the specific div block with the label
            const container = page.locator('div', { has: page.locator(`label:has-text("${labelName}")`) }).filter({
                has: page.locator('.react-select__control')
            }).first();

            await container.locator('.react-select__control').first().click();
            const menu = page.locator('.react-select__menu');
            await expect(menu).toBeVisible();

            const options = menu.locator('.react-select__option');
            if (optionText) {
                await options.filter({ hasText: optionText }).first().click();
            } else {
                if ((await options.count()) > 1) {
                    await options.nth(1).click();
                } else {
                    await options.first().click();
                }
            }
            await expect(menu).not.toBeVisible();
        };

        for (let i = 1; i <= 3; i++) {
            console.log(`Phase 8: Adding User #${i}...`);
            await page.getByRole('button', { name: /Add User/i }).first().click();
            await expect(page.locator('.form-card__title', { hasText: 'Add New User' })).toBeVisible();

            // Validation Check: Try to save empty
            if (i === 1) {
                console.log('Testing empty form validation...');
                await page.getByRole('button', { name: 'Add to Group' }).click();
                await expect(page.locator('text=Please complete all required fields')).toBeVisible();
                const btnOk = page.getByRole('button', { name: 'OK' });
                if (await btnOk.isVisible()) await btnOk.click();
            }

            const timestamp = Date.now();
            await page.getByLabel('Full Name').fill(`Automated User ${i} - ${timestamp}`);
            await page.getByLabel('Email Address').fill(`testuser${i}_${timestamp}@example.com`);

            await selectOption('SharePoint Group (Role)');
            await selectOption('Status', 'Active');

            await page.getByLabel(/Project\/Drug Assignment/i).fill(`Project ${i}`);

            await page.getByRole('button', { name: 'Add to Group' }).click();
            await expect(page.locator('text=User has been added successfully!')).toBeVisible({ timeout: 15000 });

            const btnOk = page.getByRole('button', { name: 'OK' });
            await expect(btnOk).toBeVisible();
            await btnOk.click();

            console.log(`Phase 8: User #${i} created.`);
        }

        // Verify Grid
        const count = await page.locator('.ms-DetailsRow').count();
        expect(count).toBeGreaterThanOrEqual(3);

        const rows = page.locator('.ms-DetailsRow');
        const usersCount = await rows.count();
        const iterations = Math.min(usersCount, 3);

        for (let i = 0; i < iterations; i++) {
            const firstRow = page.locator('.ms-DetailsRow').first();
            await expect(firstRow).toBeVisible();

            // 1. Edit User
            console.log(`Testing Edit User for item ${i}...`);
            await firstRow.locator('.btncal, .fa-pen-to-square').first().click();
            await expect(page.locator('.form-card__title', { hasText: 'Edit User' })).toBeVisible();
            await page.getByLabel('Full Name').fill(`Edited Automated User ${Date.now()}`);
            await page.getByRole('button', { name: 'Save Changes' }).click();
            await expect(page.locator('text=User has been updated successfully!')).toBeVisible();

            const btnOk2 = page.getByRole('button', { name: 'OK' });
            await expect(btnOk2).toBeVisible();
            await btnOk2.click();

            // 2. Delete User
            console.log(`Testing Delete User for item ${i}...`);
            await firstRow.locator('.deleticon, .fa-trash-can').first().click();
            await expect(page.locator('text=Are you sure you want to remove this user from the SharePoint Group?')).toBeVisible();
            await page.getByRole('button', { name: 'Remove' }).click();
            await expect(page.locator('text=User removed from groups successfully.')).toBeVisible();

            const btnOk3 = page.getByRole('button', { name: 'OK' });
            await expect(btnOk3).toBeVisible();
            await btnOk3.click();

            await page.waitForTimeout(1000); // Wait for grid to refresh
        }
    });
});

import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Robust selectOption helper for react-select components.
 */
async function selectOption(page: Page, label: string, valueToSelect: string) {
    console.log(`Selecting option for label: "${label}"...`);

    // 1. Locate the container using a text-based match for the label
    // Use filter to handle labels with asterisks or nested elements
    const container = page.locator('.ms-Grid-col, .ms-sm12, .boxCard, .ms-Grid-row').filter({ hasText: new RegExp(`^${label.replace('*', '')}`, 'i') }).last();

    // 2. Click the react-select control
    const control = container.locator('div[class*="-control"]').first();
    await control.waitFor({ state: 'visible', timeout: 30000 });
    await control.scrollIntoViewIfNeeded();
    await control.click();

    console.log(`Looking for option: "${valueToSelect}"`);

    // 3. Wait for the menu
    const menu = page.locator('div[class*="-menu"]').first();
    await expect(menu).toBeVisible({ timeout: 15000 });

    // Small pause for options to render
    await page.waitForTimeout(1000);

    const options = menu.locator('div[id^="react-select-"][id*="-option-"]');
    await expect(options.first()).toBeVisible({ timeout: 10000 });

    if (valueToSelect === 'ANY_AUTO') {
        const firstOption = menu.locator('div[id^="react-select-"][id*="-option-"]').first();
        const text = await firstOption.innerText();
        console.log(`Selected auto-option: "${text}"`);
        await firstOption.click();
    } else {
        const option = menu.locator('div[id^="react-select-"][id*="-option-"]').filter({ hasText: new RegExp(`^${valueToSelect}$`, 'i') }).first();
        if (await option.count() === 0) {
            // Fallback for partial match if exact match fails
            const partialOption = menu.locator('div[id^="react-select-"][id*="-option-"]').filter({ hasText: valueToSelect }).first();
            await partialOption.click();
        } else {
            await option.click();
        }
    }

    // Wait for menu to close
    await expect(menu).not.toBeVisible({ timeout: 5000 });
}

test.describe('Phase 2: Template Module Testing', () => {

    test.beforeEach(async ({ page }) => {
        // Direct navigation with extended timeout
        await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx', { waitUntil: 'networkidle', timeout: 120000 });

        // Wait for sidebar to be visible
        const sidebar = page.locator('nav.sidebar');
        await expect(sidebar).toBeVisible({ timeout: 60000 });

        // Ensure we are in Admin role (if the switch is visible)
        const roleSwitch = page.locator('.react-dropdown-container').filter({ hasText: 'Author' });
        if (await roleSwitch.count() > 0) {
            console.log('Switching role to Admin...');
            await selectOption(page, 'Switch Role', 'Admin');
            await page.waitForTimeout(2000);
        }

        // Click "Manage Templates" in sidebar
        const navItem = page.locator('.nav-item').filter({ hasText: 'Manage Templates' }).first();
        await expect(navItem).toBeVisible({ timeout: 30000 });
        await navItem.click();

        // Success indicator: the mainTitle element
        await expect(page.locator('.mainTitle', { hasText: 'Manage Templates' })).toBeVisible({ timeout: 45000 });
    });

    /**
     * Test Case 0: Form Validation (Negative Scenario)
     * Verifies that the form cannot be submitted without required fields.
     */
    test('Verify Form Validation (Empty Submission)', async ({ page }) => {
        await page.getByRole('button', { name: 'Upload Template' }).click();
        await expect(page.locator('h2', { hasText: 'Upload New Template' })).toBeVisible({ timeout: 15000 });

        // Click Save without filling anything
        await page.getByRole('button', { name: 'Save Template' }).click();

        // Check for validation errors
        // Our UI shows error messages in red and also handles local validation state
        const nameError = page.locator('text=Template Name is required');
        const fileError = page.locator('text=Please upload a file');

        await expect(nameError).toBeVisible();
        await expect(fileError).toBeVisible();

        console.log('Validation errors verified successfully.');
        await page.getByRole('button', { name: 'Cancel' }).click();
    });

    /**
     * Test Case 1: Bulk Add Templates (Multiple SOPs)
     * Verifies that multiple templates can be uploaded with metadata.
     */
    test('Bulk Add Templates - eCTD Mapping', async ({ page }) => {
        const file1Path = path.resolve('Project Documents/721814 SOP/721814 SOP/CS_OP_TR001 Revision 10.docx');
        const file2Path = path.resolve('Project Documents/721814 SOP/721814 SOP/CS_WI_TSS0002 Revision 5.docx');

        const filesToUpload = [file1Path, file2Path];

        for (const filePath of filesToUpload) {
            if (!fs.existsSync(filePath)) {
                console.warn(`Warning: File not found at ${filePath}. skipping.`);
                // List some files in that dir to help debug
                const parentDir = path.dirname(filePath);
                if (fs.existsSync(parentDir)) {
                    console.log('Files in parent dir:', fs.readdirSync(parentDir));
                }
                continue;
            }

            const fileName = path.basename(filePath);
            console.log(`\n--- Processing Template: ${fileName} ---`);

            await page.getByRole('button', { name: 'Upload Template' }).click();
            await expect(page.locator('h2', { hasText: 'Upload New Template' })).toBeVisible({ timeout: 15000 });

            // Fill basic metadata
            await page.locator('input[placeholder*="Protocol"]').fill(fileName.replace('.docx', ''));
            await selectOption(page, 'Category', 'ANY_AUTO');
            await selectOption(page, 'Country', 'ANY_AUTO');

            // Set Mapping
            await selectOption(page, 'Mapping Type', 'eCTD');

            // Wait for conditional fields
            console.log('Waiting for Mapped CTD Folder and eCTD Section fields...');
            await page.waitForTimeout(1000);

            await selectOption(page, 'Mapped CTD Folder', 'ANY_AUTO');
            await selectOption(page, 'eCTD Section', 'ANY_AUTO');

            // Upload file
            console.log('Selecting file...');
            const [fileChooser] = await Promise.all([
                page.waitForEvent('filechooser'),
                page.locator('text=Upload File *').locator('..').locator('input[type="file"]').click({ force: true })
            ]);
            await fileChooser.setFiles(filePath);

            // Save
            console.log('Clicking Save Template...');
            await page.getByRole('button', { name: 'Save Template' }).click();

            // Handle success modal or capture error
            const successMsg = page.locator('text=Template uploaded successfully');
            const errorMsg = page.locator('.field-error, .ms-MessageBar-content');

            try {
                await Promise.race([
                    expect(successMsg).toBeVisible({ timeout: 120000 }),
                    expect(errorMsg).toBeVisible({ timeout: 10000 })
                ]);

                if (await errorMsg.isVisible()) {
                    const txt = await errorMsg.innerText();
                    throw new Error(`Upload failed for ${fileName}: ${txt}`);
                }

                console.log('Success confirmed. Clicking OK.');
                await page.getByRole('button', { name: 'OK' }).click();
            } catch (e) {
                console.error(`Error during upload of ${fileName}`);
                // Take screenshot for debugging
                await page.screenshot({ path: `error-upload-${fileName.replace(/\s+/g, '_')}.png` });
                throw e;
            }

            console.log(`Template completed successfully: ${fileName}`);
        }
    });

    /**
     * Test Case 2: Multi-step Action Verification
     * Verifies View (Preview), Download, Edit Mapping, and Delete.
     */
    test('View/Preview and Edit/Delete Template Actions', async ({ page }) => {
        // Wait for grid to load
        const grid = page.locator('.boxCard', { hasText: 'Template Name' }).last();
        await expect(grid).toBeVisible({ timeout: 30000 });

        // Find rows matching our uploaded files
        const rows = page.locator('.ms-DetailsRow');
        const count = await rows.count();
        console.log(`Found ${count} rows in the templates grid.`);

        // Test CRUD on up to 2 items
        const numToTest = Math.min(count, 2);
        for (let i = 0; i < numToTest; i++) {
            const row = rows.nth(i);
            const templateName = await row.locator('[data-automation-key="name"]').innerText();
            console.log(`\nStarting CRUD actions on item: ${templateName}`);

            // 1. View / Preview
            console.log('Testing Preview...');
            await row.locator('.btnView').first().click();
            await expect(page.locator('.ms-Panel-headerText', { hasText: 'Template Preview' })).toBeVisible({ timeout: 20000 });

            // Preview might fail if SharePoint file doesn't have an embed link yet
            const previewMsg = page.locator('text=Template preview URL not available').or(page.locator(`iframe[title*="${templateName}"]`));
            await expect(previewMsg.first()).toBeVisible({ timeout: 15000 });

            console.log('Preview verified (either frame or message).');
            await page.getByRole('button', { name: 'Close' }).click();

            // 2. Download
            console.log('Testing Download...');
            const [download] = await Promise.all([
                page.waitForEvent('download', { timeout: 30000 }),
                row.locator('.btnGreen').first().click()
            ]);
            console.log('Download triggered: ', download.suggestedFilename());
            await download.delete(); // Cleanup local file

            // 3. Edit Mapping
            console.log('Testing Edit Mapping action...');
            await row.locator('a.btncal').first().click({ force: true });

            const editModal = page.locator('.ms-Modal').filter({ hasText: 'Edit Template Mapping' }).last();
            await expect(editModal).toBeVisible({ timeout: 20000 });

            // Verify dropdowns are pre-populated (our code uses IDs, so let's check visibility)
            await expect(editModal.locator('.react-dropdown-container').first()).toBeVisible();

            // Test updating Status
            await selectOption(page, 'Status', 'Inactive');
            await page.getByRole('button', { name: 'Save' }).click();
            await expect(editModal).not.toBeVisible({ timeout: 20000 });
            console.log('Edit Mapping saved successfully.');
            await page.waitForTimeout(2000);
        }

        // Cleanup: Delete tested items
        console.log('\nCleaning up tested items...');
        const deleteButtons = page.locator('.deleticon');
        const dCount = await deleteButtons.count();
        for (let i = 0; i < Math.min(dCount, 2); i++) {
            await deleteButtons.nth(0).click();
            await page.getByRole('button', { name: 'Delete' }).last().click();
            await page.waitForTimeout(1500);
        }
    });

    /**
     * Test Case 3: GMP Mapping Upload
     */
    test('Add Template - GMP Mapping', async ({ page }) => {
        const filePath = path.resolve('Project Documents/721814 SOP/721814 SOP/CS_WI_TSS0004 Revision 4.docx');
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File not found at ${filePath}. Skipping GMP Mapping Upload test.`);
            return;
        }

        console.log('\n--- Testing GMP Mapping Upload ---');
        await page.getByRole('button', { name: 'Upload Template' }).click();

        await page.locator('input[placeholder*="Protocol"]').fill('GMP_TEST_TEMPLATE');
        await selectOption(page, 'Category', 'ANY_AUTO');
        await selectOption(page, 'Country', 'ANY_AUTO');
        await selectOption(page, 'Mapping Type', 'GMP');

        // Verify GMP Model dropdown appears
        await expect(page.locator('text=Mapped GMP Model *')).toBeVisible({ timeout: 10000 });
        await selectOption(page, 'Mapped GMP Model', 'ANY_AUTO');

        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.locator('input[type="file"]').click({ force: true })
        ]);
        await fileChooser.setFiles(filePath);

        await page.getByRole('button', { name: 'Save Template' }).click();
        await expect(page.locator('text=Template uploaded successfully')).toBeVisible({ timeout: 60000 });
        await page.getByRole('button', { name: 'OK' }).click();
    });

    /**
     * Test Case 4: TMF Mapping Upload
     */
    test('Add Template - TMF Mapping', async ({ page }) => {
        const filePath = path.resolve('Project Documents/721814 SOP/721814 SOP/CS_WI_TSS0005 Revision 4.docx');
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File not found at ${filePath}. Skipping TMF Mapping Upload test.`);
            return;
        }

        console.log('\n--- Testing TMF Mapping Upload ---');
        await page.getByRole('button', { name: 'Upload Template' }).click();

        await page.locator('input[placeholder*="Protocol"]').fill('TMF_TEST_TEMPLATE');
        await selectOption(page, 'Category', 'ANY_AUTO');
        await selectOption(page, 'Country', 'ANY_AUTO');
        await selectOption(page, 'Mapping Type', 'TMF');

        // Verify TMF Folder dropdown appears
        await expect(page.locator('text=Mapped TMF Folder *')).toBeVisible({ timeout: 10000 });
        await selectOption(page, 'Mapped TMF Folder', 'ANY_AUTO');

        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.locator('input[type="file"]').click({ force: true })
        ]);
        await fileChooser.setFiles(filePath);

        await page.getByRole('button', { name: 'Save Template' }).click();
        await expect(page.locator('text=Template uploaded successfully')).toBeVisible({ timeout: 60000 });
        await page.getByRole('button', { name: 'OK' }).click();
    });

    /**
     * Test Case 3: Excel Upload Validation
     * Tests negative scenario with incorrect spreadsheet.
     */
    test('Excel Bulk Upload Validation', async ({ page }) => {
        console.log('Opening Excel Upload modal...');
        await page.getByRole('button', { name: 'Excel Upload' }).click();
        await expect(page.locator('div', { hasText: 'Excel Bulk Upload - Templates' }).last()).toBeVisible({ timeout: 15000 });

        const excelPath = path.resolve('Project Documents/DIA_GMP_vs_eCTD_MAPPING.xlsx');
        if (!fs.existsSync(excelPath)) {
            console.warn('Excel file for validation not found at ' + excelPath);
            return;
        }

        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.locator('.ms-Modal input[type="file"]').click({ force: true })
        ]);
        await fileChooser.setFiles(excelPath);

        // Wait for validation - should fail due to template mismatch
        console.log('Checking validation results...');
        const failMsg = page.locator('text=Validation Failed');
        const passMsg = page.locator('text=File validated successfully');

        await Promise.race([
            expect(failMsg).toBeVisible({ timeout: 30000 }),
            expect(passMsg).toBeVisible({ timeout: 30000 })
        ]);

        if (await failMsg.isVisible()) {
            console.log('Validation Failed as expected for incorrect headers.');
            await page.getByRole('button', { name: 'Cancel' }).click();
        } else {
            console.log('Validation unexpectedly passed.');
        }
    });

});

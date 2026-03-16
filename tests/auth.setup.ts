import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Use environment variables for credentials
    const username = process.env.PLAYWRIGHT_USERNAME;
    const password = process.env.PLAYWRIGHT_PASSWORD;

    if (!username || !password) {
        throw new Error('Please set PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD environment variables');
    }

    await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx');
    await page.screenshot({ path: 'test-results/auth_start.png' });

    // SharePoint/Microsoft Login Flow
    console.log('Entering username...');
    await page.getByPlaceholder('Email, phone, or Skype').fill(username);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.screenshot({ path: 'test-results/auth_after_username.png' });

    console.log('Entering password...');
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.screenshot({ path: 'test-results/auth_after_password.png' });

    // Handle "Stay signed in?" prompt
    try {
        console.log('Checking for "Stay signed in?" prompt...');
        // Microsoft sometimes shows 'Stay signed in?' as a heading or text
        const staySignedInButton = page.getByRole('button', { name: 'Yes' });
        await staySignedInButton.waitFor({ state: 'visible', timeout: 15000 });
        console.log('Clicking "Yes" on Stay signed in prompt...');
        await staySignedInButton.click();
    } catch (e) {
        console.log('Stay signed in prompt not visible or already handled');
        await page.screenshot({ path: 'test-results/auth_stay_signed_in_not_found.png' });
    }

    // Wait for the application to load
    console.log('Waiting for application to load at Page.aspx...');
    // SharePoint redirection can be slow and have many params
    await page.waitForURL('**/Page.aspx**', { timeout: 60000 });
    await page.waitForLoadState('load');
    await page.screenshot({ path: 'test-results/auth_application_loaded.png' });

    // Verify we are logged in - look for the admin dashboard header or user name
    console.log('Verifying login success...');
    // Try to find Sidebar as a proxy for the app being loaded
    await expect(page.locator('nav.sidebar').first()).toBeVisible({ timeout: 30000 });

    console.log('Authentication successful!');
    await page.context().storageState({ path: authFile });
});

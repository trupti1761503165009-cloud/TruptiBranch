import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as Admin', async ({ page }) => {
  const username = 'admin@redgreens.in';
  const password = '#AD@min_2026';

  if (!username || !password) {
    throw new Error('Please set PLAYWRIGHT_ADMIN_USERNAME and PLAYWRIGHT_ADMIN_PASSWORD in .env');
  }

  await page.goto('https://redgreens.sharepoint.com/sites/DMS/SitePages/Page.aspx');
  await page.getByPlaceholder('Email, phone, or Skype').fill(username);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  try {
    const staySignedInButton = page.getByRole('button', { name: 'Yes' });
    await staySignedInButton.waitFor({ state: 'visible', timeout: 15000 });
    await staySignedInButton.click();
  } catch {
    // ignore if not shown
  }

  await page.waitForURL('**/Page.aspx**', { timeout: 60000 });
  await page.waitForLoadState('load');
  await expect(page.locator('nav.sidebar').first()).toBeVisible({ timeout: 30000 });

  await page.context().storageState({ path: authFile });
});


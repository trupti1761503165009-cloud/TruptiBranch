import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'https://redgreens.sharepoint.com/sites/DMS/',
    trace: 'on-first-retry',
    headless: false,
    screenshot: 'only-on-failure',
  },

  projects: [
    // Global setup for each role
    { name: 'setup-admin', testMatch: /.*admin\.setup\.ts/ },
    { name: 'setup-author', testMatch: /.*author\.setup\.ts/ },
    { name: 'setup-hr', testMatch: /.*hr\.setup\.ts/ },

    // Admin project – runs all master phases
    {
      name: 'Admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },

    // Author project – document creation & author views
    {
      name: 'Author',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/author.json',
      },
      dependencies: ['setup-author'],
    },

    // HR project – user permissions only
    {
      name: 'HR',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/hr.json',
      },
      dependencies: ['setup-hr'],
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Playwright Test Configuration - TMDB API Testing Framework
 * Configures test execution, reporting, and browser settings for API tests
 * 
 * NOTE: This is an API testing framework - no cross-browser testing needed
 */
export default defineConfig({
  testDir: './tests/api',
  
  /* Maximum time one test can run for */
  timeout: 60 * 1000,
  
  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright']
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Collect trace on first retry */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* API testing timeout */
    actionTimeout: 30 * 1000,
  },

  /* Configure projects for API testing */
  projects: [
    {
      name: 'api-chromium',
      testMatch: '**/tests/api/**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

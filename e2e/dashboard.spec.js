import { test, expect } from '@playwright/test';

test.describe('Dashboard Auth Guard', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    
    // Without auth, the app should render the login screen
    await expect(page.getByText('CPR Analytics')).toBeVisible();
    await expect(page.getByPlaceholder('name@company.com')).toBeVisible();
  });
});

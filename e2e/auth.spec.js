import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('renders login screen correctly', async ({ page }) => {
    await page.goto('/');
    
    // Expect the title to be visible
    await expect(page.getByText('CPR Analytics')).toBeVisible();
    
    // Expect email and password inputs
    await expect(page.getByPlaceholder('name@company.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    
    // Expect Secure Login button
    await expect(page.getByRole('button', { name: /Secure Login/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder('name@company.com').fill('invalid@example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /Secure Login/i }).click();
    
    // An error message should appear (handled by Supabase auth error)
    await expect(page.getByText(/Invalid login credentials/i)).toBeVisible();
  });
});

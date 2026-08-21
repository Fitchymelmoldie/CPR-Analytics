import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('renders login screen correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'CPR Analytics' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Secure Login/i })).toBeVisible();
  });

  test('shows a friendly error on invalid credentials', async ({ page }) => {
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' })
      });
    });
    await page.goto('/');

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /Secure Login/i }).click();

    await expect(page.getByText('The email or password you entered is incorrect. Please try again.')).toBeVisible();
  });

  test('shows a friendly service message when login is unavailable', async ({ page }) => {
    await page.route('**/auth/v1/token?grant_type=password', route => route.abort('failed'));
    await page.goto('/');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: /Secure Login/i }).click();

    await expect(page.getByText('We could not reach the login service. Check your connection and try again.')).toBeVisible();
  });
});

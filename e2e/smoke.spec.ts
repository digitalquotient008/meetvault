import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('marketing homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('booking page returns 200 for known slug', async ({ request }) => {
    const res = await request.get('/book/demo');
    expect(res.ok()).toBeTruthy();
  });
});

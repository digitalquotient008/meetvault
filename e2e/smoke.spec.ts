import { test, expect } from '@playwright/test';

test.describe('Marketing pages', () => {
  test('homepage loads with hero headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('features page loads', async ({ page }) => {
    await page.goto('/features');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('pricing page loads with Starter plan', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('text=Starter')).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Auth pages', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('sign-up page loads', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/sign-up/);
  });
});

test.describe('SEO', () => {
  test('sitemap.xml is accessible', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('/blog');
  });

  test('robots.txt is accessible', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('Disallow: /app/');
  });

  test('homepage has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MeetVault/);
  });

  test('blog post has article JSON-LD', async ({ page }) => {
    await page.goto('/blog/how-to-stop-no-shows-barbershop');
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toContain('"@type":"Article"');
  });
});

test.describe('Security headers', () => {
  test('responses include security headers', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['x-frame-options']).toBe('DENY');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});

test.describe('Redirects', () => {
  test('/meetvault-vs-booksy redirects to blog', async ({ request }) => {
    const res = await request.get('/meetvault-vs-booksy', { maxRedirects: 0 });
    expect(res.status()).toBe(308); // permanent redirect
    expect(res.headers()['location']).toContain('/blog/meetvault-vs-booksy');
  });
});

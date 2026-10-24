import playwrightTest from '/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/test.js';

const { test, expect } = playwrightTest;

const baseUrl = 'http://127.0.0.1:3000';
const widths = [320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920];
const routes = [
  '/',
  '/events',
  '/leadership',
  '/community',
  '/community/scan',
  '/members/507f1f77bcf86cd799439011',
  '/member/login',
  '/member/activate',
  '/member/dashboard',
  '/admin/login',
  '/admin',
  '/admin/team',
  '/admin/faculty',
  '/admin/events',
  '/privacy',
  '/terms',
];

test.setTimeout(600000);

test('responsive routes do not overflow at requested viewport widths', async ({ browser }) => {
  const results = [];

  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(250);
      const metrics = await page.evaluate(() => ({
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));
      results.push({ width, route, ...metrics, pageErrors: [...pageErrors] });
      pageErrors.length = 0;
    }

    await context.close();
  }

  console.log(JSON.stringify(results));
  expect(results.every(result => result.scrollWidth <= result.clientWidth + 1)).toBe(true);
  expect(results.every(result => result.bodyScrollWidth <= result.clientWidth + 1)).toBe(true);
  expect(results.every(result => result.pageErrors.length === 0)).toBe(true);
});

test('mobile navigation opens, closes with Escape, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  const toggle = page.getByRole('button', { name: 'Open navigation menu' });
  await toggle.click();
  await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toHaveAttribute('aria-modal', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeHidden();
  await expect(toggle).toBeFocused();
});

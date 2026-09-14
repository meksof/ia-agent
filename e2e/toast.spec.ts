import { test, expect } from '@playwright/test';

test.describe('Toast notifications', () => {
  test('should show error toast when model response times out', async ({ page }) => {
    // Override the timeout to 200 ms so the test runs fast
    await page.addInitScript(() => {
      window.__APP_CONFIG__ = { modelResponseTimeoutMs: 200 };
    });

    // Stub models so the chat UI is fully usable
    await page.route('**/api/tags', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          models: [{ name: 'llama2', model: 'llama2' }],
        }),
      });
    });

    // Never fulfill the generate request — simulates a hung/unresponsive model
    await page.route('**/api/generate', () => {
      // intentionally left pending so the app's RxJS timeout fires
    });

    await page.goto('/');

    // Create a new conversation
    await page.getByRole('button', { name: 'Start New Chat' }).click();

    // Type and send a message
    const input = page.getByRole('textbox');
    await input.fill('Hello');
    await input.press('Enter');

    // Toast should appear shortly after the 200 ms timeout fires
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('alert')).toContainText('too long to respond');
  });
});

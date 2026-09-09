import { test, expect } from '@playwright/test';

test.describe('Models Notice', () => {
  test('should show "No Models Installed" when Ollama returns empty models', async ({ page }) => {
    await page.route('**/api/tags', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ models: [] }),
      });
    });

    await page.goto('/');

    await expect(page.locator('h2')).toContainText('No Models Installed');
    await expect(page.locator('p')).toContainText('ollama pull llama2');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should show "Ollama Not Detected" when Ollama is not running', async ({ page }) => {
    await page.route('**/api/tags', (route) => {
      route.abort('connectionrefused');
    });

    await page.goto('/');

    await expect(page.locator('h2')).toContainText('Ollama Not Detected');
    await expect(page.getByRole('link', { name: 'Learn how to install Ollama' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should show "Resource Not Found" when the models endpoint returns 404', async ({ page }) => {
    await page.route('**/api/tags', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'not found' }),
      });
    });

    await page.goto('/');

    await expect(page.locator('h2')).toContainText('Resource Not Found');
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(page.locator('p')).toContainText('Check if the endpoint is correct.');
  });

});

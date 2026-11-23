import { test, expect } from '@playwright/test';

test('la page de connexion se rend', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/GeberLMS/);
});

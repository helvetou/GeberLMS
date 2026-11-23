import { test, expect } from '@playwright/test';

const LEARNER_EMAIL = process.env.E2E_LEARNER_EMAIL ?? 'learner@demo.ee';
const LEARNER_PASSWORD = process.env.E2E_LEARNER_PASSWORD ?? 'DemoLearner123!';

test('la page de connexion se rend', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/GeberLMS/);
});

test('le catalogue public liste des cours', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: /Catalogue|Catalog|الفهرس|Katalog/ })).toBeVisible();
});

test('un apprenant se connecte et ouvre son cours', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/Email|E-Mail|البريد/).fill(LEARNER_EMAIL);
  await page.getByLabel(/Mot de passe|Password|كلمة المرور/).fill(LEARNER_PASSWORD);
  await page.getByRole('button', { name: /Se connecter|Log in|Anmelden|تسجيل الدخول/ }).click();
  await page.waitForURL(/\/learner/);
  await expect(page.getByRole('heading', { level: 1, name: /Mes cours|My courses|دوراتي|Meine Kurse/ })).toBeVisible();
});

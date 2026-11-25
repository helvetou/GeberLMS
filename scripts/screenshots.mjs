import { chromium } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173';
const OUT = 'test-results/pilote';

const scenarios = [
  { name: '01-login-desktop', path: '/login', viewport: { width: 1280, height: 800 } },
  { name: '02-login-mobile', path: '/login', viewport: { width: 390, height: 844 } },
  { name: '03-login-arabe', path: '/login?locale=ar', viewport: { width: 1280, height: 800 } },
  { name: '04-catalog-desktop', path: '/catalog', viewport: { width: 1280, height: 800 } },
  { name: '05-catalog-mobile', path: '/catalog', viewport: { width: 390, height: 844 } },
  { name: '06-catalog-arabe', path: '/catalog?locale=ar', viewport: { width: 1280, height: 800 } },
  { name: '07-cours-detail', path: '/catalog/verilog-debutants', viewport: { width: 1280, height: 800 } },
];

const browser = await chromium.launch();

for (const s of scenarios) {
  const page = await browser.newPage({ viewport: s.viewport });
  await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
  await page.close();
}

// Tableau de bord apprenant (authentifié)
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.getByLabel(/Email/).fill('learner@demo.ee');
await page.getByLabel(/Mot de passe|Password/).fill('DemoLearner123!');
await page.getByRole('button', { name: /Se connecter|Log in|Anmelden|تسجيل الدخول/ }).click();
await page.waitForURL(/\/learner/);
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/08-learner-dashboard.png`, fullPage: true });
await page.close();

await browser.close();
console.log('Captures terminées →', OUT);

/**
 * Smoke test de production (HTTP) — DoD de chaque milestone (processus §8).
 *
 * Vérifie qu'un petit ensemble de routes critiques répondent correctement sur
 * l'URL déployée. Chaque milestone étend la liste `CHECKS`.
 *
 * Usage :
 *   PROD_URL=https://geberlms.haroudm.workers.dev/ npm run smoke
 */
const PROD_URL = (process.env.PROD_URL ?? 'https://geberlms.haroudm.workers.dev/').replace(/\/+$/, '');

interface Check {
  name: string;
  path: string;
  /** Statuts acceptés. */
  statuses: number[];
  /** Si présent, le header `location` doit contenir cette chaîne. */
  locationContains?: string;
}

const CHECKS: Check[] = [
  // Page de connexion accessible aux anonymes.
  { name: 'GET /login → 200', path: '/login', statuses: [200] },
  // Racine : anonyme → redirection vers /login (aiguillage par rôle).
  { name: 'GET / → redirect /login', path: '/', statuses: [301, 302, 303, 307, 308], locationContains: '/login' },
];

async function main(): Promise<void> {
  let failures = 0;

  for (const check of CHECKS) {
    try {
      const res = await fetch(`${PROD_URL}${check.path}`, { redirect: 'manual' });
      const ok = check.statuses.includes(res.status);
      const loc = res.headers.get('location') ?? '';
      const locOk = check.locationContains ? loc.includes(check.locationContains) : true;
      const pass = ok && locOk;

      if (pass) {
        console.log(`✅ ${check.name} — ${res.status}${loc ? ` → ${loc}` : ''}`);
      } else {
        failures += 1;
        console.error(
          `❌ ${check.name} — reçu ${res.status}${loc ? ` → ${loc}` : ''} (attendu ${check.statuses.join('/')})`,
        );
      }
    } catch (err) {
      failures += 1;
      console.error(`❌ ${check.name} — erreur réseau : ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(
    failures === 0
      ? `\nSmoke test OK (${CHECKS.length} vérification(s)) sur ${PROD_URL}`
      : `\n${failures} échec(s) sur ${CHECKS.length} vérification(s)`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

void main();

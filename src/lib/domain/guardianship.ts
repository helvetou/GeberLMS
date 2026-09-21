/**
 * Liaison tuteur ↔ apprenant (FR-04, FR-07).
 *
 * Structures immuables : les fonctions renvoient de nouvelles listes
 * et ne modifient jamais l'entrée.
 */
export interface Guardianship {
  tutorId: string;
  learnerId: string;
}

export type GuardianshipList = readonly Guardianship[];

export function addGuardianship(
  links: GuardianshipList,
  g: Guardianship,
): Guardianship[] {
  const exists = links.some(
    (l) => l.tutorId === g.tutorId && l.learnerId === g.learnerId,
  );
  return exists ? [...links] : [...links, g];
}

export function removeGuardianship(
  links: GuardianshipList,
  g: Guardianship,
): Guardianship[] {
  return links.filter(
    (l) => !(l.tutorId === g.tutorId && l.learnerId === g.learnerId),
  );
}

/** Apprenants (ids uniques, triés) financés par un tuteur. */
export function learnersOfTutor(
  links: GuardianshipList,
  tutorId: string,
): string[] {
  const ids = links
    .filter((l) => l.tutorId === tutorId)
    .map((l) => l.learnerId);
  return [...new Set(ids)].sort();
}

/** Tuteurs (ids uniques, triés) d'un apprenant. */
export function tutorsOfLearner(
  links: GuardianshipList,
  learnerId: string,
): string[] {
  const ids = links
    .filter((l) => l.learnerId === learnerId)
    .map((l) => l.tutorId);
  return [...new Set(ids)].sort();
}

/** Un tuteur peut voir un apprenant seulement s'il existe une liaison (FR-07). */
export function tutorCanViewLearner(
  links: GuardianshipList,
  tutorId: string,
  learnerId: string,
): boolean {
  return links.some((l) => l.tutorId === tutorId && l.learnerId === learnerId);
}

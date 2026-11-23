/**
 * Budget LLM (NFR-06, m8) : seuils de dépense mensuelle et disjoncteur.
 */
export type BudgetStatus = 'ok' | 'warning' | 'critical';

export interface BudgetState {
  status: BudgetStatus;
  spendEuros: number;
  budgetEuros: number;
  /** Prochain seuil restant avant le dépassement. */
  remainingEuros: number;
  /** true → bloquer les nouvelles générations (disjoncteur). */
  blocked: boolean;
}

export const DEFAULT_LLM_BUDGET_EUROS = 100;
export const LLM_WARNING_EUROS = 80;
export const LLM_CRITICAL_EUROS = 100;

/**
 * Calcule l'état du budget LLM : ok, avertissement (≥80 €) ou critique (≥100 €),
 * avec disjoncteur au-delà du budget.
 */
export function budgetState(
  spendEuros: number,
  budgetEuros: number = DEFAULT_LLM_BUDGET_EUROS,
): BudgetState {
  const remainingEuros = Math.max(0, budgetEuros - spendEuros);
  let status: BudgetStatus = 'ok';
  if (spendEuros >= budgetEuros) status = 'critical';
  else if (spendEuros >= budgetEuros * 0.8) status = 'warning';

  return {
    status,
    spendEuros,
    budgetEuros,
    remainingEuros,
    blocked: spendEuros >= budgetEuros,
  };
}

/** Estimation de coût en euros à partir d'un nombre de tokens (très grossière). */
export function estimateCostEuros(promptTokens: number): number {
  // ~1 € / 1 M tokens d'entrée (ordre de grandeur Workers AI).
  return Math.round((promptTokens / 1_000_000) * 100) / 100;
}

import type { DB } from './db';
import { llmUsage } from './db/schema';
import { budgetState, estimateCostEuros, type BudgetState } from '$lib/domain/llm-budget';

/** Enregistre une consommation LLM (NFR-06). */
export async function recordLlmUsage(db: DB, model: string, promptTokens: number): Promise<void> {
  await db
    .insert(llmUsage)
    .values({
      id: crypto.randomUUID(),
      model,
      promptTokens,
      createdAt: new Date().toISOString(),
    })
    .run();
}

/** État du budget LLM cumulé (seuils 80 € / 100 €). */
export async function getLlmBudgetState(db: DB): Promise<BudgetState> {
  const rows = await db.select({ promptTokens: llmUsage.promptTokens }).from(llmUsage).all();
  const totalTokens = rows.reduce((sum, r) => sum + r.promptTokens, 0);
  return budgetState(estimateCostEuros(totalTokens));
}

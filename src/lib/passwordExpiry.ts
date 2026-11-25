/** Prazo de validade da senha, em dias. */
export const DIAS_VALIDADE_SENHA = 90;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Diz se a senha venceu: true quando já se passaram MAIS de 90 dias desde a última troca.
 * Data ausente ou inválida conta como vencida (fail-safe: obriga a trocar).
 */
export function senhaVencida(
  passwordChangedAt: string | Date | null | undefined,
  agora: Date = new Date(),
  dias: number = DIAS_VALIDADE_SENHA,
): boolean {
  if (!passwordChangedAt) return true;
  const trocadaEm = new Date(passwordChangedAt);
  if (Number.isNaN(trocadaEm.getTime())) return true;
  return agora.getTime() - trocadaEm.getTime() > dias * MS_POR_DIA;
}

/** Dias que faltam para vencer (negativo se já venceu). */
export function diasParaVencer(passwordChangedAt: string | Date, agora: Date = new Date()): number {
  const limite = new Date(passwordChangedAt).getTime() + DIAS_VALIDADE_SENHA * MS_POR_DIA;
  return Math.ceil((limite - agora.getTime()) / MS_POR_DIA);
}

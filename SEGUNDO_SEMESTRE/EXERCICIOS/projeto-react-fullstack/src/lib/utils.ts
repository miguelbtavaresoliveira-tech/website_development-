// =============================================================================
// LIB — Utilitários Gerais
// Funções helpers reutilizáveis em todo o projeto
// =============================================================================

/**
 * Formata um número para moeda brasileira (BRL)
 * @example formatarMoeda(9.90) → "R$ 9,90"
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Formata uma string de data ISO para o formato brasileiro
 * @example formatarData("2024-01-15T10:30:00") → "15/01/2024 10:30"
 */
export function formatarData(dataIso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dataIso));
}

/**
 * Capitaliza a primeira letra de uma string
 * @example capitalizar("pendente") → "Pendente"
 */
export function capitalizar(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Verifica se um valor é uma string não vazia
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

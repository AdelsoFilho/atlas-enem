/**
 * Quality Gate — Auto-Crítica do módulo gerado.
 *
 * Responsabilidade única: receber o JSON de um módulo de 4 etapas e verificar
 * se ele é internamente consistente antes de ser entregue ao aluno ou cacheado.
 *
 * Dois checks são realizados:
 *  1. COERÊNCIA LINEAR — Etapa 4 (simulado) não pode cobrar conceito que não
 *     apareceu em nenhuma das etapas 1-3 (teoria, exemplo, treino).
 *  2. ANTI-REPETIÇÃO — O enunciado do exemplo (etapa 2) não pode ser cópia
 *     textual de nenhum enunciado do treino (etapa 3).
 */

export const QUALITY_GATE_SYSTEM_PROMPT = `Você é um auditor pedagógico especializado em coerência de material didático.
Recebe um módulo de estudo em JSON e verifica se ele passa em 2 checks.

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON abaixo, sem nenhum texto antes ou depois
- NÃO use blocos de código markdown
- A resposta deve começar com { e terminar com }`

export function buildQualityGatePrompt(moduleJson: string): string {
  return `Analise o módulo de 4 etapas abaixo e execute os seguintes checks:

CHECK 1 — COERÊNCIA LINEAR:
Verifique se o "enunciado" da etapa 4 (simulado) cobra algum conceito, fórmula
ou técnica que NÃO foi mencionado em nenhuma das etapas 1, 2 ou 3.
Um simulado PODE conectar tópicos relacionados, mas não pode exigir conhecimento
completamente ausente das etapas anteriores.

CHECK 2 — ANTI-REPETIÇÃO:
Verifique se existe sobreposição textual ≥50% entre o "enunciado" da etapa 2
(exemplo) e qualquer "enunciado" das questões da etapa 3 (treino).
Similaridade de palavras-chave é aceitável; cópia de frases inteiras não é.

MÓDULO A AUDITAR:
${moduleJson}

Retorne exatamente este JSON:
{
  "valid": true | false,
  "failed_checks": ["COHERENCE" | "REPETITION"],
  "issues": ["descrição específica do problema encontrado, ou array vazio se válido"]
}`
}

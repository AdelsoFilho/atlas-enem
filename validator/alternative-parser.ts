/**
 * Parser de alternativas: extrai valores numéricos de textos de opções.
 *
 * Suporta formatos reais de provas:
 *  "{-4, 8}"            → [-4, 8]
 *  "x = -4 ou x = 8"   → [-4, 8]
 *  "3/9"                → [0.333...]
 *  "√(2/5)"             → [√(2/5)] — radicais são sinalizados mas não calculados
 *  "∅"                  → []        — conjunto vazio
 */

export interface ParseResult {
  numbers: number[]
  hasIrrational: boolean  // true se detectar √, π, etc. (não parseável exatamente)
  isEmpty: boolean        // true se texto representa conjunto vazio (∅)
  raw: string
}

// Padrões de raiz/irracional que não são parseáveis como float direto
const IRRATIONAL_RE = /[√∛π]/

export function parseAlternative(text: string): ParseResult {
  // Normaliza sinal de menos Unicode (U+2212 "−") → ASCII "-"
  // Provas digitalizadas frequentemente usam o caractere tipográfico
  const raw = text.trim().replace(/−/g, "-")

  // Conjunto vazio
  if (raw === "∅" || raw === "{}" || /conjunto vazio/i.test(raw)) {
    return { numbers: [], hasIrrational: false, isEmpty: true, raw }
  }

  const hasIrrational = IRRATIONAL_RE.test(raw)

  if (hasIrrational) {
    // Não tenta parsear iracionais — marca para validação manual
    return { numbers: [], hasIrrational: true, isEmpty: false, raw }
  }

  const numbers = extractNumbers(raw)
  return { numbers, hasIrrational: false, isEmpty: false, raw }
}

/**
 * Extrai todos os números (inteiros, decimais, frações) de um texto.
 * Ordem de processamento: frações → inteiros/decimais.
 */
export function extractNumbers(text: string): number[] {
  const results: number[] = []
  let processed = text

  // 1. Frações: -3/9, 2/5, etc.
  const fractionRe = /-?\d+\/\d+/g
  const fractions = processed.match(fractionRe) ?? []
  for (const f of fractions) {
    const parts = f.split("/")
    const num = Number(parts[0])
    const den = Number(parts[1])
    if (den !== 0) results.push(num / den)
    processed = processed.replace(f, " ")
  }

  // 2. Inteiros e decimais (incluindo negativos)
  // Regex cuidadosa: captura sinal negativo apenas se precedido de
  // espaço, vírgula, {, ( ou início de string — para não confundir com subtração
  const numberRe = /(?:^|(?<=[,\s{(]))-?\d+(?:\.\d+)?/g
  const matches = processed.match(numberRe) ?? []
  for (const m of matches) {
    results.push(Number(m.trim()))
  }

  // Remove duplicatas
  return Array.from(new Set(results))
}

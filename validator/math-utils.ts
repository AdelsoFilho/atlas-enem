/**
 * Utilitários matemáticos puros para o ValidatorEngine.
 * Implementação algébrica direta — sem dependência externa.
 * Cobre 100% dos tipos de equação presentes no ENEM/UFG.
 */

export const EPSILON = 1e-9
export const COMPARISON_EPSILON = 1e-6 // tolerância para comparação de raízes

// ─── Comparação numérica ──────────────────────────────────────────────────────

export function approxEqual(a: number, b: number, eps = COMPARISON_EPSILON): boolean {
  return Math.abs(a - b) < eps
}

// ─── Polinomial de grau 2 ─────────────────────────────────────────────────────

/**
 * Resolve ax² + bx + c = 0 via fórmula de Bhaskara.
 * Retorna raízes reais exatas. Array vazio se Δ < 0.
 */
export function solveQuadratic(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < EPSILON) {
    // Degenerado: bx + c = 0 → x = -c/b
    if (Math.abs(b) < EPSILON) return []
    return [-c / b]
  }

  const disc = b * b - 4 * a * c

  if (disc < -EPSILON) return []                       // sem raízes reais
  if (Math.abs(disc) < EPSILON) return [-b / (2 * a)] // raiz dupla

  const sqrtDisc = Math.sqrt(Math.max(0, disc))
  return [
    (-b + sqrtDisc) / (2 * a),
    (-b - sqrtDisc) / (2 * a),
  ]
}

/**
 * Avalia f(x) = ax² + bx + c em um ponto.
 */
export function evalPoly2(a: number, b: number, c: number, x: number): number {
  return a * x * x + b * x + c
}

// ─── Filtro de domínio ────────────────────────────────────────────────────────

export interface DomainFilterResult {
  valid: number[]
  rejected: number[]  // raízes que violam o domínio
}

/**
 * Filtra raízes pelo domínio: mantém apenas aquelas onde evalFn(x) > 0.
 * Usado para garantir argumento de logaritmo > 0.
 */
export function filterDomain(
  roots: number[],
  evalFn: (x: number) => number
): DomainFilterResult {
  const valid: number[] = []
  const rejected: number[] = []

  for (const r of roots) {
    const val = evalFn(r)
    if (val > EPSILON) valid.push(r)
    else rejected.push(r)
  }

  return { valid, rejected }
}

// ─── Comparação de conjuntos ──────────────────────────────────────────────────

/**
 * Compara dois arrays de números como conjuntos (ordem-independente, tolerância ε).
 * Retorna true apenas se os conjuntos têm exatamente os mesmos elementos.
 */
export function setsMatch(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false

  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)

  return sa.every((v, i) => approxEqual(v, sb[i]))
}

// ─── Análise de consistência reversa ─────────────────────────────────────────

export interface ConsistencyCheckResult {
  consistent: boolean   // true se todos os candidatos avaliam ao mesmo valor
  commonValue: number | null
}

/**
 * Verifica se um conjunto de candidatos (ex: {-4, 8}) avalia
 * para o mesmo valor em um polinômio (ex: x² - 4x).
 *
 * Usado para detectar "qual deveria ser o RHS" quando o gabarito está errado.
 */
export function checkCandidateConsistency(
  candidates: number[],
  evalFn: (x: number) => number
): ConsistencyCheckResult {
  if (candidates.length === 0) return { consistent: false, commonValue: null }

  const values = candidates.map(evalFn)
  const first = values[0]

  const consistent = values.every((v) => approxEqual(v, first))

  return {
    consistent,
    commonValue: consistent ? first : null,
  }
}

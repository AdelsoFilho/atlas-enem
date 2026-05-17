/**
 * ValidatorEngine — Módulo de Blindagem contra Erros (Error-Shield)
 *
 * Pipeline em 3 etapas para cada questão:
 *   1. Resolução simbólica independente (do zero, sem olhar alternativas)
 *   2. Confronto com Ground Truth (resultado calculado vs gabarito declarado)
 *   3. Diagnóstico e sugestão de correção (quando INVALID)
 *
 * Suporta: logarítmicas com argumento quadrático, quadráticas puras.
 * Demais tipos → status "UNCHECKED" (não bloqueia exibição).
 */

import type { Question } from "@/types/quiz"
import type { LogValidationMeta, QuadraticValidationMeta } from "@/types/quiz"
import {
  solveQuadratic,
  evalPoly2,
  filterDomain,
  setsMatch,
  checkCandidateConsistency,
  approxEqual,
} from "./math-utils"
import { parseAlternative } from "./alternative-parser"

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export type ValidationStatus = "VALID" | "INVALID" | "UNCHECKED"

export interface ValidationResult {
  status: ValidationStatus
  questionId: string
  equationType: string

  // Etapa 1: resolução independente
  allComputedRoots: number[]        // todas as raízes encontradas
  validRoots: number[]              // após filtro de domínio
  domainViolations: number[]        // raízes rejeitadas por violação de domínio

  // Etapa 2: confronto com gabarito
  parsedFromAlternative: number[]   // números extraídos da alternativa correta
  mismatch: boolean

  // Etapa 3: diagnóstico
  motivo?: string
  correcaoSugerida?: string         // erro detectado + valor correto sugerido
  debugReport?: string              // relatório técnico completo (modo admin)
}

// ─── Etapa 1 + 2 + 3 para equações logarítmicas ──────────────────────────────

function validateLog(
  meta: LogValidationMeta,
  correctOptionText: string
): Omit<ValidationResult, "questionId" | "equationType"> {
  const { base, argCoeffs: [a, b, c], result } = meta

  // ── Etapa 1: Resolução Simbólica ──────────────────────────────────────────
  // log_base(f(x)) = result  ↔  f(x) = base^result
  const rhs = Math.pow(base, result)

  // ax² + bx + c = rhs  →  ax² + bx + (c - rhs) = 0
  const allComputedRoots = solveQuadratic(a, b, c - rhs)

  // Verificação de domínio: f(x) = ax² + bx + c deve ser > 0 em cada raiz
  const evalArg = (x: number) => evalPoly2(a, b, c, x)
  const { valid: validRoots, rejected: domainViolations } = filterDomain(
    allComputedRoots,
    evalArg
  )

  // ── Etapa 2: Confronto com Ground Truth ───────────────────────────────────
  const parsed = parseAlternative(correctOptionText)

  if (parsed.isEmpty) {
    // Gabarito diz "conjunto vazio" — verificar se validRoots também é vazio
    const isConsistent = validRoots.length === 0
    return {
      status: isConsistent ? "VALID" : "INVALID",
      allComputedRoots,
      validRoots,
      domainViolations,
      parsedFromAlternative: [],
      mismatch: !isConsistent,
      motivo: isConsistent
        ? undefined
        : `Gabarito indica ∅ mas raízes válidas calculadas: [${validRoots.join(", ")}]`,
    }
  }

  if (parsed.hasIrrational) {
    // Iracionais — skip (comparação numérica exata inviável sem CAS completo)
    return {
      status: "UNCHECKED",
      allComputedRoots,
      validRoots,
      domainViolations,
      parsedFromAlternative: [],
      mismatch: false,
    }
  }

  const parsedFromAlternative = parsed.numbers
  const mismatch = !setsMatch(validRoots, parsedFromAlternative)

  if (!mismatch) {
    return {
      status: "VALID",
      allComputedRoots,
      validRoots,
      domainViolations,
      parsedFromAlternative,
      mismatch: false,
      debugReport: `OK: raízes [${validRoots.map((r) => r.toFixed(6)).join(", ")}] ≡ alternativa [${parsedFromAlternative.join(", ")}]`,
    }
  }

  // ── Etapa 3: Diagnóstico e Sugestão de Correção ───────────────────────────
  //
  // Verificação reversa: os candidatos do gabarito ({-4, 8}) avaliam
  // para um valor consistente em f(x)?
  //
  // Se todos os candidatos c_i satisfazem f(c_i) = k (mesma constante k > 0),
  // então o RHS correto seria k → log_base(k) = resultado_correto.
  //
  // Exemplo math-002:
  //   f(-4) = 16 + 16 = 32, f(8) = 64 - 32 = 32  → k = 32 (consistente)
  //   log₂(32) = 5  →  O enunciado deveria dizer "= 5", não "= 3"

  const { consistent, commonValue } = checkCandidateConsistency(
    parsedFromAlternative,
    evalArg
  )

  let correcaoSugerida: string | undefined
  let motivo: string

  const computedStr = validRoots.map((r) => r.toFixed(4)).join(", ")
  const alternativeStr = parsedFromAlternative.join(", ")

  motivo = `Raízes calculadas {${computedStr}} ≠ alternativa declarada {${alternativeStr}}`

  if (consistent && commonValue !== null && commonValue > 0) {
    const correctResult = Math.log(commonValue) / Math.log(base)
    const isIntegerResult = Math.abs(correctResult - Math.round(correctResult)) < 1e-9

    if (!approxEqual(correctResult, result)) {
      const correctResultStr = isIntegerResult
        ? String(Math.round(correctResult))
        : correctResult.toFixed(4)

      correcaoSugerida =
        `Inconsistência numérica detectada: ` +
        `enunciado usa log_${base}(f(x)) = ${result} → f(x) = ${rhs}, ` +
        `mas as alternativas {${alternativeStr}} satisfazem f(x) = ${commonValue} → ` +
        `log_${base}(${commonValue}) = ${correctResultStr}. ` +
        `Valor esperado no enunciado: ${correctResultStr}`
    }
  } else if (!consistent) {
    // Candidatos inconsistentes — possível erro de gabarito mais grave
    correcaoSugerida =
      `As alternativas {${alternativeStr}} não são raízes de nenhuma equação ` +
      `log_${base}(f(x)) = k consistente. Verifique o gabarito da fonte original.`
  }

  const debugReport =
    `QUESTÃO REJEITADA\n` +
    `Enunciado: log_${base}(f(x)) = ${result} → f(x) = ${rhs}\n` +
    `Raízes calculadas: {${computedStr}}\n` +
    `Raízes declaradas (gabarito): {${alternativeStr}}\n` +
    `Violações de domínio: ${domainViolations.length}\n` +
    (correcaoSugerida ? `Correção sugerida: ${correcaoSugerida}` : "")

  return {
    status: "INVALID",
    allComputedRoots,
    validRoots,
    domainViolations,
    parsedFromAlternative,
    mismatch: true,
    motivo,
    correcaoSugerida,
    debugReport,
  }
}

// ─── Validação de equações quadráticas puras ──────────────────────────────────

function validateQuadratic(
  meta: QuadraticValidationMeta,
  correctOptionText: string
): Omit<ValidationResult, "questionId" | "equationType"> {
  const { a, b, c, rhs } = meta

  // ax² + bx + c = rhs → ax² + bx + (c - rhs) = 0
  const allComputedRoots = solveQuadratic(a, b, c - rhs)

  const parsed = parseAlternative(correctOptionText)
  if (parsed.hasIrrational || parsed.isEmpty) {
    return {
      status: "UNCHECKED",
      allComputedRoots,
      validRoots: allComputedRoots,
      domainViolations: [],
      parsedFromAlternative: [],
      mismatch: false,
    }
  }

  const parsedFromAlternative = parsed.numbers
  const mismatch = !setsMatch(allComputedRoots, parsedFromAlternative)

  const computedStr = allComputedRoots.map((r) => r.toFixed(4)).join(", ")
  const alternativeStr = parsedFromAlternative.join(", ")

  return {
    status: mismatch ? "INVALID" : "VALID",
    allComputedRoots,
    validRoots: allComputedRoots,
    domainViolations: [],
    parsedFromAlternative,
    mismatch,
    motivo: mismatch
      ? `Raízes calculadas {${computedStr}} ≠ gabarito {${alternativeStr}}`
      : undefined,
    debugReport: mismatch
      ? `QUESTÃO REJEITADA\nRaízes calculadas: {${computedStr}}\nGabarito: {${alternativeStr}}`
      : `OK: {${computedStr}} ≡ {${alternativeStr}}`,
  }
}

// ─── Entry point público ──────────────────────────────────────────────────────

export function validateQuestion(question: Question): ValidationResult {
  const base = {
    questionId: question.id,
    equationType: question.validationMeta?.type ?? "unknown",
  }

  const unchecked: ValidationResult = {
    ...base,
    status: "UNCHECKED",
    allComputedRoots: [],
    validRoots: [],
    domainViolations: [],
    parsedFromAlternative: [],
    mismatch: false,
  }

  if (!question.validationMeta || question.validationMeta.type === "skip") {
    return unchecked
  }

  const correctOption = question.options.find((o) => o.key === question.correctKey)
  const correctText = correctOption?.text ?? ""

  if (question.validationMeta.type === "log") {
    return { ...base, equationType: "log", ...validateLog(question.validationMeta, correctText) }
  }

  if (question.validationMeta.type === "quadratic") {
    return { ...base, equationType: "quadratic", ...validateQuadratic(question.validationMeta, correctText) }
  }

  return unchecked
}

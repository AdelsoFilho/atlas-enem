"use client"

import {
  BASE_XP_PER_QUESTION,
  BASE_XP_PER_WRITING,
  LEVEL_THRESHOLDS,
  LEVEL_NAMES,
  SUBJECTS,
  MATH_ALERT_THRESHOLD,
  type SubjectKey,
} from "@/config/ufg-weights"
import type { PlayerProfile, SubjectPerformance } from "@/types"

// ─── Cálculo de XP ────────────────────────────────────────────────────────────

/**
 * XP_Ganho = Questões_Corretas * Peso_UFG_Materia * BASE_XP_PER_QUESTION
 *
 * Exemplo: 10 questões corretas de Matemática (peso 4.0)
 *   → 10 * 4.0 * 10 = 400 XP
 */
export function calcQuestionXp(
  subject: SubjectKey,
  correctAnswers: number
): number {
  const { xpMultiplier } = SUBJECTS[subject]
  return Math.round(correctAnswers * xpMultiplier * BASE_XP_PER_QUESTION)
}

/**
 * XP de redação: base fixa * multiplicador (peso 2.0)
 * Bônus de streak: cada 7 dias consecutivos = +50% XP naquele dia
 */
export function calcWritingXp(currentStreak: number): number {
  const { xpMultiplier } = SUBJECTS.writing
  const streakBonus = currentStreak > 0 && currentStreak % 7 === 0 ? 1.5 : 1.0
  return Math.round(BASE_XP_PER_WRITING * xpMultiplier * streakBonus)
}

// ─── Progressão de nível ──────────────────────────────────────────────────────

export function calcPlayerProfile(totalXp: number): PlayerProfile {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  const cappedLevel = Math.min(level, LEVEL_THRESHOLDS.length)
  const currentThreshold = LEVEL_THRESHOLDS[cappedLevel - 1]
  const nextThreshold = LEVEL_THRESHOLDS[cappedLevel] ?? Infinity

  const xpInCurrentLevel = totalXp - currentThreshold
  const xpSpanOfLevel =
    nextThreshold === Infinity ? 9999 : nextThreshold - currentThreshold
  const xpToNextLevel =
    nextThreshold === Infinity ? 0 : nextThreshold - totalXp

  return {
    totalXp,
    level: cappedLevel,
    levelName: LEVEL_NAMES[cappedLevel - 1] ?? "Lenda",
    xpToNextLevel: Math.max(0, xpToNextLevel),
    xpInCurrentLevel,
    levelProgressPercent: Math.min(
      100,
      Math.round((xpInCurrentLevel / xpSpanOfLevel) * 100)
    ),
  }
}

// ─── Análise de desempenho ponderado ─────────────────────────────────────────

export interface PerformanceAnalysis {
  subjectScores: Record<SubjectKey, number>  // accuracy 0–1 por matéria
  weightedAverage: number                     // média ponderada total 0–1
  mathAlertActive: boolean                    // true se Math < threshold
  radarData: RadarPoint[]
}

export interface RadarPoint {
  subject: string
  score: number          // 0–100 para o recharts radar
  fullMark: number       // sempre 100
  weight: number
}

export function analyzePerformance(
  performances: Record<SubjectKey, SubjectPerformance>
): PerformanceAnalysis {
  const subjectKeys = Object.keys(SUBJECTS) as SubjectKey[]

  const subjectScores = Object.fromEntries(
    subjectKeys.map((k) => [k, performances[k]?.accuracy ?? 0])
  ) as Record<SubjectKey, number>

  // Média ponderada pelos pesos UFG
  const totalWeightedScore = subjectKeys.reduce(
    (acc, k) => acc + subjectScores[k] * SUBJECTS[k].weight,
    0
  )
  const totalWeight = subjectKeys.reduce(
    (acc, k) => acc + SUBJECTS[k].weight,
    0
  )
  const weightedAverage = totalWeightedScore / totalWeight

  // Alerta: Matemática abaixo do threshold relativo à média das demais
  const otherKeys = subjectKeys.filter((k) => k !== "math")
  const otherWeightedAvg =
    otherKeys.reduce((acc, k) => acc + subjectScores[k] * SUBJECTS[k].weight, 0) /
    otherKeys.reduce((acc, k) => acc + SUBJECTS[k].weight, 0)

  const mathAlertActive =
    otherWeightedAvg > 0 &&
    subjectScores.math < otherWeightedAvg * MATH_ALERT_THRESHOLD

  const radarData: RadarPoint[] = subjectKeys.map((k) => ({
    subject: SUBJECTS[k].labelShort,
    score: Math.round(subjectScores[k] * 100),
    fullMark: 100,
    weight: SUBJECTS[k].weight,
  }))

  return { subjectScores, weightedAverage, mathAlertActive, radarData }
}

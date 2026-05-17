import type {
  SubjectAdaptState,
  DifficultyLevel,
  AnswerResult,
} from "@/types/quiz"
import type { SubjectKey } from "@/config/ufg-weights"
import { SUBJECTS } from "@/config/ufg-weights"
import { BASE_XP_PER_QUESTION } from "@/config/ufg-weights"

const CORRECT_STREAK_TO_LEVEL_UP = 3
const WRONG_STREAK_TO_LEVEL_DOWN = 2
const ELITE_LEVEL_LOCK_STREAK = 4
const MIN_DIFFICULTY: DifficultyLevel = 2
const MAX_DIFFICULTY: DifficultyLevel = 5

export function buildInitialAdaptState(subject: SubjectKey): SubjectAdaptState {
  return {
    subject,
    currentDifficulty: 3,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    accuracy: 0,
  }
}

export function applyAnswerResult(
  state: SubjectAdaptState,
  result: AnswerResult
): SubjectAdaptState {
  if (result === "skipped") {
    return { ...state, consecutiveCorrect: 0, consecutiveWrong: 0 }
  }

  const isCorrect = result === "correct"
  const newTotalAttempted = state.totalAttempted + 1
  const newTotalCorrect = state.totalCorrect + (isCorrect ? 1 : 0)

  const newConsecCorrect = isCorrect ? state.consecutiveCorrect + 1 : 0
  const newConsecWrong = !isCorrect ? state.consecutiveWrong + 1 : 0

  const lockStreak =
    state.currentDifficulty === 5 ? ELITE_LEVEL_LOCK_STREAK : CORRECT_STREAK_TO_LEVEL_UP

  let newDifficulty = state.currentDifficulty

  if (isCorrect && newConsecCorrect >= lockStreak) {
    newDifficulty = Math.min(MAX_DIFFICULTY, state.currentDifficulty + 1) as DifficultyLevel
  } else if (!isCorrect && newConsecWrong >= WRONG_STREAK_TO_LEVEL_DOWN) {
    newDifficulty = Math.max(MIN_DIFFICULTY, state.currentDifficulty - 1) as DifficultyLevel
  }

  const levelChanged = newDifficulty !== state.currentDifficulty

  return {
    subject: state.subject,
    currentDifficulty: newDifficulty,
    consecutiveCorrect: levelChanged ? 0 : newConsecCorrect,
    consecutiveWrong: levelChanged ? 0 : newConsecWrong,
    totalAttempted: newTotalAttempted,
    totalCorrect: newTotalCorrect,
    accuracy: newTotalCorrect / newTotalAttempted,
  }
}

export function getFeedbackMessage(
  result: AnswerResult,
  prevDifficulty: DifficultyLevel,
  newDifficulty: DifficultyLevel
): string {
  if (result === "correct") {
    if (newDifficulty > prevDifficulty) {
      const levelNames: Record<DifficultyLevel, string> = {
        1: "Fundamentos",
        2: "ENEM Médio",
        3: "ENEM Difícil / UFG",
        4: "UNICAMP / UFG Elite",
        5: "ITA / IME",
      }
      return `Nível desbloqueado → ${levelNames[newDifficulty]}`
    }
    return "Resolução correta."
  }

  if (result === "wrong") {
    if (newDifficulty < prevDifficulty) {
      return "Dificuldade ajustada — consolide o conceito"
    }
    return "Erro de lógica identificado"
  }

  return ""
}

export function calcBonusXpForDifficulty(difficulty: DifficultyLevel): number {
  const bonusMap: Record<DifficultyLevel, number> = {
    1: 1.0,
    2: 1.2,
    3: 1.5,
    4: 2.0,
    5: 3.0,
  }
  return bonusMap[difficulty]
}

export function calcQuestionXp(subject: SubjectKey, correct: number): number {
  return correct * SUBJECTS[subject].xpMultiplier * BASE_XP_PER_QUESTION
}

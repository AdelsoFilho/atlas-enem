"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  SubjectAdaptState,
  AttemptRecord,
  QuizSession,
  DifficultyLevel,
} from "@/types/quiz"
import type { SubjectKey } from "@/config/ufg-weights"
import { SUBJECTS } from "@/config/ufg-weights"
import {
  buildInitialAdaptState,
  applyAnswerResult,
  calcBonusXpForDifficulty,
} from "./engine"
import { calcQuestionXp } from "@/hooks/useGamification"
import { useGamificationStore } from "@/store/gamification-store"

function buildInitialAdaptMap(): Record<SubjectKey, SubjectAdaptState> {
  return Object.fromEntries(
    (Object.keys(SUBJECTS) as SubjectKey[]).map((k) => [
      k,
      buildInitialAdaptState(k),
    ])
  ) as Record<SubjectKey, SubjectAdaptState>
}

interface QuizStoreState {
  adaptStates: Record<SubjectKey, SubjectAdaptState>
  currentSession: QuizSession | null
  sessionHistory: QuizSession[]
}

interface QuizStoreActions {
  startSession: (source: QuizSession["source"]) => QuizSession
  recordAttempt: (
    questionId: string,
    subject: SubjectKey,
    difficulty: DifficultyLevel,
    selectedKey: string | null,
    isCorrect: boolean,
    timeSpentMs: number
  ) => AttemptRecord
  closeSession: () => void
  getAdaptState: (subject: SubjectKey) => SubjectAdaptState
  resetAdaptation: () => void
}

type QuizStore = QuizStoreState & QuizStoreActions

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      adaptStates: buildInitialAdaptMap(),
      currentSession: null,
      sessionHistory: [],

      startSession: (source) => {
        const session: QuizSession = {
          id: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          completedAt: null,
          attempts: [],
          xpEarned: 0,
          source,
        }
        set({ currentSession: session })
        return session
      },

      recordAttempt: (questionId, subject, difficulty, selectedKey, isCorrect, timeSpentMs) => {
        const result = selectedKey === null ? "skipped" : isCorrect ? "correct" : "wrong"

        const attempt: AttemptRecord = {
          questionId,
          subject,
          difficulty,
          result,
          timeSpentMs,
          selectedKey,
          attemptedAt: new Date().toISOString(),
        }

        set((state) => {
          const prevAdapt = state.adaptStates[subject]
          const newAdapt = applyAnswerResult(prevAdapt, result)

          // XP com bônus de dificuldade
          const baseXp = isCorrect ? calcQuestionXp(subject, 1) : 0
          const bonusMultiplier = calcBonusXpForDifficulty(difficulty)
          const xpEarned = Math.round(baseXp * bonusMultiplier)

          // Registra XP na store principal de gamificação
          if (xpEarned > 0) {
            useGamificationStore
              .getState()
              .submitQuestionSession(subject, 1, isCorrect ? 1 : 0)
          }

          return {
            adaptStates: { ...state.adaptStates, [subject]: newAdapt },
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  attempts: [...state.currentSession.attempts, attempt],
                  xpEarned: state.currentSession.xpEarned + xpEarned,
                }
              : state.currentSession,
          }
        })

        return attempt
      },

      closeSession: () => {
        set((state) => {
          if (!state.currentSession) return {}
          const closed: QuizSession = {
            ...state.currentSession,
            completedAt: new Date().toISOString(),
          }
          return {
            currentSession: null,
            sessionHistory: [closed, ...state.sessionHistory].slice(0, 50), // manter 50 sessões
          }
        })
      },

      getAdaptState: (subject) => get().adaptStates[subject],

      resetAdaptation: () => set({ adaptStates: buildInitialAdaptMap() }),
    }),
    {
      name: "atlas-quiz-adapt-v1",
      partialize: (state) => ({
        adaptStates: state.adaptStates,
        sessionHistory: state.sessionHistory,
      }),
    }
  )
)

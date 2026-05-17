"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { format } from "date-fns"
import {
  calcQuestionXp,
  calcWritingXp,
  calcPlayerProfile,
} from "@/hooks/useGamification"
import { SUBJECTS, type SubjectKey } from "@/config/ufg-weights"
import type {
  AppState,
  QuestionSession,
  DailyWriting,
  SubjectPerformance,
  StreakData,
} from "@/types"

const today = () => format(new Date(), "yyyy-MM-dd")

function buildEmptyPerformance(subject: SubjectKey): SubjectPerformance {
  return {
    subject,
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    rawScore: 0,
    weightedScore: 0,
    xpEarned: 0,
  }
}

function buildInitialPerformances(): Record<SubjectKey, SubjectPerformance> {
  return Object.fromEntries(
    (Object.keys(SUBJECTS) as SubjectKey[]).map((k) => [
      k,
      buildEmptyPerformance(k),
    ])
  ) as Record<SubjectKey, SubjectPerformance>
}

interface GamificationActions {
  submitQuestionSession: (
    subject: SubjectKey,
    totalQuestions: number,
    correctAnswers: number
  ) => QuestionSession

  submitDailyWriting: (
    theme: string,
    content: string
  ) => DailyWriting

  getTodayWriting: () => DailyWriting | undefined

  resetAllData: () => void
}

type GamificationStore = AppState & GamificationActions

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      // ─── Estado inicial ────────────────────────────────────────────────
      sessions: [],
      writings: [],
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastWritingDate: null,
        isAtRisk: true,
      },
      subjectPerformance: buildInitialPerformances(),
      player: calcPlayerProfile(0),
      dailyProgress: {
        date: today(),
        writingCompleted: false,
        totalXpToday: 0,
        sessionsCompleted: 0,
        dailyGoalPercent: 0,
      },

      // ─── Submeter sessão de questões ──────────────────────────────────
      submitQuestionSession: (subject, totalQuestions, correctAnswers) => {
        const xpEarned = calcQuestionXp(subject, correctAnswers)
        const session: QuestionSession = {
          id: crypto.randomUUID(),
          subject,
          totalQuestions,
          correctAnswers,
          xpEarned,
          completedAt: new Date().toISOString(),
        }

        set((state) => {
          const prev = state.subjectPerformance[subject]
          const newTotal = prev.totalQuestions + totalQuestions
          const newCorrect = prev.correctAnswers + correctAnswers
          const updatedPerf: SubjectPerformance = {
            ...prev,
            totalQuestions: newTotal,
            correctAnswers: newCorrect,
            accuracy: newTotal > 0 ? newCorrect / newTotal : 0,
            rawScore: newCorrect,
            weightedScore: newCorrect * SUBJECTS[subject].weight,
            xpEarned: prev.xpEarned + xpEarned,
          }

          const newTotalXp = state.player.totalXp + xpEarned
          const todayStr = today()
          const isToday = state.dailyProgress.date === todayStr

          return {
            sessions: [...state.sessions, session],
            subjectPerformance: {
              ...state.subjectPerformance,
              [subject]: updatedPerf,
            },
            player: calcPlayerProfile(newTotalXp),
            dailyProgress: {
              ...state.dailyProgress,
              date: todayStr,
              totalXpToday: isToday
                ? state.dailyProgress.totalXpToday + xpEarned
                : xpEarned,
              sessionsCompleted: isToday
                ? state.dailyProgress.sessionsCompleted + 1
                : 1,
            },
          }
        })

        return session
      },

      // ─── Submeter redação diária ───────────────────────────────────────
      submitDailyWriting: (theme, content) => {
        const state = get()
        const todayStr = today()
        const xpEarned = calcWritingXp(state.streak.currentStreak)

        // Calcula novo streak
        const last = state.streak.lastWritingDate
        const isConsecutive =
          last === format(new Date(Date.now() - 86400000), "yyyy-MM-dd")
        const newStreak = last === todayStr
          ? state.streak.currentStreak // já escreveu hoje, não incrementa
          : isConsecutive
            ? state.streak.currentStreak + 1
            : 1

        const writing: DailyWriting = {
          date: todayStr,
          theme,
          content,
          wordCount: content.trim().split(/\s+/).filter(Boolean).length,
          status: "submitted",
          xpEarned,
          submittedAt: new Date().toISOString(),
          // TODO: integrar com API de IA para correção automática
          // Conectar em /api/ai-writing-review — enviar `content` + `theme`
          // Resposta esperada: { competencias: number[], nota: number, feedback: string }
          aiReviewRequested: false,
        }

        set((state) => {
          const newTotalXp = state.player.totalXp + xpEarned
          const newStreak2: StreakData = {
            currentStreak: newStreak,
            longestStreak: Math.max(state.streak.longestStreak, newStreak),
            lastWritingDate: todayStr,
            isAtRisk: false,
          }

          // Filtra escritas do dia para não duplicar
          const otherWritings = state.writings.filter(
            (w) => w.date !== todayStr
          )

          return {
            writings: [...otherWritings, writing],
            streak: newStreak2,
            player: calcPlayerProfile(newTotalXp),
            subjectPerformance: {
              ...state.subjectPerformance,
              writing: {
                ...state.subjectPerformance.writing,
                xpEarned: state.subjectPerformance.writing.xpEarned + xpEarned,
              },
            },
            dailyProgress: {
              ...state.dailyProgress,
              date: todayStr,
              writingCompleted: true,
              totalXpToday: state.dailyProgress.totalXpToday + xpEarned,
              dailyGoalPercent: 100, // dia desbloqueado
            },
          }
        })

        return writing
      },

      getTodayWriting: () => {
        return get().writings.find((w) => w.date === today())
      },

      resetAllData: () => {
        set({
          sessions: [],
          writings: [],
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastWritingDate: null,
            isAtRisk: true,
          },
          subjectPerformance: buildInitialPerformances(),
          player: calcPlayerProfile(0),
          dailyProgress: {
            date: today(),
            writingCompleted: false,
            totalXpToday: 0,
            sessionsCompleted: 0,
            dailyGoalPercent: 0,
          },
        })
      },
    }),
    {
      name: "atlas-enem-ufg-v1", // chave no LocalStorage
      partialize: (state) => ({
        sessions: state.sessions,
        writings: state.writings,
        streak: state.streak,
        subjectPerformance: state.subjectPerformance,
        player: state.player,
        dailyProgress: state.dailyProgress,
      }),
    }
  )
)

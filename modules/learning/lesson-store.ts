"use client"

import { create } from "zustand"
import type { MicroLesson, LessonScreen, QuizPhase, AttemptState } from "./types"
import { useGamificationStore } from "@/store/gamification-store"

interface LessonStoreState {
  lesson: MicroLesson | null
  screen: LessonScreen
  quiz: QuizPhase
  isGenerating: boolean
  generationError: string | null
  sessionXp: number
}

interface LessonStoreActions {
  loadLesson: (lesson: MicroLesson) => void
  setGenerating: (v: boolean, error?: string) => void
  advanceTo: (screen: LessonScreen) => void

  // Quiz actions
  selectAnswer: (key: "A" | "B" | "C" | "D" | "E") => void
  submitAnswer: () => void        // avalia a resposta selecionada
  unlockAndRetry: () => void      // após ler o feedback de erro
  advanceToNextQuestion: () => void

  reset: () => void
}

const initialQuiz: QuizPhase = {
  currentIdx: 0,
  selectedAnswer: null,
  attemptState: "idle",
  errorMessage: null,
  conceptToReview: null,
  attemptsPerQuestion: [],
  correctCount: 0,
}

type LessonStore = LessonStoreState & LessonStoreActions

export const useLessonStore = create<LessonStore>()((set, get) => ({
  lesson: null,
  screen: "theory",
  quiz: initialQuiz,
  isGenerating: false,
  generationError: null,
  sessionXp: 0,

  loadLesson: (lesson) =>
    set({ lesson, screen: "theory", quiz: initialQuiz, sessionXp: 0 }),

  setGenerating: (v, error) =>
    set({ isGenerating: v, generationError: error ?? null }),

  advanceTo: (screen) => set({ screen }),

  selectAnswer: (key) =>
    set((state) => ({
      quiz: { ...state.quiz, selectedAnswer: key },
    })),

  submitAnswer: () => {
    const { lesson, quiz } = get()
    if (!lesson || !quiz.selectedAnswer || quiz.attemptState !== "idle") return

    const question = lesson.questions[quiz.currentIdx]
    const isCorrect = quiz.selectedAnswer === question.correctKey

    // Rastreia tentativas por questão
    const attempts = [...quiz.attemptsPerQuestion]
    attempts[quiz.currentIdx] = (attempts[quiz.currentIdx] ?? 0) + 1

    if (isCorrect) {
      const newCorrect = quiz.correctCount + 1
      const isLast = quiz.currentIdx === lesson.questions.length - 1

      // Calcula XP com bônus de acerto na primeira tentativa
      const firstTry = (attempts[quiz.currentIdx] ?? 1) === 1
      const baseXp = lesson.xpReward / lesson.questions.length
      const xpEarned = Math.round(firstTry ? baseXp * 1.5 : baseXp)

      set((state) => ({
        quiz: {
          ...state.quiz,
          selectedAnswer: quiz.selectedAnswer,
          attemptState: "correct" as AttemptState,
          attemptsPerQuestion: attempts,
          correctCount: newCorrect,
        },
        sessionXp: state.sessionXp + xpEarned,
        screen: isLast ? "completed" : state.screen,
      }))

      // Registra na store de gamificação
      if (xpEarned > 0) {
        useGamificationStore
          .getState()
          .submitQuestionSession(lesson.subject, 1, 1)
      }
    } else {
      // Erro: bloqueia o avanço
      set({
        quiz: {
          ...quiz,
          attemptState: "error-locked" as AttemptState,
          errorMessage: question.errorFeedback,
          conceptToReview: question.conceptToReview,
          attemptsPerQuestion: attempts,
        },
      })
    }
  },

  unlockAndRetry: () =>
    set((state) => ({
      quiz: {
        ...state.quiz,
        selectedAnswer: null,
        attemptState: "idle" as AttemptState,
        // NÃO limpa errorMessage — fica visível como lembrete
      },
    })),

  advanceToNextQuestion: () =>
    set((state) => ({
      quiz: {
        ...state.quiz,
        currentIdx: state.quiz.currentIdx + 1,
        selectedAnswer: null,
        attemptState: "idle" as AttemptState,
        errorMessage: null,
        conceptToReview: null,
      },
    })),

  reset: () =>
    set({
      lesson: null,
      screen: "theory",
      quiz: initialQuiz,
      isGenerating: false,
      generationError: null,
      sessionXp: 0,
    }),
}))

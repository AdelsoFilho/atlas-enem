"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { format } from "date-fns"
import type {
  EssayCorrectionResult,
  EssayMode,
  CorrectionStatus,
} from "./types"

interface EssayStoreState {
  // Editor
  content: string
  wordCount: number
  mode: EssayMode

  // Tema pré-selecionado (passado pela grade de temas, não persiste)
  pendingTheme: string | null

  // Correção
  correctionStatus: CorrectionStatus
  correctionResult: EssayCorrectionResult | null
  correctionError: string | null
  lastCorrectedAt: string | null

  // Histórico de redações corrigidas (últimas 10)
  history: {
    date: string
    excerpt: string
    notaTotal: number
    nivel: string
  }[]
}

interface EssayStoreActions {
  setContent: (text: string) => void
  setMode: (mode: EssayMode) => void
  setPendingTheme: (theme: string | null) => void
  startCorrection: () => void
  setResult: (result: EssayCorrectionResult) => void
  setCorrectionError: (msg: string) => void
  clearCorrection: () => void
  resetHistory: () => void
}

type EssayStore = EssayStoreState & EssayStoreActions

export const useEssayStore = create<EssayStore>()(
  persist(
    (set, get) => ({
      content: "",
      wordCount: 0,
      mode: "editor",
      pendingTheme: null,
      correctionStatus: "idle",
      correctionResult: null,
      correctionError: null,
      lastCorrectedAt: null,
      history: [],

      setContent: (text) =>
        set({
          content: text,
          wordCount: text.trim().split(/\s+/).filter(Boolean).length,
        }),

      setMode: (mode) => set({ mode }),
      setPendingTheme: (theme) => set({ pendingTheme: theme }),

      startCorrection: () =>
        set({ correctionStatus: "loading", correctionError: null }),

      setResult: (result) => {
        const { content, history } = get()
        const excerpt = content.trim().slice(0, 80) + "..."
        const newEntry = {
          date: format(new Date(), "yyyy-MM-dd HH:mm"),
          excerpt,
          notaTotal: result.notaTotal,
          nivel: result.nivel,
        }
        set({
          correctionStatus: "completed",
          correctionResult: result,
          lastCorrectedAt: new Date().toISOString(),
          history: [newEntry, ...history].slice(0, 10),
        })
      },

      setCorrectionError: (msg) =>
        set({ correctionStatus: "error", correctionError: msg }),

      clearCorrection: () =>
        set({
          correctionStatus: "idle",
          correctionResult: null,
          correctionError: null,
        }),

      resetHistory: () =>
        set({ history: [] }),
    }),
    {
      name: "atlas-essay-v1",
      partialize: (s) => ({ history: s.history }),
    }
  )
)

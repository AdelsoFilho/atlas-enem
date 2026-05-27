import type { EssayCorrectionResult } from "./types"

// ── Viabilidade do negócio ────────────────────────────────────────────────────

export type ViabilityLevel = "Inviável" | "Possível" | "Viável" | "Excelente"

export interface BusinessViabilityResult {
  score: number           // 0-100
  nivel: ViabilityLevel
  pontosFavoraveis: string[]
  alertas: string[]
  custo_realista: boolean
  escalabilidade: boolean
  impacto_social: boolean
  feedbackGeral: string
}

// ── Resultado híbrido ─────────────────────────────────────────────────────────

export interface BusinessEssayCorrectionResult extends EssayCorrectionResult {
  viabilidade: BusinessViabilityResult
  badge_empreendedor_social: boolean
}

// ── Tese gerada pela IA ───────────────────────────────────────────────────────

export interface GeneratedThesis {
  angle: string   // "Econômico" | "Social" | "Inovação"
  text: string
}

export interface ThesisGeneratorResult {
  theses: GeneratedThesis[]
}

// ── Estado do editor guiado ───────────────────────────────────────────────────

export type BusinessEditorStep =
  | "select-idea"
  | "generate-thesis"
  | "write-essay"
  | "result"

// Cores por nível de viabilidade
export const VIABILITY_COLOR: Record<ViabilityLevel, string> = {
  "Inviável":   "#f87171",
  "Possível":   "#fbbf24",
  "Viável":     "#34d399",
  "Excelente":  "#38bdf8",
}

export const VIABILITY_BG: Record<ViabilityLevel, string> = {
  "Inviável":   "bg-red-950/30 border-red-800/40",
  "Possível":   "bg-yellow-950/30 border-yellow-800/40",
  "Viável":     "bg-emerald-950/30 border-emerald-800/40",
  "Excelente":  "bg-sky-950/30 border-sky-800/40",
}

// Pesos oficiais UFG - base de toda a lógica de XP e priorização
// Fonte: Sistema de Seleção Unificada UFG (SISU/UFG)

export type SubjectKey =
  | "math"
  | "languages"
  | "writing"
  | "humanities"
  | "sciences"

export interface SubjectConfig {
  key: SubjectKey
  label: string
  labelShort: string
  weight: number          // peso UFG oficial
  xpMultiplier: number    // = peso (XP_Ganho = corretas * xpMultiplier * BASE_XP)
  colorToken: string      // token Tailwind
  priority: "max" | "high" | "normal"
  dailyRequired: boolean  // se true, bloqueia conclusão do dia sem submissão
  description: string
}

export const SUBJECTS: Record<SubjectKey, SubjectConfig> = {
  math: {
    key: "math",
    label: "Matemática e suas Tecnologias",
    labelShort: "Matemática",
    weight: 4.0,
    xpMultiplier: 4.0,
    colorToken: "math",
    priority: "max",
    dailyRequired: false,
    description: "Prioridade máxima UFG — cada questão vale 4× mais XP",
  },
  languages: {
    key: "languages",
    label: "Linguagens, Códigos e suas Tecnologias",
    labelShort: "Linguagens",
    weight: 2.0,
    xpMultiplier: 2.0,
    colorToken: "languages",
    priority: "high",
    dailyRequired: false,
    description: "Inclui inglês — peso igual à Redação",
  },
  writing: {
    key: "writing",
    label: "Prova de Redação",
    labelShort: "Redação",
    weight: 2.0,
    xpMultiplier: 2.0,
    colorToken: "writing",
    priority: "high",
    dailyRequired: true,  // OBRIGATÓRIO — barra diária não zera sem redação
    description: "Obrigatório diário — não completar zera o streak e a barra do dia",
  },
  humanities: {
    key: "humanities",
    label: "Ciências Humanas e suas Tecnologias",
    labelShort: "Humanas",
    weight: 1.0,
    xpMultiplier: 1.0,
    colorToken: "humanities",
    priority: "normal",
    dailyRequired: false,
    description: "História, Geografia, Filosofia, Sociologia",
  },
  sciences: {
    key: "sciences",
    label: "Ciências da Natureza e suas Tecnologias",
    labelShort: "Ciências",
    weight: 1.0,
    xpMultiplier: 1.0,
    colorToken: "sciences",
    priority: "normal",
    dailyRequired: false,
    description: "Física, Química, Biologia",
  },
}

// XP base por questão correta (antes do multiplicador de peso)
export const BASE_XP_PER_QUESTION = 10

// XP base para uma redação submetida (antes do multiplicador)
export const BASE_XP_PER_WRITING = 50

// Thresholds de nível — progressão logarítmica para não trivializar
export const LEVEL_THRESHOLDS: number[] = [
  0,      // Nível 1  — Recruta
  500,    // Nível 2  — Cadete
  1200,   // Nível 3  — Aspirante
  2500,   // Nível 4  — Tenente
  4500,   // Nível 5  — Capitão
  7500,   // Nível 6  — Major
  12000,  // Nível 7  — Coronel
  18000,  // Nível 8  — General
  27000,  // Nível 9  — Almirante
  40000,  // Nível 10 — Comandante UFG
]

export const LEVEL_NAMES: string[] = [
  "Recruta",
  "Cadete",
  "Aspirante",
  "Tenente",
  "Capitão",
  "Major",
  "Coronel",
  "General",
  "Almirante",
  "Comandante UFG",
]

// Peso total (soma) — usado para calcular média ponderada do desempenho
export const TOTAL_WEIGHT = Object.values(SUBJECTS).reduce(
  (acc, s) => acc + s.weight,
  0
) // = 10.0

// Threshold de alerta: Matemática abaixo deste percentual relativo às outras dispara alerta
export const MATH_ALERT_THRESHOLD = 0.7 // 70% da média ponderada das outras matérias

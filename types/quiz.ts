import type { SubjectKey } from "@/config/ufg-weights"

// ─── Metadados de validação matemática ───────────────────────────────────────
// Usados pelo ValidatorEngine para resolução simbólica independente

export interface LogValidationMeta {
  type: "log"
  base: number
  // Coeficientes do argumento quadrático: a·x² + b·x + c
  argCoeffs: [number, number, number]
  // Valor do lado direito: log_base(f(x)) = result
  result: number
}

export interface QuadraticValidationMeta {
  type: "quadratic"
  a: number
  b: number
  c: number   // a·x² + b·x + c = rhs
  rhs: number
}

export type ValidationMeta =
  | LogValidationMeta
  | QuadraticValidationMeta
  | { type: "skip" }  // questão de tipo não suportado — não bloqueia

// ─── Questão ──────────────────────────────────────────────────────────────────

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5
// 1 = Fundamentos  2 = ENEM médio  3 = ENEM difícil / UFG
// 4 = UNICAMP / UFG elite  5 = ITA / IME

export type QuestionSource = "ENEM" | "UFG" | "ITA" | "IME" | "UNICAMP" | "ATLAS"

export interface QuestionOption {
  key: "A" | "B" | "C" | "D" | "E"
  text: string
}

export interface Question {
  id: string
  source: QuestionSource
  year: number
  subject: SubjectKey
  topic: string
  difficulty: DifficultyLevel
  statement: string
  options: QuestionOption[]
  correctKey: "A" | "B" | "C" | "D" | "E"
  // Explicação focada na LÓGICA de resolução, não na teoria básica
  logicExplanation: string
  // Passos da cadeia de raciocínio
  logicSteps: string[]
  // Conceito pontual que o erro revela (usado no feedback)
  errorConcept: string
  requiresReasoning: boolean
  tags: string[]
  // Campo opcional — quando presente, o ValidatorEngine resolve a questão do zero
  // e compara com o gabarito antes de exibir ao usuário
  validationMeta?: ValidationMeta
}

// ─── Estado do quiz adaptativo ────────────────────────────────────────────────

export interface SubjectAdaptState {
  subject: SubjectKey
  currentDifficulty: DifficultyLevel
  consecutiveCorrect: number
  consecutiveWrong: number
  totalAttempted: number
  totalCorrect: number
  accuracy: number
}

export type AnswerResult = "correct" | "wrong" | "skipped"

export interface AttemptRecord {
  questionId: string
  subject: SubjectKey
  difficulty: DifficultyLevel
  result: AnswerResult
  timeSpentMs: number
  selectedKey: string | null
  attemptedAt: string
}

export interface QuizSession {
  id: string
  startedAt: string
  completedAt: string | null
  attempts: AttemptRecord[]
  xpEarned: number
  source: "daily-drop" | "free-practice"
}

// ─── Daily Drop ───────────────────────────────────────────────────────────────

export interface DailyDrop {
  date: string
  questions: Question[]  // sempre 10: 5 math, 2 lang, 1 hum, 1 sci, 1 redação-tema
  completed: boolean
  score: number | null   // 0–10
}

// ─── Citação de Elite ─────────────────────────────────────────────────────────

export type QuoteDiscipline =
  | "philosophy"
  | "sociology"
  | "economics"
  | "science"
  | "literature"

export interface EliteQuote {
  id: string
  text: string
  author: string
  work: string
  year: number
  discipline: QuoteDiscipline
  applicableThemes: string[]
  usageContext: string         // Como encaixar na redação ENEM
  modelParagraph: string       // Parágrafo modelo pronto para adaptar
}

export interface DailyQuotes {
  date: string
  quotes: EliteQuote[]   // sempre 3
}

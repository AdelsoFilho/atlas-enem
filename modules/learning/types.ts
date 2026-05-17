import type { SubjectKey } from "@/config/ufg-weights"

// ─── Conteúdo da micro-aula ───────────────────────────────────────────────────

export interface KeyPoint {
  label: string    // título do ponto
  detail: string   // explicação densa — sem enrolação
}

export interface TheoryContent {
  title: string
  conceptSummary: string          // 1 frase: o que é e por que importa no ENEM
  keyPoints: KeyPoint[]           // 3-5 pontos, lista densa
  formula?: { notation: string; label: string }
  memoryTrick?: string            // macete mnemônico ou padrão de reconhecimento
  applicationNote: string         // como esse conceito aparece em questões de prova
}

export interface ExampleStep {
  step: number
  label: string
  content: string
  insight?: string                // destaque: o "por quê" lógico do passo
}

export interface WorkedExample {
  statement: string
  steps: ExampleStep[]
  finalInsight: string            // o padrão generalizável desta solução
  commonTrap: string              // o erro que a maioria comete aqui
}

export interface LessonQuestion {
  id: string
  statement: string
  options: { key: "A" | "B" | "C" | "D" | "E"; text: string }[]
  correctKey: "A" | "B" | "C" | "D" | "E"
  // Feedback preciso — não genérico. "Você assumiu X, mas o enunciado não diz X."
  errorFeedback: string
  // O que retestar após o erro — aponta de volta para o KeyPoint específico
  conceptToReview: string
  correctFeedback: string
  difficulty: 1 | 2 | 3
}

export interface MicroLesson {
  id: string
  subject: SubjectKey
  topic: string
  subtopic?: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  tags: string[]
  theory: TheoryContent
  example: WorkedExample
  questions: LessonQuestion[]    // 3–5 questões em dificuldade crescente
  xpReward: number
  aiGenerated?: boolean
}

// ─── Estado do quiz ───────────────────────────────────────────────────────────

export type LessonScreen = "theory" | "example" | "quiz" | "completed"
export type AttemptState = "idle" | "correct" | "error-locked"

export interface QuizPhase {
  currentIdx: number
  selectedAnswer: "A" | "B" | "C" | "D" | "E" | null
  attemptState: AttemptState
  errorMessage: string | null
  conceptToReview: string | null
  // track por questão: quantas tentativas foram necessárias
  attemptsPerQuestion: number[]
  correctCount: number
}

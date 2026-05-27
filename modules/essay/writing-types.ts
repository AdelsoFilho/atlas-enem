// ══════════════════════════════════════════════════════════════════════════════
// Tipos do módulo "Do Zero ao 1000" — Redação Progressiva
// ══════════════════════════════════════════════════════════════════════════════

// ── Skill Tree ────────────────────────────────────────────────────────────────

export type LessonType =
  | "theory"
  | "thesis_builder"
  | "paragraph_puzzle"
  | "connector_fill"
  | "intervention_builder"
  | "multiple_choice"
  | "full_essay"

export type LessonStatus = "not_started" | "in_progress" | "completed" | "locked"

export interface SkillLesson {
  id: string                    // lesson_id  (e.g. "L0_teoria")
  levelNumber: number           // 0-5
  levelName: string
  lessonOrder: number
  lessonType: LessonType
  title: string
  instructions: string
  exerciseData: unknown         // structure depends on lessonType
  requiresLesson: string | null
  minScoreToPass: number
}

export interface UserLessonProgress {
  lessonId: string
  status: LessonStatus
  score: number
  attempts: number
  lastAnswerJson: unknown
  feedbackJson: WritingStepFeedback | null
  completedAt: string | null
}

// ── Exercise Data Shapes ───────────────────────────────────────────────────────

export interface TheoryExerciseData {
  content: string               // markdown
  keyPoints: string[]
}

export interface MultipleChoiceOption {
  id: string
  text: string
  correct: boolean
  explanation: string
}

export interface MultipleChoiceExerciseData {
  theme: string
  question: string
  text?: string                 // optional passage to read before answering
  options: MultipleChoiceOption[]
}

export interface PuzzleSentence {
  id: string
  text: string
  correct_position: number
  type: "intro" | "dev1" | "dev2" | "conclusion" | "topico_frasal" | "explicacao" | "repertorio" | "fechamento"
  label: string
}

export interface ParagraphPuzzleExerciseData {
  theme: string
  instructions: string
  sentences: PuzzleSentence[]
}

export interface ConnectorSegment {
  type: "text" | "blank"
  content?: string              // type=text
  id?: string                   // type=blank
  correct?: string              // type=blank
  options?: string[]            // type=blank
  hint?: string                 // type=blank — shown if user picks wrong
}

export interface ConnectorFillExerciseData {
  theme: string
  instructions: string
  segments: ConnectorSegment[]
}

export interface ThesisBuilderExerciseData {
  theme: string
  fields: string[]              // ["contexto","tese","argumento1","argumento2"] or ["topico_frasal"]
  hints: Record<string, string>
  focus?: string                // extra instruction narrowing the task
  argument_to_develop?: string  // for single-field exercises
  example?: Record<string, string>
}

export interface InterventionBuilderExerciseData {
  theme: string
  fields: string[]              // ["agente","acao","meio","efeito","detalhamento"]
  hints: Record<string, string>
  mnemonic?: string
  flawed_proposal?: string      // for "critique" mode
  missing_elements?: string[]
  mode?: "build" | "critique"
}

export interface FullEssayExerciseData {
  theme: string
  motivation_texts: string[]
  time_limit_minutes: number
  min_words: number
  max_words: number
  checklist: string[]
}

// ── AI Evaluation ─────────────────────────────────────────────────────────────

export interface ThesisBuilderAnswer {
  contexto?: string
  tese?: string
  argumento1?: string
  argumento2?: string
  topico_frasal?: string        // single-field mode
}

export interface InterventionBuilderAnswer {
  agente: string
  acao: string
  meio: string
  efeito: string
  detalhamento: string
}

export interface WritingStepFeedback {
  score: number                 // 0-100
  passed: boolean               // score >= minScoreToPass
  mainError: string | null      // the ONE thing to fix right now (null if good)
  strengths: string[]
  corrections: string[]
  rewriteSuggestion: string | null   // how it should look if score < 70
  encouragement: string         // short motivational line (never condescending)
}

// ── Highlight ─────────────────────────────────────────────────────────────────

export type HighlightType =
  | "topico_frasal"     // green
  | "repertorio"        // blue
  | "conectivo"         // yellow
  | "argumento_falho"   // red
  | "fuga_tema"         // red dashed

export interface TextHighlight {
  start: number
  end: number
  type: HighlightType
  tooltip: string
}

export interface EssayHighlightResult {
  highlights: TextHighlight[]
  summary: {
    hasTopicSentences: boolean
    hasRepertoire: boolean
    hasConnectors: boolean
    structureBalance: "balanced" | "intro_heavy" | "dev_missing" | "no_conclusion"
    competenceEstimates: Record<1|2|3|4|5, number>  // 0-200 rough estimate
  }
}

// ── Level State ───────────────────────────────────────────────────────────────

export interface WritingLevel {
  levelNumber: number
  levelName: string
  lessons: SkillLesson[]
  status: "locked" | "in_progress" | "completed"
  completedCount: number
  totalCount: number
}

// ── Paragraph Rewrite ─────────────────────────────────────────────────────────

export interface ParagraphRewriteResult {
  improved: string
  changes: string[]             // bullet list of what changed
}

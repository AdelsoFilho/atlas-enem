import type { SubjectKey } from "@/config/ufg-weights"

// ─── Sessão de questões ───────────────────────────────────────────────────────

export interface QuestionSession {
  id: string
  subject: SubjectKey
  totalQuestions: number
  correctAnswers: number
  xpEarned: number
  completedAt: string // ISO date
}

// ─── Redação ──────────────────────────────────────────────────────────────────

export type WritingStatus = "pending" | "in_progress" | "submitted" | "reviewed"

export interface DailyWriting {
  date: string         // YYYY-MM-DD
  theme: string
  content: string
  wordCount: number
  status: WritingStatus
  xpEarned: number
  submittedAt: string | null
  // Hook para futura integração com API de IA (ex: OpenAI, Gemini, API própria)
  // aiScore?: AiWritingScore
  aiReviewRequested: boolean
}

// ─── Perfil de desempenho ─────────────────────────────────────────────────────

export interface SubjectPerformance {
  subject: SubjectKey
  totalQuestions: number
  correctAnswers: number
  accuracy: number       // 0–1
  rawScore: number       // soma de corretas
  weightedScore: number  // rawScore * peso UFG
  xpEarned: number
}

// ─── Gamificação ──────────────────────────────────────────────────────────────

export interface PlayerProfile {
  totalXp: number
  level: number
  levelName: string
  xpToNextLevel: number
  xpInCurrentLevel: number
  levelProgressPercent: number  // 0–100
}

export interface DailyProgress {
  date: string
  writingCompleted: boolean
  totalXpToday: number
  sessionsCompleted: number
  dailyGoalPercent: number  // 0–100 (só atinge 100 se redação concluída)
}

export interface StreakData {
  currentStreak: number    // dias consecutivos com redação
  longestStreak: number
  lastWritingDate: string | null
  isAtRisk: boolean        // true se não escreveu ainda hoje
}

// ─── Estado global da store ───────────────────────────────────────────────────

export interface AppState {
  sessions: QuestionSession[]
  writings: DailyWriting[]
  streak: StreakData
  subjectPerformance: Record<SubjectKey, SubjectPerformance>
  player: PlayerProfile
  dailyProgress: DailyProgress
}

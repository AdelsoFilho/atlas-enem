import { format } from "date-fns"
import type { Question, DailyDrop, DifficultyLevel } from "@/types/quiz"
import type { SubjectKey } from "@/config/ufg-weights"
import { QUESTION_BANK } from "./question-bank"
import { validateQuestion } from "@/validator"

// Composição do Daily Drop — ponderada pelos pesos UFG:
// 5 Matemática (peso 4 → 50% do drop)
// 2 Linguagens (peso 2)
// 1 Humanas   (peso 1)
// 1 Ciências  (peso 1)
// Redação = tema separado via features/daily-writing
const DAILY_DROP_COMPOSITION: Partial<Record<SubjectKey, number>> = {
  math: 5,
  languages: 2,
  humanities: 1,
  sciences: 1,
}

// Seleção pseudo-aleatória determinística por data
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dateSeed(dateStr: string): number {
  return dateStr.split("-").reduce((acc, n) => acc * 31 + parseInt(n, 10), 0)
}

// ─── Estatísticas de purga (acessíveis em modo debug) ────────────────────────

export interface PurgeLog {
  questionId: string
  motivo: string
  correcaoSugerida?: string
}

export interface CurationResult {
  drop: DailyDrop
  purgeLog: PurgeLog[]
  purgeCount: number
}

// ─── Pipeline de curadoria com validação ─────────────────────────────────────

export function curateDailyDrop(
  date: string,
  difficultyMap: Partial<Record<SubjectKey, DifficultyLevel>> = {}
): CurationResult {
  const seed = dateSeed(date)
  const questions: Question[] = []
  const purgeLog: PurgeLog[] = []

  for (const [subject, count] of Object.entries(DAILY_DROP_COMPOSITION) as [SubjectKey, number][]) {
    const minDiff = Math.max(1, (difficultyMap[subject] ?? 3) - 1) as DifficultyLevel

    const pool = QUESTION_BANK.filter(
      (q) =>
        q.subject === subject &&
        q.requiresReasoning &&
        q.difficulty >= minDiff
    )

    const shuffled = seededShuffle(pool, seed + subject.charCodeAt(0))

    let added = 0
    for (const question of shuffled) {
      if (added >= count) break

      // ── Error-Shield: Pipeline de Validação ───────────────────────────────
      const validation = validateQuestion(question)

      if (validation.status === "INVALID") {
        // Questão corrompida — purga silenciosa + log para admin
        purgeLog.push({
          questionId: question.id,
          motivo: validation.motivo ?? "Inconsistência não especificada",
          correcaoSugerida: validation.correcaoSugerida,
        })
        // Continua para a próxima questão do pool
        continue
      }

      // VALID ou UNCHECKED — questão aprovada para exibição
      questions.push(question)
      added++
    }
  }

  return {
    drop: {
      date,
      questions,
      completed: false,
      score: null,
    },
    purgeLog,
    purgeCount: purgeLog.length,
  }
}

export function getTodayDrop(
  difficultyMap?: Partial<Record<SubjectKey, DifficultyLevel>>
): DailyDrop {
  const today = format(new Date(), "yyyy-MM-dd")

  // TODO: persistir no Supabase para sincronização multi-dispositivo
  // const cached = await supabase.from("daily_drops").select().eq("date", today).single()
  // if (cached.data) return cached.data

  const { drop } = curateDailyDrop(today, difficultyMap)
  return drop
}

// Versão com log completo — para modo admin/debug
export function getTodayDropWithLog(
  difficultyMap?: Partial<Record<SubjectKey, DifficultyLevel>>
): CurationResult {
  const today = format(new Date(), "yyyy-MM-dd")
  return curateDailyDrop(today, difficultyMap)
}

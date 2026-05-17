"use client"

import { useMemo } from "react"
import { AdaptiveQuiz } from "@/adaptive-quiz/AdaptiveQuiz"
import { QuoteCard } from "@/quote-generator/QuoteCard"
import { getDailyQuotes } from "@/quote-generator"
import { getTodayDrop } from "@/daily-engine"
import { useQuizStore } from "@/adaptive-quiz/QuizStore"
import { SUBJECTS, type SubjectKey } from "@/config/ufg-weights"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { XpBadge } from "@/components/ui/xp-badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import {
  ArrowLeft,
  Crosshair,
  BookMarked,
  FlameKindling,
  BarChart2,
} from "lucide-react"

export default function DailyDropPage() {
  const { adaptStates } = useQuizStore()

  const difficultyMap = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(adaptStates) as SubjectKey[]).map((k) => [
          k,
          adaptStates[k].currentDifficulty,
        ])
      ) as Partial<Record<SubjectKey, 1 | 2 | 3 | 4 | 5>>,
    [adaptStates]
  )

  const drop = useMemo(() => getTodayDrop(difficultyMap), [difficultyMap])
  const { quotes } = useMemo(() => getDailyQuotes(), [])

  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

  // Resumo de composição do drop
  const composition = drop.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.subject] = (acc[q.subject] ?? 0) + 1
    return acc
  }, {})

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Nav */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-xs text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Link>
        <span className="font-mono text-xs capitalize text-muted">{today}</span>
      </div>

      {/* Header do drop */}
      <div className="mb-8 rounded-xl border border-accent/20 bg-accent-dim p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
                Daily Drop
              </span>
            </div>
            <h1 className="mt-1 font-mono text-2xl font-black text-white">
              Desafio de Hoje
            </h1>
            <p className="mt-1 font-mono text-xs text-muted">
              {drop.questions.length} questões curadas · filtro de raciocínio lógico ativo
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-muted">XP disponível</p>
            <XpBadge
              xp={drop.questions.reduce((acc, q) => acc + q.difficulty * 10, 0)}
              size="lg"
            />
          </div>
        </div>

        {/* Composição do drop */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.entries(composition) as [SubjectKey, number][]).map(([subj, count]) => (
            <span
              key={subj}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs"
            >
              <span className={`h-2 w-2 rounded-full bg-${SUBJECTS[subj].colorToken}`} />
              <span className="text-white">{SUBJECTS[subj].labelShort}</span>
              <span className="font-bold text-muted">×{count}</span>
              {subj === "math" && (
                <span className="text-math font-bold">P4</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Quiz adaptativo */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <FlameKindling className="h-4 w-4 text-math" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
              Foco Matemática — Peso 4
            </h2>
          </div>
          <AdaptiveQuiz
            questions={drop.questions}
            source="daily-drop"
          />
        </section>

        {/* Repertório de Elite */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-languages" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
              Repertório de Elite
            </h2>
            <span className="font-mono text-xs text-muted">— 3 citações do dia</span>
          </div>
          <div className="flex flex-col gap-3">
            {quotes.map((quote, i) => (
              <QuoteCard key={quote.id} quote={quote} index={i} />
            ))}
          </div>
        </section>

        {/* Link para Matriz */}
        <section>
          <Card className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-accent" />
              <div>
                <p className="font-mono text-xs font-bold text-white">
                  Verificar Matriz de Competência
                </p>
                <p className="font-mono text-[10px] text-muted">
                  Onde você está vs. onde a UFG exige (Peso 4)
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-accent/30 bg-accent-dim px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent hover:text-white transition-colors"
            >
              Ver Dashboard
            </Link>
          </Card>
        </section>
      </div>
    </main>
  )
}

"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { SUBJECTS } from "@/config/ufg-weights"
import { SYLLABUS } from "@/config/syllabus"
import { CountdownTimer } from "@/components/ui/CountdownTimer"
import type { SubjectKey } from "@/config/ufg-weights"
import type { SyllabusTopic } from "@/config/syllabus"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"

// Cores por matéria
const SUBJECT_HEX: Record<string, string> = {
  math:       "#f78166",
  languages:  "#79c0ff",
  humanities: "#a5d6a7",
  sciences:   "#ce93d8",
  writing:    "#ffd54f",
}

const DIFF_LABEL: Record<SyllabusTopic["dificuldade"], string> = {
  facil:   "Fácil",
  medio:   "Médio",
  dificil: "Difícil",
}

const DIFF_COLOR: Record<SyllabusTopic["dificuldade"], string> = {
  facil:   "text-green-400 bg-green-400/10 border-green-400/20",
  medio:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  dificil: "text-red-400  bg-red-400/10  border-red-400/20",
}

function pesoLabel(peso: number): string {
  if (peso >= 5) return "🔥 Queda alta"
  if (peso >= 4) return "⭐ Importante"
  if (peso >= 3) return "Médio"
  return "Raro"
}

// ─── Topic card ───────────────────────────────────────────────────────────────

interface TopicCardProps {
  topic:         SyllabusTopic
  subject:       string
  accentColor:   string
  stepCompleted: number
}

function TopicCard({ topic, subject, accentColor, stepCompleted }: TopicCardProps) {
  const isDone      = stepCompleted >= 4
  const inProgress  = stepCompleted > 0 && stepCompleted < 4

  return (
    <Link
      href={`/learn/${subject}/${topic.id}`}
      className={`
        group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200
        ${isDone
          ? "border-green-800/50 bg-green-900/10 hover:border-green-700/60"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800/60"
        }
      `}
    >
      {/* Status icon */}
      <div className="absolute top-3 right-3">
        {isDone ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : inProgress ? (
          <div
            className="h-4 w-4 rounded-full border-2 border-t-transparent animate-[spin_1.5s_linear_infinite]"
            style={{ borderColor: accentColor }}
          />
        ) : null}
      </div>

      <p className="text-sm font-semibold text-white pr-6 leading-snug">
        {topic.titulo}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${DIFF_COLOR[topic.dificuldade]}`}>
          {DIFF_LABEL[topic.dificuldade]}
        </span>
        <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
          {pesoLabel(topic.peso_ufg)}
        </span>
        {inProgress && (
          <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
            Etapa {stepCompleted}/4
          </span>
        )}
      </div>

      {/* Progress bar */}
      {stepCompleted > 0 && (
        <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:           `${(stepCompleted / 4) * 100}%`,
              backgroundColor: isDone ? "#22c55e" : accentColor,
            }}
          />
        </div>
      )}
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnSubjectPage() {
  const params  = useParams()
  const router  = useRouter()
  const subject = params.subject as SubjectKey

  const { user } = useAuth()

  // progressMap: topic_slug → step numérico (0-4)
  // Fonte: topic_sessions (a tabela que o sistema atual escreve)
  // Regra de agregação por tópico:
  //   - Qualquer sessão is_completed=true → step = 4
  //   - Senão: max(current_step) entre as sessões daquele tópico
  const [progressMap,   setProgressMap]   = useState<Record<string, number>>({})
  const [progressReady, setProgressReady] = useState(false)

  const subjectConfig = SUBJECTS[subject]
  const topics        = SYLLABUS[subject] ?? []
  const accentColor   = SUBJECT_HEX[subject] ?? "#388bfd"

  useEffect(() => {
    if (!subjectConfig) router.replace("/")
  }, [subjectConfig, router])

  // ── Query corrigida ──────────────────────────────────────────────────────────
  //
  // DIAGNÓSTICO DO BUG:
  // A versão anterior buscava de `user_topic_progress` (step_completed).
  // O novo sistema de sessões grava em `topic_sessions` (is_completed, current_step).
  // A tabela `user_topic_progress` pode existir mas estar desatualizada ou vazia.
  //
  // FIX: Ler diretamente de `topic_sessions`, que é a fonte-de-verdade atual.
  // Agregação por topic_slug:
  //   max(step) onde is_completed conta como step=4, senão usa current_step.

  useEffect(() => {
    if (!user || !subjectConfig) return

    supabase
      .from("topic_sessions")
      .select("topic_slug, current_step, is_completed")
      .eq("user_id", user.id)
      .eq("subject_slug", subject)
      .then(({ data, error }) => {
        if (error) {
          console.warn("[progress fetch]", error.message)
          setProgressReady(true)
          return
        }

        const rows = (data ?? []) as Array<{
          topic_slug:  string
          current_step: number
          is_completed: boolean
        }>

        // Agrega: para cada tópico, guarda o step mais alto encontrado nas suas sessões
        const map: Record<string, number> = {}
        for (const row of rows) {
          const effectiveStep = row.is_completed ? 4 : row.current_step
          const existing      = map[row.topic_slug] ?? 0
          map[row.topic_slug] = Math.max(existing, effectiveStep)
        }

        setProgressMap(map)
        setProgressReady(true)
      })
  }, [user, subject, subjectConfig])

  if (!subjectConfig) return null

  // Métricas derivadas do progressMap corrigido
  const totalTopics     = topics.length
  const completedTopics = topics.filter(t => (progressMap[t.id] ?? 0) >= 4).length
  const inProgressCount = topics.filter(t => {
    const s = progressMap[t.id] ?? 0
    return s > 0 && s < 4
  }).length
  const notStarted      = totalTopics - completedTopics - inProgressCount

  // Ordenação: em andamento primeiro → peso UFG desc → não iniciados
  const sorted = [...topics].sort((a, b) => {
    const sa = progressMap[a.id] ?? 0
    const sb = progressMap[b.id] ?? 0
    const aInProg = sa > 0 && sa < 4
    const bInProg = sb > 0 && sb < 4
    if (aInProg && !bInProg) return -1
    if (!aInProg && bInProg) return 1
    return b.peso_ufg - a.peso_ufg
  })

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header fixo ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Início</span>
          </Link>

          <span className="text-neutral-700">/</span>

          <span className="font-bold text-base" style={{ color: accentColor }}>
            {subjectConfig.labelShort}
          </span>

          {/* Progresso no header — visível após dados carregarem */}
          {progressReady && completedTopics > 0 && (
            <span className="ml-auto text-xs text-neutral-500">
              {completedTopics}/{totalTopics} concluídos
            </span>
          )}
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-6 space-y-5">

        {/* Título da matéria */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <BookOpen className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{subjectConfig.label}</h1>
            <p className="text-xs text-neutral-500">
              {totalTopics} tópicos · Peso UFG ×{subjectConfig.weight}
            </p>
          </div>
        </div>

        {/* ── Countdown ENEM ──────────────────────────────────────────────── */}
        <CountdownTimer />

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        {progressReady && totalTopics > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>
                <strong className="text-green-400">{completedTopics}</strong>
                {" "}concluídos
              </span>
            </span>

            {inProgressCount > 0 && (
              <span className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: accentColor }}
                />
                <span>
                  <strong style={{ color: accentColor }}>{inProgressCount}</strong>
                  {" "}em andamento
                </span>
              </span>
            )}

            <span>
              <strong className="text-neutral-400">{notStarted}</strong>
              {" "}não iniciados
            </span>
          </div>
        )}

        {/* Skeleton para stats enquanto carrega */}
        {!progressReady && (
          <div className="flex gap-4">
            {[64, 80, 72].map(w => (
              <div key={w} className="h-3 rounded animate-pulse bg-neutral-800" style={{ width: w }} />
            ))}
          </div>
        )}

        {/* Barra de progresso geral */}
        {progressReady && completedTopics > 0 && (
          <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width:           `${(completedTopics / totalTopics) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Topic grid ──────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              subject={subject}
              accentColor={accentColor}
              stepCompleted={progressMap[topic.id] ?? 0}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

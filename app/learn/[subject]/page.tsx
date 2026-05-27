"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Star, Lock, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { SUBJECTS } from "@/config/ufg-weights"
import { SYLLABUS } from "@/config/syllabus"
import type { SubjectKey } from "@/config/ufg-weights"
import type { SyllabusTopic } from "@/config/syllabus"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"

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

// Converte peso_ufg 1-5 → texto curto para o badge
function pesoLabel(peso: number): string {
  if (peso >= 5) return "🔥 Queda alta"
  if (peso >= 4) return "⭐ Importante"
  if (peso >= 3) return "Médio"
  return "Raro"
}

// ─── Topic card ───────────────────────────────────────────────────────────────

interface TopicCardProps {
  topic: SyllabusTopic
  subject: string
  accentColor: string
  stepCompleted: number    // 0-4 do banco
}

function TopicCard({ topic, subject, accentColor, stepCompleted }: TopicCardProps) {
  const isDone = stepCompleted >= 4
  const inProgress = stepCompleted > 0 && stepCompleted < 4

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

      {/* Title */}
      <p className="text-sm font-semibold text-white pr-6 leading-snug group-hover:text-white">
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
              width: `${(stepCompleted / 4) * 100}%`,
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
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  const subjectConfig = SUBJECTS[subject]
  const topics        = SYLLABUS[subject] ?? []
  const accentColor   = SUBJECT_HEX[subject] ?? "#388bfd"

  // Redireciona se matéria inválida
  useEffect(() => {
    if (!subjectConfig) router.replace("/")
  }, [subjectConfig, router])

  // Busca progresso do usuário para esta matéria
  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    supabase
      .from("user_topic_progress")
      .select("topic_slug, step_completed")
      .eq("user_id", user.id)
      .eq("subject", subject)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, number> = {}
        for (const row of data) map[row.topic_slug] = row.step_completed
        setProgressMap(map)
      })
  }, [user, subject])

  if (!subjectConfig) return null

  // Métricas rápidas
  const totalTopics     = topics.length
  const completedTopics = topics.filter(t => (progressMap[t.id] ?? 0) >= 4).length
  const inProgressCount = topics.filter(t => { const s = progressMap[t.id] ?? 0; return s > 0 && s < 4 }).length

  // Ordenação: em andamento primeiro, depois por peso_ufg desc, depois fáceis
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
      {/* ── Header ──────────────────────────────────────────────────────────── */}
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

          {/* Progresso geral */}
          {completedTopics > 0 && (
            <span className="ml-auto text-xs text-neutral-500">
              {completedTopics}/{totalTopics} concluídos
            </span>
          )}
        </div>

        {/* Accent line */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: accentColor, opacity: 0.3 }}
        />
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-black font-black text-lg shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{subjectConfig.label}</h1>
            <p className="text-xs text-neutral-500">{totalTopics} tópicos · Peso UFG ×{subjectConfig.weight}</p>
          </div>
        </div>

        {/* Stats bar */}
        {totalTopics > 0 && (
          <div className="mt-5 flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {completedTopics} concluídos
            </span>
            {inProgressCount > 0 && (
              <span className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: accentColor }}
                />
                {inProgressCount} em andamento
              </span>
            )}
            <span>{totalTopics - completedTopics - inProgressCount} não iniciados</span>
          </div>
        )}

        {/* Barra de progresso geral */}
        {completedTopics > 0 && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(completedTopics / totalTopics) * 100}%`,
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

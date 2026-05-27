"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react"
import { SUBJECTS } from "@/config/ufg-weights"
import { getTopicBySlug } from "@/config/syllabus"
import { SessionHistoryList } from "@/components/learning/SessionHistoryList"
import { useModuleStore } from "@/modules/learning/module-store"
import { useAuth } from "@/contexts/AuthContext"
import {
  getUserTopicSessions,
  insertTopicSession,
} from "@/lib/supabaseClient"
import type { SubjectKey } from "@/config/ufg-weights"
import type { TopicSession } from "@/lib/supabaseClient"
import type { FullModule } from "@/modules/learning/module-types"

// Cores por matéria
const SUBJECT_HEX: Record<string, string> = {
  math:       "#f78166",
  languages:  "#79c0ff",
  humanities: "#a5d6a7",
  sciences:   "#ce93d8",
  writing:    "#ffd54f",
}

// ─── Empty state (nunca estudou este tópico) ──────────────────────────────────

function EmptyState({
  topicTitle,
  accentColor,
  isLoading,
  onStart,
}: {
  topicTitle:  string
  accentColor: string
  isLoading:   boolean
  onStart:     () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center px-4">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
      >
        <BookOpen className="h-8 w-8" style={{ color: accentColor }} />
      </div>

      <div>
        <h2 className="text-xl font-black text-white">Ainda não estudado</h2>
        <p className="text-sm text-neutral-400 mt-1 max-w-xs">
          Crie sua primeira lição sobre <strong className="text-neutral-200">{topicTitle}</strong>.
          A IA gera teoria, exemplos e questões personalizadas.
        </p>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: isLoading ? "#555" : accentColor }}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
            Preparando lição…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Iniciar Primeira Lição
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
          A IA está gerando teoria, exemplos e questões para este tópico.
          Isso pode levar até 20 segundos.
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopicSessionsPage() {
  const params  = useParams()
  const router  = useRouter()
  const { user } = useAuth()

  const subject   = params.subject as SubjectKey
  const topicSlug = params.topic as string

  const subjectConfig = SUBJECTS[subject]
  const topic         = getTopicBySlug(subject, topicSlug)
  const accentColor   = SUBJECT_HEX[subject] ?? "#388bfd"

  const { loadFromSession, reset } = useModuleStore()

  // ── Estado local ─────────────────────────────────────────────────────────
  const [sessions,     setSessions]     = useState<Omit<TopicSession, "content_json">[]>([])
  const [isFetching,   setIsFetching]   = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [createError,  setCreateError]  = useState<string | null>(null)

  // ── Redireciona se tópico/matéria inválidos ───────────────────────────────
  useEffect(() => {
    if (!subjectConfig || !topic) router.replace(`/learn/${subject}`)
  }, [subjectConfig, topic, subject, router])

  // ── Carrega histórico de sessões ──────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    if (!user || !topic) return
    setIsFetching(true)
    try {
      const data = await getUserTopicSessions(user.id, subject, topicSlug)
      setSessions(data)
    } catch (err) {
      console.warn("[sessions fetch]", err)
    } finally {
      setIsFetching(false)
    }
  }, [user, topic, subject, topicSlug])

  useEffect(() => { loadSessions() }, [loadSessions])

  // ── Criação de nova sessão ────────────────────────────────────────────────
  //
  // Fluxo:
  // 1. Chama /api/topic/sessions para gerar o módulo (pode demorar ~15s)
  // 2. Salva a sessão no DB via client-side helper (RLS garante ownership)
  // 3. Pré-carrega o módulo no store para início instantâneo na player page
  // 4. Navega para /learn/[subject]/[topic]/[sessionId]

  async function handleCreateSession(forceNew = false) {
    if (!user || !topic || isGenerating) return
    setIsGenerating(true)
    setCreateError(null)

    try {
      const action = forceNew ? "generate_fresh" : "generate"

      const res = await fetch("/api/topic/sessions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          subject,
          topicSlug:  topic.id,
          topicTitle: topic.titulo,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? "Erro na API")
      }

      const { module } = await res.json() as { module: FullModule }

      // Salva a sessão no DB (client-side, usa JWT do usuário → RLS)
      const sessionId = await insertTopicSession({
        id:           crypto.randomUUID(),
        user_id:      user.id,
        subject_slug: subject,
        topic_slug:   topic.id,
        topic_title:  topic.titulo,
        content_json: module,
        current_step: 0,
        xp_earned:    0,
        is_completed: false,
      })

      // Pré-carrega o módulo no store → player page inicia imediatamente
      loadFromSession(module, sessionId, 0)

      router.push(`/learn/${subject}/${topicSlug}/${sessionId}`)

    } catch (err) {
      console.error("[create session]", err)
      setCreateError(
        err instanceof Error ? err.message : "Falha ao gerar lição. Tente novamente."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Continuar sessão existente ────────────────────────────────────────────
  function handleContinueSession(sessionId: string) {
    // Reseta o store para garantir estado limpo antes de carregar a sessão
    reset()
    router.push(`/learn/${subject}/${topicSlug}/${sessionId}`)
  }

  if (!subjectConfig || !topic) return null

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2 min-w-0">
          <Link
            href={`/learn/${subject}`}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">{subjectConfig.labelShort}</span>
          </Link>

          <span className="text-neutral-700">/</span>

          <span
            className="text-sm font-semibold truncate"
            style={{ color: accentColor }}
          >
            {topic.titulo}
          </span>

          <span className="ml-auto shrink-0 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
            Peso {topic.peso_ufg}/5
          </span>
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Carregando histórico */}
        {isFetching && (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 rounded-full border-2 border-neutral-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Erro ao criar sessão */}
        {createError && (
          <div className="mb-4 rounded-xl border border-red-900/50 bg-red-900/10 px-4 py-3 text-sm text-red-400">
            {createError}
          </div>
        )}

        {/* Cenário B: nenhuma sessão ainda */}
        {!isFetching && sessions.length === 0 && (
          <EmptyState
            topicTitle={topic.titulo}
            accentColor={accentColor}
            isLoading={isGenerating}
            onStart={() => handleCreateSession(false)}
          />
        )}

        {/* Cenário A: lista de sessões anteriores */}
        {!isFetching && sessions.length > 0 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-black text-white">{topic.titulo}</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Selecione uma sessão para continuar ou crie uma nova variante.
              </p>
            </div>

            <SessionHistoryList
              sessions={sessions}
              accentColor={accentColor}
              isGenerating={isGenerating}
              onContinue={handleContinueSession}
              onNewVariant={() => handleCreateSession(true)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

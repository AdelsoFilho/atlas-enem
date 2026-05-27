"use client"

import { useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, History } from "lucide-react"
import { SUBJECTS } from "@/config/ufg-weights"
import { getTopicBySlug } from "@/config/syllabus"
import { StepWizard } from "@/components/learning/StepWizard"
import { useModuleStore } from "@/modules/learning/module-store"
import { useAuth } from "@/contexts/AuthContext"
import {
  getTopicSessionById,
  updateSessionProgress,
  completeTopicSession,
  supabase,
} from "@/lib/supabaseClient"
import type { SubjectKey } from "@/config/ufg-weights"
import type { FullModule } from "@/modules/learning/module-types"

// Cores por matéria
const SUBJECT_HEX: Record<string, string> = {
  math:       "#f78166",
  languages:  "#79c0ff",
  humanities: "#a5d6a7",
  sciences:   "#ce93d8",
  writing:    "#ffd54f",
}

// Mapeamento de tela → step numérico (para salvar no DB)
const SCREEN_TO_STEP: Record<string, number> = {
  teoria:    1,
  exemplo:   2,
  treino:    2,
  validacao: 3,
  simulado:  3,
  concluido: 4,
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-36 text-center px-4">
      <div className="h-9 w-9 rounded-full border-2 border-[#388bfd] border-t-transparent animate-spin" />
      <p className="text-neutral-300 text-sm font-medium">{label}</p>
      <p className="text-neutral-600 text-xs max-w-xs">
        A IA está gerando teoria, exemplos e questões personalizadas para este tópico
      </p>
    </div>
  )
}

// ─── Error ────────────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-36 text-center px-4">
      <span className="text-4xl">⚠️</span>
      <p className="text-red-400 text-sm max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionPlayerPage() {
  const params    = useParams()
  const router    = useRouter()
  const { user }  = useAuth()

  const subject   = params.subject   as SubjectKey
  const topicSlug = params.topic     as string
  const sessionId = params.sessionId as string

  const subjectConfig = SUBJECTS[subject]
  const topic         = getTopicBySlug(subject, topicSlug)
  const accentColor   = SUBJECT_HEX[subject] ?? "#388bfd"

  const {
    module,
    screen,
    isLoading,
    loadError,
    startLoading,
    loadFromSession,
    setLoadError,
    reset,
    activeSessionId,
    isRecovery,
    xpTotal,
    validationResult,
  } = useModuleStore()

  // ── Carrega a sessão do DB ────────────────────────────────────────────────
  //
  // Cenário A: Store já tem o módulo desta sessão (navegação direta do seletor).
  //            Pula o fetch — início instantâneo.
  // Cenário B: Store vazio (refresh, link direto, back button).
  //            Busca content_json da sessão no Supabase.

  const loadSession = useCallback(async () => {
    if (!topic || !sessionId) return
    startLoading()
    try {
      const session = await getTopicSessionById(sessionId)
      if (!session) throw new Error("Sessão não encontrada.")
      if (!session.content_json) throw new Error("Conteúdo da sessão não disponível.")
      loadFromSession(session.content_json as FullModule, sessionId, session.current_step)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Falha ao carregar a sessão.")
    }
  }, [topic, sessionId, startLoading, loadFromSession, setLoadError])

  useEffect(() => {
    if (!subjectConfig || !topic) {
      router.replace(`/learn/${subject}/${topicSlug}`)
      return
    }
    // Store já tem este módulo carregado — não precisa fazer fetch
    if (activeSessionId === sessionId && module) return
    loadSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // ── Persiste progresso da sessão + XP global a cada mudança de tela ───────

  useEffect(() => {
    const step = SCREEN_TO_STEP[screen]
    if (!step || !user || !topic || !module || !activeSessionId) return

    // 1. Atualiza topic_sessions (histórico desta sessão específica)
    if (screen !== "concluido") {
      void updateSessionProgress(activeSessionId, step, xpTotal)
    }

    // 2. Atualiza user_topic_progress (XP global do usuário neste tópico)
    void supabase.rpc("upsert_topic_progress", {
      p_user_id:    user.id,
      p_subject:    subject,
      p_topic_slug: topic.id,
      p_topic_title: topic.titulo,
      p_step:        step,
      p_xp:          0,
    }).then(({ error }: { error: unknown }) => {
      if (error) console.warn("[upsert_topic_progress]", error)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  // ── Conclusão: salva XP final e marca sessão como concluída ───────────────

  useEffect(() => {
    if (screen !== "concluido" || !user || !topic || !activeSessionId) return

    const aprovado = validationResult?.aprovado ?? false
    const lacunas  = validationResult?.lacunas_identificadas ?? []

    // Marca sessão como concluída
    void completeTopicSession(activeSessionId, xpTotal)

    // Atualiza XP global no user_topic_progress
    void supabase.rpc("upsert_topic_progress", {
      p_user_id:    user.id,
      p_subject:    subject,
      p_topic_slug: topic.id,
      p_topic_title: topic.titulo,
      p_step:        4,
      p_xp:          xpTotal,
      p_aprovado:    aprovado,
      p_lacunas:     lacunas,
    }).then(({ error }: { error: unknown }) => {
      if (error) console.warn("[upsert_topic_progress concluido]", error)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  // ── Cleanup ao sair ───────────────────────────────────────────────────────
  useEffect(() => () => { reset() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!subjectConfig || !topic) return null

  const handleBack = () => {
    reset()
    router.push(`/learn/${subject}/${topicSlug}`)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2 min-w-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">{subjectConfig.labelShort}</span>
          </button>

          <span className="text-neutral-700">/</span>

          <span className="text-sm font-semibold truncate" style={{ color: accentColor }}>
            {topic.titulo}
          </span>

          {/* Badge de sessão retomada */}
          {isRecovery && screen !== "loading" && (
            <span className="ml-auto shrink-0 flex items-center gap-1 rounded-full border border-blue-800/50 bg-blue-900/20 px-2 py-0.5 text-[10px] text-blue-400">
              <History className="h-3 w-3" />
              Sessão retomada
            </span>
          )}

          {/* Peso UFG badge (quando não está em recovery) */}
          {!isRecovery && (
            <span className="ml-auto shrink-0 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
              Peso {topic.peso_ufg}/5
            </span>
          )}
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading && <LoadingScreen label={`Carregando: ${topic.titulo}…`} />}

        {!isLoading && loadError && (
          <ErrorScreen message={loadError} onRetry={loadSession} />
        )}

        {!isLoading && !loadError && module && (
          <StepWizard pesoUfg={topic.peso_ufg} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}

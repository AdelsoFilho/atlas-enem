"use client"

import { useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SUBJECTS } from "@/config/ufg-weights"
import { SYLLABUS, getTopicBySlug } from "@/config/syllabus"
import { StepWizard } from "@/components/learning/StepWizard"
import { useModuleStore } from "@/modules/learning/module-store"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"
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

// ─── Loading screen ───────────────────────────────────────────────────────────

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

// ─── Error screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-36 text-center px-4">
      <span className="text-4xl">⚠️</span>
      <p className="text-red-400 text-sm max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-2 text-sm text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopicModulePage() {
  const params  = useParams()
  const router  = useRouter()
  const { user } = useAuth()

  const subject   = params.subject as SubjectKey
  const topicSlug = params.topic as string

  const subjectConfig = SUBJECTS[subject]
  const topic         = getTopicBySlug(subject, topicSlug)
  const accentColor   = SUBJECT_HEX[subject] ?? "#388bfd"

  const {
    module,
    screen,
    isLoading,
    loadError,
    startLoading,
    loadModule,
    setLoadError,
    reset,
  } = useModuleStore()

  // ── Fetch module ─────────────────────────────────────────────────────────

  const fetchModule = useCallback(async () => {
    if (!topic) return
    startLoading()
    try {
      const res = await fetch("/api/generate-module", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topicSlug: topic.id,
          topicTitle: topic.titulo,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro na API")
      loadModule(data as FullModule)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Falha ao gerar o módulo.")
    }
  }, [topic, subject, startLoading, loadModule, setLoadError])

  // ── Redireciona se inválido, carrega se ainda não carregado ──────────────

  useEffect(() => {
    if (!subjectConfig || !topic) {
      router.replace(`/learn/${subject}`)
      return
    }
    // Evita refetch se já carregou o módulo deste tópico
    if (module?.topico === topic.titulo) return
    fetchModule()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, topicSlug])

  // ── Persiste progresso no Supabase quando o wizard avança ────────────────

  useEffect(() => {
    if (!user || !topic || !module) return

    // Mapeia screen → step_completed (0-4)
    const SCREEN_STEP: Record<string, number> = {
      teoria:    1,
      exemplo:   2,
      treino:    2,   // treino ainda não validado
      validacao: 3,
      simulado:  3,
      concluido: 4,
    }
    const step = SCREEN_STEP[screen]
    if (!step) return

    const supabase = createClient()
    supabase.rpc("upsert_topic_progress", {
      p_user_id:    user.id,
      p_subject:    subject,
      p_topic_slug: topic.id,
      p_topic_title: topic.titulo,
      p_step:       step,
      p_xp:         0,  // XP real é salvo no concluido pelo StepWizard
    }).then(({ error }) => {
      if (error) console.warn("[upsert_topic_progress]", error)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  // ── Salva XP e resultado final quando concluído ──────────────────────────

  const { xpTotal, validationResult, simuladoCorreto } = useModuleStore()

  useEffect(() => {
    if (screen !== "concluido" || !user || !topic) return

    const supabase = createClient()
    const aprovado = validationResult?.aprovado ?? false
    const lacunas  = validationResult?.lacunas_identificadas ?? []

    supabase.rpc("upsert_topic_progress", {
      p_user_id:    user.id,
      p_subject:    subject,
      p_topic_slug: topic.id,
      p_topic_title: topic.titulo,
      p_step:       4,
      p_xp:         xpTotal,
      p_aprovado:   aprovado,
      p_lacunas:    lacunas,
    }).then(({ error }) => {
      if (error) console.warn("[upsert_topic_progress concluido]", error)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  // ── Cleanup ao sair ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => { reset() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!subjectConfig || !topic) return null

  const handleBack = () => {
    reset()
    router.push(`/learn/${subject}`)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
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

          <span
            className="text-sm font-semibold truncate"
            style={{ color: accentColor }}
          >
            {topic.titulo}
          </span>

          {/* Peso UFG badge */}
          <span className="ml-auto shrink-0 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-400">
            Peso {topic.peso_ufg}/5
          </span>
        </div>

        {/* Accent line */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: accentColor, opacity: 0.3 }}
        />
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading && <LoadingScreen label={`Gerando módulo: ${topic.titulo}…`} />}

        {!isLoading && loadError && (
          <ErrorScreen message={loadError} onRetry={fetchModule} />
        )}

        {!isLoading && !loadError && module && (
          <StepWizard pesoUfg={topic.peso_ufg} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}

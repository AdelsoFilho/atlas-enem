"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { FlashTeach } from "@/modules/learning/FlashTeach"
import { useLessonStore } from "@/modules/learning/lesson-store"
import { getMockLesson } from "@/modules/learning/mock-lessons"
import type { SubjectKey } from "@/config/ufg-weights"
import { SUBJECTS } from "@/config/ufg-weights"

// Cores estáticas por matéria — sem interpolação dinâmica de classe Tailwind
const SUBJECT_HEX: Record<string, string> = {
  math:       "#f78166",
  languages:  "#79c0ff",
  humanities: "#a5d6a7",
  sciences:   "#ce93d8",
  writing:    "#ffd54f",
}

// Rótulo de cada etapa
const STEP_LABELS = ["Teoria", "Exemplo", "Quiz"] as const
const STEP_KEYS   = ["theory", "example", "quiz"] as const

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32">
      <div className="h-8 w-8 rounded-full border-2 border-[#388bfd] border-t-transparent animate-spin" />
      <p className="text-neutral-400 text-sm">Gerando aula com IA…</p>
      <p className="text-neutral-600 text-xs">Isso pode levar alguns segundos</p>
    </div>
  )
}

// ─── Error screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-4">
      <span className="text-4xl">⚠️</span>
      <p className="text-red-400 text-sm max-w-xs">{message}</p>
      <Link
        href="/"
        className="mt-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
      >
        ← Voltar ao início
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnSubjectPage() {
  const params  = useParams()
  const router  = useRouter()
  const subject = params.subject as SubjectKey

  const {
    lesson,
    screen,
    isGenerating,
    generationError,
    loadLesson,
    setGenerating,
    reset,
  } = useLessonStore()

  const subjectConfig = SUBJECTS[subject]
  const accentColor   = SUBJECT_HEX[subject] ?? "#388bfd"

  // ── Carrega a aula ao montar ou trocar de matéria ──────────────────────────
  useEffect(() => {
    if (!subjectConfig) {
      router.replace("/")   // matéria inválida → volta ao início (não ao /dashboard)
      return
    }
    if (lesson?.subject === subject) return  // já carregada

    async function fetchLesson() {
      setGenerating(true)
      try {
        const res  = await fetch("/api/generate-lesson", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            subject,
            topic:      subjectConfig.label,
            difficulty: 3,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Erro na API")
        loadLesson(data)
      } catch {
        const mock = getMockLesson(subject)
        if (mock) loadLesson(mock)
        else      setGenerating(false, "Nenhuma aula disponível para esta matéria.")
      } finally {
        setGenerating(false)
      }
    }

    fetchLesson()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  if (!subjectConfig) return null

  // ── Calcula etapa atual ────────────────────────────────────────────────────
  const currentStep = STEP_KEYS.indexOf(
    screen === "completed" ? "quiz" : (screen as typeof STEP_KEYS[number])
  )

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header fixo ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Breadcrumb: Início / Matéria */}
          <nav className="flex items-center gap-2 text-sm min-w-0" aria-label="Breadcrumb">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Início</span>
            </Link>
            <span className="text-neutral-700" aria-hidden="true">/</span>
            <span
              className="font-semibold truncate"
              style={{ color: accentColor }}
            >
              {subjectConfig.labelShort}
            </span>
          </nav>

          {/* Step indicators */}
          {!isGenerating && !generationError && lesson && (
            <div className="flex items-center gap-1.5 shrink-0" aria-label="Progresso da aula">
              {STEP_LABELS.map((label, i) => {
                const isDone    = i < currentStep
                const isCurrent = i === currentStep
                return (
                  <div
                    key={label}
                    title={label}
                    className="flex items-center gap-1"
                  >
                    <div
                      className="h-1.5 w-8 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isDone || isCurrent ? accentColor : "#262626",
                        opacity: isDone ? 0.4 : 1,
                      }}
                    />
                  </div>
                )
              })}
              <span className="ml-1 text-xs text-neutral-500 font-mono">
                {Math.min(currentStep + 1, 3)}/3
              </span>
            </div>
          )}
        </div>

        {/* Accent line na base do header — cor da matéria */}
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: accentColor, opacity: 0.3 }}
          aria-hidden="true"
        />
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {isGenerating && <LoadingScreen />}

        {!isGenerating && generationError && (
          <ErrorScreen message={generationError} />
        )}

        {!isGenerating && !generationError && (
          <FlashTeach onBack={() => router.push("/")} />
        )}
      </main>
    </div>
  )
}

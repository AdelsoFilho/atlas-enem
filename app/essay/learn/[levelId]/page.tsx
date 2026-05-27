"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, CheckCircle2, BookOpen, Lock, ChevronRight,
  BookMarked, Loader2,
} from "lucide-react"
import { ThesisBuilder }          from "@/components/writing/ThesisBuilder"
import { ParagraphPuzzle }        from "@/components/writing/ParagraphPuzzle"
import { ConnectorFill }          from "@/components/writing/ConnectorFill"
import { InterventionBuilder }    from "@/components/writing/InterventionBuilder"
import { MultipleChoiceExercise } from "@/components/writing/MultipleChoiceExercise"
import { useWritingProgressStore } from "@/modules/essay/writing-progress-store"
import { useAuth }                from "@/contexts/AuthContext"
import type {
  SkillLesson,
  ThesisBuilderExerciseData,
  ParagraphPuzzleExerciseData,
  ConnectorFillExerciseData,
  InterventionBuilderExerciseData,
  MultipleChoiceExerciseData,
  FullEssayExerciseData,
  ThesisBuilderAnswer,
  InterventionBuilderAnswer,
} from "@/modules/essay/writing-types"

// ── Level colors ──────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<number, string> = {
  0: "#79c0ff", 1: "#a5d6a7", 2: "#ffd54f",
  3: "#ce93d8", 4: "#f78166", 5: "#56d364",
}

// ── Theory view ───────────────────────────────────────────────────────────────

function TheoryView({
  lesson,
  onComplete,
}: {
  lesson: SkillLesson
  onComplete: (score: number) => void
}) {
  const data = lesson.exerciseData as { content: string; keyPoints: string[] }

  // Minimal markdown renderer (bold + h3 + code-ish)
  function renderMarkdown(text: string) {
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-bold text-white mt-4 mb-1">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith("---")) {
          return <hr key={i} className="border-neutral-800 my-4" />
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-[#388bfd] pl-3 py-1 text-sm text-neutral-300 italic"
            >
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith("- ") || line.startsWith("✅ ") || line.startsWith("❌ ")) {
          return (
            <li key={i} className="text-sm text-neutral-300 list-none ml-1">
              {renderInline(line)}
            </li>
          )
        }
        if (line.startsWith("|")) {
          // Simple table row — just render as mono text
          return (
            <p key={i} className="font-mono text-xs text-neutral-400 leading-relaxed">
              {line}
            </p>
          )
        }
        if (!line.trim()) return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-sm text-neutral-300 leading-relaxed">
            {renderInline(line)}
          </p>
        )
      })
  }

  function renderInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        : part
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-5 py-5 space-y-1">
        {data?.content ? renderMarkdown(data.content) : null}
      </div>

      {/* Key points */}
      {data?.keyPoints?.length > 0 && (
        <div className="rounded-2xl border border-[#388bfd]/20 bg-[#0d1f3c] px-5 py-4">
          <p className="text-[10px] font-mono text-[#388bfd] uppercase tracking-widest mb-3">
            Pontos-chave para memorizar
          </p>
          <ul className="space-y-2">
            {data.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-[#388bfd] shrink-0 mt-0.5" />
                {kp}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onComplete(100)}
        className="w-full rounded-xl border border-[#388bfd]/50 bg-[#388bfd]/10 py-3 font-mono text-sm font-bold text-[#388bfd] hover:bg-[#388bfd]/20 transition-colors"
      >
        Entendi — Próxima lição
      </button>
    </div>
  )
}

// ── Full Essay View (Level 5) ─────────────────────────────────────────────────

function FullEssayView({
  lesson,
  onComplete,
}: {
  lesson: SkillLesson
  onComplete: (score: number) => void
}) {
  const data = lesson.exerciseData as FullEssayExerciseData
  const [text, setText] = useState("")
  const [timeLeft, setTimeLeft] = useState(data.time_limit_minutes * 60)
  const [started,  setStarted]  = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]  = useState(false)

  useEffect(() => {
    if (!started || submitted) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [started, submitted])

  const words = text.trim().split(/\s+/).filter(Boolean).length
  const mins  = Math.floor(timeLeft / 60)
  const secs  = timeLeft % 60

  async function handleSubmit() {
    setLoading(true)
    // Grade via existing essay route
    try {
      const res = await fetch("/api/grade-essay", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ theme: data.theme, essayText: text }),
      })
      const result = await res.json() as { notaTotal?: number }
      const score = Math.round(((result.notaTotal ?? 0) / 1000) * 100)
      setSubmitted(true)
      onComplete(score)
    } catch {
      setSubmitted(true)
      onComplete(60)
    } finally {
      setLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-5 py-5 space-y-4">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            Textos motivadores
          </p>
          {data.motivation_texts.map((t, i) => (
            <blockquote
              key={i}
              className="border-l-2 border-[#f78166] pl-3 text-sm text-neutral-300 italic"
            >
              {t}
            </blockquote>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-5 py-4">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3">
            Checklist antes de começar
          </p>
          {data.checklist.map((item, i) => (
            <p key={i} className="text-sm text-neutral-300 flex gap-2 mb-1.5">
              <span className="text-neutral-600">□</span> {item}
            </p>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full rounded-xl border border-[#f78166]/50 bg-[#f78166]/10 py-3 font-mono text-sm font-bold text-[#f78166] hover:bg-[#f78166]/20 transition-colors"
        >
          Iniciar simulado — {data.time_limit_minutes} minutos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Tempo restante</p>
        <span className={`font-mono text-lg font-black tabular-nums ${timeLeft < 300 ? "text-red-400" : "text-white"}`}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Tema</p>
        <p className="text-sm font-bold text-white">{data.theme}</p>
      </div>

      {/* Editor */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={submitted || timeLeft === 0}
        placeholder="Escreva sua redação aqui. Lembre-se: Introdução → D1 → D2 → Conclusão com proposta A-A-M-E-D."
        rows={18}
        className="w-full rounded-2xl border border-neutral-700 bg-neutral-900 px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:border-[#f78166] focus:outline-none focus:ring-1 focus:ring-[#f78166]/30 resize-none disabled:opacity-50 transition-colors leading-relaxed"
      />

      {/* Word count */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{words} palavras</span>
        <span className={words < data.min_words ? "text-red-400" : words > data.max_words ? "text-orange-400" : "text-green-400"}>
          {data.min_words}–{data.max_words} recomendadas
        </span>
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={words < 50 || loading}
          className="w-full rounded-xl border border-[#f78166]/50 bg-[#f78166]/10 py-3 font-mono text-sm font-bold text-[#f78166] hover:bg-[#f78166]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Corrigindo...</>
            : "Entregar redação"
          }
        </button>
      )}
    </div>
  )
}

// ── Lesson renderer ───────────────────────────────────────────────────────────

function LessonView({
  lesson,
  onComplete,
}: {
  lesson:     SkillLesson
  onComplete: (score: number, answerJson?: unknown) => void
}) {
  switch (lesson.lessonType) {
    case "theory":
      return <TheoryView lesson={lesson} onComplete={s => onComplete(s)} />

    case "multiple_choice":
      return (
        <MultipleChoiceExercise
          exerciseData={lesson.exerciseData as MultipleChoiceExerciseData}
          minScoreToPass={lesson.minScoreToPass}
          onComplete={s => onComplete(s)}
        />
      )

    case "paragraph_puzzle":
      return (
        <ParagraphPuzzle
          exerciseData={lesson.exerciseData as ParagraphPuzzleExerciseData}
          minScoreToPass={lesson.minScoreToPass}
          onComplete={s => onComplete(s)}
        />
      )

    case "connector_fill":
      return (
        <ConnectorFill
          exerciseData={lesson.exerciseData as ConnectorFillExerciseData}
          minScoreToPass={lesson.minScoreToPass}
          onComplete={s => onComplete(s)}
        />
      )

    case "thesis_builder":
      return (
        <ThesisBuilder
          exerciseData={lesson.exerciseData as ThesisBuilderExerciseData}
          minScoreToPass={lesson.minScoreToPass}
          onComplete={(s, ans) => onComplete(s, ans as ThesisBuilderAnswer)}
        />
      )

    case "intervention_builder":
      return (
        <InterventionBuilder
          exerciseData={lesson.exerciseData as InterventionBuilderExerciseData}
          minScoreToPass={lesson.minScoreToPass}
          onComplete={(s, ans) => onComplete(s, ans as InterventionBuilderAnswer)}
        />
      )

    case "full_essay":
      return <FullEssayView lesson={lesson} onComplete={s => onComplete(s)} />

    default:
      return <p className="text-sm text-neutral-500">Tipo de exercício não reconhecido.</p>
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LevelPage() {
  const params    = useParams()
  const router    = useRouter()
  const levelId   = Number(params.levelId)

  const { user } = useAuth()

  const {
    loadTree, loadProgress, getLevels,
    isLevelUnlocked, progressMap, saveProgress,
    isTreeLoaded, isProgressLoaded,
  } = useWritingProgressStore()

  useEffect(() => { loadTree() }, [loadTree])
  useEffect(() => {
    if (user) loadProgress(user.id)
  }, [user, loadProgress])

  const levels    = getLevels()
  const level     = levels.find(l => l.levelNumber === levelId)
  const isLoaded  = isTreeLoaded && (!user || isProgressLoaded)
  const unlocked  = isLevelUnlocked(levelId)

  // ── Current lesson index: first not-passed lesson ──────────────────────────
  const [currentIdx, setCurrentIdx] = useState<number | null>(null)
  const [justPassed, setJustPassed] = useState<string | null>(null)

  useEffect(() => {
    if (!level) return
    // Find first lesson that hasn't been passed yet
    const firstUnpassed = level.lessons.findIndex(
      l => (progressMap[l.id]?.score ?? 0) < l.minScoreToPass
    )
    setCurrentIdx(firstUnpassed === -1 ? level.lessons.length - 1 : firstUnpassed)
  }, [level, progressMap])

  const currentLesson: SkillLesson | undefined =
    level && currentIdx !== null ? level.lessons[currentIdx] : undefined

  const color = LEVEL_COLOR[levelId] ?? "#8b949e"

  // ── Handle lesson completion ───────────────────────────────────────────────
  async function handleLessonComplete(score: number, answerJson?: unknown) {
    if (!currentLesson) return

    const status = score >= currentLesson.minScoreToPass ? "completed" : "in_progress"
    setJustPassed(status === "completed" ? currentLesson.id : null)

    if (user) {
      await saveProgress({
        userId:    user.id,
        lessonId:  currentLesson.id,
        score,
        status,
        answerJson,
      })
    }
  }

  function handleNextLesson() {
    if (!level || currentIdx === null) return
    const next = currentIdx + 1
    if (next < level.lessons.length) {
      setCurrentIdx(next)
      setJustPassed(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/essay/learn")
    }
  }

  // ── Locked ────────────────────────────────────────────────────────────────
  if (isLoaded && !unlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <Lock className="h-12 w-12 text-neutral-600 mx-auto" />
          <p className="text-white font-bold">Nível bloqueado</p>
          <p className="text-sm text-neutral-500">
            Complete todas as lições do Nível {levelId - 1} primeiro.
          </p>
          <Link
            href="/essay/learn"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para a trilha
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/essay/learn"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Trilha</span>
          </Link>

          <span className="text-neutral-700">/</span>

          <span className="font-bold text-base" style={{ color }}>
            Nível {levelId}
            {level && <span className="text-neutral-500 font-normal text-sm"> — {level.levelName}</span>}
          </span>

          {level && (
            <span className="ml-auto text-xs text-neutral-500">
              {level.completedCount}/{level.totalCount}
            </span>
          )}
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: color, opacity: 0.3 }} />
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">

        {/* ── Lesson nav pills ──────────────────────────────────────────── */}
        {level && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {level.lessons.map((lesson, idx) => {
              const lessonPassed = (progressMap[lesson.id]?.score ?? 0) >= lesson.minScoreToPass
              const isCurrent    = idx === currentIdx
              return (
                <button
                  key={lesson.id}
                  onClick={() => { setCurrentIdx(idx); setJustPassed(null) }}
                  className={[
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors",
                    isCurrent
                      ? "text-black font-bold"
                      : lessonPassed
                        ? "border-green-800/50 bg-green-900/10 text-green-400 hover:bg-green-900/20"
                        : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300",
                  ].join(" ")}
                  style={isCurrent ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {lessonPassed ? <CheckCircle2 className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                  {lesson.lessonOrder}. {lesson.title.length > 18
                    ? lesson.title.slice(0, 18) + "…"
                    : lesson.title}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Lesson content ────────────────────────────────────────────── */}
        {!isLoaded && (
          <div className="space-y-4">
            {[200, 300, 150].map(h => (
              <div key={h} className="h-24 rounded-2xl border border-neutral-800 bg-neutral-900 animate-pulse" style={{ height: h }} />
            ))}
          </div>
        )}

        {isLoaded && currentLesson && (
          <div className="space-y-6">
            {/* Lesson header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookMarked className="h-4 w-4" style={{ color }} />
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                  Lição {currentLesson.lessonOrder} de {level?.totalCount}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{currentLesson.title}</h2>
              <p className="text-sm text-neutral-400 mt-1">{currentLesson.instructions}</p>
            </div>

            {/* Exercise */}
            <LessonView
              key={currentLesson.id}
              lesson={currentLesson}
              onComplete={handleLessonComplete}
            />

            {/* "Next lesson" CTA after passing */}
            {justPassed === currentLesson.id && (
              <div className="rounded-2xl border border-green-800/50 bg-green-900/10 p-5 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                <p className="font-bold text-green-300">Lição concluída!</p>
                {currentIdx !== null && level && currentIdx < level.lessons.length - 1 ? (
                  <button
                    onClick={handleNextLesson}
                    className="flex items-center gap-2 rounded-xl border border-green-700/40 bg-green-900/20 px-5 py-2.5 font-mono text-sm font-bold text-green-300 hover:bg-green-900/30 transition-colors mx-auto"
                  >
                    Próxima lição <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href="/essay/learn"
                    className="flex items-center gap-2 rounded-xl border border-green-700/40 bg-green-900/20 px-5 py-2.5 font-mono text-sm font-bold text-green-300 hover:bg-green-900/30 transition-colors mx-auto w-fit"
                  >
                    Nível completo! Ver próximo <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

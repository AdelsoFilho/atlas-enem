"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Crosshair } from "lucide-react"
import { LevelCard }              from "@/components/writing/LevelCard"
import { SkillProgressBars }      from "@/components/writing/SkillProgressBars"
import { CountdownTimer }         from "@/components/ui/CountdownTimer"
import { useWritingProgressStore } from "@/modules/essay/writing-progress-store"
import { useAuth }                from "@/contexts/AuthContext"

export default function WritingLearnPage() {
  const { user }                    = useAuth()
  const { loadTree, loadProgress, getLevels, isTreeLoaded, isProgressLoaded } =
    useWritingProgressStore()

  // Load skill tree (public) and user progress (if logged in)
  useEffect(() => {
    loadTree()
  }, [loadTree])

  useEffect(() => {
    if (user) loadProgress(user.id)
  }, [user, loadProgress])

  const levels = getLevels()
  const isLoaded = isTreeLoaded && (!user || isProgressLoaded)

  // Overall progress
  const totalLessons     = levels.reduce((s, l) => s + l.totalCount, 0)
  const completedLessons = levels.reduce((s, l) => s + l.completedCount, 0)
  const overallPct       = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/essay"
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Redação</span>
          </Link>

          <span className="text-neutral-700">/</span>

          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-[#f78166]" />
            <span className="font-mono text-sm font-black text-white">
              Do Zero ao <span className="text-[#f78166]">1000</span>
            </span>
          </div>

          {completedLessons > 0 && (
            <span className="ml-auto text-xs text-neutral-500">
              {completedLessons}/{totalLessons} lições
            </span>
          )}
        </div>

        {/* Color bar */}
        <div className="h-[2px] w-full overflow-hidden bg-neutral-900">
          <div
            className="h-full transition-all duration-700"
            style={{
              width:      `${overallPct}%`,
              background: "linear-gradient(90deg, #388bfd, #f78166, #56d364)",
            }}
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-8">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-black text-white">
              Do Zero ao <span className="text-[#f78166]">1000</span>
            </h1>
            <p className="text-sm text-neutral-400 mt-1.5">
              Aprenda redação ENEM do começo, no seu ritmo. Cada nível desbloqueia o próximo.
            </p>
          </div>

          <CountdownTimer />

          {/* Overall progress bar */}
          {completedLessons > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Progresso geral</span>
                <span className="font-mono font-bold text-white">{overallPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${overallPct}%`,
                    background: "linear-gradient(90deg, #388bfd, #f78166, #56d364)",
                  }}
                />
              </div>
            </div>
          )}

          {!user && (
            <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 px-4 py-3">
              <p className="text-sm text-orange-300">
                <strong>Faça login</strong> para salvar seu progresso entre sessões.
              </p>
            </div>
          )}
        </div>

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Level cards */}
          <div className="space-y-4">
            <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
              Trilha de aprendizado
            </p>

            {isLoaded ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {levels.map(level => (
                  <LevelCard key={level.levelNumber} level={level} />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {isLoaded && levels.length > 0 && (
              <SkillProgressBars levels={levels} />
            )}

            {/* Method card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                Método Andaimagem
              </p>
              <div className="space-y-2.5 text-xs text-neutral-400">
                <div className="flex gap-2">
                  <span className="text-[#388bfd] shrink-0 font-mono">0→1</span>
                  <span>Conceitos básicos e identificação de tese</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#a5d6a7] shrink-0 font-mono">1→2</span>
                  <span>Estrutura macro do texto</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#ffd54f] shrink-0 font-mono">2→3</span>
                  <span>Microestrutura do parágrafo</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#ce93d8] shrink-0 font-mono">3→4</span>
                  <span>Coesão e conectivos</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#f78166] shrink-0 font-mono">4→5</span>
                  <span>Proposta de intervenção A-A-M-E-D</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#56d364] shrink-0 font-mono">5</span>
                  <span>Redação completa cronometrada</span>
                </div>
              </div>
            </div>

            {/* Quick link to full essay */}
            <Link
              href="/essay"
              className="flex items-center justify-between rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 hover:border-neutral-500 hover:bg-neutral-800 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-white">Redação Livre</p>
                <p className="text-xs text-neutral-500 mt-0.5">Praticar com tema completo</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-neutral-600 rotate-180 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

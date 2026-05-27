"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Crosshair, Trophy } from "lucide-react"
import { WritingLevelBadge }       from "@/components/writing/WritingLevelBadge"
import { SkillProgressBars }       from "@/components/writing/SkillProgressBars"
import { CountdownTimer }          from "@/components/ui/CountdownTimer"
import { useWritingProgressStore }  from "@/modules/essay/writing-progress-store"
import { useAuth }                 from "@/contexts/AuthContext"

export default function WritingLearnPage() {
  const { user } = useAuth()

  const {
    loadTree,
    loadProgress,
    loadLevelState,
    getLevels,
    currentWritingLevel,
    isTreeLoaded,
    isProgressLoaded,
    isLevelStateLoaded,
  } = useWritingProgressStore()

  // Load skill tree (public)
  useEffect(() => { loadTree() }, [loadTree])

  // Load user-specific data when logged in
  useEffect(() => {
    if (!user) return
    loadProgress(user.id)
    loadLevelState(user.id)
  }, [user, loadProgress, loadLevelState])

  const levels  = getLevels()
  const isReady = isTreeLoaded && (!user || (isProgressLoaded && isLevelStateLoaded))

  const totalLessons     = levels.reduce((s, l) => s + l.totalCount, 0)
  const completedLessons = levels.reduce((s, l) => s + l.completedCount, 0)
  const overallPct       = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  const isHero = currentWritingLevel >= 5 && completedLessons === totalLessons && totalLessons > 0

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

          {user && isReady && (
            <div className="ml-auto flex items-center gap-3">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                Nível atual
              </span>
              <span
                className="font-mono text-sm font-black"
                style={{ color: currentWritingLevel >= 5 ? "#56d364" : "#f78166" }}
              >
                {currentWritingLevel}/5
              </span>
            </div>
          )}
        </div>

        {/* Gradient progress bar */}
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

        {/* ── Hero section ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {isHero ? (
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-[#ffd54f]" />
              <div>
                <h1 className="text-3xl font-black text-white">
                  Modo <span className="text-[#56d364]">Herói</span>
                </h1>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Trilha completa. Você domina a redação ENEM.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-black text-white">
                Do Zero ao <span className="text-[#f78166]">1000</span>
              </h1>
              <p className="text-sm text-neutral-400 mt-1.5">
                Aprenda redação ENEM do começo, no seu ritmo. Cada nível desbloqueia o próximo.
              </p>
            </div>
          )}

          <CountdownTimer />

          {/* Overall progress */}
          {completedLessons > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Progresso geral — {completedLessons}/{totalLessons} lições</span>
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
                <strong>Faça login</strong> para salvar seu progresso e desbloquear níveis.
              </p>
            </div>
          )}
        </div>

        {/* ── Main grid ────────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Level badges */}
          <div className="space-y-4">
            <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
              Trilha de aprendizado — 6 níveis
            </p>

            {isReady ? (
              <div className="flex flex-col gap-3">
                {levels.map(level => (
                  <WritingLevelBadge key={level.levelNumber} level={level} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl border border-neutral-800 bg-neutral-900/40 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Competence bars */}
            {isReady && levels.length > 0 && (
              <SkillProgressBars levels={levels} />
            )}

            {/* Método */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                Método Andaimagem
              </p>
              <div className="space-y-2.5 text-xs text-neutral-400">
                {[
                  { label: "0→1", color: "#79c0ff", desc: "Conceitos básicos e identificação de tese" },
                  { label: "1→2", color: "#a5d6a7", desc: "Estrutura macro do texto"                  },
                  { label: "2→3", color: "#ffd54f", desc: "Microestrutura do parágrafo"               },
                  { label: "3→4", color: "#ce93d8", desc: "Coesão e conectivos"                       },
                  { label: "4→5", color: "#f78166", desc: "Proposta de intervenção A-A-M-E-D"         },
                  { label: "5",   color: "#56d364", desc: "Redação completa cronometrada"              },
                ].map(({ label, color, desc }) => (
                  <div key={label} className="flex gap-2">
                    <span className="shrink-0 font-mono w-8" style={{ color }}>{label}</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick link */}
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

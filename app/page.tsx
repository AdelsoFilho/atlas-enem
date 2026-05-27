"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calculator, BookOpen, Globe, FlaskConical, PenLine,
  Crosshair, Zap, User, History, LogOut,
} from "lucide-react"
import { PlayerHeader }        from "@/components/dashboard/PlayerHeader"
import { PerformanceRadar }    from "@/components/dashboard/PerformanceRadar"
import { StandardEntryCard }   from "@/components/dashboard/StandardEntryCard"
import { CompetenceMatrix }    from "@/components/dashboard/CompetenceMatrix"
import { EssayTopicGrid }      from "@/components/essay/EssayTopicGrid"
import { UserHistoryList }     from "@/components/essay/UserHistoryList"
import { LoginModal }          from "@/components/ui/LoginModal"
import { CountdownTimer }      from "@/components/ui/CountdownTimer"
import { AuthSync }            from "@/components/auth/AuthSync"
import { ClientOnlyIcon }      from "@/components/ui/ClientOnlyIcon"
import { useGamificationStore }     from "@/store/gamification-store"
import { useWritingProgressStore }  from "@/modules/essay/writing-progress-store"
import { useHasMounted }           from "@/hooks/useHasMounted"
import { useAuth }                 from "@/contexts/AuthContext"
import { SUBJECTS }                from "@/config/ufg-weights"
import { WritingLevelBadge }       from "@/components/writing/WritingLevelBadge"
import type { SubjectKey }         from "@/config/ufg-weights"

// ── Subject config ────────────────────────────────────────────────────────────

const SUBJECT_ORDER: SubjectKey[] = ["math", "languages", "humanities", "sciences", "writing"]

const SUBJECT_ICON = {
  math: Calculator, languages: BookOpen,
  humanities: Globe, sciences: FlaskConical, writing: PenLine,
} as const

const SUBJECT_ACCENT: Record<SubjectKey, string> = {
  math: "#f78166", languages: "#79c0ff",
  humanities: "#a5d6a7", sciences: "#ce93d8", writing: "#ffd54f",
}

const SUBJECT_TAG: Record<SubjectKey, string> = {
  math: "Peso 4 · Max", languages: "Peso 2",
  humanities: "Peso 1", sciences: "Peso 1", writing: "Obrigatório",
}

function subjectHref(key: SubjectKey) {
  return key === "writing" ? "/essay" : `/learn/${key}`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const mounted                 = useHasMounted()
  const { subjectPerformance }  = useGamificationStore()
  const { user, signOut, loading: authLoading } = useAuth()

  // Writing level state
  const {
    loadTree, loadProgress, loadLevelState, getLevels,
    isTreeLoaded, isProgressLoaded, isLevelStateLoaded,
  } = useWritingProgressStore()

  useEffect(() => { loadTree() }, [loadTree])
  useEffect(() => {
    if (!user) return
    loadProgress(user.id)
    loadLevelState(user.id)
  }, [user, loadProgress, loadLevelState])

  const writingLevels = mounted && isTreeLoaded ? getLevels() : []
  const writingReady  = mounted && isTreeLoaded && (!user || (isProgressLoaded && isLevelStateLoaded))
  const [showLogin, setShowLogin] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Display name: full_name metadata → email prefix → "Usuário"
  const displayName = user
    ? (user.user_metadata?.full_name as string | undefined)
        || user.email?.split("@")[0]
        || "Usuário"
    : null

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <AuthSync />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ClientOnlyIcon icon={Crosshair} className="h-5 w-5 text-[#388bfd]" />
          <span className="font-mono text-sm font-black tracking-widest text-white uppercase">
            Atlas <span className="text-[#388bfd]">UFG</span> 2026
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/daily-drop"
            className="flex items-center gap-1.5 rounded-lg border border-[#388bfd]/30 px-3 py-2 font-mono text-xs font-bold text-[#388bfd] hover:bg-[#388bfd]/10 transition-colors"
            style={{ minHeight: 36 }}
          >
            <ClientOnlyIcon icon={Zap} className="h-3 w-3" />
            Daily Drop
          </Link>

          {/* Auth — show only after hydration + auth loaded */}
          {mounted && !authLoading && (
            user ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-500">
                  Olá, <span className="text-white font-semibold">{displayName}</span>
                </span>
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  title="Histórico de temas"
                  className={[
                    "p-2 rounded-lg border transition-colors",
                    showHistory
                      ? "border-[#388bfd]/50 text-[#388bfd] bg-[#388bfd]/10"
                      : "border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600",
                  ].join(" ")}
                >
                  <ClientOnlyIcon icon={History} className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => signOut()}
                  title="Sair"
                  className="p-2 rounded-lg border border-neutral-800 text-neutral-500 hover:text-red-400 hover:border-red-900 transition-colors"
                >
                  <ClientOnlyIcon icon={LogOut} className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 rounded-lg border border-orange-500/40 px-3 py-2 font-mono text-xs font-semibold text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 transition-colors"
                style={{ minHeight: 36 }}
              >
                <ClientOnlyIcon icon={User} className="h-3 w-3" />
                Entrar
              </button>
            )
          )}
        </div>
      </nav>

      {/* ── ENEM Countdown ───────────────────────────────────────────────── */}
      <section className="mb-4">
        <CountdownTimer />
      </section>

      {/* ── Player ───────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <PlayerHeader />
      </section>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* Left column */}
        <div className="flex flex-col gap-8">

          {/* ══════════════════════════════════════════════════════════════
              SEÇÃO 1 — REDAÇÃO (PRIMARY)
          ══════════════════════════════════════════════════════════════ */}
          <section
            className="rounded-2xl p-5"
            style={{ border: "1px solid #f9731630", background: "#0a0a0a" }}
          >
            <EssayTopicGrid />
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SEÇÃO "DO ZERO AO 1000" — badges de nível de redação
          ══════════════════════════════════════════════════════════════ */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
                Trilha de Redação
              </p>
              <Link
                href="/essay/learn"
                className="font-mono text-[10px] text-[#f78166] hover:text-orange-300 transition-colors uppercase tracking-widest"
              >
                Ver tudo →
              </Link>
            </div>

            {writingReady ? (
              <div className="flex flex-col gap-2">
                {writingLevels.map(level => (
                  <WritingLevelBadge key={level.levelNumber} level={level} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl border border-neutral-800 bg-neutral-900/40 animate-pulse" />
                ))}
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SEÇÃO HISTÓRICO — mostra ao clicar no botão History
          ══════════════════════════════════════════════════════════════ */}
          {showHistory && <UserHistoryList />}

          {/* ══════════════════════════════════════════════════════════════
              SEÇÃO 2 — MATÉRIAS (SECONDARY)
          ══════════════════════════════════════════════════════════════ */}
          <section>
            <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mb-3">
              Módulos de Estudo
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SUBJECT_ORDER.map((key) => {
                const s = SUBJECTS[key]
                const accuracy = mounted
                  ? Math.round((subjectPerformance[key]?.accuracy ?? 0) * 100)
                  : 0
                return (
                  <StandardEntryCard
                    key={key}
                    title={s.labelShort}
                    description={s.description}
                    tag={SUBJECT_TAG[key]}
                    icon={SUBJECT_ICON[key]}
                    progress={accuracy}
                    href={subjectHref(key)}
                    ariaLabel={`Iniciar aula de ${s.labelShort}`}
                    accentColor={SUBJECT_ACCENT[key]}
                  />
                )
              })}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-6">
          <CompetenceMatrix />
          <PerformanceRadar />
        </aside>
      </div>

      <footer className="mt-12 border-t border-neutral-900 pt-4 text-center font-mono text-xs text-neutral-700">
        ATLAS ENEM · UFG 2026 · Mat×4 · Lin×2 · Red×2 · Hum×1 · Cien×1
      </footer>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </main>
  )
}

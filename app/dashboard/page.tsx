"use client"

import Link from "next/link"
import {
  Calculator, BookOpen, Globe, FlaskConical, PenLine,
  Crosshair, Zap, BookMarked,
} from "lucide-react"
import { SUBJECTS } from "@/config/ufg-weights"
import type { SubjectKey } from "@/config/ufg-weights"
import { PlayerHeader } from "@/components/dashboard/PlayerHeader"
import { PerformanceRadar } from "@/components/dashboard/PerformanceRadar"
import { StandardEntryCard } from "@/components/dashboard/StandardEntryCard"
import { ClientOnlyIcon } from "@/components/ui/ClientOnlyIcon"
import { useGamificationStore } from "@/store/gamification-store"
import { useHasMounted } from "@/hooks/useHasMounted"

// ─── Subject metadata ─────────────────────────────────────────────────────────

const SUBJECT_ORDER: SubjectKey[] = [
  "math",
  "languages",
  "humanities",
  "sciences",
  "writing",
]

const SUBJECT_ICON = {
  math:       Calculator,
  languages:  BookOpen,
  humanities: Globe,
  sciences:   FlaskConical,
  writing:    PenLine,
} as const

// Accent colors per subject — inline styles to avoid Tailwind purge of
// dynamic class interpolation. All visually harmonious against neutral-900.
const SUBJECT_ACCENT: Record<SubjectKey, string> = {
  math:       "#f78166",   // vermelho-laranja (prioridade máxima)
  languages:  "#79c0ff",   // azul claro
  humanities: "#a5d6a7",   // verde suave
  sciences:   "#ce93d8",   // lilás
  writing:    "#ffd54f",   // âmbar (obrigatório)
}

const SUBJECT_TAG: Record<SubjectKey, string> = {
  math:       "Peso 4 · Max",
  languages:  "Peso 2",
  humanities: "Peso 1",
  sciences:   "Peso 1",
  writing:    "Obrigatório",
}

function subjectHref(key: SubjectKey): string {
  return key === "writing" ? "/essay" : `/learn/${key}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const mounted = useHasMounted()
  const { subjectPerformance } = useGamificationStore()

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      {/* Nav */}
      <nav
        className="max-w-4xl mx-auto mb-10 flex items-center justify-between"
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-2">
          <ClientOnlyIcon icon={Crosshair} className="h-5 w-5 text-[#388bfd]" />
          <span className="font-mono text-sm font-black tracking-widest text-white uppercase">
            Atlas <span className="text-[#388bfd]">UFG</span> 2026
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/daily-drop"
            aria-label="Daily Drop — questões diárias"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs font-bold text-[#388bfd] transition-colors hover:border-[#388bfd]/50 hover:bg-[#388bfd]/10"
          >
            <ClientOnlyIcon icon={Zap} className="h-3 w-3" />
            Daily Drop
          </Link>
          <Link
            href="/essay"
            aria-label="Módulo de Redação"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
          >
            <ClientOnlyIcon icon={BookMarked} className="h-3 w-3" />
            Redação
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Player status */}
        <PlayerHeader />

        {/* Subject grid */}
        <section aria-labelledby="learn-heading">
          <div className="mb-6">
            <h2
              id="learn-heading"
              className="text-2xl font-bold text-white"
            >
              Escolha uma matéria
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Teoria → Exemplo resolvido → Quiz adaptativo
            </p>
          </div>

          {/*
            Grid: 1 col mobile → 2 col sm → 3 col lg.
            Cada card tem min-h-[172px] — toque mínimo (>57px) garantido.
          */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  ariaLabel={`Iniciar aula de ${s.labelShort} — ${SUBJECT_TAG[key]}`}
                  accentColor={SUBJECT_ACCENT[key]}
                />
              )
            })}
          </div>
        </section>

        {/* Performance radar */}
        <PerformanceRadar />
      </div>
    </div>
  )
}

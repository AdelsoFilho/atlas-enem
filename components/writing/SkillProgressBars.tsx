"use client"

import type { WritingLevel } from "@/modules/essay/writing-types"

// ── 5 Competências do ENEM ────────────────────────────────────────────────────

const COMPETENCES = [
  { id: 1, label: "C1 — Norma Culta",     color: "#79c0ff", levelNumbers: [0] },
  { id: 2, label: "C2 — Tipo Textual",    color: "#a5d6a7", levelNumbers: [1] },
  { id: 3, label: "C3 — Argumentação",    color: "#f78166", levelNumbers: [0, 1, 2] },
  { id: 4, label: "C4 — Coesão",          color: "#ffd54f", levelNumbers: [3] },
  { id: 5, label: "C5 — Intervenção",     color: "#ce93d8", levelNumbers: [4] },
] as const

// Maps writing level → which competences it trains
function getCompetenceProgress(
  competenceLevels: readonly number[],
  levels: WritingLevel[]
): number {
  if (!levels.length) return 0

  const relevant = levels.filter(l => competenceLevels.includes(l.levelNumber))
  if (!relevant.length) return 0

  const total     = relevant.reduce((s, l) => s + l.totalCount, 0)
  const completed = relevant.reduce((s, l) => s + l.completedCount, 0)

  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

interface SkillProgressBarsProps {
  levels: WritingLevel[]
}

export function SkillProgressBars({ levels }: SkillProgressBarsProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
      <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
        Habilidades por Competência
      </p>

      {COMPETENCES.map(c => {
        const pct = getCompetenceProgress(c.levelNumbers, levels)
        const isDominant = pct >= 70

        return (
          <div key={c.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-300">{c.label}</span>
              <div className="flex items-center gap-1.5">
                {isDominant && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold"
                    style={{ color: c.color, background: `${c.color}20` }}
                  >
                    Dominado
                  </span>
                )}
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: c.color }}
                >
                  {pct}%
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width:           `${pct}%`,
                  backgroundColor: c.color,
                  opacity:         pct === 0 ? 0 : 1,
                }}
              />
            </div>

            {pct === 0 && (
              <p className="text-[10px] text-neutral-600">
                Treinado nos Níveis {c.levelNumbers.map(n => n).join(" e ")}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

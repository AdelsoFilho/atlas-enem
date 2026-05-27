"use client"

import Link from "next/link"
import { Lock, CheckCircle2, PlayCircle, BookOpen, Puzzle, Pencil, Link2, Target, FileText } from "lucide-react"
import type { WritingLevel } from "@/modules/essay/writing-types"

// ── Level config ──────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<number, string> = {
  0: "#79c0ff",  // Alfabetização — azul
  1: "#a5d6a7",  // Arquitetura — verde
  2: "#ffd54f",  // Parágrafo — âmbar
  3: "#ce93d8",  // Conectivos — lilás
  4: "#f78166",  // Intervenção — laranja
  5: "#56d364",  // Redação Completa — verde neon
}

const LEVEL_ICON: Record<number, React.ElementType> = {
  0: BookOpen,
  1: Puzzle,
  2: Pencil,
  3: Link2,
  4: Target,
  5: FileText,
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LevelCardProps {
  level: WritingLevel
}

export function LevelCard({ level }: LevelCardProps) {
  const { levelNumber, levelName, status, completedCount, totalCount } = level
  const color   = LEVEL_COLOR[levelNumber] ?? "#8b949e"
  const Icon    = LEVEL_ICON[levelNumber]  ?? BookOpen
  const locked  = status === "locked"
  const done    = status === "completed"
  const pct     = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const card = (
    <div
      className={[
        "group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200",
        locked
          ? "border-neutral-800 bg-neutral-900/40 opacity-60 cursor-not-allowed"
          : done
            ? "border-green-800/50 bg-green-900/10 hover:border-green-700/60 hover:bg-green-900/20"
            : "border-neutral-700 bg-neutral-900 hover:border-neutral-500 hover:bg-neutral-800/60 cursor-pointer",
      ].join(" ")}
    >
      {/* Level badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
            style={{
              background: locked ? "#21262d" : `${color}20`,
              border:     locked ? "1px solid #21262d" : `1px solid ${color}40`,
            }}
          >
            {locked
              ? <Lock className="h-4 w-4 text-neutral-600" />
              : <Icon className="h-4 w-4" style={{ color }} />
            }
          </div>

          <div>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Nível {levelNumber}
            </p>
            <p className="text-sm font-bold text-white">{levelName}</p>
          </div>
        </div>

        {/* Status icon */}
        {done   && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
        {locked && <Lock         className="h-4 w-4 text-neutral-600 shrink-0" />}
        {!locked && !done && status === "in_progress" && (
          <PlayCircle className="h-5 w-5 shrink-0" style={{ color }} />
        )}
      </div>

      {/* Lessons count */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">
          {completedCount}/{totalCount} lições
        </span>
        {!locked && (
          <span className="font-mono font-bold" style={{ color }}>
            {pct}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!locked && (
        <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      )}

      {/* Lock message */}
      {locked && (
        <p className="text-[11px] text-neutral-600">
          Complete o Nível {levelNumber - 1} para desbloquear
        </p>
      )}
    </div>
  )

  if (locked) return card

  return (
    <Link href={`/essay/learn/${levelNumber}`}>
      {card}
    </Link>
  )
}

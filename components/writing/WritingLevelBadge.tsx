"use client"

import Link from "next/link"
import { Lock, Unlock, ChevronRight, PenLine } from "lucide-react"
import type { WritingLevel } from "@/modules/essay/writing-types"

// ── Config por nível ──────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<number, string> = {
  0: "#79c0ff",
  1: "#a5d6a7",
  2: "#ffd54f",
  3: "#ce93d8",
  4: "#f78166",
  5: "#56d364",
}

const LEVEL_LABEL: Record<number, string> = {
  0: "0→1",
  1: "1→2",
  2: "2→3",
  3: "3→4",
  4: "4→5",
  5: "5 ★",
}

// ── Variante: Bloqueado ───────────────────────────────────────────────────────

function LockedBadge({ level }: { level: WritingLevel }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 opacity-60 cursor-not-allowed select-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
        <Lock className="h-3.5 w-3.5 text-neutral-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
            Nível {LEVEL_LABEL[level.levelNumber]}
          </span>
        </div>
        <p className="text-xs text-neutral-700 truncate mt-0.5">{level.levelName}</p>
      </div>

      <span className="font-mono text-[10px] text-neutral-700 shrink-0">Bloqueado</span>
    </div>
  )
}

// ── Variante: Em progresso ────────────────────────────────────────────────────

function ProgressBadge({ level }: { level: WritingLevel }) {
  const color = LEVEL_COLOR[level.levelNumber] ?? "#8b949e"
  const pct   = level.totalCount > 0
    ? Math.round((level.completedCount / level.totalCount) * 100)
    : 0

  return (
    <Link
      href={`/essay/learn/${level.levelNumber}`}
      className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:bg-neutral-800/60"
      style={{
        borderColor: `${color}40`,
        background:  `${color}08`,
      }}
    >
      {/* Icon */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}20` }}
      >
        <span className="font-mono text-xs font-black" style={{ color }}>
          {LEVEL_LABEL[level.levelNumber]}
        </span>
      </div>

      {/* Info + bar */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white truncate">{level.levelName}</p>
          <span className="font-mono text-xs font-bold ml-2 shrink-0" style={{ color }}>
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        <p className="text-[10px] text-neutral-500">
          {level.completedCount}/{level.totalCount} lições concluídas
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-neutral-700 group-hover:text-white transition-colors"
      />
    </Link>
  )
}

// ── Variante: Herói (Nível 5 completo) ───────────────────────────────────────

function HeroBadge() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-4"
      style={{ borderColor: "#56d36440", background: "#56d36408" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Unlock className="h-4 w-4 text-[#56d364]" />
        <span className="font-mono text-xs font-black text-[#56d364] uppercase tracking-wider">
          Nível 5 ★ — Modo Herói
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Você completou toda a trilha "Do Zero ao 1000". Está pronto para a prova real.
      </p>

      {/* Glow button */}
      <Link
        href="/essay"
        className="flex items-center justify-center gap-2 rounded-xl border border-[#56d364]/50 bg-[#56d364]/10 px-4 py-2.5 font-mono text-sm font-bold text-[#56d364] hover:bg-[#56d364]/20 transition-colors animate-pulse hover:animate-none"
      >
        <PenLine className="h-4 w-4" />
        Redação Livre
      </Link>
    </div>
  )
}

// ── Component principal ───────────────────────────────────────────────────────

interface WritingLevelBadgeProps {
  level: WritingLevel
}

export function WritingLevelBadge({ level }: WritingLevelBadgeProps) {
  const { status, levelNumber } = level

  // Nível 5 concluído → Herói
  if (levelNumber === 5 && status === "completed") {
    return <HeroBadge />
  }

  // Bloqueado
  if (status === "locked") {
    return <LockedBadge level={level} />
  }

  // Em progresso ou concluído (nível 0-4)
  return <ProgressBadge level={level} />
}

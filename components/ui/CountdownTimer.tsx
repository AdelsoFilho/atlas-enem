"use client"

import { useCountdown, ENEM_2026_DATE } from "@/hooks/useCountdown"

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

// ── Unit block ────────────────────────────────────────────────────────────────
// Fonte mono + tabular-nums elimina o "pulo de layout" a cada tick.

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className="font-mono text-sm sm:text-base font-bold leading-none tabular-nums">
        {value}
      </span>
      <span className="font-mono text-[8px] uppercase tracking-widest mt-0.5 opacity-50">
        {label}
      </span>
    </div>
  )
}

function Sep() {
  return (
    <span className="font-mono text-sm font-bold opacity-30 pb-3 select-none">:</span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CountdownTimer() {
  const { days, hours, minutes, seconds, isPast, isUrgent, isCritical, isHydrating } =
    useCountdown(ENEM_2026_DATE)

  // ── Paleta de urgência ─────────────────────────────────────────────────────
  const textColor   = isCritical ? "text-red-400"    : isUrgent ? "text-orange-400"    : "text-neutral-200"
  const borderColor = isCritical ? "border-red-900/60" : isUrgent ? "border-orange-900/60" : "border-neutral-800"
  const bgColor     = isCritical ? "bg-red-950/30"   : isUrgent ? "bg-orange-950/25"   : "bg-neutral-900/60"
  const dotColor    = isCritical ? "bg-red-500"      : isUrgent ? "bg-orange-500"       : "bg-[#388bfd]"

  // ── Esqueleto durante SSR / 1º render ──────────────────────────────────────
  if (isHydrating) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-700 animate-pulse" />
        <span className="font-mono text-[10px] text-neutral-600 tracking-widest">
          ENEM&nbsp;2026&nbsp;·&nbsp;--d : --h : --m : --s
        </span>
      </div>
    )
  }

  // ── Exame já realizado ─────────────────────────────────────────────────────
  if (isPast) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-green-900/50 bg-green-950/20 px-3 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span className="font-mono text-[11px] text-green-400 font-semibold uppercase tracking-widest">
          ENEM 2026 realizado!
        </span>
      </div>
    )
  }

  return (
    <div
      className={`
        flex items-center gap-3 rounded-xl border ${borderColor} ${bgColor}
        px-3 py-2.5 backdrop-blur-sm
        transition-colors duration-1000
      `}
    >
      {/* Dot pulsante "ao vivo" */}
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full animate-pulse ${dotColor}`} />

      {/* Label */}
      <span className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-widest shrink-0 opacity-60 ${textColor}`}>
        ENEM&nbsp;2026
      </span>

      {/* Separador */}
      <span className="text-neutral-700 text-xs" aria-hidden>·</span>

      {/* Unidades de tempo */}
      <div className={`flex items-end gap-1 ${textColor}`}>
        <Unit value={pad(days)}    label="dias" />
        <Sep />
        <Unit value={pad(hours)}   label="horas" />
        <Sep />
        <Unit value={pad(minutes)} label="min" />
        {/* Segundos visíveis sempre — fonte pequena não prejudica em mobile */}
        <Sep />
        <Unit value={pad(seconds)} label="seg" />
      </div>
    </div>
  )
}

"use client"

import { useCountdown, ENEM_2026_DATE } from "@/hooks/useCountdown"

// ── Utils ─────────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

// ── Unit block ────────────────────────────────────────────────────────────────

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* Fonte mono para evitar pulo de layout quando o dígito muda */}
      <span className="font-mono text-[15px] sm:text-[17px] font-bold leading-none tabular-nums">
        {value}
      </span>
      <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest mt-0.5 opacity-60">
        {label}
      </span>
    </div>
  )
}

function Sep() {
  return (
    <span className="font-mono text-[13px] sm:text-[15px] font-bold opacity-40 pb-2 select-none">
      :
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CountdownTimerProps {
  /** Compacto: oculta segundos em mobile (default true) */
  compact?: boolean
}

export function CountdownTimer({ compact = true }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isPast, isUrgent, isCritical, isHydrating } =
    useCountdown(ENEM_2026_DATE)

  // Cor do texto: muda com a proximidade do ENEM
  const textColor = isCritical
    ? "text-red-400"
    : isUrgent
    ? "text-orange-400"
    : "text-neutral-300"

  // Border/glow de urgência
  const borderColor = isCritical
    ? "border-red-900/60"
    : isUrgent
    ? "border-orange-900/60"
    : "border-neutral-800"

  const bgColor = isCritical
    ? "bg-red-950/30"
    : isUrgent
    ? "bg-orange-950/30"
    : "bg-neutral-900/60"

  // Esqueleto durante hidratação — evita mismatch SSR
  if (isHydrating) {
    return (
      <div className={`flex items-center gap-3 rounded-xl border ${borderColor} ${bgColor} px-3 py-2`}>
        <span className="h-2 w-2 rounded-full bg-neutral-700 animate-pulse" />
        <span className="font-mono text-[11px] text-neutral-600">ENEM 2026 em: --d --h --m --s</span>
      </div>
    )
  }

  if (isPast) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-900/50 bg-green-950/30 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
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
        px-3 py-2 backdrop-blur-sm
      `}
    >
      {/* Dot pulsante de "ao vivo" */}
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full animate-pulse ${
          isCritical ? "bg-red-500" : isUrgent ? "bg-orange-500" : "bg-[#388bfd]"
        }`}
      />

      {/* Label ENEM */}
      <span className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-widest shrink-0 ${textColor} opacity-70`}>
        ENEM&nbsp;2026
      </span>

      {/* Separador */}
      <span className="text-neutral-700 text-xs">·</span>

      {/* Unidades de tempo */}
      <div className={`flex items-end gap-1 ${textColor}`}>
        <Unit value={pad(days)}    label="dias" />
        <Sep />
        <Unit value={pad(hours)}   label="horas" />
        <Sep />
        <Unit value={pad(minutes)} label="min" />

        {/* Segundos: ocultos em telas muito pequenas quando compact=true */}
        <span className={compact ? "hidden xs:flex items-end gap-1" : "flex items-end gap-1"}>
          <Sep />
          <Unit value={pad(seconds)} label="seg" />
        </span>
      </div>
    </div>
  )
}

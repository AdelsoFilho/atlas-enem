"use client"

import Link from "next/link"
import { type ComponentType } from "react"
import type { LucideProps } from "lucide-react"
import { ClientOnlyIcon } from "@/components/ui/ClientOnlyIcon"

// ─── Types ────────────────────────────────────────────────────────────────────

type ColorToken = "math" | "languages" | "writing" | "humanities" | "sciences"
type Priority   = "max" | "high" | "normal"

export interface MatterEntryCardProps {
  title:     string
  subtitle:  string          // e.g. "Peso 4 UFG · ×4 XP"
  icon:      ComponentType<LucideProps>
  colorToken: ColorToken
  priority:  Priority
  /** 0–100, accuracy from gamification store */
  progress:  number
  href:      string
  ariaLabel: string
  /** Optional "Em breve" / "Gerando..." state — disables navigation */
  disabled?: boolean
  comingSoon?: boolean
}

// ─── Static Tailwind class map (dynamic interpolation not safe with Purge) ────
//
// ALL classes must appear verbatim in source so Tailwind includes them.

const THEME: Record<ColorToken, {
  cardBorder:     string
  cardHoverBorder: string
  cardHoverBg:    string
  iconRing:       string
  iconBg:         string
  iconText:       string
  barFill:        string
  weightText:     string
  accentLine:     string
}> = {
  math: {
    cardBorder:      "border-math/20",
    cardHoverBorder: "hover:border-math/60",
    cardHoverBg:     "hover:bg-math/5",
    iconRing:        "ring-math/30",
    iconBg:          "bg-math/15",
    iconText:        "text-math",
    barFill:         "bg-math",
    weightText:      "text-math",
    accentLine:      "bg-math",
  },
  languages: {
    cardBorder:      "border-languages/20",
    cardHoverBorder: "hover:border-languages/60",
    cardHoverBg:     "hover:bg-languages/5",
    iconRing:        "ring-languages/30",
    iconBg:          "bg-languages/15",
    iconText:        "text-languages",
    barFill:         "bg-languages",
    weightText:      "text-languages",
    accentLine:      "bg-languages",
  },
  writing: {
    cardBorder:      "border-writing/20",
    cardHoverBorder: "hover:border-writing/60",
    cardHoverBg:     "hover:bg-writing/5",
    iconRing:        "ring-writing/30",
    iconBg:          "bg-writing/15",
    iconText:        "text-writing",
    barFill:         "bg-writing",
    weightText:      "text-writing",
    accentLine:      "bg-writing",
  },
  humanities: {
    cardBorder:      "border-humanities/20",
    cardHoverBorder: "hover:border-humanities/60",
    cardHoverBg:     "hover:bg-humanities/5",
    iconRing:        "ring-humanities/30",
    iconBg:          "bg-humanities/15",
    iconText:        "text-humanities",
    barFill:         "bg-humanities",
    weightText:      "text-humanities",
    accentLine:      "bg-humanities",
  },
  sciences: {
    cardBorder:      "border-sciences/20",
    cardHoverBorder: "hover:border-sciences/60",
    cardHoverBg:     "hover:bg-sciences/5",
    iconRing:        "ring-sciences/30",
    iconBg:          "bg-sciences/15",
    iconText:        "text-sciences",
    barFill:         "bg-sciences",
    weightText:      "text-sciences",
    accentLine:      "bg-sciences",
  },
}

const PRIORITY_BADGE: Record<Priority, { label: string; className: string }> = {
  max:    { label: "Prioridade máxima", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  high:   { label: "Alta prioridade",   className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  normal: { label: "Normal",            className: "bg-white/5 text-surface-2 border-white/10" },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MatterEntryCard({
  title,
  subtitle,
  icon,
  colorToken,
  priority,
  progress,
  href,
  ariaLabel,
  disabled = false,
  comingSoon = false,
}: MatterEntryCardProps) {
  const t    = THEME[colorToken]
  const p    = PRIORITY_BADGE[priority]
  const pct  = Math.min(100, Math.max(0, progress))

  const inner = (
    <span
      className={[
        // Layout — card body
        "group relative flex flex-col gap-4 rounded-2xl border bg-surface p-5",
        // Min height 160px (well above 57px touch target — the full card is the tap zone)
        "min-h-[160px]",
        // Border + hover states (static from THEME map)
        t.cardBorder,
        disabled ? "opacity-50 cursor-not-allowed" : `cursor-pointer ${t.cardHoverBorder} ${t.cardHoverBg}`,
        // Smooth transition
        "transition-all duration-200 ease-out",
        // Subtle scale-up on hover (desktop)
        disabled ? "" : "hover:scale-[1.02] active:scale-[0.99]",
      ].join(" ")}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {/* ── Accent line top — progress indicator ─────────────────────── */}
      <span
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl overflow-hidden"
        aria-hidden="true"
      >
        {/* Track */}
        <span className="absolute inset-0 bg-white/5" />
        {/* Fill — width driven by inline style, color from static class */}
        <span
          className={`absolute inset-y-0 left-0 ${t.accentLine} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </span>

      {/* ── Row 1: Icon + Priority badge ─────────────────────────────── */}
      <span className="flex items-start justify-between gap-3">
        {/* Icon container — 48×48px (≥45px touch area per NN/g) */}
        <span
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            "ring-1",
            t.iconBg,
            t.iconRing,
          ].join(" ")}
        >
          {/* ClientOnlyIcon: SVG deferred to client — zero hydration mismatch */}
          <ClientOnlyIcon
            icon={icon}
            className={`h-6 w-6 ${t.iconText}`}
            placeholderClassName="h-6 w-6"
          />
        </span>

        {/* Priority badge */}
        <span
          className={[
            "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            p.className,
          ].join(" ")}
        >
          {p.label}
        </span>
      </span>

      {/* ── Row 2: Title + subtitle ───────────────────────────────────── */}
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-bold leading-tight text-white">
          {title}
        </span>
        <span className="text-xs text-surface-2 leading-relaxed">
          {subtitle}
        </span>
      </span>

      {/* ── Row 3: Progress bar + CTA ─────────────────────────────────── */}
      <span className="mt-auto flex flex-col gap-2">
        {/* Inline progress bar */}
        <span className="flex items-center gap-2">
          <span className="relative flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <span
              className={`absolute inset-y-0 left-0 rounded-full ${t.barFill} transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="text-[10px] font-mono text-surface-2 w-8 text-right">
            {pct}%
          </span>
        </span>

        {/* CTA row */}
        <span className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-surface-2">
            {comingSoon ? "Em breve" : pct === 0 ? "Iniciar aula" : "Continuar"}
          </span>
          <span
            className={[
              "text-xs font-semibold transition-all duration-200",
              t.weightText,
              disabled ? "" : "group-hover:translate-x-0.5",
            ].join(" ")}
          >
            {comingSoon ? "🔒" : "→"}
          </span>
        </span>
      </span>

      {/* ── Bottom accent glow line (hover only) ──────────────────────── */}
      <span
        className={[
          "absolute inset-x-0 bottom-0 h-[2px] rounded-b-2xl",
          t.accentLine,
          "opacity-0 transition-opacity duration-200",
          disabled ? "" : "group-hover:opacity-100",
        ].join(" ")}
        aria-hidden="true"
      />
    </span>
  )

  if (disabled || comingSoon) {
    return <span role="article">{inner}</span>
  }

  return (
    <Link href={href} aria-label={ariaLabel} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl block">
      {inner}
    </Link>
  )
}

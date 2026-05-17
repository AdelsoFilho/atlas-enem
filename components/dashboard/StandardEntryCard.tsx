"use client"

import Link from "next/link"
import { useState, useEffect, type ComponentType } from "react"
import type { LucideProps } from "lucide-react"
import { ArrowRight } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StandardEntryCardProps {
  title:      string
  description: string
  tag:        string          // e.g. "Peso 4 UFG", "Obrigatório diário"
  icon:       ComponentType<LucideProps>
  progress:   number          // 0–100
  href:       string
  ariaLabel:  string
  /** Subtle accent for the progress bar — defaults to accent blue */
  accentColor?: string        // tailwind arbitrary: "rgb(247,129,102)" or hex
}

// ─── Client-only icon (useEffect pattern) ─────────────────────────────────────
//
// Renders nothing on the server (returns a same-size placeholder),
// then mounts the real SVG on the client. This is the correct fix for
// "Hydration failed — Expected server HTML to contain a matching <svg>".

function SafeIcon({
  icon: Icon,
  className,
}: {
  icon: ComponentType<LucideProps>
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Server render + first client render: invisible placeholder with same dimensions.
  // suppressHydrationWarning on the parent span silences any residual attribute diff.
  if (!mounted) {
    return (
      <span
        className={className ?? "h-6 w-6"}
        aria-hidden="true"
        suppressHydrationWarning
      />
    )
  }

  return <Icon className={className} aria-hidden="true" />
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StandardEntryCard({
  title,
  description,
  tag,
  icon,
  progress,
  href,
  ariaLabel,
  accentColor,
}: StandardEntryCardProps) {
  const pct = Math.min(100, Math.max(0, progress))

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={[
        // Focus ring for keyboard nav
        "group block rounded-2xl focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#388bfd] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-black",
      ].join(" ")}
    >
      <article
        className={[
          // Card shell
          "relative flex flex-col overflow-hidden rounded-2xl",
          // Background: near-black card against black page
          "bg-neutral-900",
          // Border: subtle 1px separator
          "border border-neutral-800",
          // Hover: border goes blue + blue glow shadow
          "transition-all duration-200 ease-out",
          "hover:border-[#388bfd]/70",
          "hover:shadow-lg hover:shadow-[#388bfd]/10",
          // Scale micro-interaction
          "hover:scale-[1.015] active:scale-[0.995]",
          // Min height: full card is the touch target (>57px trivially)
          "min-h-[172px]",
        ].join(" ")}
      >
        {/* ── Progress bar — top of card ─────────────────────────────── */}
        {/*
          Height 3px. The fill uses an inline style for the accent color so
          we can accept an arbitrary hex/rgb from props without dynamic
          Tailwind class interpolation (which gets purged in production).
        */}
        <div className="h-[3px] w-full bg-neutral-800" aria-hidden="true">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: accentColor ?? "#388bfd",
            }}
          />
        </div>

        {/* ── Card body ──────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4 p-6">

          {/* Row 1: icon + tag */}
          <div className="flex items-start justify-between gap-3">
            {/*
              Icon container: 48×48px circle (≥ 45px touch-target per NN/g).
              suppressHydrationWarning on this span + SafeIcon pattern inside
              = zero "matching <svg>" error in console.
            */}
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#388bfd]/10 ring-1 ring-[#388bfd]/20"
              suppressHydrationWarning
            >
              <SafeIcon icon={icon} className="h-6 w-6 text-[#388bfd]" />
            </span>

            {/* Tag pill */}
            <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {tag}
            </span>
          </div>

          {/* Row 2: title + description */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold leading-tight text-white">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {description}
            </p>
          </div>

          {/* Row 3: progress + CTA */}
          <div className="mt-auto flex items-center justify-between gap-4">
            {/* Inline progress */}
            <div className="flex flex-1 items-center gap-2">
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: accentColor ?? "#388bfd",
                  }}
                />
              </div>
              <span className="w-8 text-right font-mono text-[10px] text-neutral-500">
                {pct}%
              </span>
            </div>

            {/* Arrow CTA */}
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition-all duration-200 group-hover:bg-[#388bfd]/15 group-hover:text-[#388bfd] group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

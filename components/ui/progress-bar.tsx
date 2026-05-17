"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number      // 0–100
  max?: number
  label?: string
  showPercent?: boolean
  color?: "math" | "languages" | "humanities" | "sciences" | "writing" | "xp" | "accent"
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
}

const colorMap: Record<string, string> = {
  math: "bg-math shadow-[0_0_8px_theme(colors.math.DEFAULT)]",
  languages: "bg-languages shadow-[0_0_8px_theme(colors.languages.DEFAULT)]",
  humanities: "bg-humanities shadow-[0_0_8px_theme(colors.humanities.DEFAULT)]",
  sciences: "bg-sciences shadow-[0_0_8px_theme(colors.sciences.DEFAULT)]",
  writing: "bg-writing shadow-[0_0_8px_theme(colors.writing.DEFAULT)]",
  xp: "bg-xp shadow-[0_0_8px_theme(colors.xp)]",
  accent: "bg-accent shadow-[0_0_8px_theme(colors.accent)]",
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  color = "accent",
  size = "md",
  animated = false,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <span className="font-mono text-xs text-muted">{label}</span>
          )}
          {showPercent && (
            <span className="font-mono text-xs font-semibold text-muted">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-2",
          sizeMap[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorMap[color],
            animated && "animate-pulse-slow"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

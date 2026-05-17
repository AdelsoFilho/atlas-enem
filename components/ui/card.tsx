import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  glow?: "math" | "xp" | "accent" | "writing" | "none"
}

export function Card({ children, className, glow = "none" }: CardProps) {
  const glowMap = {
    math: "shadow-glow-math border-math/30",
    xp: "shadow-glow-xp border-xp/30",
    accent: "shadow-glow-accent border-accent/30",
    writing: "shadow-glow-writing border-writing/30",
    none: "border-border",
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-4 transition-all duration-300",
        glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        "font-mono text-sm font-semibold uppercase tracking-widest text-muted",
        className
      )}
    >
      {children}
    </h3>
  )
}

import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

interface XpBadgeProps {
  xp: number
  multiplier?: number
  size?: "sm" | "md" | "lg"
  animate?: boolean
  className?: string
}

const sizeMap = {
  sm: "text-xs px-1.5 py-0.5 gap-0.5",
  md: "text-sm px-2 py-1 gap-1",
  lg: "text-base px-3 py-1.5 gap-1.5",
}

export function XpBadge({
  xp,
  multiplier,
  size = "md",
  animate = false,
  className,
}: XpBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-xp/30 bg-xp-dim font-mono font-bold text-xp",
        sizeMap[size],
        animate && "animate-pulse-slow",
        className
      )}
    >
      <Zap className="h-3 w-3" />
      +{xp} XP
      {multiplier && multiplier > 1 && (
        <span className="ml-1 text-muted opacity-70">×{multiplier}</span>
      )}
    </span>
  )
}

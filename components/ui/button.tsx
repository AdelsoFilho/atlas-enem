import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger" | "writing"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variantMap = {
  primary:
    "bg-accent text-white hover:bg-accent/90 shadow-glow-accent border-accent/50",
  secondary:
    "bg-surface-2 text-white hover:bg-surface-2/80 border-border",
  ghost:
    "bg-transparent text-muted hover:text-white hover:bg-surface-2 border-transparent",
  danger:
    "bg-red-900/50 text-red-400 hover:bg-red-900/70 border-red-800",
  writing:
    "bg-writing text-background hover:bg-writing/90 shadow-glow-writing border-writing/50 font-bold",
}

const sizeMap = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-mono font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}

"use client"

import { useState, useEffect, type ComponentType } from "react"
import type { LucideProps } from "lucide-react"

interface ClientOnlyIconProps extends LucideProps {
  icon: ComponentType<LucideProps>
  /**
   * Placeholder size while mounting. Must match the icon's h-X w-X classes
   * to avoid layout shift. Defaults to the icon's className dimensions.
   */
  placeholderClassName?: string
}

/**
 * Renders a Lucide icon only on the client, after hydration.
 * Prevents SVG hydration mismatches when icons are inside components
 * that read from Zustand persist stores (SSR state ≠ localStorage state).
 *
 * Placeholder has identical dimensions to avoid layout shift.
 */
export function ClientOnlyIcon({
  icon: Icon,
  placeholderClassName,
  className = "",
  ...props
}: ClientOnlyIconProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Extract h-X w-X from className to keep the same footprint
    const sizeClasses = className
      .split(" ")
      .filter((c) => c.startsWith("h-") || c.startsWith("w-"))
      .join(" ")

    return (
      <span
        className={placeholderClassName ?? sizeClasses ?? "h-4 w-4"}
        aria-hidden="true"
      />
    )
  }

  return <Icon className={className} {...props} />
}

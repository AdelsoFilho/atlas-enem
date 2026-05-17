"use client"

import { useState, useEffect } from "react"

/**
 * Returns false on the server and on the first client render,
 * then flips to true after hydration completes.
 *
 * Use this in any component that reads from a Zustand persist store:
 * the server render always sees the initial (empty) state, while the
 * client sees the localStorage-rehydrated state. Returning early with
 * a skeleton prevents the mismatch that triggers React's hydration error.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

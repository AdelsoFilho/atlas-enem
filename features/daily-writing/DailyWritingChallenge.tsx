"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { WritingEditor } from "./WritingEditor"
import { PenLine, Lock } from "lucide-react"
import { useGamificationStore } from "@/store/gamification-store"

export function DailyWritingChallenge() {
  const { dailyProgress } = useGamificationStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const writingCompleted = mounted && dailyProgress.writingCompleted

  return (
    <Card glow={writingCompleted ? "xp" : "writing"} className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-writing" />
          <CardTitle className="text-writing">Desafio Diário — Redação</CardTitle>
        </div>
        {mounted && !dailyProgress.writingCompleted && (
          <div className="flex items-center gap-1.5 rounded-md border border-orange-800/50 bg-orange-900/20 px-2 py-1">
            <Lock className="h-3 w-3 text-orange-400" suppressHydrationWarning />
            <span className="font-mono text-xs text-orange-300">Dia bloqueado</span>
          </div>
        )}
      </CardHeader>
      <WritingEditor />
    </Card>
  )
}

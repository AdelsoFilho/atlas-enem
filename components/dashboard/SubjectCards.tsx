"use client"

import { useGamificationStore } from "@/store/gamification-store"
import { Card } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { XpBadge } from "@/components/ui/xp-badge"
import { SUBJECTS, type SubjectKey } from "@/config/ufg-weights"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function SubjectCards() {
  const { subjectPerformance } = useGamificationStore()

  const subjectOrder: SubjectKey[] = [
    "math",
    "languages",
    "writing",
    "humanities",
    "sciences",
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {subjectOrder.map((key) => {
        const subject = SUBJECTS[key]
        const perf = subjectPerformance[key]
        const accuracy = Math.round((perf?.accuracy ?? 0) * 100)
        const isMath = key === "math"
        const isWriting = key === "writing"

        return (
          <Card
            key={key}
            glow={isMath ? "math" : isWriting ? "writing" : "none"}
            className={cn(
              "relative",
              isMath && "border-math/20 bg-math/5"
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  {isMath && (
                    <span className="rounded bg-math/20 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-math">
                      PRIORIDADE MAX
                    </span>
                  )}
                  {isWriting && (
                    <span className="rounded bg-writing/20 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-writing">
                      OBRIGATÓRIO
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-mono text-sm font-semibold text-white">
                  {subject.labelShort}
                </h3>
                <p className="font-mono text-xs text-muted">
                  Peso {subject.weight} · ×{subject.xpMultiplier} XP
                </p>
              </div>
              <XpBadge xp={perf?.xpEarned ?? 0} size="sm" />
            </div>

            <ProgressBar
              value={accuracy}
              color={subject.colorToken as Parameters<typeof ProgressBar>[0]["color"]}
              size="sm"
              showPercent
              label={`${perf?.correctAnswers ?? 0}/${perf?.totalQuestions ?? 0} corretas`}
            />

            <div className="mt-2 flex justify-between font-mono text-xs text-muted">
              <span>Ponderado UFG</span>
              <span className="text-white">
                {formatNumber(perf?.weightedScore ?? 0)}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

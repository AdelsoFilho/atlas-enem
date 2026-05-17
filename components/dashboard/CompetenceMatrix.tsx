"use client"

import { useGamificationStore } from "@/store/gamification-store"
import { useQuizStore } from "@/adaptive-quiz/QuizStore"
import { analyzePerformance } from "@/hooks/useGamification"
import { SUBJECTS, type SubjectKey } from "@/config/ufg-weights"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { cn } from "@/lib/utils"
import { AlertTriangle, TrendingUp, Crosshair } from "lucide-react"
import { ClientOnlyIcon } from "@/components/ui/ClientOnlyIcon"
import { useHasMounted } from "@/hooks/useHasMounted"

const difficultyLabel: Record<number, string> = {
  1: "Fund",
  2: "ENEM",
  3: "UFG",
  4: "UNICAMP",
  5: "ITA/IME",
}

export function CompetenceMatrix() {
  const mounted = useHasMounted()
  const { subjectPerformance } = useGamificationStore()
  const { adaptStates } = useQuizStore()
  const { mathAlertActive, subjectScores } = analyzePerformance(subjectPerformance)

  const subjectOrder: SubjectKey[] = [
    "math",
    "languages",
    "writing",
    "humanities",
    "sciences",
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClientOnlyIcon icon={Crosshair} className="h-4 w-4 text-accent" />
          <CardTitle>Matriz de Competência</CardTitle>
        </div>
        <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
          vs. Peso UFG
        </span>
      </CardHeader>

      {/* mounted guard: mathAlertActive depends on Zustand persist — server always false */}
      {mounted && mathAlertActive && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-math/30 bg-math/10 p-3">
          <ClientOnlyIcon
            icon={AlertTriangle}
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-math"
          />
          <p className="font-mono text-xs text-math">
            Matemática abaixo do limiar crítico. Peso 4 — aumente intensidade imediatamente.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {subjectOrder.map((key) => {
          const subject = SUBJECTS[key]
          const accuracy = subjectScores[key] ?? 0
          const adaptState = adaptStates[key]
          const currentLevel = adaptState?.currentDifficulty ?? 3

          // "Nota UFG" = accuracy × peso, normalizada para 0–100
          const ufgScore = Math.round(accuracy * subject.weight * 25) // max = 1×4×25 = 100

          const colorKey = subject.colorToken as Parameters<typeof ProgressBar>[0]["color"]

          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      `bg-${subject.colorToken}`
                    )}
                  />
                  <span className="font-mono text-xs text-white">
                    {subject.labelShort}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    ×{subject.weight}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                      currentLevel >= 4
                        ? "border-writing/30 text-writing"
                        : currentLevel >= 3
                        ? "border-accent/30 text-accent"
                        : "border-border text-muted"
                    )}
                  >
                    {difficultyLabel[currentLevel]}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {Math.round(accuracy * 100)}%
                  </span>
                </div>
              </div>

              <ProgressBar
                value={Math.round(accuracy * 100)}
                color={colorKey}
                size="sm"
              />

              <div className="flex justify-between font-mono text-[10px] text-muted">
                <span>Score ponderado UFG</span>
                <span
                  className={cn(
                    "font-bold",
                    ufgScore >= 70
                      ? "text-xp"
                      : ufgScore >= 40
                      ? "text-writing"
                      : "text-math"
                  )}
                >
                  {ufgScore}/100
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

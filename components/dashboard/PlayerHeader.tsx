"use client"

import { useGamificationStore } from "@/store/gamification-store"
import { ProgressBar } from "@/components/ui/progress-bar"
import { formatNumber } from "@/lib/utils"
import { Zap, Flame, Trophy } from "lucide-react"
import { ClientOnlyIcon } from "@/components/ui/ClientOnlyIcon"
import { useHasMounted } from "@/hooks/useHasMounted"

export function PlayerHeader() {
  const mounted = useHasMounted()
  const { player, streak, dailyProgress } = useGamificationStore()

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClientOnlyIcon icon={Trophy} className="h-5 w-5 text-writing" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Nível {player.level}
            </span>
          </div>
          <h1 className="mt-1 font-mono text-3xl font-black tracking-tight text-white">
            {player.levelName}
          </h1>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col items-center rounded-lg border border-xp/20 bg-xp-dim px-3 py-2">
            <ClientOnlyIcon icon={Zap} className="h-4 w-4 text-xp" />
            <span className="font-mono text-lg font-bold text-xp">
              {mounted ? formatNumber(player.totalXp) : "–"}
            </span>
            <span className="font-mono text-xs text-muted">XP Total</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-writing/20 bg-writing/5 px-3 py-2">
            <ClientOnlyIcon icon={Flame} className="h-4 w-4 text-orange-400" />
            <span className="font-mono text-lg font-bold text-white">
              {mounted ? streak.currentStreak : "–"}
            </span>
            <span className="font-mono text-xs text-muted">Streak</span>
          </div>
        </div>
      </div>

      {/* Barra de XP até próximo nível */}
      <ProgressBar
        value={player.xpInCurrentLevel}
        max={player.xpInCurrentLevel + player.xpToNextLevel}
        color="xp"
        size="md"
        showPercent
        label={
          player.xpToNextLevel > 0
            ? `${formatNumber(player.xpToNextLevel)} XP para ${player.level < 10 ? `Nível ${player.level + 1}` : "Máximo"}`
            : "Nível Máximo Atingido"
        }
      />

      {/* Progresso diário */}
      <div className="mt-4">
        <ProgressBar
          value={dailyProgress.dailyGoalPercent}
          color={dailyProgress.writingCompleted ? "xp" : "writing"}
          size="sm"
          label="Meta diária"
          showPercent
          animated={!dailyProgress.writingCompleted}
        />
        {!dailyProgress.writingCompleted && (
          <p className="mt-1 font-mono text-xs text-writing/70">
            Complete a redação para liberar 100%
          </p>
        )}
      </div>
    </div>
  )
}

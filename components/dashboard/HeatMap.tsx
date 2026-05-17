"use client"

import { useMemo } from "react"
import { useGamificationStore } from "@/store/gamification-store"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, subDays, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { ClientOnlyIcon } from "@/components/ui/ClientOnlyIcon"
import { useHasMounted } from "@/hooks/useHasMounted"

const WEEKS_TO_SHOW = 15  // ~3,5 meses

export function HeatMap() {
  const mounted = useHasMounted()
  const { sessions, writings } = useGamificationStore()

  const cells = useMemo(() => {
    // new Date() must only run client-side — server date ≠ client date causes mismatch
    if (!mounted) return []
    const today = new Date()
    const days: { date: Date; xp: number; hasWriting: boolean }[] = []

    for (let i = WEEKS_TO_SHOW * 7 - 1; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, "yyyy-MM-dd")

      const dayXp = sessions
        .filter((s) => s.completedAt?.startsWith(dateStr))
        .reduce((acc, s) => acc + s.xpEarned, 0)

      const hasWriting = writings.some((w) => w.date === dateStr && w.status === "submitted")

      days.push({ date, xp: dayXp, hasWriting })
    }

    return days
  }, [sessions, writings, mounted])

  function getIntensityClass(xp: number, hasWriting: boolean): string {
    if (xp === 0 && !hasWriting) return "bg-surface-2 border-border"
    if (xp === 0 && hasWriting) return "bg-writing/20 border-writing/30"
    if (xp < 100) return "bg-xp/20 border-xp/30"
    if (xp < 300) return "bg-xp/40 border-xp/50"
    if (xp < 600) return "bg-xp/70 border-xp/70"
    return "bg-xp border-xp shadow-glow-xp"
  }

  // Agrupar em semanas (colunas)
  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"]

  return (
    <Card className="overflow-x-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClientOnlyIcon icon={CalendarDays} className="h-4 w-4 text-xp" />
          <CardTitle>Mapa de Atividade</CardTitle>
        </div>
      </CardHeader>

      {/* Skeleton: same dimensions as the grid, shown before client mounts */}
      {!mounted && (
        <div className="h-[66px] w-full animate-pulse rounded-md bg-surface-2/30" />
      )}

      {mounted && <div className="flex gap-1">
        {/* Labels dos dias */}
        <div className="flex flex-col gap-1 pr-1">
          {dayLabels.map((label, i) => (
            <span
              key={i}
              className="flex h-3.5 w-3.5 items-center justify-center font-mono text-[9px] text-muted"
            >
              {i % 2 === 0 ? label : ""}
            </span>
          ))}
        </div>

        {/* Grid de semanas */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${format(day.date, "dd/MM", { locale: ptBR })} — ${day.xp} XP${day.hasWriting ? " + Redação" : ""}`}
                className={cn(
                  "h-3.5 w-3.5 rounded-sm border transition-all hover:scale-125",
                  getIntensityClass(day.xp, day.hasWriting)
                )}
              />
            ))}
          </div>
        ))}
      </div>}

      {/* Legenda */}
      <div className="mt-3 flex items-center justify-end gap-3">
        <span className="font-mono text-[10px] text-muted">Menos</span>
        {["bg-surface-2", "bg-xp/20", "bg-xp/40", "bg-xp/70", "bg-xp"].map(
          (cls, i) => (
            <div
              key={i}
              className={cn("h-3 w-3 rounded-sm border border-border", cls)}
            />
          )
        )}
        <span className="font-mono text-[10px] text-muted">Mais</span>
        <div className="h-3 w-3 rounded-sm border border-writing/30 bg-writing/20" />
        <span className="font-mono text-[10px] text-writing">Redação</span>
      </div>
    </Card>
  )
}

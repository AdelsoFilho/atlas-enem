"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { useGamificationStore } from "@/store/gamification-store"
import { analyzePerformance } from "@/hooks/useGamification"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp } from "lucide-react"
import { ClientOnlyIcon } from "@/components/ui/ClientOnlyIcon"
import { useHasMounted } from "@/hooks/useHasMounted"
import { SUBJECTS } from "@/config/ufg-weights"

export function PerformanceRadar() {
  const mounted = useHasMounted()
  const { subjectPerformance } = useGamificationStore()
  const { radarData, weightedAverage, mathAlertActive } =
    analyzePerformance(subjectPerformance)

  return (
    <Card glow={mathAlertActive ? "math" : "none"} className="flex flex-col gap-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClientOnlyIcon icon={TrendingUp} className="h-4 w-4 text-accent" />
          <CardTitle>Desempenho Ponderado UFG</CardTitle>
        </div>
        <span className="font-mono text-xs text-muted">
          Média:{" "}
          <span className="font-bold text-white">
            {Math.round(weightedAverage * 100)}%
          </span>
        </span>
      </CardHeader>

      {/* Alerta de Matemática — mounted guard: mathAlertActive vem do Zustand persist */}
      {mounted && mathAlertActive && (
        <div className="flex items-start gap-2 rounded-lg border border-math/30 bg-math/10 p-3">
          <ClientOnlyIcon icon={AlertTriangle} className="mt-0.5 h-4 w-4 flex-shrink-0 text-math" />
          <div>
            <p className="font-mono text-xs font-bold text-math">
              ALERTA: Matemática abaixo do limiar
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted">
              Peso 4.0 — cada ponto aqui vale 4× mais na nota final UFG.
              Priorize exercícios de Matemática hoje.
            </p>
          </div>
        </div>
      )}

      {/* Radar chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#21262d" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#8b949e", fontSize: 11, fontFamily: "monospace" }}
            />
            <Radar
              name="Desempenho"
              dataKey="score"
              stroke="#388bfd"
              fill="#388bfd"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: "#0f1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Acerto"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda de pesos */}
      <div className="grid grid-cols-2 gap-1.5 border-t border-border pt-3 sm:grid-cols-3">
        {Object.values(SUBJECTS).map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full bg-${s.colorToken}`} />
            <span className="font-mono text-xs text-muted">
              {s.labelShort}
              <span className="ml-1 text-white">×{s.weight}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

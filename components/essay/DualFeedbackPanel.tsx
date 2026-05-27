"use client"

import {
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Award,
  RotateCcw, ChevronDown, ChevronUp,
} from "lucide-react"
import { useState } from "react"
import type { BusinessEssayCorrectionResult } from "@/modules/essay/business-types"
import type { CompetenceResult } from "@/modules/essay/types"
import { VIABILITY_COLOR, VIABILITY_BG } from "@/modules/essay/business-types"

// ── Helpers ───────────────────────────────────────────────────────────────────

function noteColor(nota: number): string {
  if (nota >= 160) return "text-green-400"
  if (nota >= 120) return "text-yellow-400"
  if (nota >= 80)  return "text-orange-400"
  return "text-red-400"
}

function scoreBar(value: number, max: number, color: string) {
  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ── Competence Row ────────────────────────────────────────────────────────────

function CompetenceRow({ c }: { c: CompetenceResult }) {
  const [open, setOpen] = useState(false)
  const hasDetails = c.problemas.length > 0 || c.versaoReescrita

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => hasDetails && setOpen((v) => !v)}
      >
        <span className="text-xs font-mono font-bold text-neutral-600 shrink-0 w-5">
          C{c.competencia}
        </span>
        <span className="flex-1 text-sm text-neutral-300 truncate">{c.titulo}</span>
        <span className={`text-sm font-black font-mono shrink-0 ${noteColor(c.nota)}`}>
          {c.nota}
        </span>
        {hasDetails && (
          open
            ? <ChevronUp className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
            : <ChevronDown className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
        )}
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        {scoreBar(c.nota, 200, noteColor(c.nota).replace("text-", "#").replace("green-400", "#4ade80").replace("yellow-400", "#facc15").replace("orange-400", "#fb923c").replace("red-400", "#f87171"))}
      </div>

      {/* Expand */}
      {open && hasDetails && (
        <div className="px-4 pb-4 space-y-3 border-t border-neutral-800 pt-3">
          <p className="text-xs text-neutral-400 leading-relaxed">{c.comentario}</p>

          {c.problemas.length > 0 && (
            <div className="space-y-1">
              {c.problemas.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{p}</p>
                </div>
              ))}
            </div>
          )}

          {c.versaoReescrita && (
            <div className="rounded-xl bg-[#388bfd]/5 border border-[#388bfd]/20 px-3 py-2.5">
              <p className="text-[10px] font-mono text-[#388bfd] uppercase tracking-widest mb-1">
                Versão sugerida
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed italic">
                {c.versaoReescrita}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface DualFeedbackPanelProps {
  result: BusinessEssayCorrectionResult
  onReset: () => void
}

export function DualFeedbackPanel({ result, onReset }: DualFeedbackPanelProps) {
  const v = result.viabilidade
  const vColor = VIABILITY_COLOR[v.nivel]
  const vBg    = VIABILITY_BG[v.nivel]

  // Nível da redação
  const nivelColor =
    result.nivel === "Gênio" ? "text-[#ffd54f]"
    : result.nivel === "Estrategista" ? "text-[#388bfd]"
    : "text-neutral-400"

  return (
    <div className="space-y-6">

      {/* ── Badge Empreendedor Social ──────────────────────────────────── */}
      {result.badge_empreendedor_social && (
        <div className="rounded-2xl border border-[#ffd54f]/40 bg-[#ffd54f]/5 p-5 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#ffd54f]/20 text-3xl">
            🏆
          </div>
          <div>
            <p className="font-mono text-xs text-[#ffd54f] uppercase tracking-widest font-bold">
              Badge conquistada
            </p>
            <p className="text-lg font-black text-white mt-0.5">Empreendedor Social</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              C5 ≥ 160 pts + Viabilidade ≥ 70/100 · +50 XP bônus
            </p>
          </div>
        </div>
      )}

      {/* ── Scores Overview ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Nota ENEM */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-2">
          <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
            Nota ENEM
          </p>
          <p className={`text-4xl font-black font-mono ${nivelColor}`}>
            {result.notaTotal}
          </p>
          <p className="text-xs text-neutral-500">{result.nivel} · /1000</p>
          {scoreBar(result.notaTotal, 1000, vColor)}
        </div>

        {/* Viabilidade */}
        <div className={`rounded-2xl border p-4 space-y-2 ${vBg}`}>
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: vColor, opacity: 0.7 }}>
            Viabilidade
          </p>
          <p className="text-4xl font-black font-mono" style={{ color: vColor }}>
            {v.score}
          </p>
          <p className="text-xs" style={{ color: vColor, opacity: 0.6 }}>{v.nivel} · /100</p>
          {scoreBar(v.score, 100, vColor)}
        </div>
      </div>

      {/* ── Feedback Geral ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
          Diagnóstico Geral
        </p>
        <p className="text-sm text-neutral-300 leading-relaxed">{result.feedbackGeral}</p>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          {result.pontosFortes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-green-600 uppercase tracking-widest">Pontos fortes</p>
              {result.pontosFortes.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-400">{p}</p>
                </div>
              ))}
            </div>
          )}
          {result.areasParaMelhora.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest">Melhorar</p>
              {result.areasParaMelhora.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-400">{p}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 5 Competências ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
          5 Competências ENEM
        </p>
        {result.competencias.map((c) => (
          <CompetenceRow key={c.competencia} c={c} />
        ))}
      </div>

      {/* ── Painel de Viabilidade do Negócio ────────────────────────── */}
      <div className={`rounded-2xl border p-5 space-y-4 ${vBg}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: vColor }} />
          <p className="font-mono text-xs font-black uppercase tracking-widest" style={{ color: vColor }}>
            Análise do Plano de Negócio
          </p>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed">{v.feedbackGeral}</p>

        {/* Checklist */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Custo realista",  value: v.custo_realista  },
            { label: "Escalável",       value: v.escalabilidade  },
            { label: "Impacto social",  value: v.impacto_social  },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl border border-neutral-800 bg-black/40 py-3 px-2"
            >
              {value
                ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                : <XCircle    className="h-5 w-5 text-red-400" />
              }
              <p className="text-[10px] text-neutral-500 text-center leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Pontos favoráveis */}
        {v.pontosFavoraveis.length > 0 && (
          <div className="space-y-1.5">
            {v.pontosFavoraveis.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400">{p}</p>
              </div>
            ))}
          </div>
        )}

        {/* Alertas */}
        {v.alertas.length > 0 && (
          <div className="space-y-1.5">
            {v.alertas.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300/80">{a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recomeçar ────────────────────────────────────────────────── */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-800 py-3 text-sm text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Escrever nova redação
      </button>
    </div>
  )
}

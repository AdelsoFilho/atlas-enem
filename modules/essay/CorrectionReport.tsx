"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { EssayCorrectionResult, CompetenceResult } from "./types"

const COMPETENCE_COLOR = ["", "text-math", "text-languages", "text-accent", "text-humanities", "text-xp"]
const COMPETENCE_BG = ["", "bg-math/10 border-math/30", "bg-languages/10 border-languages/30", "bg-accent/10 border-accent/30", "bg-humanities/10 border-humanities/30", "bg-xp/10 border-xp/30"]

const NIVEL_CONFIG = {
  Iniciado: { color: "text-red-400", bg: "bg-red-900/20 border-red-500/30" },
  Estrategista: { color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-500/30" },
  Gênio: { color: "text-green-400", bg: "bg-green-900/20 border-green-500/30" },
}

function ScoreBar({ nota }: { nota: number }) {
  const pct = (nota / 200) * 100
  const color =
    nota >= 160 ? "bg-green-500" : nota >= 120 ? "bg-yellow-500" : nota >= 80 ? "bg-orange-500" : "bg-red-500"
  return (
    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  )
}

function CompetenceCard({ c }: { c: CompetenceResult }) {
  const [expanded, setExpanded] = useState(false)
  const colorText = COMPETENCE_COLOR[c.competencia]
  const colorBg = COMPETENCE_BG[c.competencia]

  return (
    <div className={`rounded-xl border ${colorBg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left"
      >
        <span className={`text-sm font-bold shrink-0 ${colorText}`}>C{c.competencia}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{c.titulo}</p>
          <ScoreBar nota={c.nota} />
        </div>
        <span className={`text-xl font-bold shrink-0 ${colorText}`}>{c.nota}</span>
        <span className="text-surface-2 text-xs shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
              <p className="text-white text-sm leading-relaxed">{c.comentario}</p>

              {c.problemas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                    Problemas identificados
                  </p>
                  <ul className="space-y-1">
                    {c.problemas.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-red-300">
                        <span className="shrink-0 mt-0.5">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.versaoReescrita && (
                <div className="rounded-lg bg-black/30 border border-white/5 p-3">
                  <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">
                    Sugestão de reescrita{c.paragrafoIdx !== undefined ? ` (§${c.paragrafoIdx})` : ""}
                  </p>
                  <p className="text-white/80 text-xs leading-relaxed italic">
                    {c.versaoReescrita}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface CorrectionReportProps {
  result: EssayCorrectionResult
  onReset: () => void
}

export function CorrectionReport({ result, onReset }: CorrectionReportProps) {
  const nivelCfg = NIVEL_CONFIG[result.nivel]
  const totalPct = (result.notaTotal / 1000) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Total score */}
      <div className={`rounded-2xl border p-6 text-center ${nivelCfg.bg}`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${nivelCfg.color}`}>
          {result.nivel}
        </p>
        <p className={`text-5xl font-black ${nivelCfg.color}`}>{result.notaTotal}</p>
        <p className="text-surface-2 text-xs mt-1">de 1000 pontos</p>
        <div className="mt-4 h-2 w-full rounded-full bg-black/40 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${result.notaTotal >= 800 ? "bg-green-500" : result.notaTotal >= 500 ? "bg-yellow-500" : "bg-red-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${totalPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>

      {/* Feedback geral */}
      <div className="rounded-xl bg-surface border border-white/5 p-4">
        <p className="text-xs font-semibold text-surface-2 uppercase tracking-wider mb-2">
          Diagnóstico geral
        </p>
        <p className="text-white text-sm leading-relaxed">{result.feedbackGeral}</p>
      </div>

      {/* Competências */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-surface-2 uppercase tracking-wider">
          5 Competências
        </p>
        {result.competencias.map((c) => (
          <CompetenceCard key={c.competencia} c={c} />
        ))}
      </div>

      {/* Pontos fortes e áreas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-green-900/10 border border-green-500/20 p-4">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
            Pontos fortes
          </p>
          <ul className="space-y-1">
            {result.pontosFortes.map((p, i) => (
              <li key={i} className="text-xs text-green-300 flex gap-1">
                <span>✓</span>{p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-red-900/10 border border-red-500/20 p-4">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
            Foco imediato
          </p>
          <ul className="space-y-1">
            {result.areasParaMelhora.map((a, i) => (
              <li key={i} className="text-xs text-red-300 flex gap-1">
                <span>→</span>{a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-surface-2 hover:text-white hover:border-white/30 transition-colors"
      >
        ← Nova redação
      </button>
    </motion.div>
  )
}

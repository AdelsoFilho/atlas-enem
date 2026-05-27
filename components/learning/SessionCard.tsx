"use client"

import { CheckCircle2, Clock, PlayCircle, RotateCcw, Zap } from "lucide-react"
import type { TopicSession } from "@/lib/supabaseClient"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  })
}

const STEP_LABELS = ["", "Teoria", "Exemplo", "Simulado", "Concluído"]

// ── Component ─────────────────────────────────────────────────────────────────

interface SessionCardProps {
  session:    Omit<TopicSession, "content_json">
  accentColor: string
  onContinue: (sessionId: string) => void
}

export function SessionCard({ session, accentColor, onContinue }: SessionCardProps) {
  const { id, current_step, xp_earned, is_completed, created_at } = session

  const progressPct  = (current_step / 4) * 100
  const stepLabel    = STEP_LABELS[current_step] ?? "Teoria"
  const isNew        = current_step === 0
  const isDone       = is_completed || current_step >= 4

  return (
    <div
      className={[
        "group flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200",
        isDone
          ? "border-green-800/40 bg-green-900/8 hover:border-green-700/50"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700",
      ].join(" ")}
    >
      {/* Linha superior: data + badge de status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-neutral-500 font-mono">
          {formatDate(created_at)}
        </span>

        {isDone ? (
          <span className="flex items-center gap-1 rounded-full border border-green-700/40 bg-green-900/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Concluída
          </span>
        ) : isNew ? (
          <span className="flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
            <Clock className="h-3 w-3" />
            Não iniciada
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-blue-700/40 bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
            <PlayCircle className="h-3 w-3" />
            Em andamento
          </span>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
            {isNew ? "Iniciar" : `Etapa ${current_step}/4 — ${stepLabel}`}
          </span>
          {xp_earned > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-semibold">
              <Zap className="h-3 w-3" />
              {xp_earned} XP
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:           `${progressPct}%`,
              backgroundColor: isDone ? "#22c55e" : accentColor,
            }}
          />
        </div>
      </div>

      {/* Ações */}
      <button
        onClick={() => onContinue(id)}
        className={[
          "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
          isDone
            ? "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-500"
            : "text-black",
        ].join(" ")}
        style={isDone ? {} : { backgroundColor: accentColor }}
      >
        {isDone ? (
          <><RotateCcw className="h-4 w-4" /> Revisar módulo</>
        ) : isNew ? (
          <><PlayCircle className="h-4 w-4" /> Iniciar</>
        ) : (
          <><PlayCircle className="h-4 w-4" /> Continuar da Etapa {current_step + 1}</>
        )}
      </button>
    </div>
  )
}

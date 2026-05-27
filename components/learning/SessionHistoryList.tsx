"use client"

import { Sparkles, AlertTriangle } from "lucide-react"
import { SessionCard } from "./SessionCard"
import type { TopicSession } from "@/lib/supabaseClient"

interface SessionHistoryListProps {
  sessions:     Omit<TopicSession, "content_json">[]
  accentColor:  string
  isGenerating: boolean
  onContinue:   (sessionId: string) => void
  onNewVariant: () => void
}

export function SessionHistoryList({
  sessions,
  accentColor,
  isGenerating,
  onContinue,
  onNewVariant,
}: SessionHistoryListProps) {
  const hasCompleted = sessions.some(s => s.is_completed)

  return (
    <div className="flex flex-col gap-4">
      {/* Header da lista */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
          {sessions.length} {sessions.length === 1 ? "sessão" : "sessões"} anteriores
        </p>
      </div>

      {/* Cards de sessões */}
      <div className="flex flex-col gap-3">
        {sessions.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            accentColor={accentColor}
            onContinue={onContinue}
          />
        ))}
      </div>

      {/* Botão de nova variante */}
      <div className="mt-2">
        <button
          onClick={onNewVariant}
          disabled={isGenerating}
          className="w-full flex flex-col items-center gap-1 rounded-2xl border border-dashed border-neutral-700 bg-transparent py-4 text-sm text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-neutral-400 border-t-transparent animate-spin" />
              <span className="text-xs">Gerando nova variante…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Gerar Nova Variante</span>
            </>
          )}
        </button>

        {/* Aviso sutil sobre o que a nova variante significa */}
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-neutral-600 leading-relaxed">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-yellow-700" />
          Isso criará uma nova lição com exemplos e questões diferentes.
          {hasCompleted && " Sua pontuação já está salva."}
        </p>
      </div>
    </div>
  )
}

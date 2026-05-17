"use client"

import { useState, useEffect, useCallback } from "react"
import { History, RotateCcw, CheckCircle2, Loader2, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  fetchUserHistory,
  resetUserHistory,
  type DbHistoryEntry,
} from "@/lib/supabaseClient"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(iso))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserHistoryList() {
  const { user } = useAuth()

  const [entries, setEntries] = useState<DbHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUserHistory(user.id)
      setEntries(data)
    } catch {
      setError("Não foi possível carregar o histórico.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleReset() {
    if (!user) return
    const ok = window.confirm(
      "⚠️ Resetar progresso?\n\nTodos os temas serão marcados como não realizados. Essa ação não pode ser desfeita."
    )
    if (!ok) return

    setResetting(true)
    try {
      await resetUserHistory(user.id)
      setEntries([])
    } catch {
      setError("Falha ao resetar progresso.")
    } finally {
      setResetting(false)
    }
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl p-5" style={{ border: "1px solid #388bfd18", background: "#0a0a0a" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="font-mono text-sm font-black uppercase tracking-widest text-[#388bfd] flex items-center gap-2">
          <History className="h-4 w-4" suppressHydrationWarning />
          Seus Campos de Batalha
        </h2>

        {entries.length > 0 && (
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 rounded-lg border border-red-900/50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-950/30 hover:border-red-700 transition-colors disabled:opacity-50"
          >
            {resetting ? (
              <Loader2 className="h-3 w-3 animate-spin" suppressHydrationWarning />
            ) : (
              <Trash2 className="h-3 w-3" suppressHydrationWarning />
            )}
            Resetar Progresso
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-neutral-600 py-4">
          <Loader2 className="h-4 w-4 animate-spin" suppressHydrationWarning />
          <span className="font-mono text-xs">Carregando histórico…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && entries.length === 0 && !error && (
        <div className="text-center py-6">
          <RotateCcw className="h-6 w-6 text-neutral-800 mx-auto mb-2" suppressHydrationWarning />
          <p className="font-mono text-xs text-neutral-700">
            Nenhum tema realizado ainda.
          </p>
          <p className="font-mono text-[10px] text-neutral-800 mt-0.5">
            Escolha um tema acima e comece a escrever.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && entries.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => {
            const topic = entry.essay_topics
            const title = topic?.title ?? `Tema #${entry.topic_id}`
            const category = topic?.category ?? "—"
            const date = formatDate(entry.completed_at)

            return (
              <li
                key={entry.id}
                className="flex items-start gap-3 rounded-xl bg-[#111] border border-neutral-800/60 px-4 py-3"
              >
                {/* Check icon */}
                <CheckCircle2
                  className="h-4 w-4 text-green-500 shrink-0 mt-0.5"
                  suppressHydrationWarning
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block font-mono text-[9px] font-bold uppercase tracking-widest text-[#388bfd] bg-[#388bfd]/10 border border-[#388bfd]/20 rounded px-1.5 py-0.5 mb-1">
                    {category}
                  </span>
                  <p className="text-white text-sm font-semibold leading-snug truncate">
                    {title}
                  </p>
                </div>

                {/* Date */}
                <span className="font-mono text-[10px] text-neutral-600 shrink-0 mt-0.5">
                  {date}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {/* Count */}
      {!loading && entries.length > 0 && (
        <p className="font-mono text-[10px] text-neutral-700 text-center mt-3">
          {entries.length} tema{entries.length !== 1 ? "s" : ""} concluído{entries.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Sparkles, Loader2, Copy, Check, X } from "lucide-react"
import type { BusinessIdea } from "@/config/business-ideas"
import type { GeneratedThesis } from "@/modules/essay/business-types"

// ── Cores por ângulo ──────────────────────────────────────────────────────────

const ANGLE_COLOR: Record<string, string> = {
  "Econômico":  "#56d364",
  "Social":     "#79c0ff",
  "Inovação":   "#ce93d8",
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ThesisGeneratorProps {
  theme: string
  businessIdea: BusinessIdea
  onSelect: (thesis: string) => void
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ThesisGenerator({
  theme,
  businessIdea,
  onSelect,
  onClose,
}: ThesisGeneratorProps) {
  const [theses,    setTheses]    = useState<GeneratedThesis[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/thesis-generator", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ theme, businessIdea }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar teses")
      setTheses(data.theses ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text: string, idx: number) {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[#ffd54f]/30 bg-[#0a0a0a] p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-[#ffd54f]" />
            <h2 className="font-mono text-sm font-black text-white uppercase tracking-widest">
              Gerador de Teses
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Ideia: <span className="text-neutral-300">{businessIdea.title}</span>
            {" "}·{" "}
            Tema: <span className="text-neutral-300 line-clamp-1">{theme}</span>
          </p>
        </div>

        {/* Generate button */}
        {theses.length === 0 && (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-black text-sm transition-all active:scale-[0.99] disabled:opacity-60"
            style={{ background: "#ffd54f" }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando teses…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar 3 Opções de Tese com IA
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Theses list */}
        {theses.length > 0 && (
          <div className="space-y-3">
            {theses.map((t, i) => {
              const color = ANGLE_COLOR[t.angle] ?? "#ffd54f"
              return (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-2.5"
                >
                  {/* Angle badge */}
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-widest"
                    style={{ color, background: `${color}20`, border: `1px solid ${color}30` }}
                  >
                    Ângulo {t.angle}
                  </span>

                  <p className="text-sm text-neutral-200 leading-relaxed">
                    {t.text}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onSelect(t.text)}
                      className="flex-1 rounded-lg py-2 text-xs font-bold transition-all"
                      style={{ background: color, color: "#000" }}
                    >
                      Usar esta tese
                    </button>
                    <button
                      onClick={() => handleCopy(t.text, i)}
                      className="flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      {copiedIdx === i
                        ? <Check className="h-3.5 w-3.5 text-green-400" />
                        : <Copy className="h-3.5 w-3.5" />
                      }
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Regenerate */}
            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-xl border border-neutral-800 py-2.5 text-xs text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 transition-colors"
            >
              {loading ? "Gerando…" : "↻ Gerar novas opções"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

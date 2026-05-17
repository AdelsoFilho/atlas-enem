"use client"

import { useState } from "react"
import { CORINGA_TEMPLATE } from "./types"

// Cores estáticas por parágrafo — inline styles evitam purge do Tailwind
const PARA_THEME: Record<string, { border: string; label: string; dot: string }> = {
  intro:      { border: "#388bfd", label: "#388bfd", dot: "#388bfd"  },
  dev1:       { border: "#79c0ff", label: "#79c0ff", dot: "#79c0ff"  },
  dev2:       { border: "#f78166", label: "#f78166", dot: "#f78166"  },
  conclusion: { border: "#56d364", label: "#56d364", dot: "#56d364"  },
}

export function StructureTemplate() {
  const [open, setOpen] = useState<string | null>("intro")

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
        Template CORINGA
      </p>

      {CORINGA_TEMPLATE.map((para) => {
        const theme = PARA_THEME[para.id] ?? { border: "#ffffff33", label: "#ffffff", dot: "#ffffff" }
        const isOpen = open === para.id

        return (
          <div
            key={para.id}
            className="rounded-xl bg-neutral-900 overflow-hidden transition-all"
            style={{ border: `1px solid ${theme.border}40` }}
          >
            {/* ── Header / botão ─────────────────────────────────── */}
            <button
              onClick={() => setOpen(isOpen ? null : para.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: theme.label }}
                >
                  {para.label}
                </span>
                <span className="text-xs text-neutral-600 font-mono">
                  ~{para.targetWords} palavras
                </span>
              </div>
              <span
                className="text-xs font-mono transition-transform"
                style={{ color: theme.label }}
              >
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* ── Body expandido ─────────────────────────────────── */}
            {isOpen && (
              <div
                className="px-4 pb-4 pt-3 space-y-3"
                style={{ borderTop: `1px solid ${theme.border}25` }}
              >
                {/* Padrão / esqueleto */}
                <div className="rounded-lg bg-black/40 border border-neutral-800 p-3">
                  <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                    {para.pattern}
                  </p>
                </div>

                {/* Dicas */}
                <ul className="space-y-2">
                  {para.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-400 leading-relaxed">
                      <span
                        className="mt-0.5 shrink-0 font-bold"
                        style={{ color: theme.dot }}
                      >
                        •
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

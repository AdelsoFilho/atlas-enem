"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, PenLine, Briefcase, ChevronRight, Crosshair } from "lucide-react"
import { EssayEditor } from "@/modules/essay/EssayEditor"
import { useEssayStore } from "@/modules/essay/essay-store"

// ─── Cores das competências — valores estáticos (sem Tailwind dinâmico) ───────
const COMPETENCE_COLOR: Record<string, string> = {
  math:       "#f78166",
  languages:  "#79c0ff",
  accent:     "#388bfd",
  humanities: "#a5d6a7",
  xp:         "#56d364",
}

const COMPETENCES = [
  { code: "C1", label: "Norma Culta",          colorKey: "math"       },
  { code: "C2", label: "Tema e Estrutura",      colorKey: "languages"  },
  { code: "C3", label: "Argumentação",          colorKey: "accent"     },
  { code: "C4", label: "Coesão Textual",        colorKey: "humanities" },
  { code: "C5", label: "Proposta de Intervenção", colorKey: "xp"       },
]

// ─── Painel de histórico ──────────────────────────────────────────────────────
// Usa hook mounted para não ler o Zustand persist no servidor

function HistoryPanel() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { history } = useEssayStore()

  if (!mounted || history.length === 0) return null

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
        Histórico
      </p>
      <ul className="space-y-2">
        {history.map((entry, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl bg-neutral-800/60 px-3 py-2.5"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-300 truncate">{entry.excerpt}</p>
              <p className="text-[10px] text-neutral-600 mt-0.5 font-mono">{entry.date}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-white">{entry.notaTotal}</p>
              <p className="text-[10px] text-neutral-500">{entry.nivel}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EssayPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Início</span>
            </Link>
            <span className="text-neutral-700" aria-hidden="true">/</span>
            <div className="flex items-center gap-1.5" style={{ color: "#ffd54f" }}>
              {/* Ícone inline sem ClientOnlyIcon — aria-hidden evita mismatch */}
              <PenLine className="h-4 w-4" aria-hidden="true" suppressHydrationWarning />
              <span className="font-semibold">Redação ENEM</span>
            </div>
          </nav>

          <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest hidden sm:block">
            5 Competências · 0–1000 pts
          </span>
        </div>
        {/* Linha amarela (cor da redação) */}
        <div className="h-[2px] w-full bg-[#ffd54f]/30" aria-hidden="true" />
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">

          {/* Coluna principal — editor */}
          <div className="min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Redação ENEM</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Escreva usando o Template CORINGA e receba correção por IA nas 5 competências.
              </p>
            </div>

            {/* ── Modo Empreendedor CTA ─────────────────────────────────── */}
            <Link
              href="/essay/business-mode"
              className="group mb-6 flex items-center gap-3 rounded-2xl border border-[#ffd54f]/25 bg-[#ffd54f]/5 p-4 transition-all hover:border-[#ffd54f]/50 hover:bg-[#ffd54f]/10 block"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffd54f]/15">
                <Briefcase className="h-5 w-5 text-[#ffd54f]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#ffd54f]">Redação & Negócios: Saindo do Zero</p>
                  <span className="rounded-full border border-[#ffd54f]/30 bg-[#ffd54f]/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#ffd54f]/70 uppercase">
                    Novo
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                  Use sua redação para estruturar um plano de negócio real. Nota ENEM + Análise de Viabilidade. Ideias com R$ 0 de investimento.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#ffd54f]/40 group-hover:text-[#ffd54f]/70 transition-colors shrink-0" />
            </Link>

            {/* ── Do Zero ao 1000 CTA ────────────────────────────────────── */}
            <Link
              href="/essay/learn"
              className="group mb-6 flex items-center gap-3 rounded-2xl border border-[#f78166]/25 bg-[#f78166]/5 p-4 transition-all hover:border-[#f78166]/50 hover:bg-[#f78166]/10 block"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f78166]/15">
                <Crosshair className="h-5 w-5 text-[#f78166]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#f78166]">Do Zero ao 1000 — Módulo Progressivo</p>
                  <span className="rounded-full border border-[#f78166]/30 bg-[#f78166]/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#f78166]/70 uppercase">
                    Iniciantes
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                  6 níveis de aprendizado guiado. Comece pelo básico e evolua até o simulado completo.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#f78166]/40 group-hover:text-[#f78166]/70 transition-colors shrink-0" />
            </Link>

            <EssayEditor />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Peso UFG */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">
                Peso UFG
              </p>
              <p className="text-4xl font-black" style={{ color: "#ffd54f" }}>
                2.0×
              </p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Mesmo peso de Linguagens. Nunca pule a redação.
              </p>
            </div>

            {/* Competências — cores via inline style, não classe dinâmica */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
                Competências avaliadas
              </p>
              {COMPETENCES.map(({ code, label, colorKey }) => (
                <div key={code} className="flex items-center gap-2">
                  <span
                    className="w-7 text-xs font-bold shrink-0"
                    style={{ color: COMPETENCE_COLOR[colorKey] }}
                  >
                    {code}
                  </span>
                  <span className="text-xs text-neutral-400 flex-1">{label}</span>
                  <span className="text-[10px] font-mono text-neutral-600">0–200</span>
                </div>
              ))}
              <div className="border-t border-neutral-800 pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Total</span>
                <span className="text-xs font-mono text-white">0–1000</span>
              </div>
            </div>

            {/* Dica rápida */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-2">
                Mnemônico C5
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <span className="font-bold text-white">A</span>gente ·{" "}
                <span className="font-bold text-white">A</span>ção ·{" "}
                <span className="font-bold text-white">M</span>eio ·{" "}
                <span className="font-bold text-white">F</span>inalidade ·{" "}
                <span className="font-bold text-white">D</span>etalhe
              </p>
              <p className="text-[10px] text-neutral-600 mt-1">
                Proposta sem todos os 5 elementos perde pontos em C5.
              </p>
            </div>

            <HistoryPanel />
          </aside>
        </div>
      </main>
    </div>
  )
}

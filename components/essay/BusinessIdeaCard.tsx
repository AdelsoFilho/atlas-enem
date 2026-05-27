"use client"

import { Briefcase, Globe, Store, CheckCircle2, ChevronRight } from "lucide-react"
import type { BusinessIdea, BusinessCategory } from "@/config/business-ideas"

// ── Ícones por categoria ──────────────────────────────────────────────────────

const CATEGORY_ICON: Record<BusinessCategory, typeof Briefcase> = {
  "Serviços": Briefcase,
  "Digital":  Globe,
  "Franquia": Store,
}

const CATEGORY_COLOR: Record<BusinessCategory, string> = {
  "Serviços": "#a5d6a7",
  "Digital":  "#79c0ff",
  "Franquia": "#ffd54f",
}

// ── Dificuldade ───────────────────────────────────────────────────────────────

const DIFF_STYLE = {
  "Iniciante":     "text-green-400 bg-green-400/10 border-green-400/20",
  "Intermediário": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BusinessIdeaCardProps {
  idea: BusinessIdea
  isSelected?: boolean
  onSelect: (idea: BusinessIdea) => void
  onUse?: (idea: BusinessIdea) => void   // "Usar na minha redação"
  compact?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BusinessIdeaCard({
  idea,
  isSelected = false,
  onSelect,
  onUse,
  compact = false,
}: BusinessIdeaCardProps) {
  const Icon  = CATEGORY_ICON[idea.category]
  const color = CATEGORY_COLOR[idea.category]

  const isZeroCost = idea.estimated_cost === "R$ 0"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(idea)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(idea)}
      className={[
        "group relative flex flex-col gap-3 rounded-2xl border p-4 cursor-pointer",
        "transition-all duration-200",
        isSelected
          ? "border-[#ffd54f]/60 bg-[#ffd54f]/5 ring-1 ring-[#ffd54f]/20"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800/60",
      ].join(" ")}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <span className="absolute top-3 right-3">
          <CheckCircle2 className="h-4 w-4 text-[#ffd54f]" />
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-6">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">
            {idea.title}
          </p>
          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
            {idea.category}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Custo */}
        <span
          className={[
            "rounded-full border px-2 py-0.5 text-[10px] font-bold font-mono",
            isZeroCost
              ? "text-green-400 bg-green-400/10 border-green-400/20"
              : "text-neutral-300 bg-neutral-800 border-neutral-700",
          ].join(" ")}
        >
          {isZeroCost ? "✦ R$ 0" : idea.estimated_cost}
        </span>

        {/* Dificuldade */}
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${DIFF_STYLE[idea.difficulty]}`}>
          {idea.difficulty}
        </span>
      </div>

      {/* Eixo ENEM */}
      {!compact && (
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          <span className="text-neutral-600">Eixo ENEM: </span>
          {idea.enem_axis_relation}
        </p>
      )}

      {/* Descrição — aparece quando selecionado */}
      {isSelected && !compact && (
        <div className="rounded-xl bg-[#ffd54f]/5 border border-[#ffd54f]/20 px-3 py-2.5 space-y-2">
          <p className="text-xs text-neutral-300 leading-relaxed">
            {idea.description}
          </p>
          <div className="border-t border-[#ffd54f]/10 pt-2">
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-1">
              Exemplo de Tese
            </p>
            <p className="text-xs text-[#ffd54f]/80 leading-relaxed italic">
              "{idea.example_thesis}"
            </p>
          </div>
        </div>
      )}

      {/* Botão "Usar na redação" */}
      {isSelected && onUse && (
        <button
          onClick={(e) => { e.stopPropagation(); onUse(idea) }}
          className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-bold text-sm text-black transition-all active:scale-[0.99]"
          style={{ background: "#ffd54f" }}
        >
          Usar esta ideia na minha redação
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

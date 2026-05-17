"use client"

import { useState } from "react"
import type { EliteQuote } from "@/types/quiz"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Quote, ChevronDown, ChevronUp, Tag } from "lucide-react"

const disciplineLabel: Record<string, string> = {
  philosophy: "Filosofia",
  sociology: "Sociologia",
  economics: "Economia",
  science: "Ciência",
  literature: "Literatura",
}

const disciplineColor: Record<string, string> = {
  philosophy: "text-languages border-languages/30 bg-languages/10",
  sociology: "text-humanities border-humanities/30 bg-humanities/10",
  economics: "text-writing border-writing/30 bg-writing/10",
  science: "text-sciences border-sciences/30 bg-sciences/10",
  literature: "text-accent border-accent/30 bg-accent-dim",
}

interface QuoteCardProps {
  quote: EliteQuote
  index: number
}

export function QuoteCard({ quote, index }: QuoteCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
          <blockquote className="font-sans text-sm italic leading-relaxed text-white">
            "{quote.text}"
          </blockquote>
        </div>
        <span className="font-mono text-xs font-bold text-muted opacity-40 flex-shrink-0">
          0{index + 1}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-semibold text-white">{quote.author}</p>
          <p className="font-mono text-xs text-muted">
            {quote.work}, {quote.year}
          </p>
        </div>
        <span
          className={cn(
            "rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
            disciplineColor[quote.discipline] ?? "text-muted border-border bg-surface-2"
          )}
        >
          {disciplineLabel[quote.discipline]}
        </span>
      </div>

      {/* Temas aplicáveis */}
      <div className="flex flex-wrap gap-1.5">
        {quote.applicableThemes.map((theme) => (
          <span
            key={theme}
            className="flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted"
          >
            <Tag className="h-2.5 w-2.5" />
            {theme}
          </span>
        ))}
      </div>

      {/* Expansível: contexto + parágrafo modelo */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent/80 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Ocultar uso" : "Como usar na redação"}
      </button>

      {expanded && (
        <div className="mt-1 flex flex-col gap-3 rounded-lg border border-accent/20 bg-accent-dim p-3">
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
              Contexto de aplicação
            </p>
            <p className="font-sans text-xs leading-relaxed text-white/80">
              {quote.usageContext}
            </p>
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
              Parágrafo modelo
            </p>
            <p className="font-sans text-xs leading-relaxed text-white/70 italic border-l-2 border-accent/40 pl-3">
              {quote.modelParagraph}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

"use client"

import { useState, useCallback } from "react"
import { Lightbulb, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import type { BusinessIdea } from "@/config/business-ideas"

// ── Parágrafos ────────────────────────────────────────────────────────────────

type ParagraphId = "intro" | "dev1" | "dev2" | "conclusion"

interface ParagraphMeta {
  id: ParagraphId
  label: string
  placeholder: string
  targetWords: number
  // Tooltip dinâmico (recebe a ideia para personalizar)
  tooltip: (idea: BusinessIdea) => string
  businessHint: (idea: BusinessIdea) => string
}

const PARAGRAPHS: ParagraphMeta[] = [
  {
    id: "intro",
    label: "Introdução",
    targetWords: 80,
    placeholder:
      "Contextualize o problema social com dado ou fato. Apresente sua tese no final do parágrafo.",
    tooltip: (idea) =>
      `Contextualize o problema do tema + apresente o empreendedorismo (especificamente "${idea.title}") como solução viável.`,
    businessHint: (idea) =>
      `Eixo ENEM conectado: ${idea.enem_axis_relation}. Use esse contexto para situar o problema social antes de apresentar sua tese.`,
  },
  {
    id: "dev1",
    label: "Desenvolvimento 1",
    targetWords: 120,
    placeholder:
      "Argumento sobre viabilidade econômica do modelo de negócio. Use dados, pesquisas ou referências reais.",
    tooltip: (idea) =>
      `Argumente sobre VIABILIDADE ECONÔMICA: custo inicial ${idea.estimated_cost}, plataformas disponíveis, potencial de renda.`,
    businessHint: (idea) =>
      `Dado sugerido: segundo o SEBRAE, ${idea.category === "Digital" ? "negócios digitais cresceram 40% após a pandemia" : "serviços locais autônomos geram R$ 1.500–4.000/mês"}. Mencione o investimento de ${idea.estimated_cost} como diferencial de acessibilidade.`,
  },
  {
    id: "dev2",
    label: "Desenvolvimento 2",
    targetWords: 120,
    placeholder:
      "Argumento sobre impacto social: inclusão, geração de emprego, comunidade. Use ângulo diferente do D1.",
    tooltip: () =>
      `Argumente sobre IMPACTO SOCIAL: como esse negócio resolve o problema do tema? Inclusão, geração de emprego, comunidade.`,
    businessHint: (idea) =>
      `Ângulo sugerido: como "${idea.title}" pode especificamente ajudar grupos vulneráveis ligados ao eixo "${idea.enem_axis_relation}"? Use dado do IBGE ou referência a política pública.`,
  },
  {
    id: "conclusion",
    label: "Conclusão — Plano de Ação",
    targetWords: 100,
    placeholder:
      "Retome a tese + apresente sua proposta de intervenção como plano de negócio (Agente + Ação + Meio + Finalidade + Detalhe).",
    tooltip: (idea) =>
      `Estrutura obrigatória: [Agente: Empreendedor Individual/MEI] deve [Ação: criar/oferecer ${idea.title}] por meio de [Meio: ${idea.category === "Digital" ? "plataformas digitais e redes sociais" : "comunidade local e redes sociais"}] com objetivo de [Finalidade: resolver o problema do tema] e [Detalhe: custo ${idea.estimated_cost} — acessível a qualquer cidadão].`,
    businessHint: (idea) =>
      `Custo real a mencionar: ${idea.estimated_cost}. Não invente valores maiores — isso prejudica a viabilidade. Feche com o impacto social esperado.`,
  },
]

// ── Paragraph Block ───────────────────────────────────────────────────────────

interface ParagraphBlockProps {
  meta: ParagraphMeta
  value: string
  onChange: (val: string) => void
  idea: BusinessIdea
}

function ParagraphBlock({ meta, value, onChange, idea }: ParagraphBlockProps) {
  const [showHint, setShowHint] = useState(false)

  const words = value.trim().split(/\s+/).filter(Boolean).length
  const pct   = Math.min(words / meta.targetWords, 1)
  const ok    = words >= meta.targetWords * 0.8

  return (
    <div className="space-y-2">
      {/* Label + word count */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          {meta.label}
        </label>
        <span className={`text-[11px] font-mono ${ok ? "text-green-400" : "text-neutral-600"}`}>
          {words}/{meta.targetWords} palavras
        </span>
      </div>

      {/* Tooltip de negócio */}
      <div className="rounded-xl bg-[#ffd54f]/5 border border-[#ffd54f]/20 overflow-hidden">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-left"
          onClick={() => setShowHint((v) => !v)}
        >
          <Lightbulb className="h-3.5 w-3.5 text-[#ffd54f] shrink-0" />
          <p className="flex-1 text-xs text-[#ffd54f]/80 leading-snug">
            {meta.tooltip(idea)}
          </p>
          {showHint
            ? <ChevronUp className="h-3 w-3 text-[#ffd54f]/50 shrink-0" />
            : <ChevronDown className="h-3 w-3 text-[#ffd54f]/50 shrink-0" />
          }
        </button>

        {showHint && (
          <div className="px-3 pb-3 border-t border-[#ffd54f]/10">
            <p className="text-[11px] text-neutral-500 leading-relaxed mt-2">
              💡 {meta.businessHint(idea)}
            </p>
          </div>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={meta.placeholder}
          rows={5}
          className={[
            "w-full rounded-xl resize-none",
            "bg-neutral-900 border",
            ok ? "border-neutral-700" : "border-neutral-800",
            "px-4 py-3 text-white text-sm leading-7",
            "placeholder:text-neutral-600",
            "focus:outline-none focus:border-[#ffd54f]/40 focus:ring-1 focus:ring-[#ffd54f]/10",
            "transition-colors",
          ].join(" ")}
        />
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: ok ? "#4ade80" : "#ffd54f",
          }}
        />
      </div>
    </div>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────

interface BusinessEssayEditorProps {
  businessIdea: BusinessIdea
  onReady: (text: string, wordCount: number) => void
  initialThesis?: string
}

export function BusinessEssayEditor({
  businessIdea,
  onReady,
  initialThesis = "",
}: BusinessEssayEditorProps) {
  const [paragraphs, setParagraphs] = useState<Record<ParagraphId, string>>({
    intro:      initialThesis,
    dev1:       "",
    dev2:       "",
    conclusion: "",
  })

  const update = useCallback((id: ParagraphId, val: string) => {
    setParagraphs((prev) => ({ ...prev, [id]: val }))
  }, [])

  const fullText    = PARAGRAPHS.map((p) => paragraphs[p.id]).filter(Boolean).join("\n\n")
  const totalWords  = fullText.trim().split(/\s+/).filter(Boolean).length
  const allComplete = PARAGRAPHS.every(
    (p) => paragraphs[p.id].trim().split(/\s+/).filter(Boolean).length >= p.targetWords * 0.8
  )

  return (
    <div className="space-y-6">

      {/* Ideia selecionada (chip) */}
      <div className="flex items-center gap-2 rounded-xl border border-[#ffd54f]/20 bg-[#ffd54f]/5 px-3 py-2">
        <span className="text-[10px] font-mono text-[#ffd54f]/60 uppercase tracking-widest shrink-0">Ideia:</span>
        <span className="text-xs text-[#ffd54f] font-semibold truncate">{businessIdea.title}</span>
        <span className="ml-auto text-[10px] font-mono text-neutral-600">{businessIdea.estimated_cost}</span>
      </div>

      {/* Paragraphs */}
      {PARAGRAPHS.map((meta) => (
        <ParagraphBlock
          key={meta.id}
          meta={meta}
          value={paragraphs[meta.id]}
          onChange={(val) => update(meta.id, val)}
          idea={businessIdea}
        />
      ))}

      {/* Word count total */}
      <div className="flex items-center justify-between text-xs text-neutral-600 font-mono">
        <span>Total: {totalWords} palavras</span>
        <span>{allComplete ? "✓ Mínimo atingido" : "Complete todos os parágrafos"}</span>
      </div>

      {/* Submit */}
      <button
        disabled={!allComplete}
        onClick={() => onReady(fullText, totalWords)}
        className={[
          "w-full rounded-xl py-4 font-bold text-sm transition-all",
          allComplete
            ? "text-black active:scale-[0.99]"
            : "bg-neutral-800 text-neutral-600 cursor-not-allowed",
        ].join(" ")}
        style={allComplete ? { background: "#ffd54f" } : {}}
      >
        {allComplete ? "Corrigir com IA — Nota ENEM + Viabilidade" : `Faltam parágrafos (${totalWords} palavras)`}
      </button>
    </div>
  )
}

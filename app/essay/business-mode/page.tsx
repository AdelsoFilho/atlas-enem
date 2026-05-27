"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Briefcase, Globe, Store, Sparkles,
  PenLine, Filter, ChevronRight,
} from "lucide-react"
import { BusinessIdeaCard }     from "@/components/essay/BusinessIdeaCard"
import { ThesisGenerator }      from "@/components/essay/ThesisGenerator"
import { BusinessEssayEditor }  from "@/components/essay/BusinessEssayEditor"
import { DualFeedbackPanel }    from "@/components/essay/DualFeedbackPanel"
import { BUSINESS_IDEAS }       from "@/config/business-ideas"
import type { BusinessIdea, BusinessFilter } from "@/config/business-ideas"
import type { BusinessEssayCorrectionResult, BusinessEditorStep } from "@/modules/essay/business-types"

// ── Temas do ENEM 2026 ────────────────────────────────────────────────────────

const ENEM_THEMES = [
  "Os desafios da inclusão digital de idosos no Brasil",
  "Impactos da inteligência artificial no mercado de trabalho",
  "A persistência da fome e da insegurança alimentar no Brasil",
  "Caminhos para combater a violência urbana nas grandes cidades",
  "Saúde mental na sociedade contemporânea e o papel das escolas",
  "O envelhecimento da população e os desafios da previdência",
  "Gestão de resíduos sólidos e o problema do lixo no Brasil",
  "A valorização da identidade indígena e a preservação cultural",
  "Democratização do acesso à cultura no país",
  "Direitos humanos e a inclusão de pessoas com deficiência",
]

// ── Filtros ────────────────────────────────────────────────────────────────────

const FILTERS: { id: BusinessFilter; label: string; icon: typeof Briefcase }[] = [
  { id: "Todos",            label: "Todos",          icon: Filter    },
  { id: "Investimento Zero", label: "R$ 0",          icon: Sparkles  },
  { id: "Serviço Local",    label: "Serviço Local",  icon: Briefcase },
  { id: "Digital",          label: "Digital",        icon: Globe     },
]

function applyFilter(ideas: BusinessIdea[], filter: BusinessFilter): BusinessIdea[] {
  if (filter === "Todos")             return ideas
  if (filter === "Investimento Zero") return ideas.filter((i) => i.estimated_cost === "R$ 0")
  if (filter === "Serviço Local")     return ideas.filter((i) => i.category === "Serviços")
  if (filter === "Digital")           return ideas.filter((i) => i.category === "Digital" || i.category === "Franquia")
  return ideas
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS: { id: BusinessEditorStep; label: string }[] = [
  { id: "select-idea",      label: "1. Ideia"    },
  { id: "generate-thesis",  label: "2. Tese"     },
  { id: "write-essay",      label: "3. Escrever" },
  { id: "result",           label: "4. Resultado"},
]

function StepBar({ current }: { current: BusinessEditorStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done    = i < currentIdx
        const active  = i === currentIdx
        return (
          <div key={s.id} className="flex items-center gap-0">
            <div
              className={[
                "rounded-full px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap",
                active ? "bg-[#ffd54f]/20 text-[#ffd54f] border border-[#ffd54f]/40"
                : done  ? "text-neutral-500"
                : "text-neutral-700",
              ].join(" ")}
            >
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className={`h-3 w-3 mx-1 shrink-0 ${done ? "text-neutral-600" : "text-neutral-800"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessModePage() {
  // Step machine
  const [step,          setStep]         = useState<BusinessEditorStep>("select-idea")
  const [selectedIdea,  setSelectedIdea] = useState<BusinessIdea | null>(null)
  const [filter,        setFilter]       = useState<BusinessFilter>("Todos")
  const [selectedTheme, setSelectedTheme] = useState("")

  // Thesis
  const [showThesisModal, setShowThesisModal] = useState(false)
  const [chosenThesis,    setChosenThesis]    = useState("")

  // Result
  const [correcting,  setCorrecting]  = useState(false)
  const [result,      setResult]      = useState<BusinessEssayCorrectionResult | null>(null)
  const [corrError,   setCorrError]   = useState<string | null>(null)

  const filtered = applyFilter(BUSINESS_IDEAS, filter)

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleUseIdea(idea: BusinessIdea) {
    setSelectedIdea(idea)
    setStep("generate-thesis")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleThesisSelect(thesis: string) {
    setChosenThesis(thesis)
    setShowThesisModal(false)
    setStep("write-essay")
  }

  function handleSkipThesis() {
    setStep("write-essay")
  }

  async function handleEssayReady(text: string) {
    if (!selectedTheme || !selectedIdea) return
    setCorrecting(true)
    setCorrError(null)
    try {
      const res = await fetch("/api/grade-essay-business", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          theme:        selectedTheme,
          essayText:    text,
          businessIdea: selectedIdea,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro na correção")
      setResult(data as BusinessEssayCorrectionResult)
      setStep("result")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setCorrError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setCorrecting(false)
    }
  }

  function handleReset() {
    setStep("select-idea")
    setSelectedIdea(null)
    setSelectedTheme("")
    setChosenThesis("")
    setResult(null)
    setCorrError(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-sm shrink-0">
            <Link
              href="/essay"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Redação</span>
            </Link>
            <span className="text-neutral-700">/</span>
            <div className="flex items-center gap-1.5 text-[#ffd54f]">
              <Briefcase className="h-4 w-4" />
              <span className="font-semibold text-sm">Saindo do Zero</span>
            </div>
          </nav>

          <StepBar current={step} />
        </div>
        <div className="h-[2px] w-full bg-[#ffd54f]/30" />
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        {step === "select-idea" && (
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">
              Redação & Negócios: <span style={{ color: "#ffd54f" }}>Saindo do Zero</span>
            </h1>
            <p className="text-sm text-neutral-500 max-w-xl">
              Use a redação ENEM para estruturar um plano de negócio real.
              Sua proposta de intervenção (C5) vira um pitch de empresa com custo inicial acessível.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 1 — SELECIONAR IDEIA
        ══════════════════════════════════════════════════════════════════ */}
        {step === "select-idea" && (
          <div className="space-y-5">

            {/* Tema */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                1. Escolha o tema da redação
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffd54f]/40 transition-colors [color-scheme:dark]"
              >
                <option value="" disabled className="text-neutral-500">
                  Selecione um tema do ENEM 2026…
                </option>
                {ENEM_THEMES.map((t) => (
                  <option key={t} value={t} className="text-white bg-neutral-900">{t}</option>
                ))}
              </select>
            </div>

            {/* Filtros */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                2. Escolha sua ideia de negócio ({filtered.length} opções)
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {FILTERS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    className={[
                      "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      filter === id
                        ? "border-[#ffd54f]/50 bg-[#ffd54f]/10 text-[#ffd54f]"
                        : "border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600",
                    ].join(" ")}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de ideias */}
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((idea) => (
                <BusinessIdeaCard
                  key={idea.id}
                  idea={idea}
                  isSelected={selectedIdea?.id === idea.id}
                  onSelect={setSelectedIdea}
                  onUse={selectedTheme ? handleUseIdea : undefined}
                />
              ))}
            </div>

            {selectedIdea && !selectedTheme && (
              <p className="text-center text-xs text-[#ffd54f]/60 font-mono">
                ↑ Selecione um tema acima para continuar
              </p>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2 — GERAR TESE
        ══════════════════════════════════════════════════════════════════ */}
        {step === "generate-thesis" && selectedIdea && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-white">Construa sua Tese</h2>
              <p className="text-sm text-neutral-500 mt-1">
                A IA vai gerar 3 opções de tese conectando o tema ao seu negócio.
                Você pode adaptar livremente.
              </p>
            </div>

            {/* Selecionado */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-2">
              <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Resumo</p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-neutral-600 text-xs">Tema</p>
                  <p className="text-neutral-200 text-xs leading-snug mt-0.5">{selectedTheme}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-xs">Ideia de Negócio</p>
                  <p className="text-[#ffd54f] text-xs font-semibold mt-0.5">{selectedIdea.title}</p>
                  <p className="text-neutral-600 text-[10px]">{selectedIdea.estimated_cost}</p>
                </div>
              </div>
            </div>

            {/* Tese escolhida */}
            {chosenThesis && (
              <div className="rounded-2xl border border-[#ffd54f]/30 bg-[#ffd54f]/5 p-4">
                <p className="text-[10px] font-mono text-[#ffd54f]/60 uppercase tracking-widest mb-1">
                  Tese selecionada
                </p>
                <p className="text-sm text-neutral-200 leading-relaxed">{chosenThesis}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowThesisModal(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-black text-sm transition-all active:scale-[0.99]"
                style={{ background: "#ffd54f" }}
              >
                <Sparkles className="h-4 w-4" />
                {chosenThesis ? "Gerar novas teses" : "Gerar teses com IA"}
              </button>

              <button
                onClick={handleSkipThesis}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-800 py-3 text-sm text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
              >
                <PenLine className="h-4 w-4" />
                {chosenThesis ? "Continuar com esta tese" : "Escrever minha própria tese"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3 — ESCREVER REDAÇÃO GUIADA
        ══════════════════════════════════════════════════════════════════ */}
        {step === "write-essay" && selectedIdea && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-white">Escreva sua Redação</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Cada parágrafo tem dicas empreendedoras. Clique no ícone 💡 para expandir.
              </p>
            </div>

            {/* Tema selecionado */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Tema</p>
                <p className="text-xs text-neutral-300 leading-snug mt-0.5">{selectedTheme}</p>
              </div>
            </div>

            {corrError && (
              <div className="rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3">
                <p className="text-sm text-red-300">{corrError}</p>
              </div>
            )}

            {correcting ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div
                  className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#ffd54f" }}
                />
                <p className="text-sm text-neutral-400">
                  Analisando nota ENEM + viabilidade do negócio…
                </p>
                <p className="text-xs text-neutral-600">Isso pode levar até 20 segundos</p>
              </div>
            ) : (
              <BusinessEssayEditor
                businessIdea={selectedIdea}
                onReady={handleEssayReady}
                initialThesis={chosenThesis}
              />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 4 — RESULTADO
        ══════════════════════════════════════════════════════════════════ */}
        {step === "result" && result && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-white">Resultado Completo</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Nota ENEM nas 5 competências + análise de viabilidade do seu plano de negócio.
              </p>
            </div>
            <DualFeedbackPanel result={result} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* ── Thesis Generator Modal ──────────────────────────────────────── */}
      {showThesisModal && selectedIdea && (
        <ThesisGenerator
          theme={selectedTheme}
          businessIdea={selectedIdea}
          onSelect={handleThesisSelect}
          onClose={() => setShowThesisModal(false)}
        />
      )}
    </div>
  )
}

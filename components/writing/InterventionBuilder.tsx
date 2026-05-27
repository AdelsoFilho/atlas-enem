"use client"

import { useState } from "react"
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import type {
  InterventionBuilderExerciseData,
  InterventionBuilderAnswer,
  WritingStepFeedback,
} from "@/modules/essay/writing-types"

// ── Field config ──────────────────────────────────────────────────────────────

const FIELD_META: Array<{
  key:     keyof InterventionBuilderAnswer
  label:   string
  mnemonic: string
  accent:  string
  placeholder: string
}> = [
  {
    key:     "agente",
    label:   "Agente",
    mnemonic: "A",
    accent:  "#388bfd",
    placeholder: "Ex: O Ministério da Educação, as universidades públicas, as ONGs...",
  },
  {
    key:     "acao",
    label:   "Ação",
    mnemonic: "A",
    accent:  "#79c0ff",
    placeholder: "Ex: implementar programas de letramento digital, ampliar o acesso ao CAPS...",
  },
  {
    key:     "meio",
    label:   "Meio / Modo",
    mnemonic: "M",
    accent:  "#a5d6a7",
    placeholder: "Ex: por meio de parcerias público-privadas, mediante repasses do Fundo Nacional...",
  },
  {
    key:     "efeito",
    label:   "Efeito / Objetivo",
    mnemonic: "E",
    accent:  "#ffd54f",
    placeholder: "Ex: a fim de reduzir a exclusão digital, com o objetivo de garantir o acesso...",
  },
  {
    key:     "detalhamento",
    label:   "Detalhamento",
    mnemonic: "D",
    accent:  "#ce93d8",
    placeholder: "Ex: assegurando a dignidade humana e a equidade social para as populações vulneráveis.",
  },
]

// ── Assembled paragraph preview ───────────────────────────────────────────────

function assembleProposal(answer: InterventionBuilderAnswer): string {
  const parts = [
    answer.agente && `${answer.agente}`,
    answer.acao   && `deve ${answer.acao}`,
    answer.meio   && `${answer.meio}`,
    answer.efeito && `${answer.efeito}`,
    answer.detalhamento && `${answer.detalhamento}`,
  ].filter(Boolean)

  if (parts.length === 0) return ""
  return parts.join(", ") + "."
}

// ── Feedback Panel ────────────────────────────────────────────────────────────

function FeedbackPanel({
  feedback,
  minScore,
}: {
  feedback: WritingStepFeedback
  minScore: number
}) {
  const [showRewrite, setShowRewrite] = useState(false)
  const passed = feedback.score >= minScore
  const color  = passed ? "#56d364" : feedback.score >= 60 ? "#ffd54f" : "#f78166"

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: `${color}40`, background: `${color}08` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {passed
            ? <CheckCircle2 className="h-5 w-5" style={{ color }} />
            : <AlertCircle  className="h-5 w-5" style={{ color }} />
          }
          <span className="font-mono font-bold text-sm" style={{ color }}>
            {passed ? "Proposta completa!" : "Continue ajustando"}
          </span>
        </div>
        <span className="font-mono text-2xl font-black" style={{ color }}>
          {feedback.score}
          <span className="text-xs text-neutral-600 font-normal">/100</span>
        </span>
      </div>

      {feedback.mainError && (
        <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 px-4 py-3">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">
            Elemento crítico
          </p>
          <p className="text-sm text-orange-200">{feedback.mainError}</p>
        </div>
      )}

      {feedback.strengths.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
            Elementos bem feitos
          </p>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-300 flex gap-2">
                <span className="text-green-500 shrink-0">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.corrections.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
            O que ajustar
          </p>
          <ul className="space-y-1">
            {feedback.corrections.map((c, i) => (
              <li key={i} className="text-sm text-yellow-300 flex gap-2">
                <span className="shrink-0">→</span> {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.rewriteSuggestion && (
        <div>
          <button
            onClick={() => setShowRewrite(v => !v)}
            className="flex items-center gap-1.5 text-xs font-mono text-[#388bfd] hover:text-blue-300 transition-colors"
          >
            {showRewrite ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Ver proposta montada pelo Professor
          </button>
          {showRewrite && (
            <div className="mt-2 rounded-xl border border-[#388bfd]/20 bg-[#0d1f3c] px-4 py-3">
              <p className="text-[10px] font-mono text-[#388bfd] uppercase tracking-widest mb-2">
                Versão completa (A-A-M-E-D)
              </p>
              <p className="text-sm text-neutral-200 leading-relaxed italic">
                {feedback.rewriteSuggestion}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-neutral-400 italic border-t border-neutral-800 pt-3">
        {feedback.encouragement}
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface InterventionBuilderProps {
  exerciseData:   InterventionBuilderExerciseData
  minScoreToPass: number
  onComplete:     (score: number, answer: InterventionBuilderAnswer) => void
}

export function InterventionBuilder({ exerciseData, minScoreToPass, onComplete }: InterventionBuilderProps) {
  const [answers, setAnswers] = useState<InterventionBuilderAnswer>({
    agente: "", acao: "", meio: "", efeito: "", detalhamento: "",
  })
  const [feedback, setFeedback] = useState<WritingStepFeedback | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [showHints, setShowHints] = useState(false)

  function handleChange(key: keyof InterventionBuilderAnswer, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setFeedback(null)
  }

  const assembled = assembleProposal(answers)
  const allFilled = FIELD_META.every(f => answers[f.key].trim().length > 0)
  const passed    = feedback && feedback.score >= minScoreToPass

  async function handleSubmit() {
    if (!allFilled || loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/writing/evaluate-step", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          stepType:     "intervention_builder",
          theme:        exerciseData.theme,
          answer:       answers,
          exerciseData,
        }),
      })

      const fb: WritingStepFeedback = await res.json()
      setFeedback(fb)
      if (fb.score >= minScoreToPass) onComplete(fb.score, answers)
    } catch {
      setFeedback({
        score: 0, passed: false,
        mainError: "Erro ao conectar. Tente novamente.",
        strengths: [], corrections: [], rewriteSuggestion: null,
        encouragement: "Continue — você consegue!",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Tema</p>
        <p className="text-sm font-semibold text-white">{exerciseData.theme}</p>
        {exerciseData.mnemonic && (
          <p className="text-[10px] font-mono text-neutral-500 mt-1.5">
            Lembre-se: <span className="text-[#388bfd]">{exerciseData.mnemonic}</span>
          </p>
        )}
      </div>

      {/* Flawed proposal (critique mode) */}
      {exerciseData.flawed_proposal && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3">
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1">
            Proposta original (incorreta)
          </p>
          <p className="text-sm text-red-200 italic">"{exerciseData.flawed_proposal}"</p>
          <p className="text-xs text-neutral-500 mt-1.5">
            Reescreva usando os 5 elementos A-A-M-E-D abaixo:
          </p>
        </div>
      )}

      {/* Hint toggle */}
      <button
        onClick={() => setShowHints(v => !v)}
        className="flex items-center gap-1.5 text-xs font-mono text-yellow-500 hover:text-yellow-300 transition-colors"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        {showHints ? "Ocultar dicas" : "Mostrar dicas para cada campo"}
      </button>

      {/* Fields */}
      {FIELD_META.map(({ key, label, mnemonic, accent, placeholder }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-black shrink-0"
              style={{ background: accent, color: "#000" }}
            >
              {mnemonic}
            </span>
            <label className="text-sm font-semibold text-white">{label}</label>
          </div>

          {showHints && exerciseData.hints[key] && (
            <div className="rounded-lg border border-yellow-900/30 bg-yellow-950/20 px-3 py-2">
              <p className="text-xs text-yellow-300">{exerciseData.hints[key]}</p>
            </div>
          )}

          <input
            type="text"
            value={answers[key]}
            onChange={e => handleChange(key, e.target.value)}
            placeholder={placeholder}
            disabled={!!passed}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#388bfd] focus:outline-none focus:ring-1 focus:ring-[#388bfd]/30 disabled:opacity-50 transition-colors"
          />
        </div>
      ))}

      {/* Live preview */}
      {assembled && (
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 px-4 py-3">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
            Prévia da proposta
          </p>
          <p className="text-sm text-neutral-200 leading-relaxed italic">
            {assembled}
          </p>
        </div>
      )}

      {/* Submit */}
      {!passed && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled || loading}
          className="w-full rounded-xl border border-[#388bfd]/50 bg-[#388bfd]/10 py-3 font-mono text-sm font-bold text-[#388bfd] hover:bg-[#388bfd]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Avaliando A-A-M-E-D...</>
            : "Enviar proposta"
          }
        </button>
      )}

      {feedback && <FeedbackPanel feedback={feedback} minScore={minScoreToPass} />}

      {feedback && !passed && (
        <button
          onClick={() => setFeedback(null)}
          className="w-full rounded-xl border border-neutral-700 py-2.5 font-mono text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}

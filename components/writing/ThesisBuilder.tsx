"use client"

import { useState } from "react"
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import type {
  ThesisBuilderExerciseData,
  ThesisBuilderAnswer,
  WritingStepFeedback,
} from "@/modules/essay/writing-types"

// ── Score color ───────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return "#56d364"
  if (score >= 60) return "#ffd54f"
  return "#f78166"
}

// ── Field labels ──────────────────────────────────────────────────────────────

const FIELD_LABEL: Record<string, string> = {
  contexto:      "Contexto",
  tese:          "Tese",
  argumento1:    "Argumento 1",
  argumento2:    "Argumento 2",
  topico_frasal: "Tópico Frasal",
}

const FIELD_PLACEHOLDER: Record<string, string> = {
  contexto:      "Ex: Em 2023, o Brasil registrou 33 milhões de pessoas em insegurança alimentar (IBGE).",
  tese:          "Ex: A fome compromete o desenvolvimento cognitivo e a trajetória educacional de crianças brasileiras.",
  argumento1:    "Ex: A desnutrição nos primeiros 1.000 dias prejudica irreversivelmente a formação cerebral.",
  argumento2:    "Ex: Além disso, a fome força a evasão escolar, perpetuando o ciclo de pobreza.",
  topico_frasal: "Ex: A ausência de acesso à internet aprofunda as desigualdades sociais no Brasil.",
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
  const color  = scoreColor(feedback.score)

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{
        borderColor: `${color}40`,
        background:  `${color}08`,
      }}
    >
      {/* Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {passed
            ? <CheckCircle2 className="h-5 w-5" style={{ color }} />
            : <AlertCircle  className="h-5 w-5" style={{ color }} />
          }
          <span className="font-mono font-bold text-sm" style={{ color }}>
            {passed ? "Aprovado!" : "Continue praticando"}
          </span>
        </div>
        <span className="font-mono text-2xl font-black" style={{ color }}>
          {feedback.score}
          <span className="text-xs text-neutral-600 font-normal">/100</span>
        </span>
      </div>

      {/* Main error (if any) */}
      {feedback.mainError && (
        <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 px-4 py-3">
          <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">
            Foco principal
          </p>
          <p className="text-sm text-orange-200">{feedback.mainError}</p>
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
            Pontos fortes
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

      {/* Corrections */}
      {feedback.corrections.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
            O que melhorar
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

      {/* Rewrite suggestion (collapsible) */}
      {feedback.rewriteSuggestion && (
        <div>
          <button
            onClick={() => setShowRewrite(v => !v)}
            className="flex items-center gap-1.5 text-xs font-mono text-[#388bfd] hover:text-blue-300 transition-colors"
          >
            {showRewrite ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Ver como ficaria
          </button>
          {showRewrite && (
            <div className="mt-2 rounded-xl border border-[#388bfd]/20 bg-[#0d1f3c] px-4 py-3">
              <p className="text-[10px] font-mono text-[#388bfd] uppercase tracking-widest mb-2">
                Versão melhorada
              </p>
              <p className="text-sm text-neutral-200 leading-relaxed">
                {feedback.rewriteSuggestion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Encouragement */}
      <p className="text-xs text-neutral-400 italic border-t border-neutral-800 pt-3">
        {feedback.encouragement}
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ThesisBuilderProps {
  exerciseData: ThesisBuilderExerciseData
  minScoreToPass: number
  onComplete: (score: number, answer: ThesisBuilderAnswer) => void
}

export function ThesisBuilder({ exerciseData, minScoreToPass, onComplete }: ThesisBuilderProps) {
  const [answers,  setAnswers]  = useState<ThesisBuilderAnswer>({})
  const [feedback, setFeedback] = useState<WritingStepFeedback | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [showHints, setShowHints] = useState(false)

  const fields = exerciseData.fields

  function handleChange(field: string, value: string) {
    setAnswers(prev => ({ ...prev, [field]: value }))
    setFeedback(null)
  }

  const allFilled = fields.every(f => (answers[f as keyof ThesisBuilderAnswer] ?? "").trim().length > 0)

  async function handleSubmit() {
    if (!allFilled || loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/writing/evaluate-step", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          stepType:     "thesis_builder",
          theme:        exerciseData.theme,
          answer:       answers,
          exerciseData,
        }),
      })

      const fb: WritingStepFeedback = await res.json()
      setFeedback(fb)

      if (fb.score >= minScoreToPass) {
        onComplete(fb.score, answers)
      }
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

  const passed = feedback && feedback.score >= minScoreToPass

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
          Tema da redação
        </p>
        <p className="text-sm font-semibold text-white leading-snug">
          {exerciseData.theme}
        </p>
        {exerciseData.argument_to_develop && (
          <p className="text-xs text-neutral-500 mt-1.5">
            Argumento a desenvolver: <span className="text-neutral-300">{exerciseData.argument_to_develop}</span>
          </p>
        )}
      </div>

      {/* Hint toggle */}
      <button
        onClick={() => setShowHints(v => !v)}
        className="flex items-center gap-1.5 text-xs font-mono text-yellow-500 hover:text-yellow-300 transition-colors"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        {showHints ? "Ocultar dicas" : "Mostrar dicas"}
      </button>

      {/* Fields */}
      {fields.map((field) => (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            {FIELD_LABEL[field] ?? field}
          </label>

          {showHints && exerciseData.hints[field] && (
            <div className="rounded-lg border border-yellow-900/30 bg-yellow-950/20 px-3 py-2">
              <p className="text-xs text-yellow-300">{exerciseData.hints[field]}</p>
            </div>
          )}

          <textarea
            value={answers[field as keyof ThesisBuilderAnswer] ?? ""}
            onChange={e => handleChange(field, e.target.value)}
            placeholder={FIELD_PLACEHOLDER[field] ?? ""}
            rows={field === "tese" || field === "topico_frasal" ? 3 : 2}
            disabled={!!passed}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#388bfd] focus:outline-none focus:ring-1 focus:ring-[#388bfd]/30 resize-none disabled:opacity-50 transition-colors"
          />
        </div>
      ))}

      {/* Submit */}
      {!passed && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled || loading}
          className="w-full rounded-xl border border-[#388bfd]/50 bg-[#388bfd]/10 py-3 font-mono text-sm font-bold text-[#388bfd] hover:bg-[#388bfd]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Avaliando...</>
            : "Enviar para o Professor Atlas"
          }
        </button>
      )}

      {/* Feedback */}
      {feedback && (
        <FeedbackPanel feedback={feedback} minScore={minScoreToPass} />
      )}

      {/* Try again after failed */}
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

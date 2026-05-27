"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react"
import type { ConnectorFillExerciseData, ConnectorSegment } from "@/modules/essay/writing-types"

// ── Single Blank ──────────────────────────────────────────────────────────────

interface BlankProps {
  segment:   ConnectorSegment & { type: "blank" }
  value:     string
  onChange:  (id: string, value: string) => void
  checked:   boolean
}

function Blank({ segment, value, onChange, checked }: BlankProps) {
  const isCorrect = checked && value === segment.correct
  const isWrong   = checked && value !== segment.correct && value !== ""
  const isEmpty   = checked && value === ""

  return (
    <span className="inline-block mx-1 align-baseline">
      <select
        value={value}
        onChange={e => onChange(segment.id!, e.target.value)}
        disabled={checked}
        className={[
          "rounded-lg border px-2.5 py-1 font-mono text-sm font-semibold focus:outline-none transition-colors",
          "disabled:cursor-default",
          isCorrect ? "border-green-500/60 bg-green-900/20 text-green-300"
          : isWrong  ? "border-red-500/60  bg-red-900/20  text-red-300"
          : isEmpty  ? "border-orange-500/60 bg-orange-900/20 text-orange-300"
          : "border-neutral-600 bg-neutral-800 text-white hover:border-[#388bfd]/60",
        ].join(" ")}
      >
        <option value="">escolha...</option>
        {segment.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {/* Feedback inline */}
      {isCorrect && (
        <CheckCircle2 className="inline h-3.5 w-3.5 text-green-500 ml-1" />
      )}
      {(isWrong || isEmpty) && (
        <span className="inline-flex items-center gap-1 ml-1">
          <XCircle className="h-3.5 w-3.5 text-red-400" />
          {segment.hint && (
            <span className="text-[10px] text-orange-300 italic">{segment.hint}</span>
          )}
        </span>
      )}
      {(isWrong || isEmpty) && (
        <span className="ml-1 text-[11px] text-green-400 font-mono">
          → {segment.correct}
        </span>
      )}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ConnectorFillProps {
  exerciseData:   ConnectorFillExerciseData
  minScoreToPass: number
  onComplete:     (score: number) => void
}

export function ConnectorFill({ exerciseData, minScoreToPass, onComplete }: ConnectorFillProps) {
  const blanks = exerciseData.segments.filter(s => s.type === "blank")

  const [answers, setAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(blanks.map(b => [b.id!, ""]))
  )
  const [checked, setChecked] = useState(false)
  const [score,   setScore]   = useState(0)
  const [showTip, setShowTip] = useState(false)

  const allFilled = blanks.every(b => (answers[b.id!] ?? "") !== "")

  function handleChange(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function handleCheck() {
    const correct = blanks.filter(b => answers[b.id!] === b.correct).length
    const s = Math.round((correct / blanks.length) * 100)
    setScore(s)
    setChecked(true)
    if (s >= minScoreToPass) onComplete(s)
  }

  function handleReset() {
    setAnswers(Object.fromEntries(blanks.map(b => [b.id!, ""])))
    setChecked(false)
    setScore(0)
  }

  const passed = score >= minScoreToPass

  return (
    <div className="space-y-5">
      {/* Theme */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Tema</p>
        <p className="text-sm font-semibold text-white">{exerciseData.theme}</p>
      </div>

      <p className="text-xs text-neutral-400">{exerciseData.instructions}</p>

      {/* Tip */}
      <button
        onClick={() => setShowTip(v => !v)}
        className="flex items-center gap-1.5 text-xs font-mono text-yellow-500 hover:text-yellow-300 transition-colors"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        {showTip ? "Ocultar dica" : "Mostrar dica de conectivos"}
      </button>

      {showTip && (
        <div className="rounded-xl border border-yellow-900/30 bg-yellow-950/10 px-4 py-3 text-xs text-yellow-200 space-y-1">
          <p><strong>Adição:</strong> Além disso · Ademais · Outrossim</p>
          <p><strong>Consequência:</strong> Portanto · Logo · Assim</p>
          <p><strong>Contraste:</strong> Contudo · Todavia · Entretanto</p>
          <p><strong>Causa:</strong> Visto que · Pois · Dado que</p>
          <p><strong>Concessão:</strong> Embora · Ainda que · Apesar de</p>
          <p><strong>Sequência:</strong> Nesse sentido · Diante disso · Dessa forma</p>
        </div>
      )}

      {/* Text with inline blanks */}
      <div
        className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-5 py-5 text-sm text-neutral-200 leading-loose"
      >
        {exerciseData.segments.map((seg, i) => {
          if (seg.type === "text") {
            return <span key={i}>{seg.content}</span>
          }
          return (
            <Blank
              key={seg.id}
              segment={seg as ConnectorSegment & { type: "blank" }}
              value={answers[seg.id!] ?? ""}
              onChange={handleChange}
              checked={checked}
            />
          )
        })}
      </div>

      {/* Actions */}
      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!allFilled}
          className="w-full rounded-xl border border-[#388bfd]/50 bg-[#388bfd]/10 py-3 font-mono text-sm font-bold text-[#388bfd] hover:bg-[#388bfd]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Verificar respostas
        </button>
      ) : (
        <div className="space-y-3">
          <div
            className="rounded-2xl border p-4 text-center"
            style={{
              borderColor: passed ? "#22c55e40" : "#f7816640",
              background:  passed ? "#0f2f1430" : "#3d1a1830",
            }}
          >
            <p
              className="font-mono text-2xl font-black"
              style={{ color: passed ? "#56d364" : "#f78166" }}
            >
              {score}/100
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              {blanks.filter(b => answers[b.id!] === b.correct).length} de {blanks.length} conectivos corretos
            </p>
            {passed
              ? <p className="text-xs text-green-400 mt-2">Excelente domínio de coesão!</p>
              : <p className="text-xs text-neutral-400 mt-2">Revise os conectivos acima e tente novamente.</p>
            }
          </div>

          {!passed && (
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-neutral-700 py-2.5 font-mono text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
    </div>
  )
}

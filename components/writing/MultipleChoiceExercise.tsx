"use client"

import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import type { MultipleChoiceExerciseData } from "@/modules/essay/writing-types"

interface MultipleChoiceExerciseProps {
  exerciseData:   MultipleChoiceExerciseData
  minScoreToPass: number
  onComplete:     (score: number) => void
}

export function MultipleChoiceExercise({
  exerciseData,
  minScoreToPass,
  onComplete,
}: MultipleChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [checked,  setChecked]  = useState(false)

  function handleSelect(id: string) {
    if (checked) return
    setSelected(id)
  }

  function handleCheck() {
    if (!selected || checked) return
    setChecked(true)
    const isCorrect = exerciseData.options.find(o => o.id === selected)?.correct ?? false
    const score = isCorrect ? 100 : 0
    if (score >= minScoreToPass) onComplete(score)
  }

  function handleReset() {
    setSelected(null)
    setChecked(false)
  }

  const selectedOption  = exerciseData.options.find(o => o.id === selected)
  const passed          = checked && (selectedOption?.correct ?? false)
  const correctOption   = exerciseData.options.find(o => o.correct)

  return (
    <div className="space-y-5">
      {/* Theme */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Tema</p>
        <p className="text-sm font-semibold text-white">{exerciseData.theme}</p>
      </div>

      {/* Optional passage */}
      {exerciseData.text && (
        <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 px-5 py-4">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
            Leia o trecho
          </p>
          <p className="text-sm text-neutral-200 leading-relaxed italic">
            "{exerciseData.text}"
          </p>
        </div>
      )}

      {/* Question */}
      <p className="text-sm font-semibold text-white leading-snug">
        {exerciseData.question}
      </p>

      {/* Options */}
      <div className="space-y-2.5">
        {exerciseData.options.map(option => {
          const isSelected = selected === option.id
          const isCorrect  = checked && option.correct
          const isWrong    = checked && isSelected && !option.correct

          let borderColor = "border-neutral-700"
          let bg          = "bg-neutral-900"
          let textColor   = "text-neutral-200"

          if (isSelected && !checked) {
            borderColor = "border-[#388bfd]/60"
            bg          = "bg-[#0d1f3c]"
            textColor   = "text-white"
          }
          if (isCorrect) {
            borderColor = "border-green-500/60"
            bg          = "bg-green-900/20"
            textColor   = "text-green-200"
          }
          if (isWrong) {
            borderColor = "border-red-500/60"
            bg          = "bg-red-900/20"
            textColor   = "text-red-200"
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={checked}
              className={`w-full text-left rounded-xl border ${borderColor} ${bg} px-4 py-3 transition-all duration-150 flex items-start gap-3`}
            >
              <span className="font-mono text-xs font-bold uppercase shrink-0 mt-0.5 w-5">
                {option.id})
              </span>
              <div className="flex-1">
                <p className={`text-sm ${textColor} leading-snug`}>{option.text}</p>

                {/* Explanation after check */}
                {checked && (isSelected || isCorrect) && (
                  <p className={`text-xs mt-2 ${option.correct ? "text-green-400" : "text-red-300"}`}>
                    {option.explanation}
                  </p>
                )}
              </div>

              {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />}
              {isWrong   && <XCircle      className="h-4 w-4 text-red-400  shrink-0 mt-0.5" />}
            </button>
          )
        })}
      </div>

      {/* Action */}
      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!selected}
          className="w-full rounded-xl border border-[#388bfd]/50 bg-[#388bfd]/10 py-3 font-mono text-sm font-bold text-[#388bfd] hover:bg-[#388bfd]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Confirmar resposta
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
              className="font-mono text-xl font-black"
              style={{ color: passed ? "#56d364" : "#f78166" }}
            >
              {passed ? "Correto!" : "Incorreto"}
            </p>
            {!passed && correctOption && (
              <p className="text-xs text-neutral-400 mt-1">
                Alternativa correta: <span className="font-bold text-green-400 uppercase">{correctOption.id}</span>
              </p>
            )}
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

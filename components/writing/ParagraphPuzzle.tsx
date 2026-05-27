"use client"

import { useState, useCallback } from "react"
import { CheckCircle2, XCircle, ArrowUp, ArrowDown, Trophy } from "lucide-react"
import type { ParagraphPuzzleExerciseData, PuzzleSentence } from "@/modules/essay/writing-types"

// ── Type badge colors ─────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  topico_frasal: "#388bfd",
  explicacao:    "#79c0ff",
  repertorio:    "#56d364",
  fechamento:    "#f78166",
  intro:         "#388bfd",
  dev1:          "#ffd54f",
  dev2:          "#f78166",
  conclusion:    "#56d364",
}

const TYPE_BG: Record<string, string> = {
  topico_frasal: "#0d1f3c",
  explicacao:    "#0d2032",
  repertorio:    "#0f2f14",
  fechamento:    "#3d1a18",
  intro:         "#0d1f3c",
  dev1:          "#2e2500",
  dev2:          "#3d1a18",
  conclusion:    "#0f2f14",
}

function scorePuzzle(ordered: PuzzleSentence[], original: PuzzleSentence[]): number {
  const correct = ordered.filter(
    (s, idx) => s.correct_position === idx
  ).length
  return Math.round((correct / original.length) * 100)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ParagraphPuzzleProps {
  exerciseData:   ParagraphPuzzleExerciseData
  minScoreToPass: number
  onComplete:     (score: number) => void
}

export function ParagraphPuzzle({ exerciseData, minScoreToPass, onComplete }: ParagraphPuzzleProps) {
  // Shuffle once on mount
  const [items, setItems] = useState<PuzzleSentence[]>(() => {
    const shuffled = [...exerciseData.sentences]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })

  const [checked, setChecked] = useState(false)
  const [score,   setScore]   = useState(0)

  const moveUp = useCallback((idx: number) => {
    if (idx === 0 || checked) return
    setItems(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }, [checked])

  const moveDown = useCallback((idx: number) => {
    if (idx === items.length - 1 || checked) return
    setItems(prev => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }, [checked, items.length])

  function handleCheck() {
    const s = scorePuzzle(items, exerciseData.sentences)
    setScore(s)
    setChecked(true)
    if (s >= minScoreToPass) {
      onComplete(s)
    }
  }

  function handleReset() {
    const shuffled = [...exerciseData.sentences]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setItems(shuffled)
    setChecked(false)
    setScore(0)
  }

  const passed = score >= minScoreToPass

  return (
    <div className="space-y-5">
      {/* Theme pill */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Tema</p>
        <p className="text-sm font-semibold text-white">{exerciseData.theme}</p>
      </div>

      {/* Instruction */}
      <p className="text-xs text-neutral-400">{exerciseData.instructions}</p>

      {/* Sentence list */}
      <div className="space-y-2">
        {items.map((sentence, idx) => {
          const isCorrect = checked && sentence.correct_position === idx
          const isWrong   = checked && sentence.correct_position !== idx
          const color = TYPE_COLOR[sentence.type] ?? "#8b949e"
          const bg    = TYPE_BG[sentence.type]    ?? "#161b22"

          return (
            <div
              key={sentence.id}
              className="flex gap-3 rounded-2xl border p-4 transition-all duration-300"
              style={{
                borderColor: checked
                  ? (isCorrect ? "#22c55e60" : "#f7816660")
                  : "#21262d",
                background: checked
                  ? (isCorrect ? "#0f2f1480" : "#3d1a1860")
                  : "#0f1117",
              }}
            >
              {/* Position number */}
              <span className="font-mono text-lg font-black text-neutral-600 w-5 shrink-0 mt-0.5">
                {idx + 1}
              </span>

              <div className="flex-1 min-w-0">
                {/* Type badge */}
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider mb-2"
                  style={{ color, background: bg }}
                >
                  {sentence.label}
                </span>

                <p className="text-sm text-neutral-200 leading-relaxed">
                  {sentence.text}
                </p>

                {/* Reveal correct position after check */}
                {isWrong && (
                  <p className="text-[11px] text-green-400 mt-1.5">
                    ✓ Posição correta: {sentence.correct_position + 1}
                  </p>
                )}
              </div>

              {/* Status icon or move buttons */}
              <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                {checked ? (
                  isCorrect
                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                    : <XCircle      className="h-5 w-5 text-red-400" />
                ) : (
                  <>
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-neutral-700 disabled:opacity-20 transition-colors"
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === items.length - 1}
                      className="p-1 rounded-lg hover:bg-neutral-700 disabled:opacity-20 transition-colors"
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4 text-neutral-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      {!checked ? (
        <button
          onClick={handleCheck}
          className="w-full rounded-xl border border-[#388bfd]/50 bg-[#388bfd]/10 py-3 font-mono text-sm font-bold text-[#388bfd] hover:bg-[#388bfd]/20 transition-colors"
        >
          Verificar ordem
        </button>
      ) : (
        <div className="space-y-3">
          {/* Result */}
          <div
            className="rounded-2xl border p-4 text-center"
            style={{
              borderColor: passed ? "#22c55e40" : "#f7816640",
              background:  passed ? "#0f2f1430" : "#3d1a1830",
            }}
          >
            {passed && <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />}
            <p
              className="font-mono text-2xl font-black"
              style={{ color: passed ? "#56d364" : "#f78166" }}
            >
              {score}/100
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              {score === 100
                ? "Perfeito! Você conhece a estrutura!"
                : passed
                  ? "Aprovado! Boa compreensão da estrutura."
                  : `${items.filter((s, i) => s.correct_position === i).length} de ${items.length} corretos. Continue praticando!`
              }
            </p>
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

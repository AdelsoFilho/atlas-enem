"use client"

import { useState, useEffect, useRef } from "react"
import type { Question } from "@/types/quiz"
import { Button } from "@/components/ui/button"
import { XpBadge } from "@/components/ui/xp-badge"
import { cn } from "@/lib/utils"
import { calcQuestionXp, calcBonusXpForDifficulty } from "@/adaptive-quiz/engine"
import {
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Target,
  Clock,
  Zap,
} from "lucide-react"

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswer: (selectedKey: string, isCorrect: boolean, timeMs: number) => void
  onSkip: () => void
  feedbackMessage?: string
}

const difficultyLabel: Record<number, string> = {
  1: "FUND",
  2: "ENEM",
  3: "UFG",
  4: "UNICAMP",
  5: "ITA/IME",
}
const difficultyColor: Record<number, string> = {
  1: "text-muted border-border",
  2: "text-languages border-languages/30",
  3: "text-accent border-accent/30",
  4: "text-writing border-writing/30",
  5: "text-math border-math/30 shadow-glow-math",
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onSkip,
  feedbackMessage,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
    setShowExplanation(false)
    startTimeRef.current = Date.now()
  }, [question.id])

  const isCorrect = selected === question.correctKey
  const xpBase = 10 * question.difficulty
  const bonusMulti = calcBonusXpForDifficulty(question.difficulty)

  function handleSelect(key: string) {
    if (revealed) return
    setSelected(key)
  }

  function handleConfirm() {
    if (!selected || revealed) return
    setRevealed(true)
    const timeMs = Date.now() - startTimeRef.current
    onAnswer(selected, selected === question.correctKey, timeMs)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho da questão */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">
            {questionNumber}/{totalQuestions}
          </span>
          <span
            className={cn(
              "rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest",
              difficultyColor[question.difficulty]
            )}
          >
            {difficultyLabel[question.difficulty]}
          </span>
          <span className="font-mono text-[10px] text-muted">
            {question.source} {question.year}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted" />
          <XpBadge
            xp={Math.round(xpBase * bonusMulti)}
            multiplier={question.difficulty >= 4 ? bonusMulti : undefined}
            size="sm"
          />
        </div>
      </div>

      {/* Tópico */}
      <p className="flex items-center gap-1.5 font-mono text-xs text-muted">
        <Target className="h-3 w-3" />
        {question.topic}
      </p>

      {/* Enunciado */}
      <div className="rounded-lg border border-border bg-surface-2 p-4">
        <p className="font-sans text-sm leading-relaxed text-white">
          {question.statement}
        </p>
      </div>

      {/* Alternativas */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.key
          const isRight = opt.key === question.correctKey

          let variant: string = "default"
          if (revealed) {
            if (isRight) variant = "correct"
            else if (isSelected && !isRight) variant = "wrong"
            else variant = "dim"
          } else if (isSelected) {
            variant = "selected"
          }

          return (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              disabled={revealed}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150",
                "font-sans text-sm",
                variant === "default" &&
                  "border-border bg-surface hover:border-accent/50 hover:bg-accent-dim text-white",
                variant === "selected" &&
                  "border-accent bg-accent-dim text-white shadow-glow-accent",
                variant === "correct" &&
                  "border-xp bg-xp-dim text-xp",
                variant === "wrong" &&
                  "border-red-800 bg-red-900/20 text-red-400",
                variant === "dim" &&
                  "border-border bg-surface text-muted opacity-50"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border font-mono text-xs font-bold",
                  variant === "correct" && "border-xp text-xp",
                  variant === "wrong" && "border-red-700 text-red-400",
                  variant === "selected" && "border-accent text-accent",
                  (variant === "default" || variant === "dim") &&
                    "border-border text-muted"
                )}
              >
                {opt.key}
              </span>
              <span className="leading-relaxed">{opt.text}</span>
              {revealed && isRight && (
                <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-xp" />
              )}
              {revealed && isSelected && !isRight && (
                <AlertCircle className="ml-auto h-4 w-4 flex-shrink-0 text-red-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback após resposta */}
      {revealed && (
        <div
          className={cn(
            "rounded-lg border p-3",
            isCorrect
              ? "border-xp/30 bg-xp-dim"
              : "border-red-800/40 bg-red-900/10"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "font-mono text-xs font-semibold",
                isCorrect ? "text-xp" : "text-red-400"
              )}
            >
              {isCorrect
                ? "Resolução correta. Raciocínio validado."
                : `Erro de lógica na etapa de resolução. Conceito: ${question.errorConcept}`}
            </p>
            {feedbackMessage && (
              <span className="rounded border border-writing/30 bg-writing/10 px-2 py-0.5 font-mono text-[10px] text-writing">
                {feedbackMessage}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExplanation((p) => !p)}
            className="mt-2 flex items-center gap-1 font-mono text-xs text-accent hover:text-accent/80"
          >
            <Zap className="h-3 w-3" />
            {showExplanation ? "Ocultar" : "Ver cadeia de raciocínio"}
          </button>

          {showExplanation && (
            <div className="mt-3 flex flex-col gap-2">
              {question.logicSteps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="mt-0.5 font-mono text-[10px] font-bold text-accent opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-sans text-xs text-white/80">{step}</p>
                </div>
              ))}
              <div className="mt-1 rounded border border-border bg-surface p-2">
                <p className="font-mono text-[10px] font-semibold uppercase text-muted">
                  Explicação lógica completa
                </p>
                <p className="mt-1 font-sans text-xs leading-relaxed text-white/70">
                  {question.logicExplanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        {!revealed ? (
          <>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!selected}
              onClick={handleConfirm}
            >
              <ChevronRight className="h-4 w-4" />
              Confirmar
            </Button>
            <Button variant="ghost" size="md" onClick={onSkip}>
              Pular
            </Button>
          </>
        ) : (
          <Button variant="primary" className="flex-1" onClick={onSkip}>
            <ChevronRight className="h-4 w-4" />
            Próxima questão
          </Button>
        )}
      </div>
    </div>
  )
}

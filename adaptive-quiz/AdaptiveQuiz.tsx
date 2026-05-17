"use client"

import { useState, useEffect, useCallback } from "react"
import type { Question, DifficultyLevel } from "@/types/quiz"
import type { SubjectKey } from "@/config/ufg-weights"
import { useQuizStore } from "./QuizStore"
import { getFeedbackMessage, applyAnswerResult } from "./engine"
import { QuestionCard } from "./QuestionCard"
import { ProgressBar } from "@/components/ui/progress-bar"
import { XpBadge } from "@/components/ui/xp-badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdaptiveQuizProps {
  questions: Question[]
  source?: "daily-drop" | "free-practice"
  onComplete?: (xpEarned: number, accuracy: number) => void
}

export function AdaptiveQuiz({
  questions,
  source = "free-practice",
  onComplete,
}: AdaptiveQuizProps) {
  const { startSession, recordAttempt, closeSession, adaptStates } =
    useQuizStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId] = useState(() => {
    startSession(source)
    return crypto.randomUUID()
  })
  const [feedbackMsg, setFeedbackMsg] = useState<string | undefined>()
  const [completed, setCompleted] = useState(false)
  const [totalXp, setTotalXp] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  const advance = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      closeSession()
      setCompleted(true)
      onComplete?.(totalXp, correctCount / questions.length)
    } else {
      setCurrentIndex((i) => i + 1)
      setFeedbackMsg(undefined)
    }
  }, [currentIndex, questions.length, closeSession, onComplete, totalXp, correctCount])

  const handleAnswer = useCallback(
    (selectedKey: string, isCorrect: boolean, timeMs: number) => {
      if (!currentQuestion) return

      const subject = currentQuestion.subject as SubjectKey
      const difficulty = currentQuestion.difficulty as DifficultyLevel

      recordAttempt(
        currentQuestion.id,
        subject,
        difficulty,
        selectedKey,
        isCorrect,
        timeMs
      )

      const prevState = adaptStates[subject]
      const newState = applyAnswerResult(
        prevState,
        isCorrect ? "correct" : "wrong"
      )

      const msg = getFeedbackMessage(
        isCorrect ? "correct" : "wrong",
        prevState.currentDifficulty,
        newState.currentDifficulty
      )
      if (msg.includes("desbloqueado") || msg.includes("ajustada")) {
        setFeedbackMsg(msg)
      }

      if (isCorrect) {
        setCorrectCount((c) => c + 1)
        setTotalXp((x) => x + 10 * difficulty) // XP simplificado no componente
      }
    },
    [currentQuestion, recordAttempt, adaptStates]
  )

  if (!currentQuestion && !completed) return null

  if (completed) {
    const accuracy = correctCount / questions.length
    return (
      <Card glow={accuracy >= 0.7 ? "xp" : "none"} className="flex flex-col items-center gap-6 py-10 text-center">
        <Trophy
          className={cn(
            "h-14 w-14",
            accuracy >= 0.7 ? "text-xp" : "text-muted"
          )}
        />
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Sessão encerrada
          </p>
          <h2 className="mt-1 font-mono text-2xl font-black text-white">
            {correctCount}/{questions.length} corretas
          </h2>
          <p className="mt-1 font-mono text-sm text-muted">
            {Math.round(accuracy * 100)}% de precisão
          </p>
        </div>

        <XpBadge xp={totalXp} size="lg" />

        <div className="w-full max-w-xs">
          <ProgressBar
            value={accuracy * 100}
            color={accuracy >= 0.7 ? "xp" : "math"}
            size="lg"
            showPercent
          />
        </div>

        <p className="max-w-xs font-mono text-xs text-muted">
          {accuracy >= 0.8
            ? "Desempenho de elite. Próxima sessão iniciará em nível superior."
            : accuracy >= 0.5
            ? "Desempenho estável. Identifique o padrão dos erros antes da próxima sessão."
            : "Desempenho abaixo do limiar. Revise os conceitos marcados nos erros."}
        </p>

        <Button
          variant="secondary"
          onClick={() => {
            setCurrentIndex(0)
            setCompleted(false)
            setTotalXp(0)
            setCorrectCount(0)
            startSession(source)
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Nova sessão
        </Button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progresso da sessão */}
      <div className="flex items-center gap-3">
        <ProgressBar
          value={progress}
          color="accent"
          size="sm"
          className="flex-1"
        />
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
          <TrendingUp className="h-3 w-3 text-xp" />
          <span className="text-xp font-bold">{totalXp}</span> XP
        </div>
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        onSkip={advance}
        feedbackMessage={feedbackMsg}
      />
    </div>
  )
}

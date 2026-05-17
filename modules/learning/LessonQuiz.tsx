"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useLessonStore } from "./lesson-store"
import { ErrorReview } from "@/components/adaptive-feedback/ErrorReview"

const OPTION_KEYS = ["A", "B", "C", "D", "E"] as const

export function LessonQuiz() {
  const {
    lesson,
    quiz,
    selectAnswer,
    submitAnswer,
    unlockAndRetry,
    advanceToNextQuestion,
  } = useLessonStore()

  if (!lesson) return null

  const { currentIdx, selectedAnswer, attemptState, errorMessage, conceptToReview } = quiz
  const question   = lesson.questions[currentIdx]
  const isLast     = currentIdx === lesson.questions.length - 1
  const isLocked   = attemptState === "error-locked"
  const isCorrect  = attemptState === "correct"

  const difficultyLabel = ["", "ENEM médio", "ENEM difícil", "UFG Elite"][question.difficulty] ?? ""

  return (
    <motion.div
      key={currentIdx}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {/* Progress + label */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#388bfd]">
          Questão {currentIdx + 1} / {lesson.questions.length}
        </p>
        <span className="rounded-full bg-neutral-900 border border-neutral-700 px-3 py-1 text-xs text-neutral-400">
          {difficultyLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
        <motion.div
          className="h-full bg-[#388bfd] rounded-full"
          animate={{ width: `${(currentIdx / lesson.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Statement */}
      <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
        <p className="text-white text-sm leading-relaxed">{question.statement}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected   = selectedAnswer === opt.key
          const isCorrectOpt = opt.key === question.correctKey

          // Base: texto visível (neutral-300) sobre fundo neutro
          let cls = "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-[#388bfd]/50 hover:text-white"

          if (isCorrect) {
            if (isCorrectOpt)  cls = "border-green-500/60 bg-green-950/40 text-green-300"
            else if (isSelected) cls = "border-neutral-700 bg-neutral-900 text-neutral-500 opacity-50"
            else               cls = "border-neutral-800 bg-neutral-900 text-neutral-600 opacity-40"
          } else if (isLocked) {
            if (isSelected)    cls = "border-red-500/60 bg-red-950/40 text-red-300"
            else               cls = "border-neutral-800 bg-neutral-900 text-neutral-600 opacity-40"
          } else if (isSelected) {
            cls = "border-[#388bfd]/60 bg-[#388bfd]/10 text-white"
          }

          return (
            <button
              key={opt.key}
              disabled={isLocked || isCorrect}
              onClick={() => selectAnswer(opt.key as typeof OPTION_KEYS[number])}
              className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left text-sm transition-all ${cls}`}
            >
              <span className="font-bold shrink-0 w-5">{opt.key})</span>
              <span className="leading-relaxed">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {/* Error feedback */}
      <AnimatePresence>
        {isLocked && errorMessage && conceptToReview && (
          <ErrorReview
            errorMessage={errorMessage}
            conceptToReview={conceptToReview}
            onRetry={unlockAndRetry}
          />
        )}
      </AnimatePresence>

      {/* Correct feedback */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-green-500/40 bg-green-950/40 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <p className="font-semibold text-green-300 text-sm">Correto!</p>
            </div>
            <p className="text-green-200/90 text-sm leading-relaxed">
              {question.correctFeedback}
            </p>
            <button
              onClick={isLast ? undefined : advanceToNextQuestion}
              className="w-full rounded-lg bg-green-500/20 border border-green-500/40 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/30 transition-colors"
            >
              {isLast ? "Ver resultado →" : "Próxima questão →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      {!isCorrect && !isLocked && (
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer}
          className="w-full rounded-xl bg-[#388bfd] py-3 font-bold text-white hover:bg-[#388bfd]/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Confirmar resposta
        </button>
      )}
    </motion.div>
  )
}

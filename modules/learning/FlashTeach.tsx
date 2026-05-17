"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useLessonStore } from "./lesson-store"
import { TheoryCard } from "./TheoryCard"
import { WorkedExampleCard } from "./WorkedExampleCard"
import { LessonQuiz } from "./LessonQuiz"

// ─── Tela de conclusão ────────────────────────────────────────────────────────

interface CompletedScreenProps {
  correctCount:   number
  totalQuestions: number
  sessionXp:      number
  onReset:        () => void
  onBack:         () => void
}

function CompletedScreen({
  correctCount,
  totalQuestions,
  sessionXp,
  onReset,
  onBack,
}: CompletedScreenProps) {
  const perfect = correctCount === totalQuestions
  const pct     = Math.round((correctCount / totalQuestions) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 max-w-sm mx-auto text-center py-12"
    >
      <span className="text-6xl" role="img" aria-label={perfect ? "Troféu" : "Check"}>
        {perfect ? "🏆" : "✅"}
      </span>

      <div>
        <h2 className="text-2xl font-bold text-white">
          {perfect ? "Aula perfeita!" : "Aula concluída!"}
        </h2>
        <p className="text-neutral-400 text-sm mt-1">
          {correctCount} de {totalQuestions} questões corretas · {pct}% de acerto
        </p>
      </div>

      {/* XP earned */}
      <div className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
        <p className="text-[#56d364] text-4xl font-black">+{sessionXp} XP</p>
        <p className="text-neutral-500 text-xs mt-1">
          {perfect
            ? "Bônus de perfeição aplicado"
            : "Bônus de primeira tentativa incluído onde aplicável"}
        </p>
      </div>

      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onReset}
          className="w-full rounded-xl bg-[#388bfd] py-3 text-sm font-bold text-white hover:bg-[#388bfd]/90 transition-colors"
        >
          Refazer aula
        </button>
        <button
          onClick={onBack}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 text-sm font-semibold text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
        >
          ← Voltar ao início
        </button>
      </div>
    </motion.div>
  )
}

// ─── FlashTeach — só conteúdo, sem background/padding próprio ─────────────────
// O layout (bg, padding, header) é responsabilidade da página pai.

interface FlashTeachProps {
  onBack: () => void   // chamado ao concluir a aula ("Voltar ao início")
}

export function FlashTeach({ onBack }: FlashTeachProps) {
  const { lesson, screen, quiz, sessionXp, advanceTo, reset } = useLessonStore()

  if (!lesson) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-neutral-500 text-sm">Nenhuma aula carregada.</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {screen === "theory" && (
        <motion.div
          key="theory"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          <TheoryCard
            theory={lesson.theory}
            onContinue={() => advanceTo("example")}
          />
        </motion.div>
      )}

      {screen === "example" && (
        <motion.div
          key="example"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          <WorkedExampleCard
            example={lesson.example}
            onContinue={() => advanceTo("quiz")}
          />
        </motion.div>
      )}

      {screen === "quiz" && (
        <motion.div
          key="quiz"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          <LessonQuiz />
        </motion.div>
      )}

      {screen === "completed" && (
        <motion.div
          key="completed"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <CompletedScreen
            correctCount={quiz.correctCount}
            totalQuestions={lesson.questions.length}
            sessionXp={sessionXp}
            onReset={reset}
            onBack={onBack}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

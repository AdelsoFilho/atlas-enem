"use client"

import { motion } from "framer-motion"

interface ErrorReviewProps {
  errorMessage: string
  conceptToReview: string
  onRetry: () => void
}

export function ErrorReview({ errorMessage, conceptToReview, onRetry }: ErrorReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-red-500/40 bg-red-900/20 p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">✗</span>
        <div className="space-y-1">
          <p className="font-semibold text-red-300 text-sm">Resposta incorreta</p>
          <p className="text-red-200/80 text-sm leading-relaxed">{errorMessage}</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface/60 border border-white/5 px-4 py-3">
        <p className="text-xs font-semibold text-surface-2 uppercase tracking-wider mb-1">
          Conceito para revisar
        </p>
        <p className="text-white text-sm">{conceptToReview}</p>
      </div>

      <button
        onClick={onRetry}
        className="w-full rounded-lg bg-red-500/20 border border-red-500/40 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
      >
        Entendi — Tentar novamente
      </button>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import type { TheoryContent } from "./types"

interface TheoryCardProps {
  theory: TheoryContent
  onContinue: () => void
}

export function TheoryCard({ theory, onContinue }: TheoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#388bfd]">
          Teoria
        </p>
        <h2 className="text-2xl font-bold text-white">{theory.title}</h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          {theory.conceptSummary}
        </p>
      </div>

      {/* Key Points */}
      <div className="space-y-3">
        {theory.keyPoints.map((pt, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl bg-neutral-900 p-4 border border-neutral-800"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#388bfd]/20 text-xs font-bold text-[#388bfd]">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-white text-sm">{pt.label}</p>
              <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
                {pt.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Formula */}
      {theory.formula && (
        <div className="rounded-xl bg-[#f78166]/10 border border-[#f78166]/30 p-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-[#f78166] uppercase tracking-wider">
            {theory.formula.label}
          </p>
          <code className="text-[#f78166] text-lg font-mono">
            {theory.formula.notation}
          </code>
        </div>
      )}

      {/* Memory Trick */}
      {theory.memoryTrick && (
        <div className="rounded-xl bg-[#56d364]/10 border border-[#56d364]/30 p-4">
          <p className="text-xs font-semibold text-[#56d364] uppercase tracking-wider mb-1">
            Macete
          </p>
          <p className="text-white text-sm leading-relaxed">{theory.memoryTrick}</p>
        </div>
      )}

      {/* Application Note */}
      <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
        <p className="text-xs font-semibold text-[#79c0ff] uppercase tracking-wider mb-1">
          Como cai na prova
        </p>
        <p className="text-neutral-400 text-sm leading-relaxed">
          {theory.applicationNote}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full rounded-xl bg-[#388bfd] py-3 font-bold text-white hover:bg-[#388bfd]/90 transition-colors"
      >
        Ver Exemplo Resolvido →
      </button>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import type { WorkedExample } from "./types"

interface WorkedExampleCardProps {
  example: WorkedExample
  onContinue: () => void
}

export function WorkedExampleCard({ example, onContinue }: WorkedExampleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#79c0ff]">
          Exemplo Resolvido
        </p>
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-white text-sm leading-relaxed">{example.statement}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="relative flex flex-col gap-0">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-8 bottom-8 w-px bg-neutral-700" />

        {example.steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative flex gap-4 pb-4"
          >
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 border border-neutral-700 text-sm font-bold text-[#388bfd]">
              {step.step}
            </span>
            <div className="flex-1 pt-1">
              <p className="font-semibold text-white text-sm">{step.label}</p>
              <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
                {step.content}
              </p>
              {step.insight && (
                <div className="mt-2 rounded-lg bg-[#388bfd]/10 border border-[#388bfd]/20 px-3 py-2">
                  <p className="text-xs text-[#388bfd] leading-relaxed">
                    💡 {step.insight}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final Insight */}
      <div className="rounded-xl bg-[#56d364]/10 border border-[#56d364]/30 p-4">
        <p className="text-xs font-semibold text-[#56d364] uppercase tracking-wider mb-1">
          Padrão generalizável
        </p>
        <p className="text-white text-sm leading-relaxed">{example.finalInsight}</p>
      </div>

      {/* Common Trap */}
      <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4">
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
          Armadilha frequente
        </p>
        <p className="text-red-300 text-sm leading-relaxed">{example.commonTrap}</p>
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full rounded-xl bg-[#388bfd] py-3 font-bold text-white hover:bg-[#388bfd]/90 transition-colors"
      >
        Iniciar Questões →
      </button>
    </motion.div>
  )
}

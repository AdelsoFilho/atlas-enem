"use client"

import { useEffect, useState } from "react"
import type { ValidationStatus } from "@/validator"
import { cn } from "@/lib/utils"
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react"

interface ValidationBadgeProps {
  status: ValidationStatus
  debugReport?: string
  correcaoSugerida?: string
  questionId: string
  className?: string
}

// Badge visível apenas quando ATLAS_ADMIN=true no localStorage
export function ValidationBadge({
  status,
  debugReport,
  correcaoSugerida,
  questionId,
  className,
}: ValidationBadgeProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    // Ativado via console: localStorage.setItem("ATLAS_ADMIN", "true")
    setIsAdmin(localStorage.getItem("ATLAS_ADMIN") === "true")
  }, [])

  if (!isAdmin) return null

  const config = {
    VALID: {
      icon: ShieldCheck,
      label: "Validação OK",
      classes: "border-xp/40 bg-xp-dim text-xp",
    },
    INVALID: {
      icon: ShieldAlert,
      label: "INVÁLIDA",
      classes: "border-math/40 bg-math/10 text-math",
    },
    UNCHECKED: {
      icon: ShieldQuestion,
      label: "Não verificada",
      classes: "border-border bg-surface-2 text-muted",
    },
  }[status]

  const Icon = config.icon

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        onClick={() => setShowReport((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80",
          config.classes
        )}
        title={`Questão ${questionId} — clique para detalhes`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </button>

      {showReport && (status === "INVALID" || debugReport) && (
        <div className="rounded border border-math/30 bg-math/5 p-3 font-mono text-[10px]">
          <p className="mb-1 font-bold uppercase text-math">
            Relatório Técnico — {questionId}
          </p>
          {debugReport && (
            <pre className="whitespace-pre-wrap text-white/70">{debugReport}</pre>
          )}
          {correcaoSugerida && (
            <div className="mt-2 border-t border-math/20 pt-2">
              <p className="font-bold text-writing">Correção sugerida:</p>
              <p className="mt-0.5 text-white/80">{correcaoSugerida}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

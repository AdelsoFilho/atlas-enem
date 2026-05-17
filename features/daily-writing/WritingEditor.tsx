"use client"

import { useState, useEffect } from "react"
import { useDailyWriting } from "@/hooks/useDailyWriting"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { XpBadge } from "@/components/ui/xp-badge"
import { calcWritingXp } from "@/hooks/useGamification"
import { cn } from "@/lib/utils"
import { CheckCircle, Flame, AlertTriangle, BookOpen } from "lucide-react"

export function WritingEditor() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const {
    theme,
    content,
    setContent,
    wordCount,
    minWords,
    idealWords,
    canSubmit,
    isSubmitting,
    submitError,
    handleSubmit,
    streak,
    isCompleted,
  } = useDailyWriting()

  const wordProgress = Math.min(100, (wordCount / idealWords) * 100)
  const xpPreview = calcWritingXp(streak.currentStreak)
  const isStreakWeek = streak.currentStreak > 0 && streak.currentStreak % 7 === 0

  if (isCompleted && mounted) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="rounded-full border border-xp/30 bg-xp-dim p-6">
          <CheckCircle className="h-12 w-12 text-xp" suppressHydrationWarning />
        </div>
        <div>
          <h2 className="font-mono text-xl font-bold text-white">
            Missão Cumprida
          </h2>
          <p className="mt-1 text-muted">
            Redação de hoje enviada. Streak atual:{" "}
            <span className="font-bold text-writing">{streak.currentStreak} dias</span>
          </p>
        </div>
        <XpBadge xp={xpPreview} size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tema do dia */}
      <div className="rounded-lg border border-writing/20 bg-writing/5 p-4">
        <div className="mb-1 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-writing" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-writing">
            Tema do dia
          </span>
        </div>
        <p className="text-base font-medium text-white">{theme}</p>
      </div>

      {/* Streak e XP preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame
            className={cn(
              "h-4 w-4",
              streak.currentStreak > 0
                ? "text-orange-400 animate-streak-flame"
                : "text-muted"
            )}
          />
          <span className="font-mono text-sm text-muted">
            Streak:{" "}
            <span className="font-bold text-white">{streak.currentStreak}</span>
            {" "}dias
          </span>
          {isStreakWeek && (
            <span className="rounded-full border border-writing/40 bg-writing/10 px-2 py-0.5 font-mono text-xs font-bold text-writing">
              +50% XP BÔNUS
            </span>
          )}
        </div>
        <XpBadge xp={xpPreview} />
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Inicie sua redação aqui. Estruture em Introdução, Desenvolvimento (2 parágrafos) e Conclusão com proposta de intervenção..."
          rows={16}
          suppressHydrationWarning
          className={cn(
            "w-full resize-none rounded-lg border bg-surface p-4 font-sans text-sm leading-relaxed text-white placeholder:text-muted/50",
            "focus:outline-none focus:ring-1 focus:ring-writing/50",
            "transition-all duration-200",
            wordCount >= minWords ? "border-writing/30" : "border-border"
          )}
        />
        <span className="absolute bottom-3 right-3 font-mono text-xs text-muted">
          {wordCount} palavras
        </span>
      </div>

      {/* Barra de progresso de palavras */}
      <ProgressBar
        value={wordProgress}
        color="writing"
        label={`${wordCount}/${idealWords} palavras`}
        showPercent
        size="sm"
      />

      {/* Alerta de mínimo */}
      {mounted && wordCount > 0 && wordCount < minWords && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-800/50 bg-orange-900/20 px-3 py-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-400" suppressHydrationWarning />
          <p className="font-mono text-xs text-orange-300">
            Mínimo de {minWords} palavras para submeter ({minWords - wordCount} restantes)
          </p>
        </div>
      )}

      {submitError && (
        <p className="font-mono text-xs text-red-400">{submitError}</p>
      )}

      {/* Botão de submit — bloqueio de conclusão do dia */}
      <Button
        variant="writing"
        size="lg"
        disabled={!canSubmit}
        loading={isSubmitting}
        onClick={handleSubmit}
        className="w-full"
      >
        {canSubmit ? "Submeter Redação e Concluir o Dia" : `Escreva mais ${Math.max(0, minWords - wordCount)} palavras`}
      </Button>

      <p className="text-center font-mono text-xs text-muted">
        A barra de progresso diário só completa com a redação submetida.
      </p>
    </div>
  )
}

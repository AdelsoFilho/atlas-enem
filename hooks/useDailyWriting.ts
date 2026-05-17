"use client"

import { useState, useCallback } from "react"
import { useGamificationStore } from "@/store/gamification-store"

// Banco de temas — em produção, buscar de /api/writing-themes (por data)
// TODO: conectar à API de temas externos ou ao seu próprio banco de dados
const WRITING_THEMES: string[] = [
  "Os desafios da educação digital no Brasil contemporâneo",
  "A solidariedade como valor fundamental na sociedade pós-pandêmica",
  "Impactos das redes sociais na construção da identidade juvenil",
  "A importância da preservação do cerrado brasileiro",
  "Desafios para a implementação da igualdade racial no mercado de trabalho",
  "O papel da ciência e da tecnologia no combate às fake news",
  "A crise hídrica e os limites do modelo de desenvolvimento atual",
  "Saúde mental e a pressão por alta performance na juventude brasileira",
  "Inteligência artificial: oportunidade ou ameaça para o emprego no Brasil?",
  "Os limites e possibilidades da democracia participativa no século XXI",
]

function getDailyTheme(): string {
  // Tema baseado no dia do ano para ser determinístico (mesmo tema para o dia inteiro)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  )
  return WRITING_THEMES[dayOfYear % WRITING_THEMES.length]
}

export function useDailyWriting() {
  const { submitDailyWriting, getTodayWriting, streak } = useGamificationStore()

  const todayWriting = getTodayWriting()
  const theme = getDailyTheme()

  const [content, setContent] = useState(todayWriting?.content ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const MIN_WORDS = 200
  const IDEAL_WORDS = 600 // redação ENEM ideal
  const canSubmit = wordCount >= MIN_WORDS && !todayWriting?.submittedAt

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const writing = submitDailyWriting(theme, content)

      // TODO: Chamar API de IA para correção
      // Descomente e implemente quando a API estiver disponível:
      //
      // const review = await fetch("/api/ai-writing-review", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ theme: writing.theme, content: writing.content }),
      // }).then(r => r.json())
      //
      // useGamificationStore.getState().updateWritingReview(writing.date, review)

      return writing
    } catch (err) {
      setSubmitError("Erro ao salvar redação. Tente novamente.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }, [canSubmit, submitDailyWriting, theme, content])

  return {
    theme,
    content,
    setContent,
    wordCount,
    minWords: MIN_WORDS,
    idealWords: IDEAL_WORDS,
    canSubmit,
    isSubmitting,
    submitError,
    handleSubmit,
    todayWriting,
    streak,
    isCompleted: !!todayWriting?.submittedAt,
  }
}

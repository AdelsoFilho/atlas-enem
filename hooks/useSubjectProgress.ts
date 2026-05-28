"use client"

import { useState, useEffect } from "react"
import { SYLLABUS } from "@/config/syllabus"
import { getSubjectTopicCompletion } from "@/lib/supabaseClient"
import type { SubjectKey } from "@/config/ufg-weights"

/**
 * Retorna o progresso de conclusão de tópicos por matéria.
 *
 * - Usuário logado  → lê topic_sessions do Supabase (tópicos distintos concluídos)
 * - Usuário deslogado → retorna todos 0%
 *
 * O percentual é: completedTopics / totalTopicsInSyllabus × 100
 *
 * "writing" não tem tópicos no SYLLABUS, então fica sempre 0 aqui
 * (o progresso de redação usa a barra de meta diária separada).
 */
export function useSubjectProgress(userId: string | null) {
  const [progress, setProgress] = useState<Record<SubjectKey, number>>({
    math: 0, languages: 0, humanities: 0, sciences: 0, writing: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setProgress({ math: 0, languages: 0, humanities: 0, sciences: 0, writing: 0 })
      return
    }

    setLoading(true)
    getSubjectTopicCompletion(userId)
      .then((completedBySubject) => {
        setProgress({
          math:       pct("math",       completedBySubject),
          languages:  pct("languages",  completedBySubject),
          humanities: pct("humanities", completedBySubject),
          sciences:   pct("sciences",   completedBySubject),
          writing:    0, // gerenciado pelo módulo de redação
        })
      })
      .catch(() => { /* falha silenciosa — mantém 0% */ })
      .finally(() => setLoading(false))
  }, [userId])

  return { progress, loading }
}

function pct(subject: SubjectKey, completed: Record<string, number>): number {
  const total     = SYLLABUS[subject]?.length ?? 0
  const done      = completed[subject] ?? 0
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

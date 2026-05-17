"use client"

/**
 * AuthSync — componente invisível montado na raiz da página.
 *
 * Rastreia o ID do usuário ativo no localStorage.
 * Quando o usuário muda (login diferente, ou logout → novo login),
 * reseta todas as stores de progresso para que cada conta comece zerada.
 *
 * Lógica da chave "atlas_active_user":
 *  - Não definido / vazio → sessão de visitante
 *  - UUID              → usuário autenticado específico
 *
 * Cenários:
 *  ✅ Mesmo usuário faz login novamente → chave igual → NÃO reseta
 *  ✅ Usuário B loga após usuário A     → chaves diferentes → reseta
 *  ✅ Visitante → faz login             → "" vs UUID → reseta
 *  ✅ Logout → visitante                → UUID vs "" → reseta (visitante começa limpo)
 */

import { useEffect, useRef } from "react"
import { useAuth }               from "@/contexts/AuthContext"
import { useGamificationStore }  from "@/store/gamification-store"
import { useEssayStore }         from "@/modules/essay/essay-store"

const STORAGE_KEY = "atlas_active_user"

export function AuthSync() {
  const { user, loading } = useAuth()
  const resetGamification  = useGamificationStore((s) => s.resetAllData)
  const resetEssayHistory  = useEssayStore((s) => s.resetHistory)

  // evita rodar no primeiro render antes de auth carregar
  const initialized = useRef(false)

  useEffect(() => {
    if (loading) return

    const newId      = user?.id ?? ""
    const storedId   = localStorage.getItem(STORAGE_KEY) ?? ""

    if (!initialized.current) {
      // primeira vez: apenas registra o usuário atual, sem resetar
      initialized.current = true
      if (newId !== storedId) {
        // Usuário diferente do que estava — reseta
        resetGamification()
        resetEssayHistory()
        localStorage.setItem(STORAGE_KEY, newId)
      }
      return
    }

    // Mudança de usuário durante a sessão (ex: logout → novo login)
    if (newId !== storedId) {
      resetGamification()
      resetEssayHistory()
      localStorage.setItem(STORAGE_KEY, newId)
    }
  }, [user?.id, loading, resetGamification, resetEssayHistory])

  return null
}

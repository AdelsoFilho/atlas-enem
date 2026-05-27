"use client"

import { useState, useEffect } from "react"

// ── Data-alvo: ENEM 2026 ──────────────────────────────────────────────────────
// 08 de novembro de 2026 às 13:30 (Horário de Brasília = UTC-3)
// Equivale a 16:30 UTC.  Fixar na constante evita drift de timezone.
export const ENEM_2026_DATE = new Date("2026-11-08T16:30:00.000Z")

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CountdownResult {
  days:       number
  hours:      number
  minutes:    number
  seconds:    number
  totalMs:    number    // milissegundos restantes
  isPast:     boolean
  /** < 30 dias restantes */
  isUrgent:   boolean
  /** < 7 dias restantes */
  isCritical: boolean
  /** true enquanto o hook ainda não rodou no cliente (SSR / 1º render) */
  isHydrating: boolean
}

const ZERO: CountdownResult = {
  days: 0, hours: 0, minutes: 0, seconds: 0,
  totalMs: 0, isPast: false, isUrgent: false, isCritical: false,
  isHydrating: true,
}

// ── Cálculo puro ──────────────────────────────────────────────────────────────

function compute(targetDate: Date): CountdownResult {
  const totalMs = targetDate.getTime() - Date.now()

  if (totalMs <= 0) {
    return { ...ZERO, isPast: true, isHydrating: false }
  }

  const days    = Math.floor(totalMs / 86_400_000)
  const hours   = Math.floor((totalMs % 86_400_000) / 3_600_000)
  const minutes = Math.floor((totalMs % 3_600_000)  / 60_000)
  const seconds = Math.floor((totalMs % 60_000)      / 1_000)

  return {
    days, hours, minutes, seconds, totalMs,
    isPast:      false,
    isUrgent:    days < 30,
    isCritical:  days < 7,
    isHydrating: false,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Retorna uma contagem regressiva atualizada a cada segundo.
 *
 * - Usa `Date.now()` como referência absoluta em cada tick para manter
 *   precisão mesmo se a aba ficar em background por horas.
 * - Intervalo de 500ms garante que o segundo nunca "pule" visualmente.
 * - Retorna `isHydrating: true` no servidor e no 1º render para evitar
 *   mismatch de hidratação no Next.js.
 */
export function useCountdown(targetDate: Date = ENEM_2026_DATE): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(ZERO)

  useEffect(() => {
    // Calcula imediatamente após o mount para eliminar "flash" de zeros
    setResult(compute(targetDate))

    const id = setInterval(() => {
      setResult(compute(targetDate))
    }, 500)                          // 500ms evita pulo de dígito

    return () => clearInterval(id)  // cleanup obrigatório — sem memory leak
  }, [targetDate])

  return result
}

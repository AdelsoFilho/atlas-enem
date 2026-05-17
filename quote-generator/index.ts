import { format } from "date-fns"
import type { DailyQuotes, EliteQuote } from "@/types/quiz"
import { QUOTE_BANK } from "./bank"

function dateSeed(dateStr: string): number {
  return dateStr.split("-").reduce((acc, n) => acc * 31 + parseInt(n, 10), 0)
}

// 3 citações por dia — seleção determinística para não variar ao recarregar
export function getDailyQuotes(date?: string): DailyQuotes {
  const today = date ?? format(new Date(), "yyyy-MM-dd")
  const seed = dateSeed(today)

  // Embaralha com seed do dia
  const shuffled = [...QUOTE_BANK].sort((a, b) => {
    const hashA = (dateSeed(a.id) ^ seed) >>> 0
    const hashB = (dateSeed(b.id) ^ seed) >>> 0
    return hashA - hashB
  })

  // Garante variedade de disciplinas nas 3 selecionadas
  const selected: EliteQuote[] = []
  const usedDisciplines = new Set<string>()

  for (const quote of shuffled) {
    if (selected.length >= 3) break
    if (!usedDisciplines.has(quote.discipline)) {
      selected.push(quote)
      usedDisciplines.add(quote.discipline)
    }
  }

  // Completar se não tiver 3 com disciplinas únicas
  for (const quote of shuffled) {
    if (selected.length >= 3) break
    if (!selected.includes(quote)) selected.push(quote)
  }

  return { date: today, quotes: selected.slice(0, 3) }
}

export type { EliteQuote, DailyQuotes }

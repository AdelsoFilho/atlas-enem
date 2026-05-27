"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap, Loader2, WifiOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useEssayStore } from "@/modules/essay/essay-store"
import {
  fetchAllTopics,
  fetchDoneTopicIds,
  recordTopicDone,
  type DbTopic,
} from "@/lib/supabaseClient"

// ── Dados locais (fallback offline + render) ──────────────────────────────────

const LOCAL_TOPICS = [
  { id: 1,  title: "Os desafios da inclusão digital de idosos no Brasil",           category: "TECNOLOGIA" },
  { id: 2,  title: "Impactos da inteligência artificial no mercado de trabalho",    category: "TECNOLOGIA" },
  { id: 3,  title: "A persistência da fome e da insegurança alimentar no Brasil",   category: "SOCIEDADE"  },
  { id: 4,  title: "Caminhos para combater a violência urbana nas grandes cidades", category: "SEGURANÇA"  },
  { id: 5,  title: "Democratização do acesso à cultura no país",                    category: "CULTURA"    },
  { id: 6,  title: "Saúde mental na sociedade contemporânea e o papel das escolas", category: "SAÚDE"      },
  { id: 7,  title: "Gestão de resíduos sólidos e o problema do lixo no Brasil",     category: "AMBIENTE"   },
  { id: 8,  title: "Ética e privacidade no uso de redes sociais",                   category: "ÉTICA"      },
  { id: 9,  title: "O envelhecimento da população e os desafios da previdência",    category: "SOCIEDADE"  },
  { id: 10, title: "A valorização da identidade indígena e a preservação cultural", category: "CULTURA"    },
] as const

type SurpriseState = "idle" | "loading" | "offline"

// ── Component ─────────────────────────────────────────────────────────────────

export function EssayTopicGrid() {
  const router = useRouter()
  const { user } = useAuth()
  const { setPendingTheme } = useEssayStore()

  const [surpriseState, setSurpriseState] = useState<SurpriseState>("idle")
  const [offlineNotice, setOfflineNotice] = useState(false)

  // ── Navigate to essay with pre-selected theme ─────────────────────────────
  async function goToEssay(topic: DbTopic | typeof LOCAL_TOPICS[number], recordInDb = true) {
    // Record in DB if user is logged in (non-blocking for UX)
    if (user && recordInDb) {
      recordTopicDone(user.id, topic.id).catch(console.error)
    }
    setPendingTheme(topic.title)
    router.push("/essay")
  }

  // ── Smart surprise: anti-repetition when logged in ───────────────────────
  async function handleSurprise() {
    if (surpriseState === "loading") return

    // ── Visitante: sorteio local simples ─────────────────────────────────
    if (!user) {
      const pick = LOCAL_TOPICS[Math.floor(Math.random() * LOCAL_TOPICS.length)]
      goToEssay(pick, false)
      return
    }

    // ── Usuário logado: consulta Supabase ─────────────────────────────────
    setSurpriseState("loading")
    setOfflineNotice(false)

    try {
      const [allTopics, doneIds] = await Promise.all([
        fetchAllTopics(),
        fetchDoneTopicIds(user.id),
      ])

      const doneSet = new Set(doneIds)
      const available = allTopics.filter((t) => !doneSet.has(t.id))

      if (available.length === 0) {
        // Dominou todos! Pergunta se quer resetar
        const reset = window.confirm(
          "🏆 Parabéns — você dominou todos os temas!\n\nDeseja resetar seu progresso e recomeçar?"
        )
        if (reset) {
          const { resetUserHistory } = await import("@/lib/supabaseClient")
          await resetUserHistory(user.id)
          // Sorteia qualquer tema após reset
          const pick = allTopics[Math.floor(Math.random() * allTopics.length)]
          setSurpriseState("idle")
          goToEssay(pick)
        } else {
          setSurpriseState("idle")
        }
        return
      }

      const pick = available[Math.floor(Math.random() * available.length)]
      setSurpriseState("idle")
      goToEssay(pick)
    } catch {
      // Fallback offline
      setSurpriseState("offline")
      setOfflineNotice(true)
      setTimeout(() => setSurpriseState("idle"), 2000)
      const pick = LOCAL_TOPICS[Math.floor(Math.random() * LOCAL_TOPICS.length)]
      goToEssay(pick, false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = surpriseState === "loading"

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h2 className="font-mono text-sm font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
          <Zap className="h-4 w-4" suppressHydrationWarning />
          Temas da Vez
        </h2>
        <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mt-0.5 ml-6">
          {user ? `Modo anti-repetição ativo — ${user.email}` : "Escolha ou sofra"}
        </p>
      </div>

      {/* Surprise button */}
      <button
        onClick={handleSurprise}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6 font-black text-white text-sm uppercase tracking-widest transition-colors active:brightness-90 disabled:opacity-70"
        style={{
          minHeight: 56,
          background: isLoading
            ? "linear-gradient(135deg, #6b2504, #7c2d12)"
            : "linear-gradient(135deg, #9a3412, #ea580c)",
          boxShadow: isLoading ? "none" : "0 4px 24px rgba(234,88,12,0.35)",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin shrink-0" suppressHydrationWarning />
            Calculando probabilidade…
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 shrink-0" suppressHydrationWarning />
            {user ? "Surpresa acirrada (anti-repetição)" : "Não decidiu? Sorteio instantâneo"}
          </>
        )}
      </button>

      {/* Offline notice */}
      {offlineNotice && (
        <div className="flex items-center gap-2 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2">
          <WifiOff className="h-3.5 w-3.5 text-neutral-500 shrink-0" suppressHydrationWarning />
          <p className="text-xs text-neutral-500">
            Modo offline — sorteio local aplicado, repetições possíveis.
          </p>
        </div>
      )}

      {/* Login nudge for visitors */}
      {!user && (
        <p className="text-[10px] font-mono text-neutral-700 text-center -mt-1">
          Faça login para ativar o modo anti-repetição inteligente
        </p>
      )}

      {/* Topic grid */}
      <div className="grid gap-2 sm:grid-cols-2">
        {LOCAL_TOPICS.map(({ id, title, category }) => (
          <button
            key={id}
            onClick={() => goToEssay({ id, title, category, is_active: true })}
            className="group w-full text-left rounded-xl bg-[#111] border border-neutral-800 p-4 transition-all duration-100 hover:border-orange-500 hover:bg-neutral-900 active:scale-[0.99]"
            style={{ minHeight: 72 }}
          >
            <span className="inline-block font-mono text-[9px] font-bold uppercase tracking-widest text-[#388bfd] bg-[#388bfd]/10 border border-[#388bfd]/20 rounded px-1.5 py-0.5 mb-2">
              {category}
            </span>
            <p className="text-white text-sm font-semibold leading-snug group-hover:text-orange-50 transition-colors">
              {title}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

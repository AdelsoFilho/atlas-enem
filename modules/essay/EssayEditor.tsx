"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useEssayStore } from "./essay-store"
import { StructureTemplate } from "./StructureTemplate"
import { CorrectionReport } from "./CorrectionReport"

// Todos os temas — compartilhados com EssayTopicGrid do dashboard
export const ALL_THEMES = [
  // Temas da grade de desafio (primeiros 10 = do EssayTopicGrid)
  "Os desafios da inclusão digital de idosos no Brasil",
  "Impactos da inteligência artificial no mercado de trabalho",
  "A persistência da fome e da insegurança alimentar no Brasil",
  "Caminhos para combater a violência urbana nas grandes cidades",
  "Democratização do acesso à cultura no país",
  "Saúde mental na sociedade contemporânea e o papel das escolas",
  "Gestão de resíduos sólidos e o problema do lixo no Brasil",
  "Ética e privacidade no uso de redes sociais",
  "O envelhecimento da população e os desafios da previdência",
  "A valorização da identidade indígena e a preservação cultural",
  // Temas clássicos extras
  "A invisibilidade social das pessoas em situação de rua no Brasil",
  "Desafios para a democratização do acesso à internet no Brasil",
  "O papel da educação ambiental no combate às mudanças climáticas",
  "Caminhos para superar o racismo estrutural no Brasil",
]

const MIN_WORDS = 150
const MAX_WORDS = 400

export function EssayEditor() {
  // Select controlado — permite pré-seleção via pendingTheme do store
  const [selectedTheme, setSelectedTheme] = useState("")

  const {
    content,
    wordCount,
    mode,
    pendingTheme,
    correctionStatus,
    correctionResult,
    correctionError,
    setContent,
    setMode,
    setPendingTheme,
    startCorrection,
    clearCorrection,
  } = useEssayStore()

  // Lê tema pré-selecionado vindo do EssayTopicGrid (store, não persistido)
  useEffect(() => {
    if (pendingTheme) {
      setSelectedTheme(pendingTheme)
      setPendingTheme(null)
    }
  }, [pendingTheme, setPendingTheme])

  async function handleCorrect() {
    if (!selectedTheme || wordCount < MIN_WORDS) return
    startCorrection()
    try {
      const res = await fetch("/api/grade-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedTheme, essayText: content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro na correção")
      useEssayStore.getState().setResult(data)
    } catch (err) {
      useEssayStore.getState().setCorrectionError(
        err instanceof Error ? err.message : "Erro desconhecido"
      )
    }
  }

  if (correctionStatus === "completed" && correctionResult) {
    return <CorrectionReport result={correctionResult} onReset={clearCorrection} />
  }

  const canSubmit =
    correctionStatus !== "loading" &&
    wordCount >= MIN_WORDS &&
    !!selectedTheme

  return (
    <div className="flex flex-col gap-5">
      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl bg-neutral-900 border border-neutral-800 p-1">
        {(["editor", "template"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={[
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
              mode === m
                ? "bg-[#388bfd] text-white shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800",
            ].join(" ")}
          >
            {m === "editor" ? "Editor Livre" : "Template CORINGA"}
          </button>
        ))}
      </div>

      {/* ── Tema (select controlado) ────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
          Tema da Redação
        </label>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className={[
            "w-full rounded-xl bg-neutral-900 border border-neutral-700",
            "px-4 py-3 text-white text-sm",
            "focus:outline-none focus:border-[#388bfd]/60",
            "transition-colors [color-scheme:dark]",
          ].join(" ")}
        >
          <option value="" disabled className="text-neutral-500">
            Selecione um tema...
          </option>
          {ALL_THEMES.map((t) => (
            <option key={t} value={t} className="text-white bg-neutral-900">
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* ── Template CORINGA ───────────────────────────────────────────── */}
      {mode === "template" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <StructureTemplate />
        </motion.div>
      )}

      {/* ── Textarea ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
            Sua Redação
          </label>
          <span
            className={[
              "text-xs font-mono",
              wordCount === 0
                ? "text-neutral-600"
                : wordCount < MIN_WORDS
                ? "text-red-400"
                : wordCount > MAX_WORDS
                ? "text-yellow-400"
                : "text-green-400",
            ].join(" ")}
          >
            {wordCount} palavras
            {wordCount > 0 && wordCount < MIN_WORDS && ` (mín. ${MIN_WORDS})`}
            {wordCount > MAX_WORDS && ` (máx. recomendado: ${MAX_WORDS})`}
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva sua redação aqui. Use os 4 parágrafos: Introdução, Desenvolvimento 1, Desenvolvimento 2 e Conclusão com proposta de intervenção."
          rows={16}
          className={[
            "w-full rounded-xl resize-none",
            "bg-neutral-900 border border-neutral-700",
            "px-4 py-4 text-white text-sm leading-7",
            "placeholder:text-neutral-600",
            "focus:outline-none focus:border-[#388bfd]/60 focus:ring-1 focus:ring-[#388bfd]/20",
            "transition-colors",
          ].join(" ")}
        />
      </div>

      {/* ── Erro ───────────────────────────────────────────────────────── */}
      {correctionStatus === "error" && correctionError && (
        <div className="rounded-xl bg-red-950/40 border border-red-500/30 px-4 py-3">
          <p className="text-red-300 text-sm">{correctionError}</p>
        </div>
      )}

      {/* ── Botão corrigir ─────────────────────────────────────────────── */}
      <button
        onClick={handleCorrect}
        disabled={!canSubmit}
        className={[
          "w-full rounded-xl py-4 font-bold text-white text-base transition-all",
          canSubmit
            ? "bg-[#388bfd] hover:bg-[#388bfd]/90 active:scale-[0.99]"
            : "bg-neutral-800 text-neutral-600 cursor-not-allowed",
        ].join(" ")}
      >
        {correctionStatus === "loading"
          ? "Corrigindo com IA…"
          : "Corrigir com IA (5 Competências ENEM)"}
      </button>

      {wordCount > 0 && wordCount < MIN_WORDS && (
        <p className="text-center text-xs text-neutral-500">
          Faltam {MIN_WORDS - wordCount} palavras para ativar a correção
        </p>
      )}
    </div>
  )
}

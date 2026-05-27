"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, CheckCircle2, XCircle, Zap, AlertTriangle, RefreshCw } from "lucide-react"
import { useModuleStore, getTempoGasto } from "@/modules/learning/module-store"
import type {
  TeoriaConteudo, ExemploConteudo, TreinoConteudo, SimuladoConteudo, Questao,
} from "@/modules/learning/module-types"

// ── Slide wrapper ─────────────────────────────────────────────────────────────

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  )
}

// ── Step 1: Teoria ────────────────────────────────────────────────────────────

function TeoriaStep({ conteudo, onNext }: { conteudo: TeoriaConteudo; onNext: () => void }) {
  return (
    <Slide>
      <div className="flex flex-col gap-5">
        <div>
          <span className="font-mono text-[10px] text-[#388bfd] uppercase tracking-widest">Etapa 1 · Teoria</span>
          <h2 className="text-xl font-black text-white mt-1">{conteudo.titulo}</h2>
          <p className="text-neutral-400 text-sm mt-2 leading-relaxed">{conteudo.explicacao}</p>
        </div>

        {/* Pontos-chave */}
        <div className="flex flex-col gap-2">
          {conteudo.pontos_chave.map((p, i) => (
            <div key={i} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
              <p className="text-sm font-bold text-white">{p.label}</p>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{p.detalhe}</p>
            </div>
          ))}
        </div>

        {/* Fórmula */}
        {conteudo.formula_latex && (
          <div className="rounded-xl bg-[#388bfd]/5 border border-[#388bfd]/20 p-4">
            <p className="font-mono text-[10px] text-[#388bfd] uppercase tracking-widest mb-1">Fórmula</p>
            <p className="font-mono text-white text-sm">{conteudo.formula_latex}</p>
          </div>
        )}

        {/* Macete */}
        {conteudo.macete && (
          <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
            <p className="font-mono text-[10px] text-yellow-400 uppercase tracking-widest mb-1">⚡ Macete</p>
            <p className="text-sm text-yellow-100 leading-relaxed">{conteudo.macete}</p>
          </div>
        )}

        {/* Como cai na UFG */}
        <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-4">
          <p className="font-mono text-[10px] text-orange-400 uppercase tracking-widest mb-1">🎯 Como cai na UFG</p>
          <p className="text-sm text-orange-100 leading-relaxed">{conteudo.como_cai_na_ufg}</p>
        </div>

        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#388bfd] py-4 text-sm font-bold text-white hover:bg-[#388bfd]/90 transition-colors"
        >
          Ver Exemplo Resolvido <ChevronRight className="h-4 w-4" suppressHydrationWarning />
        </button>
      </div>
    </Slide>
  )
}

// ── Step 2: Exemplo ───────────────────────────────────────────────────────────

function ExemploStep({ conteudo, onNext }: { conteudo: ExemploConteudo; onNext: () => void }) {
  return (
    <Slide>
      <div className="flex flex-col gap-5">
        <div>
          <span className="font-mono text-[10px] text-purple-400 uppercase tracking-widest">Etapa 2 · Exemplo Resolvido</span>
          <div className="mt-3 rounded-xl bg-neutral-900 border border-neutral-800 p-4">
            <p className="text-sm text-white leading-relaxed">{conteudo.enunciado}</p>
          </div>
        </div>

        {/* Passos */}
        <div className="flex flex-col gap-2">
          {conteudo.passos.map((p) => (
            <div key={p.passo} className="flex gap-3">
              <div className="shrink-0 h-7 w-7 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-purple-400">{p.passo}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{p.label}</p>
                <p className="text-sm text-neutral-400 mt-0.5">{p.acao}</p>
                {p.insight && (
                  <p className="text-xs text-purple-300 mt-1 italic">→ {p.insight}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resultado */}
        <div className="rounded-xl bg-[#56d364]/5 border border-[#56d364]/20 p-4">
          <p className="font-mono text-[10px] text-[#56d364] uppercase tracking-widest mb-1">Resposta</p>
          <p className="text-sm text-white font-semibold">{conteudo.resposta_final}</p>
        </div>

        {/* Pegadinha */}
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
          <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-1">⚠️ Pegadinha Clássica</p>
          <p className="text-sm text-red-200 leading-relaxed">{conteudo.pegadinha}</p>
        </div>

        {/* Padrão */}
        <div className="rounded-xl bg-neutral-900 border border-neutral-700 p-4">
          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Padrão Generalizável</p>
          <p className="text-sm text-neutral-300 leading-relaxed">{conteudo.padrao_generalizavel}</p>
        </div>

        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-sm font-bold text-white hover:bg-purple-600/90 transition-colors"
        >
          Iniciar Treino Dirigido <ChevronRight className="h-4 w-4" suppressHydrationWarning />
        </button>
      </div>
    </Slide>
  )
}

// ── Step 3: Treino ────────────────────────────────────────────────────────────

function TreinoStep({ conteudo, onValidated }: { conteudo: TreinoConteudo; onValidated: () => void }) {
  const { submitResposta, respostas, tempoInicio } = useModuleStore()
  const { module } = useModuleStore()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const questao = conteudo.questoes[currentIdx]
  const isCorrect = submitted && selected === questao.gabarito
  const isLast = currentIdx === conteudo.questoes.length - 1

  function handleSubmit() {
    if (!selected || submitted) return
    submitResposta(questao as Questao, selected as "A" | "B" | "C" | "D" | "E")
    setSubmitted(true)
  }

  async function handleNext() {
    if (!isLast) {
      setCurrentIdx(i => i + 1)
      setSelected(null)
      setSubmitted(false)
      return
    }

    // Todas respondidas — chamar validate-module
    setIsValidating(true)
    try {
      const allRespostas = [...respostas]
      const tempo = getTempoGasto(tempoInicio)
      const pesoUfg = 3 // valor padrão; a página pode injetar via prop

      const res = await fetch("/api/validate-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topico: module?.topico ?? "",
          pesoUfg,
          respostas: allRespostas,
          tempoSegundos: tempo,
        }),
      })
      const result = await res.json()
      useModuleStore.getState().setValidationResult(result)
      onValidated()
    } catch {
      useModuleStore.getState().setValidationResult({
        aprovado: true,
        acertos: respostas.filter(r => r.acertou).length,
        xp_ganho: respostas.filter(r => r.acertou).length * 45,
        lacunas_identificadas: [],
        recomendacao_proxima_etapa: "avançar_simulado",
        feedback_curto: "Segue para o simulado.",
        analise_tempo: "normal",
      })
      onValidated()
    } finally {
      setIsValidating(false)
    }
  }

  const nivelColor = { facil: "text-green-400", medio: "text-yellow-400", dificil: "text-red-400" }

  return (
    <Slide>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-green-400 uppercase tracking-widest">
            Etapa 3 · Treino Dirigido
          </span>
          <span className="font-mono text-xs text-neutral-500">
            {currentIdx + 1}/{conteudo.questoes.length}
          </span>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
          <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${nivelColor[questao.nivel]}`}>
            {questao.nivel}
          </span>
          <p className="text-sm text-white mt-2 leading-relaxed">{questao.enunciado}</p>
        </div>

        {/* Alternativas */}
        <div className="flex flex-col gap-2">
          {questao.alternativas.map((alt) => {
            const isSelected = selected === alt.key
            const isRight    = submitted && alt.key === questao.gabarito
            const isWrong    = submitted && isSelected && !isRight

            return (
              <button
                key={alt.key}
                onClick={() => !submitted && setSelected(alt.key)}
                disabled={submitted}
                className={[
                  "w-full text-left flex gap-3 rounded-xl border p-3.5 transition-all",
                  isRight  ? "border-[#56d364] bg-[#56d364]/10 text-white" :
                  isWrong  ? "border-red-500 bg-red-500/10 text-white" :
                  isSelected ? "border-[#388bfd] bg-[#388bfd]/10 text-white" :
                  "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600",
                ].join(" ")}
              >
                <span className={[
                  "shrink-0 h-6 w-6 rounded-full border text-xs font-bold flex items-center justify-center",
                  isRight ? "border-[#56d364] text-[#56d364]" :
                  isWrong ? "border-red-400 text-red-400" :
                  isSelected ? "border-[#388bfd] text-[#388bfd]" :
                  "border-neutral-700 text-neutral-500",
                ].join(" ")}>
                  {alt.key}
                </span>
                <span className="text-sm">{alt.texto}</span>
              </button>
            )
          })}
        </div>

        {/* Feedback pós-submissão */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${isCorrect ? "border-[#56d364]/30 bg-[#56d364]/5" : "border-red-500/30 bg-red-500/5"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect
                ? <CheckCircle2 className="h-4 w-4 text-[#56d364]" suppressHydrationWarning />
                : <XCircle className="h-4 w-4 text-red-400" suppressHydrationWarning />}
              <span className={`text-xs font-bold ${isCorrect ? "text-[#56d364]" : "text-red-400"}`}>
                {isCorrect ? "Correto!" : `Errado — Gabarito: ${questao.gabarito}`}
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {isCorrect ? questao.comentario_certo : questao.comentario_errado}
            </p>
          </motion.div>
        )}

        {/* Botões */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full rounded-xl bg-green-700 py-4 text-sm font-bold text-white hover:bg-green-600 transition-colors disabled:opacity-40"
          >
            Confirmar Resposta
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isValidating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-700 py-4 text-sm font-bold text-white hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            {isValidating ? (
              <><RefreshCw className="h-4 w-4 animate-spin" suppressHydrationWarning /> Analisando desempenho…</>
            ) : isLast ? (
              <>Ver Resultado <Zap className="h-4 w-4" suppressHydrationWarning /></>
            ) : (
              <>Próxima Questão <ChevronRight className="h-4 w-4" suppressHydrationWarning /></>
            )}
          </button>
        )}
      </div>
    </Slide>
  )
}

// ── Validação (resultado do treino) ──────────────────────────────────────────

function ValidacaoStep({ onNext, onRepeat }: { onNext: () => void; onRepeat: () => void }) {
  const { validationResult } = useModuleStore()
  if (!validationResult) return null

  const { aprovado, acertos, xp_ganho, lacunas_identificadas, feedback_curto, recomendacao_proxima_etapa } = validationResult

  return (
    <Slide>
      <div className="flex flex-col gap-5 text-center max-w-sm mx-auto py-6">
        <span className="text-5xl">{aprovado ? "✅" : "📖"}</span>

        <div>
          <h3 className="text-xl font-black text-white">{aprovado ? "Treino aprovado!" : "Reforce antes de avançar"}</h3>
          <p className="text-neutral-400 text-sm mt-1">{acertos}/3 corretas · {feedback_curto}</p>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 text-left">
          <p className="text-[#56d364] text-3xl font-black text-center">+{xp_ganho} XP</p>
          {lacunas_identificadas.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] text-yellow-400 uppercase tracking-widest mb-2">
                <AlertTriangle className="inline h-3 w-3 mr-1" suppressHydrationWarning />
                Revisar
              </p>
              <ul className="flex flex-col gap-1">
                {lacunas_identificadas.map((l, i) => (
                  <li key={i} className="text-xs text-neutral-300 flex items-start gap-1.5">
                    <span className="text-yellow-400 shrink-0">→</span> {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {aprovado || recomendacao_proxima_etapa === "avançar_simulado" ? (
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-4 text-sm font-bold text-white hover:bg-orange-500 transition-colors"
          >
            Enfrentar o Simulado UFG <Zap className="h-4 w-4" suppressHydrationWarning />
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={onRepeat}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-3 text-sm font-semibold text-white hover:border-neutral-500 transition-colors"
            >
              ↩ Rever Teoria
            </button>
            <button
              onClick={onNext}
              className="w-full rounded-xl bg-orange-600/70 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Ir ao Simulado mesmo assim →
            </button>
          </div>
        )}
      </div>
    </Slide>
  )
}

// ── Step 4: Simulado ──────────────────────────────────────────────────────────

function SimuladoStep({ conteudo, pesoUfg }: { conteudo: SimuladoConteudo; pesoUfg: number }) {
  const { submitSimulado } = useModuleStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const xpBonus = pesoUfg * 25
  const isCorrect = submitted && selected === conteudo.gabarito

  function handleSubmit() {
    if (!selected || submitted) return
    setSubmitted(true)
    submitSimulado(selected as "A" | "B" | "C" | "D" | "E", conteudo.gabarito, xpBonus)
  }

  return (
    <Slide>
      <div className="flex flex-col gap-5">
        <div>
          <span className="font-mono text-[10px] text-orange-400 uppercase tracking-widest">Etapa 4 · Simulado UFG</span>
          <p className="font-mono text-[9px] text-neutral-600 mt-0.5 uppercase tracking-widest">Questão Interdisciplinar</p>
        </div>

        <div className="rounded-xl bg-neutral-900 border border-orange-500/20 p-4">
          <p className="text-sm text-white leading-relaxed">{conteudo.enunciado}</p>
        </div>

        <div className="flex flex-col gap-2">
          {conteudo.alternativas.map((alt) => {
            const isSelected = selected === alt.key
            const isRight    = submitted && alt.key === conteudo.gabarito
            const isWrong    = submitted && isSelected && !isRight

            return (
              <button
                key={alt.key}
                onClick={() => !submitted && setSelected(alt.key)}
                disabled={submitted}
                className={[
                  "w-full text-left flex gap-3 rounded-xl border p-3.5 transition-all",
                  isRight    ? "border-[#56d364] bg-[#56d364]/10 text-white" :
                  isWrong    ? "border-red-500 bg-red-500/10 text-white" :
                  isSelected ? "border-orange-500 bg-orange-500/10 text-white" :
                  "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600",
                ].join(" ")}
              >
                <span className={[
                  "shrink-0 h-6 w-6 rounded-full border text-xs font-bold flex items-center justify-center",
                  isRight ? "border-[#56d364] text-[#56d364]" :
                  isWrong ? "border-red-400 text-red-400" :
                  isSelected ? "border-orange-400 text-orange-400" :
                  "border-neutral-700 text-neutral-500",
                ].join(" ")}>
                  {alt.key}
                </span>
                <span className="text-sm">{alt.texto}</span>
              </button>
            )
          })}
        </div>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${isCorrect ? "border-[#56d364]/30 bg-[#56d364]/5" : "border-red-500/30 bg-red-500/5"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect
                ? <CheckCircle2 className="h-4 w-4 text-[#56d364]" suppressHydrationWarning />
                : <XCircle className="h-4 w-4 text-red-400" suppressHydrationWarning />}
              <span className={`text-xs font-bold ${isCorrect ? "text-[#56d364]" : "text-red-400"}`}>
                {isCorrect ? `Correto! +${xpBonus} XP` : `Gabarito: ${conteudo.gabarito}`}
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {isCorrect ? conteudo.comentario_certo : conteudo.comentario_errado}
            </p>
            <p className="text-xs text-neutral-500 mt-2 italic">
              Conexão: {conteudo.conexao_topicos}
            </p>
          </motion.div>
        )}

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full rounded-xl py-4 text-sm font-bold text-white transition-colors disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #9a3412, #ea580c)" }}
          >
            Confirmar Resposta Final
          </button>
        )}
      </div>
    </Slide>
  )
}

// ── Tela de Conclusão ─────────────────────────────────────────────────────────

function ConcluídoScreen({ onBack, onRepeat }: { onBack: () => void; onRepeat: () => void }) {
  const { xpTotal, simuladoCorreto, module } = useModuleStore()

  return (
    <Slide>
      <div className="flex flex-col items-center gap-6 max-w-sm mx-auto text-center py-10">
        <span className="text-6xl">{simuladoCorreto ? "🏆" : "🎯"}</span>
        <div>
          <h2 className="text-2xl font-black text-white">Módulo Concluído!</h2>
          <p className="text-neutral-400 text-sm mt-1">{module?.topico}</p>
        </div>

        <div className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
          <p className="text-[#56d364] text-4xl font-black">+{xpTotal} XP</p>
          <p className="text-neutral-500 text-xs mt-1">4 etapas concluídas</p>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onRepeat}
            className="w-full rounded-xl bg-[#388bfd] py-3 text-sm font-bold text-white hover:bg-[#388bfd]/90 transition-colors"
          >
            Refazer Módulo
          </button>
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 text-sm font-semibold text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
          >
            ← Voltar aos Tópicos
          </button>
        </div>
      </div>
    </Slide>
  )
}

// ── StepWizard principal ──────────────────────────────────────────────────────

interface StepWizardProps {
  pesoUfg: number
  onBack: () => void
}

const STEP_LABELS = ["Teoria", "Exemplo", "Treino", "Simulado"]

export function StepWizard({ pesoUfg, onBack }: StepWizardProps) {
  const { module, screen, advanceTo, reset } = useModuleStore()

  if (!module) return null

  const teoria  = module.modulos[0].conteudo as TeoriaConteudo
  const exemplo = module.modulos[1].conteudo as ExemploConteudo
  const treino  = module.modulos[2].conteudo as TreinoConteudo
  const simulado= module.modulos[3].conteudo as SimuladoConteudo

  const stepIndex = ["teoria","exemplo","treino","validacao","simulado","concluido"].indexOf(screen)
  const progressStep = Math.min(stepIndex, 3)

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar das etapas */}
      {screen !== "concluido" && (
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="h-1.5 w-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i < progressStep ? "#56d364" :
                                   i === progressStep ? "#388bfd" : "#262626",
                }}
              />
              <span className={`font-mono text-[9px] uppercase tracking-widest ${
                i <= progressStep ? "text-neutral-400" : "text-neutral-700"
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo por etapa */}
      <AnimatePresence mode="wait">
        {screen === "teoria" && (
          <TeoriaStep key="teoria" conteudo={teoria} onNext={() => advanceTo("exemplo")} />
        )}
        {screen === "exemplo" && (
          <ExemploStep key="exemplo" conteudo={exemplo} onNext={() => advanceTo("treino")} />
        )}
        {screen === "treino" && (
          <TreinoStep key="treino" conteudo={treino} onValidated={() => {}} />
        )}
        {screen === "validacao" && (
          <ValidacaoStep
            key="validacao"
            onNext={() => advanceTo("simulado")}
            onRepeat={() => advanceTo("teoria")}
          />
        )}
        {screen === "simulado" && (
          <SimuladoStep key="simulado" conteudo={simulado} pesoUfg={pesoUfg} />
        )}
        {screen === "concluido" && (
          <ConcluídoScreen key="concluido" onBack={onBack} onRepeat={reset} />
        )}
      </AnimatePresence>
    </div>
  )
}

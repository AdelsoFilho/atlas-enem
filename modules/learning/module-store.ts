"use client"

import { create } from "zustand"
import type {
  FullModule,
  ModuleScreen,
  RespostaAluno,
  ValidationResult,
  ReinforcementData,
  Questao,
} from "./module-types"

interface ModuleStoreState {
  module: FullModule | null
  screen: ModuleScreen
  isLoading: boolean
  loadError: string | null

  // Treino (etapa 3)
  respostas: RespostaAluno[]
  tempoInicio: number | null
  validationResult: ValidationResult | null

  // Simulado (etapa 4)
  respostaSimulado: string | null
  simuladoCorreto: boolean | null

  // XP total do módulo
  xpTotal: number

  // Tutor adaptativo — micro-reforço por erro crítico
  isReinforcementActive:  boolean
  reinforcementData:      ReinforcementData | null
}

interface ModuleStoreActions {
  startLoading: () => void
  loadModule: (module: FullModule) => void
  setLoadError: (msg: string) => void

  advanceTo: (screen: ModuleScreen) => void

  // Treino
  submitResposta: (questao: Questao, resposta: "A" | "B" | "C" | "D" | "E") => void
  setValidationResult: (result: ValidationResult) => void
  startTempo: () => void

  // Simulado
  submitSimulado: (resposta: "A" | "B" | "C" | "D" | "E", gabarito: string, xpBonus: number) => void

  // Tutor adaptativo
  /** Ativa o modal de Correção de Rota com o conteúdo gerado pela IA */
  activateReinforcement: (data: ReinforcementData) => void
  /** Confirma leitura do reforço — libera o fluxo para a próxima questão */
  confirmReinforcement:  () => void

  reset: () => void
}

type ModuleStore = ModuleStoreState & ModuleStoreActions

const initialState: ModuleStoreState = {
  module: null,
  screen: "loading",
  isLoading: false,
  loadError: null,
  respostas: [],
  tempoInicio: null,
  validationResult: null,
  respostaSimulado: null,
  simuladoCorreto: null,
  xpTotal: 0,
}

export const useModuleStore = create<ModuleStore>()((set, get) => ({
  ...initialState,

  startLoading: () => set({ isLoading: true, loadError: null, screen: "loading" }),

  loadModule: (module) => set({
    module,
    screen: "teoria",
    isLoading: false,
    loadError: null,
    respostas: [],
    tempoInicio: null,
    validationResult: null,
    respostaSimulado: null,
    simuladoCorreto: null,
    xpTotal: 0,
  }),

  setLoadError: (msg) => set({ isLoading: false, loadError: msg }),

  advanceTo: (screen) => {
    set({ screen })
    // Inicia cronômetro ao entrar no treino
    if (screen === "treino") {
      set({ tempoInicio: Date.now() })
    }
  },

  startTempo: () => set({ tempoInicio: Date.now() }),

  submitResposta: (questao, resposta) => {
    const acertou = resposta === questao.gabarito
    const novaResposta: RespostaAluno = {
      questaoId: questao.id,
      gabarito: questao.gabarito,
      resposta,
      acertou,
    }
    set(state => ({ respostas: [...state.respostas, novaResposta] }))
  },

  setValidationResult: (result) => {
    set(state => ({
      validationResult: result,
      xpTotal: state.xpTotal + result.xp_ganho,
      screen: "validacao",
    }))
  },

  submitSimulado: (resposta, gabarito, xpBonus) => {
    const correto = resposta === gabarito
    set(state => ({
      respostaSimulado: resposta,
      simuladoCorreto: correto,
      xpTotal: state.xpTotal + (correto ? xpBonus : Math.floor(xpBonus * 0.3)),
      screen: "concluido",
    }))
  },

  reset: () => set(initialState),
}))

// ── Selectors ─────────────────────────────────────────────────────────────────

export function getTempoGasto(tempoInicio: number | null): number {
  if (!tempoInicio) return 0
  return Math.round((Date.now() - tempoInicio) / 1000)
}

/**
 * Types para o sistema de módulos de 4 etapas.
 */

// ── Conteúdo por etapa ────────────────────────────────────────────────────────

export interface PontoChave {
  label: string
  detalhe: string
}

export interface TeoriaConteudo {
  titulo: string
  explicacao: string
  pontos_chave: PontoChave[]
  formula_latex: string | null
  macete: string | null
  como_cai_na_ufg: string
}

export interface Passo {
  passo: number
  label: string
  acao: string
  insight: string
}

export interface ExemploConteudo {
  enunciado: string
  passos: Passo[]
  resposta_final: string
  pegadinha: string
  padrao_generalizavel: string
}

export interface Alternativa {
  key: "A" | "B" | "C" | "D" | "E"
  texto: string
}

export interface Questao {
  id: string
  nivel: "facil" | "medio" | "dificil"
  enunciado: string
  alternativas: Alternativa[]
  gabarito: "A" | "B" | "C" | "D" | "E"
  comentario_certo: string
  comentario_errado: string
}

export interface TreinoConteudo {
  questoes: Questao[]
}

export interface SimuladoConteudo extends Omit<Questao, "id" | "nivel"> {
  conexao_topicos: string
}

// ── Módulo completo ───────────────────────────────────────────────────────────

export type ModuloTipo = "teoria" | "exemplo" | "treino" | "simulado"

export interface ModuloEtapa<T = TeoriaConteudo | ExemploConteudo | TreinoConteudo | SimuladoConteudo> {
  etapa: 1 | 2 | 3 | 4
  tipo: ModuloTipo
  conteudo: T
}

export interface FullModule {
  topico: string
  materia: string
  modulos: [
    ModuloEtapa<TeoriaConteudo>,
    ModuloEtapa<ExemploConteudo>,
    ModuloEtapa<TreinoConteudo>,
    ModuloEtapa<SimuladoConteudo>,
  ]
}

// ── Estado do aluno ───────────────────────────────────────────────────────────

export type ModuleScreen = "loading" | "teoria" | "exemplo" | "treino" | "validacao" | "simulado" | "concluido"

export interface RespostaAluno {
  questaoId: string
  gabarito: string
  resposta: string
  acertou: boolean
}

export interface ValidationResult {
  aprovado: boolean
  acertos: number
  xp_ganho: number
  lacunas_identificadas: string[]
  recomendacao_proxima_etapa: "avançar_simulado" | "repetir_teoria" | "revisar_exemplo"
  feedback_curto: string
  analise_tempo: "rapido" | "normal" | "lento"
}

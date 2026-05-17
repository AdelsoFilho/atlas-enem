// ─── As 5 Competências do ENEM ────────────────────────────────────────────────

export interface CompetenceResult {
  competencia: 1 | 2 | 3 | 4 | 5
  titulo: string
  // Notas válidas: 0, 40, 80, 120, 160, 200
  nota: number
  comentario: string              // análise direta, sem elogios vazios
  problemas: string[]             // lista de problemas específicos encontrados
  paragrafoIdx?: number           // qual parágrafo tem o problema principal
  versaoReescrita?: string        // reescrita sugerida do parágrafo problemático
}

export type EssayLevel = "Iniciado" | "Estrategista" | "Gênio"

export interface EssayCorrectionResult {
  competencias: CompetenceResult[]
  notaTotal: number               // 0–1000
  nivel: EssayLevel
  feedbackGeral: string           // diagnóstico geral em 2-3 frases
  pontosFortes: string[]          // o que funciona
  areasParaMelhora: string[]      // o que exige foco imediato
}

// ─── Template coringa de redação ──────────────────────────────────────────────

export interface ParagraphTemplate {
  id: "intro" | "dev1" | "dev2" | "conclusion"
  label: string
  pattern: string                 // o esqueleto com [LACUNAS]
  tips: string[]
  targetWords: number
}

export const CORINGA_TEMPLATE: ParagraphTemplate[] = [
  {
    id: "intro",
    label: "Introdução",
    targetWords: 80,
    pattern:
      "Em [CONTEXTO HISTÓRICO/CIENTÍFICO], [PROBLEMA CENTRAL] tornou-se [IMPACTO]. " +
      "Nesse sentido, [TESE DIRETA — tomada de posição clara].",
    tips: [
      "Comece com dado, citação ou fato — nunca com 'Desde os primórdios'",
      "A tese deve ser afirmação, não pergunta",
      "Evite primeira pessoa",
    ],
  },
  {
    id: "dev1",
    label: "Desenvolvimento 1",
    targetWords: 120,
    pattern:
      "[ARGUMENTO CENTRAL 1]. " +
      "Segundo [AUTOR/DADO/PESQUISA], [EVIDÊNCIA]. " +
      "Portanto, [ENCADEAMENTO LÓGICO COM A TESE].",
    tips: [
      "1 argumento = 1 parágrafo. Não misture.",
      "Evidência pode ser dado histórico, científico ou citação de autor",
      "O último período deve fechar o raciocínio — não deixar aberto",
    ],
  },
  {
    id: "dev2",
    label: "Desenvolvimento 2",
    targetWords: 120,
    pattern:
      "Além disso, [ARGUMENTO 2 — ângulo diferente do D1]. " +
      "[EVIDÊNCIA 2 — diferente da anterior]. " +
      "Assim, [ARTICULAÇÃO COM A TESE].",
    tips: [
      "D2 deve complementar D1, não repetir",
      "Use conectivo de adição ou contraste no início",
      "O ângulo pode ser: causa ≠ consequência, global ≠ local, econômico ≠ social",
    ],
  },
  {
    id: "conclusion",
    label: "Conclusão",
    targetWords: 100,
    pattern:
      "Logo, [RETOMADA DA TESE com outros termos]. " +
      "Para tanto, [AGENTE — quem age] deve [AÇÃO — o quê] por meio de [MEIO — como], " +
      "com o objetivo de [FINALIDADE — por quê], [DETALHE — impacto esperado].",
    tips: [
      "Proposta de intervenção: agente + ação + meio + finalidade + detalhe",
      "Nunca termine com 'Portanto, devemos pensar nisso'",
      "A proposta deve ser factível e respeitar os direitos humanos",
    ],
  },
]

// ─── Estado da correção ───────────────────────────────────────────────────────

export type EssayMode = "editor" | "template" | "repertoire"
export type CorrectionStatus = "idle" | "loading" | "completed" | "error"

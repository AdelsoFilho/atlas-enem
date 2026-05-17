// Módulo de Redação ENEM
// Peso UFG: 2.0 — Obrigatório diário

// Competências ENEM avaliadas na redação (cada uma vale 200 pontos, total 1000)
export const WRITING_COMPETENCIES = [
  {
    id: 1,
    label: "Domínio da norma culta",
    description: "Gramática, ortografia, pontuação",
    maxScore: 200,
  },
  {
    id: 2,
    label: "Compreensão da proposta",
    description: "Entendimento do tema e adequação ao tipo dissertativo-argumentativo",
    maxScore: 200,
  },
  {
    id: 3,
    label: "Argumentação",
    description: "Seleção, relação e organização de informações e argumentos",
    maxScore: 200,
  },
  {
    id: 4,
    label: "Coesão textual",
    description: "Uso de mecanismos linguísticos para construção do texto",
    maxScore: 200,
  },
  {
    id: 5,
    label: "Proposta de intervenção",
    description: "Respeito aos direitos humanos; intervenção detalhada e articulada",
    maxScore: 200,
  },
]

// Estrutura recomendada de redação ENEM
export const WRITING_STRUCTURE = {
  introduction: {
    label: "Introdução",
    minWords: 50,
    idealWords: 80,
    tip: "Apresente o tema, contextualize e aponte o problema central com tese clara.",
  },
  development1: {
    label: "Desenvolvimento 1",
    minWords: 80,
    idealWords: 120,
    tip: "Primeiro argumento com evidência concreta (dado, exemplo histórico, citação).",
  },
  development2: {
    label: "Desenvolvimento 2",
    minWords: 80,
    idealWords: 120,
    tip: "Segundo argumento, aprofundando ou contrapondo o anterior.",
  },
  conclusion: {
    label: "Conclusão",
    minWords: 60,
    idealWords: 100,
    tip: "Retome a tese e apresente proposta de intervenção com: agente, ação, meio, finalidade e detalhamento.",
  },
}

// TODO: Integração com API de correção por IA
// Endpoint esperado: POST /api/ai-writing-review
// Request: { theme: string, content: string }
// Response: {
//   competencias: [number, number, number, number, number],  // 0–200 cada
//   notaTotal: number,   // 0–1000
//   feedback: string,
//   sugestoes: string[]
// }

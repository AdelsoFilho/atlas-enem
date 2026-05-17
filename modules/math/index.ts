// Módulo de Matemática e suas Tecnologias
// Peso UFG: 4.0 — Prioridade máxima de XP

export const MATH_TOPICS = [
  { id: "algebra", label: "Álgebra e Funções", weight: 1.0 },
  { id: "geometry", label: "Geometria Plana e Espacial", weight: 1.0 },
  { id: "statistics", label: "Estatística e Probabilidade", weight: 1.0 },
  { id: "financial", label: "Matemática Financeira", weight: 0.8 },
  { id: "progressions", label: "Progressões (PA/PG)", weight: 0.8 },
  { id: "trigonometry", label: "Trigonometria", weight: 0.8 },
  { id: "combinatorics", label: "Combinatória", weight: 0.6 },
]

// TODO: Conectar à API de questões
// Opções: Qconcursos API, ENEM Aberto (https://enem.dev), API própria
//
// interface QuestionApiResponse { ... }
// export async function fetchMathQuestions(topic: string, difficulty: 1|2|3): Promise<Question[]> {
//   const res = await fetch(`/api/questions?subject=math&topic=${topic}&difficulty=${difficulty}`)
//   return res.json()
// }

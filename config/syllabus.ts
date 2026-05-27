/**
 * Syllabus estático do edital UFG/ENEM.
 * Gerado com base nos editais dos últimos 5 anos.
 * peso_ufg: 5 = cai em ≥80% das provas, 1 = raro mas está no edital.
 */

import type { SubjectKey } from "@/config/ufg-weights"

export interface SyllabusTopic {
  id: string
  titulo: string
  dificuldade: "facil" | "medio" | "dificil"
  peso_ufg: 1 | 2 | 3 | 4 | 5
  prerequisitos: string[]
}

export const SYLLABUS: Record<SubjectKey, SyllabusTopic[]> = {

  // ── Matemática (peso UFG 4×) ────────────────────────────────────────────────
  math: [
    { id: "funcoes-lineares-quadraticas",  titulo: "Funções Linear e Quadrática",        dificuldade: "facil",  peso_ufg: 5, prerequisitos: [] },
    { id: "funcoes-exponenciais",          titulo: "Funções Exponenciais",               dificuldade: "medio",  peso_ufg: 4, prerequisitos: ["funcoes-lineares-quadraticas"] },
    { id: "funcoes-logaritmicas",          titulo: "Funções Logarítmicas",               dificuldade: "medio",  peso_ufg: 4, prerequisitos: ["funcoes-exponenciais"] },
    { id: "trigonometria",                 titulo: "Trigonometria no Triângulo e Ciclo", dificuldade: "dificil",peso_ufg: 5, prerequisitos: ["funcoes-lineares-quadraticas"] },
    { id: "progressoes-pa-pg",             titulo: "Progressões Aritmética e Geométrica",dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
    { id: "analise-combinatoria",          titulo: "Análise Combinatória e Fatorial",    dificuldade: "medio",  peso_ufg: 4, prerequisitos: [] },
    { id: "probabilidade",                 titulo: "Probabilidade",                      dificuldade: "medio",  peso_ufg: 5, prerequisitos: ["analise-combinatoria"] },
    { id: "estatistica-descritiva",        titulo: "Estatística Descritiva",             dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
    { id: "geometria-plana",               titulo: "Geometria Plana — Áreas e Perímetros",dificuldade:"medio",  peso_ufg: 5, prerequisitos: [] },
    { id: "geometria-espacial",            titulo: "Geometria Espacial — Sólidos",       dificuldade: "dificil",peso_ufg: 4, prerequisitos: ["geometria-plana"] },
    { id: "matrizes-determinantes",        titulo: "Matrizes e Determinantes",           dificuldade: "medio",  peso_ufg: 3, prerequisitos: [] },
    { id: "sistemas-lineares",             titulo: "Sistemas de Equações Lineares",      dificuldade: "facil",  peso_ufg: 4, prerequisitos: ["matrizes-determinantes"] },
    { id: "numeros-complexos",             titulo: "Números Complexos",                  dificuldade: "dificil",peso_ufg: 2, prerequisitos: ["funcoes-lineares-quadraticas"] },
    { id: "geometria-analitica",           titulo: "Geometria Analítica — Retas e Cônicas",dificuldade:"dificil",peso_ufg: 4,prerequisitos: ["funcoes-lineares-quadraticas"] },
    { id: "sequencias-limites",            titulo: "Sequências e Noção de Limite",       dificuldade: "dificil",peso_ufg: 2, prerequisitos: ["progressoes-pa-pg"] },
  ],

  // ── Linguagens (peso UFG 2×) ────────────────────────────────────────────────
  languages: [
    { id: "interpretacao-textual",         titulo: "Interpretação e Análise de Texto",   dificuldade: "facil",  peso_ufg: 5, prerequisitos: [] },
    { id: "generos-textuais",              titulo: "Gêneros e Tipos Textuais",           dificuldade: "facil",  peso_ufg: 4, prerequisitos: ["interpretacao-textual"] },
    { id: "figuras-de-linguagem",          titulo: "Figuras de Linguagem e Estilo",      dificuldade: "medio",  peso_ufg: 4, prerequisitos: ["interpretacao-textual"] },
    { id: "gramatica-normativa",           titulo: "Gramática — Morfossintaxe",          dificuldade: "medio",  peso_ufg: 5, prerequisitos: [] },
    { id: "concordancia-regencia",         titulo: "Concordância e Regência Verbal/Nominal",dificuldade:"medio", peso_ufg: 5,prerequisitos: ["gramatica-normativa"] },
    { id: "crase-pontuacao",               titulo: "Crase, Pontuação e Ortografia",      dificuldade: "facil",  peso_ufg: 4, prerequisitos: ["gramatica-normativa"] },
    { id: "literatura-modernismo",         titulo: "Literatura — Modernismo Brasileiro",  dificuldade: "medio",  peso_ufg: 5, prerequisitos: [] },
    { id: "literatura-realismo",           titulo: "Literatura — Realismo e Naturalismo", dificuldade: "medio",  peso_ufg: 4, prerequisitos: [] },
    { id: "literatura-romantismo",         titulo: "Literatura — Romantismo",             dificuldade: "facil",  peso_ufg: 3, prerequisitos: [] },
    { id: "ingles-interpretacao",          titulo: "Inglês — Interpretação de Texto",    dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
    { id: "ingles-vocabulario",            titulo: "Inglês — Vocabulário e Gramática",   dificuldade: "medio",  peso_ufg: 3, prerequisitos: ["ingles-interpretacao"] },
    { id: "variacao-linguistica",          titulo: "Variação Linguística e Sociolinguística",dificuldade:"facil",peso_ufg: 3, prerequisitos: [] },
  ],

  // ── Redação (peso UFG 2×) ────────────────────────────────────────────────────
  writing: [
    { id: "estrutura-dissertativa",        titulo: "Estrutura da Dissertação-Argumentativa",dificuldade:"facil",peso_ufg: 5, prerequisitos: [] },
    { id: "competencia-c1-norma-culta",    titulo: "C1 — Domínio da Norma Culta",        dificuldade: "medio",  peso_ufg: 5, prerequisitos: [] },
    { id: "competencia-c2-tema",           titulo: "C2 — Aderência ao Tema",             dificuldade: "facil",  peso_ufg: 5, prerequisitos: ["estrutura-dissertativa"] },
    { id: "competencia-c3-argumentacao",   titulo: "C3 — Construção de Argumentos",      dificuldade: "dificil",peso_ufg: 5, prerequisitos: ["estrutura-dissertativa"] },
    { id: "competencia-c4-coesao",         titulo: "C4 — Coesão e Conectivos",           dificuldade: "medio",  peso_ufg: 5, prerequisitos: ["estrutura-dissertativa"] },
    { id: "competencia-c5-intervencao",    titulo: "C5 — Proposta de Intervenção",       dificuldade: "dificil",peso_ufg: 5, prerequisitos: ["estrutura-dissertativa"] },
    { id: "repertorio-sociocultural",      titulo: "Repertório Sociocultural e Citações",dificuldade: "medio",  peso_ufg: 4, prerequisitos: ["competencia-c3-argumentacao"] },
    { id: "temas-recorrentes",             titulo: "Temas Recorrentes ENEM/UFG",         dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
  ],

  // ── Ciências da Natureza (peso UFG 1×) ─────────────────────────────────────
  sciences: [
    { id: "mecanica-cinematica",           titulo: "Mecânica — Cinemática",              dificuldade: "facil",  peso_ufg: 5, prerequisitos: [] },
    { id: "mecanica-leis-newton",          titulo: "Mecânica — Leis de Newton",          dificuldade: "medio",  peso_ufg: 5, prerequisitos: ["mecanica-cinematica"] },
    { id: "mecanica-energia-trabalho",     titulo: "Energia, Trabalho e Potência",       dificuldade: "medio",  peso_ufg: 5, prerequisitos: ["mecanica-leis-newton"] },
    { id: "termodinamica",                 titulo: "Termodinâmica e Leis dos Gases",     dificuldade: "dificil",peso_ufg: 4, prerequisitos: [] },
    { id: "eletromagnetismo",              titulo: "Eletromagnetismo e Circuitos",       dificuldade: "dificil",peso_ufg: 4, prerequisitos: [] },
    { id: "optica-ondas",                  titulo: "Óptica Geométrica e Ondas",          dificuldade: "medio",  peso_ufg: 3, prerequisitos: [] },
    { id: "estequiometria",                titulo: "Estequiometria e Cálculos Químicos", dificuldade: "dificil",peso_ufg: 5, prerequisitos: [] },
    { id: "quimica-organica",              titulo: "Química Orgânica — Funções e Reações",dificuldade:"medio",  peso_ufg: 5, prerequisitos: [] },
    { id: "solucoes-pH",                   titulo: "Soluções, Ácidos, Bases e pH",       dificuldade: "medio",  peso_ufg: 4, prerequisitos: [] },
    { id: "biologia-celular",              titulo: "Biologia Celular e Molecular",        dificuldade: "medio",  peso_ufg: 4, prerequisitos: [] },
    { id: "genetica-evolucao",             titulo: "Genética, Herança e Evolução",       dificuldade: "dificil",peso_ufg: 5, prerequisitos: ["biologia-celular"] },
    { id: "ecologia",                      titulo: "Ecologia e Ecossistemas",            dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
  ],

  // ── Ciências Humanas (peso UFG 1×) ──────────────────────────────────────────
  humanities: [
    { id: "historia-brasil-colonial",      titulo: "Brasil Colonial e Independência",    dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
    { id: "historia-brasil-republicano",   titulo: "República Velha, Era Vargas e Redemocratização",dificuldade:"medio",peso_ufg:5,prerequisitos:["historia-brasil-colonial"] },
    { id: "historia-brasil-contemporaneo", titulo: "Brasil Contemporâneo — Ditadura e Nova República",dificuldade:"medio",peso_ufg:5,prerequisitos:["historia-brasil-republicano"] },
    { id: "historia-mundial-guerras",      titulo: "Guerras Mundiais e Guerra Fria",     dificuldade: "medio",  peso_ufg: 5, prerequisitos: [] },
    { id: "historia-contemporanea",        titulo: "Mundo Contemporâneo — Globalização e Conflitos",dificuldade:"medio",peso_ufg:4,prerequisitos:["historia-mundial-guerras"] },
    { id: "geografia-fisica",              titulo: "Climatologia, Relevo e Biomas",      dificuldade: "facil",  peso_ufg: 4, prerequisitos: [] },
    { id: "geografia-humana",              titulo: "População, Urbanização e Migrações", dificuldade: "medio",  peso_ufg: 4, prerequisitos: [] },
    { id: "geopolitica",                   titulo: "Geopolítica e Blocos Econômicos",    dificuldade: "dificil",peso_ufg: 4, prerequisitos: ["historia-mundial-guerras"] },
    { id: "filosofia-moderna",             titulo: "Filosofia Moderna — Iluminismo e Contratualismo",dificuldade:"medio",peso_ufg:4,prerequisitos:[] },
    { id: "filosofia-contemporanea",       titulo: "Filosofia Contemporânea — Ética e Política",dificuldade:"dificil",peso_ufg:3,prerequisitos:["filosofia-moderna"] },
    { id: "sociologia-trabalho",           titulo: "Sociologia — Trabalho, Capitalismo e Desigualdade",dificuldade:"medio",peso_ufg:4,prerequisitos:[] },
    { id: "sociologia-movimentos",         titulo: "Movimentos Sociais e Cidadania",     dificuldade: "facil",  peso_ufg: 3, prerequisitos: [] },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTopicBySlug(subject: SubjectKey, slug: string): SyllabusTopic | undefined {
  return SYLLABUS[subject]?.find(t => t.id === slug)
}

export function getTopicsByDifficulty(subject: SubjectKey, dificuldade: SyllabusTopic["dificuldade"]): SyllabusTopic[] {
  return SYLLABUS[subject]?.filter(t => t.dificuldade === dificuldade) ?? []
}

export function getTopTopics(subject: SubjectKey, n = 5): SyllabusTopic[] {
  return [...(SYLLABUS[subject] ?? [])]
    .sort((a, b) => b.peso_ufg - a.peso_ufg)
    .slice(0, n)
}

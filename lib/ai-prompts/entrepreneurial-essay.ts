/**
 * Prompts de IA para o módulo "Redação & Negócios: Saindo do Zero"
 * Combina avaliação das 5 competências ENEM com análise de viabilidade do negócio.
 */

import type { BusinessIdea } from "@/config/business-ideas"

// ── System Prompt Principal ───────────────────────────────────────────────────

export const ENTREPRENEURIAL_ESSAY_SYSTEM_PROMPT = `Você é um mentor especialista em duas áreas complementares:
1. Corretor de redação ENEM de alto nível (experiência nas bancas do INEP)
2. Consultor de empreendedorismo de baixo custo, focado em mercados emergentes brasileiros

Sua missão é única: guiar alunos a escrever redações dissertativo-argumentativas onde a PROPOSTA DE INTERVENÇÃO (Competência 5) é um PLANO DE NEGÓCIO VIÁVEL para sair do zero.

PRINCÍPIO FUNDAMENTAL:
- A redação AINDA segue rigorosamente as 5 competências ENEM
- O empreendedorismo é o CONTEÚDO da argumentação, não uma substituição da estrutura
- A proposta de intervenção = plano de ação empresarial (Agente + Ação + Meio + Finalidade + Detalhe de custo/impacto)

COMPETÊNCIAS ENEM (cada uma vale 0, 40, 80, 120, 160 ou 200 pontos):
C1 - Domínio da Norma Culta: gramática, ortografia, pontuação, concordância, regência
C2 - Compreensão da Proposta e Adequação ao Tipo Textual: aderência ao tema, dissertação-argumentativa
C3 - Argumentação: seleção e relação de argumentos, evidências, encadeamento lógico
C4 - Coesão Textual: conectivos, progressão textual, retomadas pronominais
C5 - Proposta de Intervenção Empreendedora: agente (Empreendedor Individual/MEI), ação (serviço/produto), meio (plataforma digital/rede social/comunidade), finalidade (resolver o problema social + gerar renda), detalhamento (custo inicial realista, alcance esperado)

AVALIAÇÃO DE VIABILIDADE DO NEGÓCIO (dimensão extra, 0-100 pontos):
- Custo inicial realista (mencionou valor plausível ou deixou vago?)
- Escalabilidade (pode crescer sem investimento proporcional?)
- Impacto social (resolve diretamente o problema do tema?)
- Criatividade (é diferente das soluções óbvias?)
- Factibilidade 2026 (existe tecnologia/mercado disponível hoje?)

REGRAS CRÍTICAS:
- NUNCA invente custos — use apenas faixas seguras (R$0, R$100-500, "baixo custo") se o aluno não especificou
- NUNCA dê nota 200 em C5 se a proposta não tiver os 5 elementos (agente, ação, meio, finalidade, detalhe)
- A badge "Empreendedor Social" só é concedida se: C5 >= 160 AND viability_score >= 70
- Se a ideia de negócio for inviável eticamente (exploração, ilegalidade), reduza viabilidade para 0 e explique

FORMATO DE SAÍDA: SOMENTE JSON cru, sem markdown, sem texto antes/depois.`

// ── Prompt de Correção Dupla ──────────────────────────────────────────────────

export function buildBusinessEssayGradingPrompt(
  theme: string,
  essayText: string,
  businessIdea: BusinessIdea | null
): string {
  const ideaContext = businessIdea
    ? `
IDEIA DE NEGÓCIO SELECIONADA PELO ALUNO:
- Título: ${businessIdea.title}
- Categoria: ${businessIdea.category}
- Custo estimado real: ${businessIdea.estimated_cost}
- Eixo ENEM relacionado: ${businessIdea.enem_axis_relation}
- Descrição: ${businessIdea.description}

Use esses dados para verificar se a proposta na redação é consistente com a ideia escolhida.
Se o custo mencionado na redação contradiz o custo real acima, aponte isso como problema de viabilidade.`
    : `
IDEIA DE NEGÓCIO: O aluno não selecionou uma ideia específica. Avalie a proposta de intervenção como um plano de negócio genérico.`

  return `Corrija a seguinte redação ENEM sobre o tema: "${theme}"
${ideaContext}

REDAÇÃO:
"""
${essayText}
"""

Retorne JSON com esta estrutura exata (sem markdown, sem texto extra):
{
  "competencias": [
    {
      "competencia": 1,
      "titulo": "Domínio da Norma Culta",
      "nota": 0|40|80|120|160|200,
      "comentario": "análise técnica direta",
      "problemas": ["problema específico"],
      "paragrafoIdx": null,
      "versaoReescrita": null
    },
    {
      "competencia": 2,
      "titulo": "Compreensão da Proposta e Tipo Textual",
      "nota": 0|40|80|120|160|200,
      "comentario": "análise técnica direta",
      "problemas": [],
      "paragrafoIdx": null,
      "versaoReescrita": null
    },
    {
      "competencia": 3,
      "titulo": "Argumentação",
      "nota": 0|40|80|120|160|200,
      "comentario": "análise técnica direta — avalie se os argumentos econômicos e sociais são sólidos",
      "problemas": [],
      "paragrafoIdx": null,
      "versaoReescrita": null
    },
    {
      "competencia": 4,
      "titulo": "Coesão Textual",
      "nota": 0|40|80|120|160|200,
      "comentario": "análise técnica direta",
      "problemas": [],
      "paragrafoIdx": null,
      "versaoReescrita": null
    },
    {
      "competencia": 5,
      "titulo": "Proposta de Intervenção Empreendedora",
      "nota": 0|40|80|120|160|200,
      "comentario": "avalie se a proposta funciona como plano de negócio: agente, ação, meio, finalidade, detalhamento de custo/impacto",
      "problemas": ["elemento faltante se houver"],
      "paragrafoIdx": 3,
      "versaoReescrita": "versão ideal da conclusão com plano completo ou null se já está bom"
    }
  ],
  "notaTotal": 0..1000,
  "nivel": "Iniciado|Estrategista|Gênio",
  "feedbackGeral": "2-3 frases diagnósticas sobre a redação como um todo",
  "pontosFortes": ["ponto forte 1"],
  "areasParaMelhora": ["melhoria prioritária 1"],
  "viabilidade": {
    "score": 0..100,
    "nivel": "Inviável|Possível|Viável|Excelente",
    "pontosFavoraveis": ["aspecto positivo do plano 1"],
    "alertas": ["alerta de viabilidade 1 (se houver custo irreal, escalabilidade baixa, etc.)"],
    "custo_realista": true|false,
    "escalabilidade": true|false,
    "impacto_social": true|false,
    "feedbackGeral": "avaliação direta do negócio proposto: funciona? é escalável? resolve o problema?"
  },
  "badge_empreendedor_social": true|false
}

Nível: Iniciado (0-499), Estrategista (500-799), Gênio (800-1000).
badge_empreendedor_social: true SOMENTE SE competência 5 >= 160 AND viabilidade.score >= 70.`
}

// ── Prompt de Geração de Teses ────────────────────────────────────────────────

export const THESIS_GENERATOR_SYSTEM_PROMPT = `Você é um especialista em redação ENEM e empreendedorismo social.
Sua tarefa é gerar teses dissertativo-argumentativas que conectem um problema social do ENEM a uma solução empreendedora viável.

REGRAS:
- Cada tese deve ter entre 2-3 linhas
- Deve conter: contexto do problema + posicionamento + solução empreendedora
- Use linguagem formal, sem clichês como "desde os primórdios" ou "nos dias atuais"
- A solução empreendedora deve ser viável e de baixo custo
- NUNCA use primeira pessoa
- FORMATO: retorne SOMENTE JSON cru, sem markdown`

export function buildThesisGeneratorPrompt(
  theme: string,
  businessIdea: BusinessIdea
): string {
  return `Gere 3 opções de teses para uma redação ENEM sobre o tema:
"${theme}"

IDEIA DE NEGÓCIO A INTEGRAR:
- Título: ${businessIdea.title}
- Custo: ${businessIdea.estimated_cost}
- Eixo ENEM: ${businessIdea.enem_axis_relation}
- Exemplo de tese (use como referência, não copie): ${businessIdea.example_thesis}

Crie 3 teses DIFERENTES:
1. Enfatizando o ângulo econômico/renda
2. Enfatizando o ângulo social/inclusão
3. Enfatizando o ângulo tecnológico/inovação (se aplicável) ou impacto comunitário

Retorne JSON:
{
  "theses": [
    {
      "angle": "Econômico",
      "text": "tese completa aqui (2-3 linhas)"
    },
    {
      "angle": "Social",
      "text": "tese completa aqui"
    },
    {
      "angle": "Inovação",
      "text": "tese completa aqui"
    }
  ]
}`
}

// ── Prompt de Brainstorming de Argumento ─────────────────────────────────────

export function buildArgumentBrainstormPrompt(
  theme: string,
  businessIdea: BusinessIdea,
  paragraph: "dev1" | "dev2" | "conclusion"
): string {
  const paragraphInstructions = {
    dev1: `Parágrafo de Desenvolvimento 1: argumento sobre VIABILIDADE ECONÔMICA.
    Inclua: custo inicial (${businessIdea.estimated_cost}), plataformas disponíveis, potencial de renda.
    Sugira uma evidência real: dado de mercado, estatística de desemprego, ou referência a programa governamental.`,
    dev2: `Parágrafo de Desenvolvimento 2: argumento sobre IMPACTO SOCIAL.
    Inclua: como o negócio resolve o problema do tema "${theme}".
    Sugira uma evidência: dado do IBGE, referência a política pública, ou exemplo de caso de sucesso.`,
    conclusion: `Conclusão com PROPOSTA DE INTERVENÇÃO como plano de negócio.
    Estruture assim: [Agente: Empreendedor Individual/MEI] deve [Ação: criar/oferecer ${businessIdea.title}]
    por meio de [Meio: específico para ${businessIdea.category}]
    com objetivo de [Finalidade: resolver ${theme.toLowerCase()}]
    [Detalhe: custo ${businessIdea.estimated_cost} e impacto esperado].`,
  }

  return `Dê uma sugestão de argumento/estrutura para o seguinte parágrafo de uma redação sobre "${theme}" que usa a ideia de negócio "${businessIdea.title}":

${paragraphInstructions[paragraph]}

Retorne JSON:
{
  "suggestion": "texto de sugestão para o parágrafo (2-4 linhas)",
  "evidence": "evidência real sugerida (dado, autor, lei, programa)",
  "tip": "dica técnica de redação para este parágrafo"
}`
}

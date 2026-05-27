/**
 * Prompts para o sistema de módulos de 4 etapas.
 * Cada módulo cobre um tópico específico do edital UFG/ENEM.
 */

// ── Prompt 1: Geração de Syllabus ─────────────────────────────────────────────

export function buildSyllabusPrompt(materia: string): string {
  return `
ATUE COMO: Especialista em pedagogia focado no ENEM e vestibular UFG.
TAREFA: Gerar uma lista JSON estrita de tópicos de estudo para a matéria: ${materia}.

REGRAS CRÍTICAS:
1. NÃO inclua tópicos genéricos como "Introdução" ou "Revisão". Apenas conceitos testáveis.
2. A lista deve cobrir 100% do edital frequente na UFG nos últimos 5 anos.
3. Formato de saída: APENAS um array JSON. Sem markdown, sem texto extra.
4. Estrutura de cada item:
{
  "id": "slug-unico-em-kebab-case",
  "titulo": "Nome do Tópico (Ex: Leis de Newton)",
  "dificuldade": "facil" | "medio" | "dificil",
  "peso_ufg": 1-5,
  "prerequisitos": ["slug-outro-topico"]
}

peso_ufg: 5 = caiu em ≥80% das provas UFG, 1 = raro mas está no edital.

MATÉRIA ALVO: ${materia}

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o array JSON cru
- NÃO use blocos de código markdown
- A resposta deve começar com [ e terminar com ]

GERE O JSON AGORA:`
}

// ── Prompt 2: Geração de Módulo Completo (4 etapas) ──────────────────────────

export const MODULE_SYSTEM_PROMPT = `Você é um professor de cursinho de elite para UFG. Objetivo: aprovação técnica, sem enrolação.
Você gera módulos de estudo em 4 etapas sequenciais com densidade máxima de informação.

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON cru, sem NENHUM texto antes ou depois
- NÃO use blocos de código markdown (\`\`\`json ou \`\`\`)
- A resposta deve começar com { e terminar com } e nada mais`

export function buildFullModulePrompt(topico: string, materia: string): string {
  return `O aluno selecionou o tópico: "${topico}" (matéria: ${materia}).

Crie um módulo de estudo completo com a seguinte estrutura JSON exata:

{
  "topico": "${topico}",
  "materia": "${materia}",
  "modulos": [
    {
      "etapa": 1,
      "tipo": "teoria",
      "conteudo": {
        "titulo": "Título direto do conceito",
        "explicacao": "Explicação densa e direta. O que é, por que cai na UFG, como reconhecer.",
        "pontos_chave": [
          { "label": "Nome do conceito", "detalhe": "Explicação técnica sem rodeios" }
        ],
        "formula_latex": "fórmula em notação LaTeX ou texto (null se não aplicável)",
        "macete": "Regra de bolso ou padrão de reconhecimento rápido para prova",
        "como_cai_na_ufg": "Em que contexto exato a UFG cobra esse conceito"
      }
    },
    {
      "etapa": 2,
      "tipo": "exemplo",
      "conteudo": {
        "enunciado": "Enunciado de questão-modelo real nível UFG/ENEM",
        "passos": [
          { "passo": 1, "label": "Nome do passo", "acao": "O que fazer", "insight": "Por que esse passo funciona" }
        ],
        "resposta_final": "Resposta ou valor final",
        "pegadinha": "O erro que 70% dos alunos cometem nessa questão",
        "padrao_generalizavel": "A lógica que resolve todas as questões desse tipo"
      }
    },
    {
      "etapa": 3,
      "tipo": "treino",
      "conteudo": {
        "questoes": [
          {
            "id": "q1",
            "nivel": "facil",
            "enunciado": "Questão nível ENEM médio",
            "alternativas": [
              { "key": "A", "texto": "alternativa A" },
              { "key": "B", "texto": "alternativa B" },
              { "key": "C", "texto": "alternativa C" },
              { "key": "D", "texto": "alternativa D" },
              { "key": "E", "texto": "alternativa E" }
            ],
            "gabarito": "A",
            "comentario_certo": "Por que está correto — reforço do raciocínio",
            "comentario_errado": "Erro específico de quem erra — qual passo falhou"
          },
          {
            "id": "q2",
            "nivel": "medio",
            "enunciado": "Questão nível ENEM difícil / UFG",
            "alternativas": [{"key":"A","texto":""},{"key":"B","texto":""},{"key":"C","texto":""},{"key":"D","texto":""},{"key":"E","texto":""}],
            "gabarito": "B",
            "comentario_certo": "...",
            "comentario_errado": "..."
          },
          {
            "id": "q3",
            "nivel": "dificil",
            "enunciado": "Questão nível UFG elite / UNICAMP",
            "alternativas": [{"key":"A","texto":""},{"key":"B","texto":""},{"key":"C","texto":""},{"key":"D","texto":""},{"key":"E","texto":""}],
            "gabarito": "C",
            "comentario_certo": "...",
            "comentario_errado": "..."
          }
        ]
      }
    },
    {
      "etapa": 4,
      "tipo": "simulado",
      "conteudo": {
        "enunciado": "Questão complexa estilo UFG discursiva/múltipla avançada, misturando ${topico} com outro tópico relacionado",
        "alternativas": [{"key":"A","texto":""},{"key":"B","texto":""},{"key":"C","texto":""},{"key":"D","texto":""},{"key":"E","texto":""}],
        "gabarito": "D",
        "comentario_certo": "Raciocínio completo da solução",
        "comentario_errado": "Onde a lógica falha em quem erra",
        "conexao_topicos": "Qual outro tópico foi misturado e por que a UFG cobra essa integração"
      }
    }
  ]
}`
}

// ── Prompt 3: Validação de Progresso ─────────────────────────────────────────

export const VALIDATION_SYSTEM_PROMPT = `Você é um avaliador rigoroso de desempenho acadêmico.
Analise respostas de alunos e retorne diagnóstico preciso em JSON.

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON cru, sem NENHUM texto antes ou depois
- NÃO use blocos de código markdown
- A resposta deve começar com { e terminar com }`

export function buildValidationPrompt(
  topico: string,
  pesoUfg: number,
  respostasAluno: Array<{ questaoId: string; gabarito: string; resposta: string; acertou: boolean }>,
  tempoSegundos: number
): string {
  const acertos = respostasAluno.filter(r => r.acertou).length

  return `DADOS DE ENTRADA:
- Tópico: ${topico}
- Peso UFG: ${pesoUfg}/5
- Respostas do aluno: ${JSON.stringify(respostasAluno)}
- Tempo gasto: ${tempoSegundos}s
- Acertos: ${acertos}/3

TAREFA: Analisar padrões de erro e calcular XP merecido.

Retorne JSON com esta estrutura exata:
{
  "aprovado": ${acertos >= 2},
  "acertos": ${acertos},
  "xp_ganho": <number: acertos * ${pesoUfg} * 15>,
  "lacunas_identificadas": ["conceito_especifico que o aluno errou baseado nas questões"],
  "recomendacao_proxima_etapa": "avançar_simulado" | "repetir_teoria" | "revisar_exemplo",
  "feedback_curto": "Frase direta de no máximo 12 palavras sobre o desempenho",
  "analise_tempo": "rapido" | "normal" | "lento"
}

Se o aluno errou alguma questão, identifique O CONCEITO EXATO que faltou comparando com o gabarito.`
}

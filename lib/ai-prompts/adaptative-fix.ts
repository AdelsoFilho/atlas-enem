/**
 * Adaptive Fix — Micro-reforço personalizado por erro.
 *
 * Quando o aluno erra uma questão crítica (nível difícil ou peso UFG alto),
 * este prompt gera uma analogia do mundo real de ~150 palavras focada
 * exclusivamente no conceito que causou o erro. A ideia é usar memória
 * episódica (cenário concreto) para fixar o conceito abstrato.
 */

import type { Questao } from "@/modules/learning/module-types"

export const ADAPTIVE_FIX_SYSTEM_PROMPT = `Você é um tutor especialista em ENEM/UFG que usa analogias do mundo real
para corrigir lacunas conceituais específicas de forma rápida e memorável.

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON abaixo, sem nenhum texto antes ou depois
- NÃO use blocos de código markdown
- A resposta deve começar com { e terminar com }`

export function buildAdaptiveFixPrompt(
  topico: string,
  questao: Questao,
  respostaErrada: string
): string {
  const alternativaErrada = questao.alternativas.find(a => a.key === respostaErrada)
  const alternativaCorreta = questao.alternativas.find(a => a.key === questao.gabarito)

  return `O aluno estava estudando o tópico "${topico}" e errou a seguinte questão:

ENUNCIADO: ${questao.enunciado}
RESPOSTA DO ALUNO: (${respostaErrada}) ${alternativaErrada?.texto ?? ""}
GABARITO CORRETO: (${questao.gabarito}) ${alternativaCorreta?.texto ?? ""}
COMENTÁRIO DO ERRO: ${questao.comentario_errado}

TAREFA:
1. Identifique O ÚNICO conceito/passo lógico que o aluno não domina (lacuna exata).
2. Crie UMA analogia do mundo real (cotidiano, esporte, culinária, tecnologia) de
   exatamente 130-160 palavras que explique esse conceito de forma que nunca mais
   possa ser confundido. NÃO repita o enunciado da questão. NÃO dê a resposta
   diretamente — ensine o raciocínio via analogia.

Retorne exatamente este JSON:
{
  "lacuna": "nome curto do conceito que faltou (máx 8 palavras)",
  "analogia": "texto de 130-160 palavras com a analogia do mundo real"
}`
}

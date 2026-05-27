import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { ADAPTIVE_FIX_SYSTEM_PROMPT, buildAdaptiveFixPrompt } from "@/lib/ai-prompts/adaptative-fix"
import type { Questao } from "@/modules/learning/module-types"

const client = new Anthropic()

function extractJSON(text: string): string {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

// ── Critérios para acionar micro-reforço ──────────────────────────────────────
//
// Micro-reforço é reservado para erros com maior probabilidade de indicar
// lacuna conceitual real: questões difíceis OU tópicos de alto peso na UFG.
// Questões fáceis erradas por distração não justificam o custo da chamada.

function isCriticalMiss(questao: Questao, pesoUfg: number): boolean {
  return questao.nivel === "dificil" || pesoUfg >= 4
}

// ── Tipos exportados (consumidos pelo store e pelo StepWizard) ────────────────

export interface ReinforcementData {
  lacuna:   string
  analogia: string
}

export interface ValidateAnswerResponse {
  requiresMicroReinforcement: boolean
  reinforcementData?:         ReinforcementData
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { topico, questao, respostaAluno, pesoUfg } = await req.json() as {
      topico:        string
      questao:       Questao
      respostaAluno: string
      pesoUfg:       number
    }

    if (!topico || !questao || !respostaAluno) {
      return NextResponse.json(
        { error: "topico, questao e respostaAluno são obrigatórios" },
        { status: 400 }
      )
    }

    const acertou = respostaAluno === questao.gabarito

    // Acertou ou questão não-crítica → sem reforço, resposta instantânea
    if (acertou || !isCriticalMiss(questao, pesoUfg ?? 0)) {
      return NextResponse.json<ValidateAnswerResponse>({
        requiresMicroReinforcement: false,
      })
    }

    // Erro em questão crítica → gera analogia com Haiku (rápido e barato)
    const message = await client.messages.create({
      model:      "claude-haiku-4-5",
      max_tokens: 512,
      system:     ADAPTIVE_FIX_SYSTEM_PROMPT,
      messages:   [{
        role:    "user",
        content: buildAdaptiveFixPrompt(topico, questao, respostaAluno),
      }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const reinforcementData = JSON.parse(extractJSON(text)) as ReinforcementData

    return NextResponse.json<ValidateAnswerResponse>({
      requiresMicroReinforcement: true,
      reinforcementData,
    })

  } catch (err) {
    console.error("[validate-answer]", err)
    // Falha silenciosa: o aluno continua sem reforço em vez de ficar bloqueado
    return NextResponse.json<ValidateAnswerResponse>({
      requiresMicroReinforcement: false,
    })
  }
}

import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { VALIDATION_SYSTEM_PROMPT, buildValidationPrompt } from "@/lib/ai-prompts/module"
import type { RespostaAluno } from "@/modules/learning/module-types"

const client = new Anthropic()

function extractJSON(text: string): string {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { topico, pesoUfg, respostas, tempoSegundos } = await req.json() as {
      topico: string
      pesoUfg: number
      respostas: RespostaAluno[]
      tempoSegundos: number
    }

    if (!topico || !respostas?.length) {
      return NextResponse.json(
        { error: "topico e respostas são obrigatórios" },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: VALIDATION_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildValidationPrompt(topico, pesoUfg, respostas, tempoSegundos) },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const raw = extractJSON(text)
    const result = JSON.parse(raw)

    return NextResponse.json(result)
  } catch (err) {
    console.error("[validate-module]", err)
    // Fallback: calcula localmente sem IA
    const { respostas = [], pesoUfg = 1 } = await req.json().catch(() => ({}))
    const acertos = (respostas as RespostaAluno[]).filter(r => r.acertou).length
    return NextResponse.json({
      aprovado: acertos >= 2,
      acertos,
      xp_ganho: acertos * pesoUfg * 15,
      lacunas_identificadas: [],
      recomendacao_proxima_etapa: acertos >= 2 ? "avançar_simulado" : "repetir_teoria",
      feedback_curto: acertos >= 2 ? "Bom desempenho, siga em frente." : "Revise a teoria antes de avançar.",
      analise_tempo: "normal",
    })
  }
}

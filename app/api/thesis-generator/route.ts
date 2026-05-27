import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  THESIS_GENERATOR_SYSTEM_PROMPT,
  buildThesisGeneratorPrompt,
} from "@/lib/ai-prompts/entrepreneurial-essay"
import type { BusinessIdea } from "@/config/business-ideas"

const client = new Anthropic()

function extractJSON(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { theme, businessIdea } = (await req.json()) as {
      theme: string
      businessIdea: BusinessIdea
    }

    if (!theme || !businessIdea) {
      return NextResponse.json(
        { error: "theme e businessIdea são obrigatórios" },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5",  // Haiku: mais rápido para geração de teses curtas
      max_tokens: 1024,
      system: THESIS_GENERATOR_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildThesisGeneratorPrompt(theme, businessIdea),
        },
      ],
    })

    const text =
      message.content[0].type === "text" ? message.content[0].text : ""
    const raw = extractJSON(text)
    const result = JSON.parse(raw)

    return NextResponse.json(result)
  } catch (err) {
    console.error("[thesis-generator]", err)
    return NextResponse.json(
      { error: "Falha ao gerar teses. Tente novamente." },
      { status: 500 }
    )
  }
}

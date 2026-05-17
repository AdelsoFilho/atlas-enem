import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  ESSAY_GRADING_SYSTEM_PROMPT,
  buildEssayGradingPrompt,
} from "@/lib/ai-prompts/essay"

const client = new Anthropic()

/**
 * Strip markdown code fences that the model sometimes wraps around JSON.
 * Handles: ```json\n{...}\n```, ```\n{...}\n```, and raw JSON.
 */
function extractJSON(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { theme, essayText } = await req.json() as {
      theme: string
      essayText: string
    }

    if (!theme || !essayText) {
      return NextResponse.json(
        { error: "theme e essayText são obrigatórios" },
        { status: 400 }
      )
    }

    const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length
    if (wordCount < 50) {
      return NextResponse.json(
        { error: "Redação muito curta para correção" },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: ESSAY_GRADING_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildEssayGradingPrompt(theme, essayText) },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const raw = extractJSON(text)
    const result = JSON.parse(raw)

    return NextResponse.json(result)
  } catch (err) {
    console.error("[grade-essay]", err)
    return NextResponse.json(
      { error: "Falha na correção. Tente novamente." },
      { status: 500 }
    )
  }
}

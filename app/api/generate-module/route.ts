import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { MODULE_SYSTEM_PROMPT, buildFullModulePrompt } from "@/lib/ai-prompts/module"
import type { SubjectKey } from "@/config/ufg-weights"

const client = new Anthropic()

function extractJSON(text: string): string {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { subject, topicSlug, topicTitle } = await req.json() as {
      subject: SubjectKey
      topicSlug: string
      topicTitle: string
    }

    if (!subject || !topicSlug || !topicTitle) {
      return NextResponse.json(
        { error: "subject, topicSlug e topicTitle são obrigatórios" },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: MODULE_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildFullModulePrompt(topicTitle, subject) },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const raw = extractJSON(text)
    const module = JSON.parse(raw)

    return NextResponse.json(module)
  } catch (err) {
    console.error("[generate-module]", err)
    return NextResponse.json(
      { error: "Falha ao gerar módulo. Tente novamente." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { buildSyllabusPrompt } from "@/lib/ai-prompts/module"
import { SUBJECTS } from "@/config/ufg-weights"
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
    const { subject } = await req.json() as { subject: SubjectKey }

    if (!subject || !SUBJECTS[subject]) {
      return NextResponse.json(
        { error: "subject inválido" },
        { status: 400 }
      )
    }

    const materia = SUBJECTS[subject].label

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: "Você é um especialista em pedagogia do ENEM e UFG. Retorne SOMENTE JSON válido, sem markdown.",
      messages: [
        { role: "user", content: buildSyllabusPrompt(materia) },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const raw = extractJSON(text)
    const topics = JSON.parse(raw)

    return NextResponse.json({ subject, topics })
  } catch (err) {
    console.error("[generate-syllabus]", err)
    return NextResponse.json(
      { error: "Falha ao gerar syllabus." },
      { status: 500 }
    )
  }
}

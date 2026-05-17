import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { LESSON_SYSTEM_PROMPT, buildLessonPrompt } from "@/lib/ai-prompts/lesson"
import { getMockLesson } from "@/modules/learning/mock-lessons"
import type { SubjectKey } from "@/config/ufg-weights"

const client = new Anthropic()

/**
 * Strip markdown code fences that the model sometimes wraps around JSON.
 * Handles: ```json\n{...}\n```, ```\n{...}\n```, and raw JSON.
 */
function extractJSON(text: string): string {
  const trimmed = text.trim()
  // Remove opening fence (```json or ```)
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
  return stripped
}

export async function POST(req: NextRequest) {
  let subject: SubjectKey = "math"

  try {
    const body = await req.json() as {
      subject: SubjectKey
      topic: string
      difficulty: number
    }
    subject = body.subject ?? "math"

    if (!body.subject || !body.topic) {
      return NextResponse.json({ error: "subject e topic são obrigatórios" }, { status: 400 })
    }

    const diff = Math.max(1, Math.min(5, body.difficulty ?? 3))

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: LESSON_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildLessonPrompt(body.subject, body.topic, diff) },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const raw = extractJSON(text)
    const lesson = JSON.parse(raw)

    return NextResponse.json(lesson)
  } catch (err) {
    console.error("[generate-lesson]", err)

    // Fallback to mock lesson on AI error
    const mock = getMockLesson(subject)
    if (mock) return NextResponse.json(mock)

    return NextResponse.json(
      { error: "Falha ao gerar aula. Tente novamente." },
      { status: 500 }
    )
  }
}

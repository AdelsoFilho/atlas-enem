import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { buildAnswerValidationPrompt } from "@/lib/ai-prompts/essay"

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { question, correctAnswer, studentAnswer, subject } = await req.json() as {
      question: string
      correctAnswer: string
      studentAnswer: string
      subject: string
    }

    if (!question || !correctAnswer || !studentAnswer || !subject) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: buildAnswerValidationPrompt(question, correctAnswer, studentAnswer, subject),
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const feedback = JSON.parse(raw)

    return NextResponse.json(feedback)
  } catch (err) {
    console.error("[validate-answer]", err)
    return NextResponse.json(
      { error: "Falha ao gerar feedback. Tente novamente." },
      { status: 500 }
    )
  }
}

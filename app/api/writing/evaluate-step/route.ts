import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  THESIS_EVAL_SYSTEM,
  INTERVENTION_EVAL_SYSTEM,
  buildThesisEvalPrompt,
  buildInterventionEvalPrompt,
} from "@/lib/ai-prompts/writing-tutor"
import type {
  ThesisBuilderAnswer,
  InterventionBuilderAnswer,
  ThesisBuilderExerciseData,
  InterventionBuilderExerciseData,
  WritingStepFeedback,
} from "@/modules/essay/writing-types"

const client = new Anthropic()

function extractJSON(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    stepType,
    theme,
    answer,
    exerciseData,
  } = body as {
    stepType:     "thesis_builder" | "intervention_builder"
    theme:        string
    answer:       ThesisBuilderAnswer | InterventionBuilderAnswer
    exerciseData: ThesisBuilderExerciseData | InterventionBuilderExerciseData
  }

  if (!stepType || !theme || !answer || !exerciseData) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  let systemPrompt: string
  let userPrompt:   string

  if (stepType === "thesis_builder") {
    systemPrompt = THESIS_EVAL_SYSTEM
    userPrompt   = buildThesisEvalPrompt(
      theme,
      answer as ThesisBuilderAnswer,
      exerciseData as ThesisBuilderExerciseData
    )
  } else {
    systemPrompt = INTERVENTION_EVAL_SYSTEM
    userPrompt   = buildInterventionEvalPrompt(
      theme,
      answer as InterventionBuilderAnswer,
      exerciseData as InterventionBuilderExerciseData
    )
  }

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system:     systemPrompt,
      messages:   [{ role: "user", content: userPrompt }],
    })

    const raw = (msg.content[0] as { type: string; text?: string }).text ?? ""
    const parsed = JSON.parse(extractJSON(raw)) as WritingStepFeedback

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("[evaluate-step]", err)
    // Graceful degradation: never block the student
    const fallback: WritingStepFeedback = {
      score:              60,
      passed:             false,
      mainError:          "Não foi possível avaliar automaticamente. Tente novamente.",
      strengths:          [],
      corrections:        [],
      rewriteSuggestion:  null,
      encouragement:      "Continue praticando — você está no caminho certo!",
    }
    return NextResponse.json(fallback)
  }
}

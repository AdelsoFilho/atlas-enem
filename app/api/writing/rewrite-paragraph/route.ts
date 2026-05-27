import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import {
  PARAGRAPH_REWRITE_SYSTEM,
  buildParagraphRewritePrompt,
} from "@/lib/ai-prompts/writing-tutor"
import type { ParagraphRewriteResult } from "@/modules/essay/writing-types"

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
    paragraphText,
    paragraphType,
    theme,
  } = body as {
    paragraphText: string
    paragraphType: string
    theme:         string
  }

  if (!paragraphText?.trim() || !theme) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  try {
    const msg = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 700,
      system:     PARAGRAPH_REWRITE_SYSTEM,
      messages:   [{
        role:    "user",
        content: buildParagraphRewritePrompt(
          paragraphText,
          paragraphType ?? "desenvolvimento",
          theme
        ),
      }],
    })

    const raw = (msg.content[0] as { type: string; text?: string }).text ?? ""
    const result = JSON.parse(extractJSON(raw)) as ParagraphRewriteResult

    return NextResponse.json(result)
  } catch (err) {
    console.error("[rewrite-paragraph]", err)
    return NextResponse.json({ error: "Rewrite failed" }, { status: 500 })
  }
}

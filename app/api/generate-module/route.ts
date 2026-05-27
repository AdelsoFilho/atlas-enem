import { NextRequest, NextResponse } from "next/server"
import { generateOrFetchModule } from "@/lib/moduleGenerator"
import type { SubjectKey } from "@/config/ufg-weights"

export async function POST(req: NextRequest) {
  try {
    const { subject, topicSlug, topicTitle } = await req.json() as {
      subject:    SubjectKey
      topicSlug:  string
      topicTitle: string
    }

    if (!subject || !topicSlug || !topicTitle) {
      return NextResponse.json(
        { error: "subject, topicSlug e topicTitle são obrigatórios" },
        { status: 400 }
      )
    }

    const module = await generateOrFetchModule(subject, topicSlug, topicTitle)
    return NextResponse.json(module)

  } catch (err) {
    console.error("[generate-module]", err)
    return NextResponse.json(
      { error: "Falha ao gerar módulo. Tente novamente." },
      { status: 500 }
    )
  }
}

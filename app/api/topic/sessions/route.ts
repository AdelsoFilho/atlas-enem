/**
 * /api/topic/sessions
 *
 * Gerencia o ciclo de vida das sessões de aprendizado.
 * As operações de DB (INSERT/UPDATE) são feitas client-side via RLS.
 * Esta rota só é responsável pelas operações que requerem a chave Anthropic
 * (geração de módulo via IA), que não pode ficar exposta no cliente.
 *
 * Actions (POST):
 *  - "generate"       → Cache hit → retorna módulo. Cache miss → gera + salva cache.
 *  - "generate_fresh" → Ignora cache, gera variante nova, atualiza cache compartilhado.
 *
 * GET:
 *  - Retorna sessões de um usuário para um tópico (ordenadas por data desc).
 *    Requer query params: userId, subjectSlug, topicSlug.
 */

import { NextRequest, NextResponse } from "next/server"
import { generateOrFetchModule } from "@/lib/moduleGenerator"
import { supabase }              from "@/lib/supabaseClient"
import type { SubjectKey }       from "@/config/ufg-weights"
import type { TopicSession }     from "@/lib/supabaseClient"

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId      = searchParams.get("userId")
  const subjectSlug = searchParams.get("subjectSlug")
  const topicSlug   = searchParams.get("topicSlug")

  if (!userId || !subjectSlug || !topicSlug) {
    return NextResponse.json(
      { error: "userId, subjectSlug e topicSlug são obrigatórios" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("topic_sessions")
    .select("id, subject_slug, topic_slug, topic_title, current_step, xp_earned, is_completed, created_at, updated_at")
    .eq("user_id", userId)
    .eq("subject_slug", subjectSlug)
    .eq("topic_slug", topicSlug)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[sessions GET]", error)
    return NextResponse.json({ error: "Falha ao buscar sessões." }, { status: 500 })
  }

  return NextResponse.json({ sessions: data ?? [] })
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action:      "generate" | "generate_fresh"
      subject:     SubjectKey
      topicSlug:   string
      topicTitle:  string
    }

    const { action, subject, topicSlug, topicTitle } = body

    if (!action || !subject || !topicSlug || !topicTitle) {
      return NextResponse.json(
        { error: "action, subject, topicSlug e topicTitle são obrigatórios" },
        { status: 400 }
      )
    }

    const bypassCache = action === "generate_fresh"
    const module = await generateOrFetchModule(subject, topicSlug, topicTitle, bypassCache)

    return NextResponse.json({ module })

  } catch (err) {
    console.error("[sessions POST]", err)
    return NextResponse.json(
      { error: "Falha ao gerar módulo para a sessão." },
      { status: 500 }
    )
  }
}

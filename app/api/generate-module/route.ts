import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import Anthropic from "@anthropic-ai/sdk"
import { MODULE_SYSTEM_PROMPT, buildFullModulePrompt } from "@/lib/ai-prompts/module"
import { QUALITY_GATE_SYSTEM_PROMPT, buildQualityGatePrompt } from "@/lib/ai-prompts/quality-gate"
import { getCachedModule, saveCachedModule } from "@/lib/supabaseClient"
import type { SubjectKey } from "@/config/ufg-weights"

const client = new Anthropic()

// ── Utils ─────────────────────────────────────────────────────────────────────

function extractJSON(text: string): string {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex")
}

// ── Geração principal via Anthropic ──────────────────────────────────────────

async function generateRawModule(topicTitle: string, subject: SubjectKey): Promise<unknown> {
  const message = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 8192,
    system:     MODULE_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: buildFullModulePrompt(topicTitle, subject) }],
  })
  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return JSON.parse(extractJSON(text))
}

// ── Quality Gate (Auto-Crítica) ───────────────────────────────────────────────
//
// Envia o JSON gerado para o claude-haiku-4-5 (modelo rápido/barato).
// O modelo retorna { valid, failed_checks, issues }.
// Se inválido → regenera o módulo UMA única vez (evita loop).
// Separa a lógica de validação da lógica de geração — cada função tem
// responsabilidade única e pode evoluir de forma independente.

interface QualityGateResult {
  valid:         boolean
  failed_checks: string[]
  issues:        string[]
}

async function runQualityGate(moduleJson: string): Promise<QualityGateResult> {
  try {
    const message = await client.messages.create({
      model:      "claude-haiku-4-5",
      max_tokens: 512,
      system:     QUALITY_GATE_SYSTEM_PROMPT,
      messages:   [{ role: "user", content: buildQualityGatePrompt(moduleJson) }],
    })
    const text = message.content[0].type === "text" ? message.content[0].text : ""
    return JSON.parse(extractJSON(text)) as QualityGateResult
  } catch {
    // Se o quality gate falhar por qualquer motivo, deixa o módulo passar.
    // Melhor entregar conteúdo sem auditoria do que bloquear o aluno.
    console.warn("[quality-gate] Falha ao auditar — módulo aprovado por fallback")
    return { valid: true, failed_checks: [], issues: [] }
  }
}

// ── Route Handler ─────────────────────────────────────────────────────────────

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

    // ── A. Verificar cache ──────────────────────────────────────────────────
    const cached = await getCachedModule(topicSlug, subject)
    if (cached) {
      return NextResponse.json(cached)
    }

    // ── B. Cache miss → Gerar módulo via IA ────────────────────────────────
    let moduleData = await generateRawModule(topicTitle, subject)
    let moduleJson = JSON.stringify(moduleData)

    // ── C. Quality Gate — Auto-Crítica ─────────────────────────────────────
    // O gate roda DEPOIS da geração e ANTES do cache/retorno.
    // Se falhar, tentamos regenerar uma única vez para não desperdiçar créditos.
    const gate = await runQualityGate(moduleJson)

    if (!gate.valid) {
      console.info(
        `[quality-gate] Módulo "${topicTitle}" reprovado (${gate.failed_checks.join(", ")}).`,
        "Regenerando…",
        gate.issues
      )

      // Única tentativa de regeneração
      moduleData = await generateRawModule(topicTitle, subject)
      moduleJson = JSON.stringify(moduleData)

      // Segunda auditoria — se ainda falhar, entrega mesmo assim (não bloqueia aluno)
      const gate2 = await runQualityGate(moduleJson)
      if (!gate2.valid) {
        console.warn(
          `[quality-gate] Módulo "${topicTitle}" falhou nas 2 tentativas.`,
          "Entregando sem aprovação para não bloquear aluno."
        )
      }
    }

    // ── D. Persistir no cache ───────────────────────────────────────────────
    const checksum = sha256(moduleJson)
    await saveCachedModule(topicSlug, subject, moduleData, checksum)

    return NextResponse.json(moduleData)

  } catch (err) {
    console.error("[generate-module]", err)
    return NextResponse.json(
      { error: "Falha ao gerar módulo. Tente novamente." },
      { status: 500 }
    )
  }
}

/**
 * moduleGenerator — lógica de geração de módulos compartilhada entre rotas.
 *
 * Extraída de generate-module/route.ts para ser reutilizada por:
 *  - /api/generate-module  (rota legada, continua funcionando)
 *  - /api/topic/sessions   (rota nova de gerenciamento de sessões)
 *
 * Fluxo: Cache Supabase → Anthropic Sonnet → Quality Gate (Haiku) → Salvar Cache
 * A flag `bypassCache` permite forçar nova geração (botão "Gerar Nova Variante").
 */

import crypto    from "crypto"
import Anthropic from "@anthropic-ai/sdk"
import { MODULE_SYSTEM_PROMPT, buildFullModulePrompt }   from "@/lib/ai-prompts/module"
import { QUALITY_GATE_SYSTEM_PROMPT, buildQualityGatePrompt } from "@/lib/ai-prompts/quality-gate"
import { getCachedModule, saveCachedModule }              from "@/lib/supabaseClient"
import type { SubjectKey }  from "@/config/ufg-weights"
import type { FullModule }  from "@/modules/learning/module-types"

const anthropic = new Anthropic()

// ── Helpers internos ──────────────────────────────────────────────────────────

export function extractJSON(text: string): string {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex")
}

// ── Camada 1: Geração bruta via Anthropic ─────────────────────────────────────

async function callAnthropic(topicTitle: string, subject: SubjectKey): Promise<FullModule> {
  const message = await anthropic.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 8192,
    system:     MODULE_SYSTEM_PROMPT,
    messages:   [{ role: "user", content: buildFullModulePrompt(topicTitle, subject) }],
  })
  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return JSON.parse(extractJSON(text)) as FullModule
}

// ── Camada 2: Quality Gate ─────────────────────────────────────────────────────

interface GateResult { valid: boolean; failed_checks: string[]; issues: string[] }

async function runQualityGate(moduleJson: string): Promise<GateResult> {
  try {
    const msg  = await anthropic.messages.create({
      model:      "claude-haiku-4-5",
      max_tokens: 512,
      system:     QUALITY_GATE_SYSTEM_PROMPT,
      messages:   [{ role: "user", content: buildQualityGatePrompt(moduleJson) }],
    })
    const text = msg.content[0].type === "text" ? msg.content[0].text : ""
    return JSON.parse(extractJSON(text)) as GateResult
  } catch {
    console.warn("[quality-gate] Falha — módulo aprovado por fallback")
    return { valid: true, failed_checks: [], issues: [] }
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Gera (ou recupera do cache) o módulo de 4 etapas para um tópico.
 *
 * @param bypassCache  true quando o usuário clica em "Gerar Nova Variante";
 *                     força nova geração e atualiza o cache compartilhado.
 */
export async function generateOrFetchModule(
  subject:    SubjectKey,
  topicSlug:  string,
  topicTitle: string,
  bypassCache = false
): Promise<FullModule> {
  // ── A. Cache hit (somente se não forçar nova geração) ──────────────────────
  if (!bypassCache) {
    const cached = await getCachedModule(topicSlug, subject)
    if (cached) return cached as FullModule
  }

  // ── B. Geração via Anthropic ───────────────────────────────────────────────
  let moduleData = await callAnthropic(topicTitle, subject)
  let moduleJson = JSON.stringify(moduleData)

  // ── C. Quality Gate ─────────────────────────────────────────────────────────
  const gate = await runQualityGate(moduleJson)
  if (!gate.valid) {
    console.info(
      `[quality-gate] "${topicTitle}" reprovado (${gate.failed_checks.join(", ")}) — regenerando…`,
      gate.issues
    )
    moduleData = await callAnthropic(topicTitle, subject)
    moduleJson = JSON.stringify(moduleData)

    const gate2 = await runQualityGate(moduleJson)
    if (!gate2.valid) {
      console.warn(`[quality-gate] "${topicTitle}" falhou 2x — entregando mesmo assim.`)
    }
  }

  // ── D. Persistir no cache compartilhado ────────────────────────────────────
  const checksum = sha256(moduleJson)
  await saveCachedModule(topicSlug, subject, moduleData, checksum)

  return moduleData
}

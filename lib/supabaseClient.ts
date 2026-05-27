import { createClient } from "@supabase/supabase-js"

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Linha retornada pela tabela cached_modules.
 * Helpers abaixo são server-only: chamados exclusivamente de Route Handlers.
 */
export interface CachedModuleRow {
  id:            string
  topic_slug:    string
  subject:       string
  content_json:  unknown          // tipado como FullModule pelo chamador
  hash_checksum: string
  created_at:    string
  expires_at:    string
}

export interface DbProfile {
  id:         string
  email:      string
  full_name:  string | null
  created_at: string
}

export interface DbTopic {
  id:        number
  title:     string
  category:  string
  is_active: boolean
}

export interface DbHistoryEntry {
  id:           string
  user_id:      string
  topic_id:     number
  completed_at: string
  score:        number | null
  essay_topics?: DbTopic       // joined
}

// ── Client (singleton) ────────────────────────────────────────────────────────

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    "[Supabase] Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. " +
    "Funcionalidades de auth e histórico estarão desativadas."
  )
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnon ?? "")

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Busca IDs dos temas já realizados pelo usuário */
export async function fetchDoneTopicIds(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("user_history")
    .select("topic_id")
    .eq("user_id", userId)

  if (error) throw error
  return (data ?? []).map((r) => r.topic_id as number)
}

/** Busca todos os temas ativos */
export async function fetchAllTopics(): Promise<DbTopic[]> {
  const { data, error } = await supabase
    .from("essay_topics")
    .select("*")
    .eq("is_active", true)
    .order("id")

  if (error) throw error
  return (data ?? []) as DbTopic[]
}

/** Registra tema no histórico (ignora se já existir via UNIQUE constraint) */
export async function recordTopicDone(userId: string, topicId: number): Promise<void> {
  const { error } = await supabase
    .from("user_history")
    .upsert({ user_id: userId, topic_id: topicId }, { onConflict: "user_id,topic_id" })

  if (error) throw error
}

/** Busca histórico completo do usuário com join no título do tema */
export async function fetchUserHistory(userId: string): Promise<DbHistoryEntry[]> {
  const { data, error } = await supabase
    .from("user_history")
    .select("*, essay_topics(id, title, category)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as DbHistoryEntry[]
}

/** Apaga todo o histórico do usuário (reset de progresso) */
export async function resetUserHistory(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_history")
    .delete()
    .eq("user_id", userId)

  if (error) throw error
}

// ── Cache de módulos (server-only) ────────────────────────────────────────────

/**
 * Retorna o conteúdo cacheado de um módulo se ele existir e não tiver expirado.
 * Retorna null em cache miss ou expirado.
 * ⚠️ Chamar apenas de Route Handlers (Node.js) — não de componentes client-side.
 */
export async function getCachedModule(
  topicSlug: string,
  subject: string
): Promise<unknown | null> {
  const { data, error } = await supabase
    .from("cached_modules")
    .select("content_json, expires_at")
    .eq("topic_slug", topicSlug)
    .eq("subject", subject)
    .single()

  if (error || !data) return null

  // Valida TTL no lado do cliente além do filtro SQL (dupla garantia)
  if (new Date(data.expires_at) < new Date()) return null

  return data.content_json
}

/**
 * Persiste ou atualiza um módulo no cache com TTL de 30 dias.
 * Usa UPSERT pela constraint UNIQUE(topic_slug, subject).
 * ⚠️ Chamar apenas de Route Handlers (Node.js) — não de componentes client-side.
 */
export async function saveCachedModule(
  topicSlug: string,
  subject:   string,
  content:   unknown,
  checksum:  string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from("cached_modules")
    .upsert(
      {
        topic_slug:    topicSlug,
        subject,
        content_json:  content,
        hash_checksum: checksum,
        expires_at:    expiresAt,
      },
      { onConflict: "topic_slug,subject" }
    )

  // Falha silenciosa: cache é best-effort; não deve quebrar a rota principal
  if (error) console.warn("[saveCachedModule]", error.message)
}

import { createClient } from "@supabase/supabase-js"

// ── Types ─────────────────────────────────────────────────────────────────────

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

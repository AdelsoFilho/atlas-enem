-- ── Tabela: topic_sessions ────────────────────────────────────────────────────
-- Cada linha representa UMA tentativa/sessão de um usuário em um tópico.
-- Permite múltiplas variantes (o aluno pode gerar nova lição e ter histórico).

CREATE TABLE IF NOT EXISTS topic_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_slug  text        NOT NULL,
  topic_slug    text        NOT NULL,
  topic_title   text        NOT NULL DEFAULT '',
  -- Conteúdo completo da lição (as 4 etapas). Null enquanto está sendo gerado.
  content_json  jsonb,
  -- 0 = criada/não iniciada · 1 = teoria · 2 = exemplo · 3 = simulado · 4 = concluída
  current_step  int         NOT NULL DEFAULT 0 CHECK (current_step BETWEEN 0 AND 4),
  xp_earned     int         NOT NULL DEFAULT 0,
  is_completed  boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Índices para as queries mais comuns
CREATE INDEX IF NOT EXISTS idx_ts_user_topic
  ON topic_sessions(user_id, topic_slug);

CREATE INDEX IF NOT EXISTS idx_ts_user_subject
  ON topic_sessions(user_id, subject_slug);

CREATE INDEX IF NOT EXISTS idx_ts_completed
  ON topic_sessions(user_id, is_completed);

-- Trigger para manter updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS topic_sessions_updated_at ON topic_sessions;
CREATE TRIGGER topic_sessions_updated_at
  BEFORE UPDATE ON topic_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Usuários só enxergam e modificam suas próprias sessões.
-- Todas as operações client-side passam pelo JWT do supabase-js v2,
-- portanto auth.uid() é resolvido corretamente.

ALTER TABLE topic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_sessions" ON topic_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ── Tabela: user_topic_progress ──────────────────────────────────────────────
-- Rastreia qual etapa do módulo de 4 passos o usuário completou por tópico.

CREATE TABLE IF NOT EXISTS user_topic_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject         text NOT NULL,
  topic_slug      text NOT NULL,
  topic_title     text NOT NULL,

  -- 0 = nenhuma etapa, 1 = teoria, 2 = exemplo, 3 = treino, 4 = simulado (módulo completo)
  step_completed  int NOT NULL DEFAULT 0 CHECK (step_completed BETWEEN 0 AND 4),

  xp_earned       int NOT NULL DEFAULT 0,
  aprovado        boolean DEFAULT NULL,           -- resultado da validação (etapa 3)
  answers_json    jsonb DEFAULT NULL,             -- respostas do aluno nas questões
  lacunas         text[] DEFAULT '{}',            -- conceitos identificados como lacuna

  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz DEFAULT NULL,        -- preenchido quando step_completed = 4

  UNIQUE(user_id, subject, topic_slug)
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_utp_user        ON user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_utp_subject     ON user_topic_progress(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_utp_completed   ON user_topic_progress(user_id, step_completed);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_progress" ON user_topic_progress
  FOR ALL USING (auth.uid() = user_id);

-- ── Helpers ───────────────────────────────────────────────────────────────────

-- Upsert de progresso (chamado a cada etapa concluída)
-- Uso no cliente: supabase.rpc('upsert_topic_progress', { ... })
CREATE OR REPLACE FUNCTION upsert_topic_progress(
  p_user_id     uuid,
  p_subject     text,
  p_topic_slug  text,
  p_topic_title text,
  p_step        int,
  p_xp          int,
  p_aprovado    boolean DEFAULT NULL,
  p_answers     jsonb   DEFAULT NULL,
  p_lacunas     text[]  DEFAULT '{}'
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_topic_progress
    (user_id, subject, topic_slug, topic_title, step_completed, xp_earned, aprovado, answers_json, lacunas, completed_at)
  VALUES
    (p_user_id, p_subject, p_topic_slug, p_topic_title, p_step, p_xp, p_aprovado, p_answers, p_lacunas,
     CASE WHEN p_step = 4 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, subject, topic_slug)
  DO UPDATE SET
    step_completed = GREATEST(user_topic_progress.step_completed, p_step),
    xp_earned      = GREATEST(user_topic_progress.xp_earned, p_xp),
    aprovado       = COALESCE(p_aprovado, user_topic_progress.aprovado),
    answers_json   = COALESCE(p_answers,  user_topic_progress.answers_json),
    lacunas        = CASE WHEN array_length(p_lacunas, 1) > 0 THEN p_lacunas ELSE user_topic_progress.lacunas END,
    completed_at   = CASE WHEN p_step = 4 THEN now() ELSE user_topic_progress.completed_at END;
END;
$$;

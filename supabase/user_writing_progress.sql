-- ══════════════════════════════════════════════════════════════════════════════
-- user_writing_progress: rastreia o progresso do aluno nas lições de redação
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_writing_progress (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id       text        NOT NULL,  -- FK lógica: writing_skill_tree.lesson_id
  status          text        NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score           int         NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  attempts        int         NOT NULL DEFAULT 0,
  last_answer_json jsonb,                -- última resposta do aluno para retry
  feedback_json   jsonb,                -- último feedback da IA
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- ── Trigger: atualiza updated_at automaticamente ──────────────────────────────
CREATE OR REPLACE FUNCTION set_writing_progress_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_writing_progress_updated_at ON user_writing_progress;
CREATE TRIGGER trg_writing_progress_updated_at
  BEFORE UPDATE ON user_writing_progress
  FOR EACH ROW EXECUTE FUNCTION set_writing_progress_updated_at();

-- ── RLS: cada aluno vê e altera apenas seus próprios dados ────────────────────
ALTER TABLE user_writing_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "writing_progress_own" ON user_writing_progress;
CREATE POLICY "writing_progress_own"
  ON user_writing_progress
  USING      (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Índice para queries comuns ────────────────────────────────────────────────
CREATE INDEX ON user_writing_progress (user_id, lesson_id);
CREATE INDEX ON user_writing_progress (user_id, status);

-- ── RPC: upsert_writing_progress ─────────────────────────────────────────────
-- Chamada pelo cliente para salvar progresso sem precisar de dois round-trips.
CREATE OR REPLACE FUNCTION upsert_writing_progress(
  p_user_id         uuid,
  p_lesson_id       text,
  p_score           int,
  p_status          text,
  p_last_answer     jsonb DEFAULT NULL,
  p_feedback        jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER   -- necessário para bypass de RLS ao inserir pela primeira vez
AS $$
BEGIN
  INSERT INTO user_writing_progress
    (user_id, lesson_id, score, status, attempts, last_answer_json, feedback_json, completed_at)
  VALUES (
    p_user_id,
    p_lesson_id,
    p_score,
    p_status,
    1,
    p_last_answer,
    p_feedback,
    CASE WHEN p_status = 'completed' THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    score           = GREATEST(user_writing_progress.score, EXCLUDED.score),
    status          = EXCLUDED.status,
    attempts        = user_writing_progress.attempts + 1,
    last_answer_json = COALESCE(EXCLUDED.last_answer_json, user_writing_progress.last_answer_json),
    feedback_json   = COALESCE(EXCLUDED.feedback_json, user_writing_progress.feedback_json),
    completed_at    = CASE
                        WHEN EXCLUDED.status = 'completed' AND user_writing_progress.completed_at IS NULL
                        THEN now()
                        ELSE user_writing_progress.completed_at
                      END;
END;
$$;

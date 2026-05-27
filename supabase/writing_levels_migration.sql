-- ══════════════════════════════════════════════════════════════════════════════
-- writing_levels_migration.sql
-- Execute INTEIRO no Supabase SQL Editor (idempotente — pode rodar várias vezes)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Coluna current_writing_level em profiles ──────────────────────────────
--   Representa até qual nível o usuário "chegou" (0 = nunca treinou, 5 = herói)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_writing_level INT NOT NULL DEFAULT 0;

-- ─── 2. Catálogo estático de níveis ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.writing_levels (
  id            TEXT PRIMARY KEY,   -- "0_1", "1_2", ..., "5"
  level_number  INT  NOT NULL UNIQUE CHECK (level_number BETWEEN 0 AND 5),
  title         TEXT NOT NULL
);

ALTER TABLE public.writing_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "writing_levels_public_read" ON public.writing_levels;
CREATE POLICY "writing_levels_public_read"
  ON public.writing_levels FOR SELECT USING (true);

-- Seed (idempotente)
INSERT INTO public.writing_levels (id, level_number, title) VALUES
  ('0_1', 0, 'Conceitos básicos e identificação de tema'),
  ('1_2', 1, 'Estrutura macro do texto'),
  ('2_3', 2, 'Microestrutura do parágrafo'),
  ('3_4', 3, 'Coesão e conectivos'),
  ('4_5', 4, 'Proposta de intervenção A-A-M-E-D'),
  ('5',   5, 'Redação completa cronometrada')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- ─── 3. Tabela user_writing_levels (progresso por nível) ─────────────────────
CREATE TABLE IF NOT EXISTS public.user_writing_levels (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id    TEXT        NOT NULL REFERENCES public.writing_levels(id),
  status      TEXT        NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'in_progress', 'completed')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_uwl_user_id ON public.user_writing_levels (user_id);

ALTER TABLE public.user_writing_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "uwl_own" ON public.user_writing_levels;
CREATE POLICY "uwl_own"
  ON public.user_writing_levels
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_uwl_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_uwl_updated_at ON public.user_writing_levels;
CREATE TRIGGER trg_uwl_updated_at
  BEFORE UPDATE ON public.user_writing_levels
  FOR EACH ROW EXECUTE FUNCTION public.set_uwl_updated_at();

-- ─── 4. initialize_user_writing_levels ───────────────────────────────────────
--   Chame uma vez por usuário (idempotente via ON CONFLICT DO NOTHING).
--   Nível 0 começa como in_progress; os demais ficam locked.
CREATE OR REPLACE FUNCTION public.initialize_user_writing_levels(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_writing_levels (user_id, level_id, status)
  SELECT
    p_user_id,
    wl.id,
    CASE WHEN wl.level_number = 0 THEN 'in_progress' ELSE 'locked' END
  FROM public.writing_levels wl
  ON CONFLICT (user_id, level_id) DO NOTHING;
END;
$$;

-- ─── 5. unlock_next_level ─────────────────────────────────────────────────────
--   Incrementa current_writing_level no profiles e atualiza user_writing_levels.
--   Retorna TRUE se o desbloqueio ocorreu, FALSE se já estava no máximo ou
--   se o argumento era inválido.
CREATE OR REPLACE FUNCTION public.unlock_next_level(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cur  INT;
  v_next INT;
BEGIN
  -- Lê nível atual
  SELECT current_writing_level INTO v_cur
  FROM public.profiles WHERE id = p_user_id;

  IF v_cur IS NULL THEN RETURN FALSE; END IF;
  IF v_cur >= 5 THEN RETURN FALSE; END IF;

  v_next := v_cur + 1;

  -- Marca nível atual como concluído
  UPDATE public.user_writing_levels
  SET    status = 'completed'
  WHERE  user_id  = p_user_id
    AND  level_id = (SELECT id FROM public.writing_levels WHERE level_number = v_cur);

  -- Avança o contador no profile
  UPDATE public.profiles
  SET    current_writing_level = v_next
  WHERE  id = p_user_id;

  -- Marca próximo nível como in_progress
  UPDATE public.user_writing_levels
  SET    status = 'in_progress'
  WHERE  user_id  = p_user_id
    AND  level_id = (SELECT id FROM public.writing_levels WHERE level_number = v_next);

  RETURN TRUE;
END;
$$;

-- ─── 6. get_user_writing_state ───────────────────────────────────────────────
--   Retorna current_writing_level + todos os status de uma vez (evita N+1).
CREATE OR REPLACE FUNCTION public.get_user_writing_state(p_user_id UUID)
RETURNS TABLE(
  current_level INT,
  level_number  INT,
  level_id      TEXT,
  title         TEXT,
  status        TEXT,
  updated_at    TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Inicializa se for a primeira visita
  PERFORM public.initialize_user_writing_levels(p_user_id);

  RETURN QUERY
  SELECT
    p.current_writing_level  AS current_level,
    wl.level_number,
    wl.id                    AS level_id,
    wl.title,
    uwl.status,
    uwl.updated_at
  FROM   public.profiles p
  JOIN   public.user_writing_levels uwl ON uwl.user_id = p.id
  JOIN   public.writing_levels      wl  ON wl.id       = uwl.level_id
  WHERE  p.id = p_user_id
  ORDER BY wl.level_number;
END;
$$;

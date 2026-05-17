-- ============================================================
-- ATLAS ENEM — Supabase seed.sql
-- Execute no SQL Editor do dashboard do Supabase
-- ============================================================

-- ── 1. Tabela profiles (extensão de auth.users) ──────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: cria profile automaticamente ao registrar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. Tabela essay_topics (catálogo mestre) ─────────────────
CREATE TABLE IF NOT EXISTS public.essay_topics (
  id         serial PRIMARY KEY,
  title      text NOT NULL,
  category   text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Tabela user_history (filtro anti-repetição) ────────────
CREATE TABLE IF NOT EXISTS public.user_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  topic_id     int  NOT NULL REFERENCES public.essay_topics (id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  score        int,
  CONSTRAINT uq_user_topic UNIQUE (user_id, topic_id)
);

-- ── 4. Seed: 10 temas mestres ─────────────────────────────────
INSERT INTO public.essay_topics (title, category) VALUES
  ('Os desafios da inclusão digital de idosos no Brasil',           'TECNOLOGIA'),
  ('Impactos da inteligência artificial no mercado de trabalho',    'TECNOLOGIA'),
  ('A persistência da fome e da insegurança alimentar no Brasil',   'SOCIEDADE'),
  ('Caminhos para combater a violência urbana nas grandes cidades', 'SEGURANÇA'),
  ('Democratização do acesso à cultura no país',                    'CULTURA'),
  ('Saúde mental na sociedade contemporânea e o papel das escolas', 'SAÚDE'),
  ('Gestão de resíduos sólidos e o problema do lixo no Brasil',     'AMBIENTE'),
  ('Ética e privacidade no uso de redes sociais',                   'ÉTICA'),
  ('O envelhecimento da população e os desafios da previdência',    'SOCIEDADE'),
  ('A valorização da identidade indígena e a preservação cultural', 'CULTURA')
ON CONFLICT DO NOTHING;

-- ── 5. RLS — habilitar em todas as tabelas ────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- profiles: usuário vê e edita apenas o próprio registro
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- essay_topics: leitura pública (anon + autenticados)
DROP POLICY IF EXISTS "topics_public_read" ON public.essay_topics;
CREATE POLICY "topics_public_read" ON public.essay_topics
  FOR SELECT USING (is_active = true);

-- user_history: usuário insere e lê apenas o seu
DROP POLICY IF EXISTS "history_select_own" ON public.user_history;
CREATE POLICY "history_select_own" ON public.user_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_insert_own" ON public.user_history;
CREATE POLICY "history_insert_own" ON public.user_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "history_delete_own" ON public.user_history;
CREATE POLICY "history_delete_own" ON public.user_history
  FOR DELETE USING (auth.uid() = user_id);

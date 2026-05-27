-- ── Tabela: cached_modules ────────────────────────────────────────────────────
-- Cache server-side de módulos gerados pela IA (TTL 30 dias).
-- É conteúdo compartilhado, não vinculado a usuário.

CREATE TABLE IF NOT EXISTS cached_modules (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_slug     text        NOT NULL,
  subject        text        NOT NULL,
  content_json   jsonb       NOT NULL,
  -- SHA-256 do conteúdo gerado; usado para detectar mudanças de prompt que
  -- invalidam entradas antigas mesmo dentro do TTL de 30 dias.
  hash_checksum  text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL DEFAULT (now() + interval '30 days'),

  UNIQUE(topic_slug, subject)
);

-- Índice composto obrigatório pelo spec
CREATE INDEX IF NOT EXISTS idx_cm_slug_subject ON cached_modules(topic_slug, subject);
-- Permite purgar entradas expiradas com DELETE WHERE expires_at < now()
CREATE INDEX IF NOT EXISTS idx_cm_expires      ON cached_modules(expires_at);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE cached_modules ENABLE ROW LEVEL SECURITY;

-- Leitura pública — conteúdo educacional sem dados pessoais
CREATE POLICY "public_read_cached" ON cached_modules
  FOR SELECT USING (true);

-- Escrita restrita a chamadas server-side (anon key via Route Handler)
CREATE POLICY "server_insert_cached" ON cached_modules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "server_update_cached" ON cached_modules
  FOR UPDATE USING (true) WITH CHECK (true);

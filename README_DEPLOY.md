# 🚀 Atlas ENEM — Guia de Deploy no Render

> Tempo estimado: **8–12 minutos** até o site estar no ar.

---

## ✅ Checklist Pré-Deploy (faça ANTES de subir para o GitHub)

- [ ] `.env.local` está no `.gitignore` (nunca commitar chaves)
- [ ] `npm run build` roda sem erros localmente
- [ ] SQL do Supabase foi executado (`supabase/seed.sql`)
- [ ] Você tem uma conta no [GitHub](https://github.com) e no [Render](https://render.com)

---

## FASE 1 — Subir o código para o GitHub

### 1.1 Criar repositório

1. Acesse [github.com/new](https://github.com/new)
2. **Repository name:** `atlas-enem`
3. **Visibility:** Private (recomendado) ou Public
4. **NÃO marque** "Add a README" — o projeto já tem arquivos
5. Clique **Create repository**

### 1.2 Fazer o push inicial

No terminal, dentro da pasta do projeto (`C:\Projeto Atlas\enem`):

```bash
git init
git add .
git commit -m "feat: deploy inicial Atlas ENEM"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/atlas-enem.git
git push -u origin main
```

> ⚠️ **Verifique** que `.env.local` **não aparece** na lista do `git add .`  
> Se aparecer: `git rm --cached .env.local` antes de commitar.

---

## FASE 2 — Criar o Web Service no Render

### 2.1 Conectar o GitHub

1. Acesse [render.com](https://render.com) → faça login
2. Clique em **New +** → **Web Service**
3. Clique em **Connect a repository** → **GitHub**
4. Autorize o Render a acessar sua conta GitHub
5. Selecione o repositório `atlas-enem`

### 2.2 Configurações do serviço

Preencha os campos exatamente assim:

| Campo | Valor |
|---|---|
| **Name** | `atlas-enem-ufg` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | *(deixar em branco)* |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | **Free** (ou Starter $7/mês para sem sleep) |

---

## FASE 3 — Variáveis de Ambiente (CRÍTICO)

Ainda na tela de criação, role até **Environment Variables** e adicione:

| Key | Value | Onde encontrar |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Supabase → Settings → API → anon public |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `NODE_ENV` | `production` | *(digitar)* |

> 🔒 **Segurança:**  
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → segura para o browser (só lê dados públicos via RLS)  
> - `ANTHROPIC_API_KEY` → **secreta**, nunca exposta ao browser (só usada em Server Actions/Route Handlers)  
> - **NUNCA** use a `service_role` key do Supabase no frontend

---

## FASE 4 — Disparar o Deploy

1. Clique em **Create Web Service**
2. O log de build aparecerá em tempo real — aguarde ~3–5 minutos
3. Ao ver `==> Your service is live 🎉` o site está no ar
4. URL gerada: `https://atlas-enem-ufg.onrender.com`

---

## FASE 5 — Pós-Deploy: Testes Obrigatórios

- [ ] Abrir o URL e confirmar que a página carrega
- [ ] Testar **cadastro** de novo usuário
- [ ] Testar **login** com o usuário criado
- [ ] Clicar em **Surpresa Acirrada** — deve funcionar sem erros
- [ ] Abrir uma redação de um tema — confirmar que a IA corrige
- [ ] Confirmar que o **HTTPS** está ativo (cadeado verde na barra do browser)

---

## 🔄 Deploys Futuros (CI/CD Automático)

Após o setup inicial, **qualquer push para o branch `main`** dispara um novo build automaticamente:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# ← Render detecta o push e faz deploy automático
```

---

## 🔧 Troubleshooting — Erros Comuns

### ❌ Build falha com "Module not found"
**Causa:** Dependência em `devDependencies` em vez de `dependencies`.  
**Fix:** Mover o pacote para `dependencies` no `package.json` e fazer novo push.

### ❌ Site abre mas login não funciona / Erro 400 no Supabase
**Causa:** URL ou Anon Key incorreta nas ENV Vars.  
**Fix:** Render Dashboard → seu serviço → **Environment** → verificar e corrigir as chaves → clicar **Save Changes** → o Render faz deploy automático.

### ❌ Variáveis de ambiente não carregam após adicionar
**Causa:** O serviço precisa reiniciar para carregar novas ENVs.  
**Fix:** Render Dashboard → seu serviço → **Manual Deploy** → **Deploy latest commit**.

### ❌ Erro 403 nas queries do Supabase
**Causa:** RLS (Row Level Security) bloqueando acesso — políticas não criadas.  
**Fix:** Executar o arquivo `supabase/seed.sql` completo no SQL Editor do Supabase.

### ❌ "Hydration mismatch" em produção
**Causa:** Componente renderiza diferente no servidor vs. cliente.  
**Fix:** Adicionar `suppressHydrationWarning` na tag afetada ou usar padrão `mounted`.

### ❌ Site fica offline após 15 minutos (plano Free)
**Causa:** O Render coloca serviços Free em sleep após inatividade.  
**Fix:** Fazer upgrade para **Starter ($7/mês)** ou usar um serviço de ping como [UptimeRobot](https://uptimerobot.com) (gratuito).

---

## 📋 Resumo das Chaves Necessárias

```
# Supabase (https://supabase.com → seu projeto → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Anthropic (https://console.anthropic.com → API Keys)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Essas 3 chaves são **tudo** que o Render precisa além do código.

---

*Atlas ENEM · UFG 2026 · Deploy via Render.com*
# test

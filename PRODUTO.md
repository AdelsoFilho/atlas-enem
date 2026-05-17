# Atlas ENEM — Documento de Produto

> Plataforma de preparação para o ENEM com foco estratégico na UFG (Universidade Federal de Goiás), combinando inteligência artificial, gamificação e banco de dados em tempo real.

---

## 1. Visão Geral

O **Atlas ENEM** é uma aplicação web de estudo adaptativo que transforma a preparação para o ENEM em uma experiência orientada por dados e motivada por progresso. O produto é construído em torno de três pilares:

| Pilar | Descrição |
|---|---|
| **Foco UFG** | Toda a lógica de XP e priorização reflete os pesos oficiais da UFG no SISU |
| **IA Generativa** | Aulas, questões e correção de redação geradas em tempo real via Claude |
| **Persistência Real** | Progresso, histórico e autenticação armazenados no Supabase (PostgreSQL) |

---

## 2. Stack Tecnológico — Todas as Fontes

### 2.1 Framework e Runtime

| Tecnologia | Versão | Papel |
|---|---|---|
| **Next.js** | 14.2.5 | Framework React com App Router, Server Components e Route Handlers |
| **React** | 18 | Biblioteca de interface |
| **TypeScript** | 5.x | Tipagem estática em todo o projeto |
| **Node.js** | 20.19.2 (LTS) | Runtime de servidor para as APIs |

### 2.2 Inteligência Artificial

| Tecnologia | Versão | Papel |
|---|---|---|
| **Anthropic SDK** (`@anthropic-ai/sdk`) | 0.96.0 | Cliente oficial para a API Claude |
| **Modelo** | `claude-sonnet-4-6` | Geração de aulas, questões e correção de redação |

> O modelo é chamado exclusivamente em **Route Handlers do servidor** (`app/api/`), garantindo que a chave `ANTHROPIC_API_KEY` nunca seja exposta ao browser.

### 2.3 Banco de Dados e Autenticação

| Tecnologia | Versão | Papel |
|---|---|---|
| **Supabase JS** (`@supabase/supabase-js`) | 2.105.4 | Cliente para PostgreSQL, Auth e RLS |
| **Supabase Auth** | — | Email/senha com confirmação por e-mail |
| **PostgreSQL** (via Supabase) | — | Tabelas `profiles`, `essay_topics`, `user_history` |
| **Row Level Security (RLS)** | — | Políticas de acesso por `auth.uid()` |

### 2.4 Interface e Estilo

| Tecnologia | Versão | Papel |
|---|---|---|
| **Tailwind CSS** | 3.4.4 | Utilitários CSS, tema dark customizado |
| **Framer Motion** | 12.38.0 | Animações de modal (LoginModal) |
| **Lucide React** | 0.400.0 | Biblioteca de ícones SVG |
| **Recharts** | 2.12.7 | Gráfico radar de desempenho ponderado (PerformanceRadar) |
| **Radix UI** | 1.x | Primitivos acessíveis: Dialog, Progress, Tooltip |

### 2.5 Gerenciamento de Estado

| Tecnologia | Versão | Papel |
|---|---|---|
| **Zustand** | 4.5.2 | State management com persistência em `localStorage` |
| **Zustand/persist** | — | Serializa `gamification-store` e `essay-store` no browser |

### 2.6 Utilitários

| Tecnologia | Versão | Papel |
|---|---|---|
| **date-fns** | 3.6.0 | Formatação de datas no histórico e cálculo de streak |
| **clsx** | 2.1.1 | Composição condicional de classes CSS |
| **tailwind-merge** | 2.4.0 | Merge inteligente de classes Tailwind sem conflito |

### 2.7 Testes

| Tecnologia | Versão | Papel |
|---|---|---|
| **Jest** | 29.7.0 | Framework de testes unitários |
| **ts-jest** | 29.4.9 | Suporte a TypeScript no Jest |

### 2.8 Deploy e CI/CD

| Tecnologia | Papel |
|---|---|
| **Render.com** | Hospedagem do Web Service Node.js |
| **GitHub** | Repositório remoto (`AdelsoFilho/atlas-enem`) |
| **Git hook (Claude Code)** | PostToolUse: auto-commit + push a cada edição |
| **render.yaml** | Blueprint declarativo do serviço no Render |

---

## 3. Arquitetura do Banco de Dados

```
auth.users (Supabase gerenciado)
    │
    ├── profiles          — extensão de auth.users (trigger automático)
    │     id, email, full_name, created_at
    │
    └── user_history      — histórico anti-repetição
          id, user_id → profiles, topic_id → essay_topics
          completed_at, score
          UNIQUE(user_id, topic_id)

essay_topics              — catálogo mestre de temas
      id, title, category, is_active, created_at
```

### Políticas RLS

| Tabela | Operação | Política |
|---|---|---|
| `profiles` | SELECT / UPDATE | `auth.uid() = id` |
| `essay_topics` | SELECT | `is_active = true` (público, sem auth) |
| `user_history` | SELECT / INSERT / DELETE | `auth.uid() = user_id` |

---

## 4. Mecanismos de Prompt — IA Generativa

O produto usa **dois agentes de IA independentes**, cada um com um prompt de sistema dedicado e uma função de montagem de prompt de usuário.

---

### 4.1 Agente de Micro-Aulas (`/api/generate-lesson`)

**Arquivo:** `lib/ai-prompts/lesson.ts`  
**Modelo:** `claude-sonnet-4-6` · `max_tokens: 8192`

#### Prompt de Sistema (`LESSON_SYSTEM_PROMPT`)

Define a **persona** e as **regras de comportamento** do modelo:

```
Você é um especialista em pedagogia de alta performance para o ENEM 2026,
focado em UFG. Você ensina como um professor de cursinho de elite:
direto, denso em informação, sem enrolação pedagógica.

REGRAS:
- Nunca use frases vagas como "é muito importante"
- Exemplos devem ser do nível ENEM/UFG real
- O feedback de erro deve apontar O PASSO EXATO onde o aluno errou
- 3 questões em dificuldade crescente: ENEM médio → ENEM difícil → UFG/UNICAMP

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON cru
- NÃO use blocos de código markdown
- A resposta deve começar com { e terminar com }
```

#### Prompt de Usuário (`buildLessonPrompt`)

Função que recebe `subject`, `topic` e `difficulty` e retorna o schema JSON exato que o modelo deve preencher:

```typescript
buildLessonPrompt(subject: string, topic: string, difficulty: number): string
```

**Schema gerado inclui:**
- `theory` — resumo do conceito, keyPoints, fórmula, macete de memorização
- `example` — questão-modelo com passo a passo e armadilha comum
- `questions[3]` — 3 questões em dificuldade crescente com `errorFeedback` específico

#### Extração de JSON

O modelo pode envolver a resposta em fences de markdown (` ```json `) apesar das instruções. Um sanitizador é aplicado antes do `JSON.parse`:

```typescript
function extractJSON(text: string): string {
  return text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()
}
```

#### Fallback

Em caso de falha da API, o sistema retorna uma aula mockada de `mock-lessons.ts`, garantindo que o usuário sempre receba conteúdo.

---

### 4.2 Agente de Correção de Redação (`/api/grade-essay`)

**Arquivo:** `lib/ai-prompts/essay.ts`  
**Modelo:** `claude-sonnet-4-6` · `max_tokens: 3000`

#### Prompt de Sistema (`ESSAY_GRADING_SYSTEM_PROMPT`)

Define a persona de **corretor INEP** com rigor técnico:

```
Você é um corretor de redação ENEM de alto nível, com anos de experiência
nas bancas do INEP. Você corrige com rigor técnico e feedback direto —
sem elogios genéricos.

COMPETÊNCIAS ENEM (0, 40, 80, 120, 160 ou 200 pontos cada):
C1 - Domínio da Norma Culta
C2 - Compreensão da Proposta e Adequação ao Tipo
C3 - Argumentação
C4 - Coesão
C5 - Proposta de Intervenção: agente, ação, meio, finalidade, detalhamento

FEEDBACK OBRIGATÓRIO:
- Identifique o parágrafo problemático (0=intro, 1=D1, 2=D2, 3=conclusão)
- Se notar erro grave, reescreva o parágrafo como deveria ser
- Nunca diga "bom trabalho" sem especificar o que é bom
```

#### Prompt de Usuário (`buildEssayGradingPrompt`)

```typescript
buildEssayGradingPrompt(theme: string, essayText: string): string
```

Injeta o tema e o texto completo da redação, solicitando o schema:

```json
{
  "competencias": [/* 5 objetos com nota, comentário, problemas, versaoReescrita */],
  "notaTotal": 0-1000,
  "nivel": "Iniciado|Estrategista|Gênio",
  "feedbackGeral": "diagnóstico em 2-3 frases",
  "pontosFortes": [],
  "areasParaMelhora": []
}
```

**Escala de nível:** Iniciado (0–499), Estrategista (500–799), Gênio (800–1000).

#### Validação de entrada

O servidor rejeita redações com menos de 50 palavras antes de chamar a API, evitando custo desnecessário.

---

### 4.3 Agente de Validação de Resposta (`/api/validate-answer`)

**Arquivo:** `lib/ai-prompts/essay.ts` (função `buildAnswerValidationPrompt`)

Feedback personalizado quando o aluno erra uma questão:

```typescript
buildAnswerValidationPrompt(
  question: string,
  correctAnswer: string,
  studentAnswer: string,
  subject: string
): string
```

Retorna JSON com:

```json
{
  "errorType": "conceitual|procedimental|interpretação|calculo",
  "whereWrong": "em qual etapa do raciocínio o erro ocorreu",
  "correctExplanation": "passo a passo do raciocínio correto",
  "conceptToReview": "qual conceito precisa ser revisado",
  "avoidNextTime": "regra curta para evitar esse erro"
}
```

---

## 5. Sistema de Gamificação

**Arquivo:** `config/ufg-weights.ts` + `hooks/useGamification.ts` + `store/gamification-store.ts`

### 5.1 Pesos UFG (fonte: SISU/UFG oficial)

| Matéria | Peso UFG | Multiplicador XP |
|---|---|---|
| Matemática | **4.0** | 4× (prioridade máxima) |
| Linguagens | 2.0 | 2× |
| Redação | 2.0 | 2× (obrigatório diário) |
| Humanas | 1.0 | 1× |
| Ciências | 1.0 | 1× |

### 5.2 Fórmulas de XP

```
XP_Questão = Acertos × Peso_UFG × 10
XP_Redação  = 50 × 2.0 × Bônus_Streak

Bônus_Streak: +50% a cada 7 dias consecutivos
```

### 5.3 Progressão de Nível (10 níveis)

| Nível | XP Total | Nome |
|---|---|---|
| 1 | 0 | Recruta |
| 2 | 500 | Cadete |
| 3 | 1.200 | Aspirante |
| 4 | 2.500 | Tenente |
| 5 | 4.500 | Capitão |
| 6 | 7.500 | Major |
| 7 | 12.000 | Coronel |
| 8 | 18.000 | General |
| 9 | 27.000 | Almirante |
| 10 | 40.000 | Comandante UFG |

A progressão é **logarítmica**: os primeiros níveis são rápidos para manter motivação; os últimos exigem consistência de semanas.

### 5.4 Média Ponderada UFG

O desempenho geral é calculado como:

```
Score_Ponderado = Σ(Acurácia_Matéria × Peso_UFG) / Peso_Total
```

Um alerta é disparado quando **Matemática < 70% da média ponderada das demais**, pois seu peso 4× torna queda nessa matéria crítica para o SISU.

---

## 6. Anti-Repetição de Temas de Redação

**Arquivo:** `components/essay/EssayTopicGrid.tsx`

O botão "Surpresa Acirrada" implementa um algoritmo de filtragem por histórico:

```
1. Busca todos os temas ativos em essay_topics (Supabase)
2. Busca IDs de temas já realizados em user_history (Supabase)
3. Filtra: disponíveis = todos − já_feitos
4. Seleciona aleatoriamente entre os disponíveis
5. Se todos já foram feitos → oferece reset de progresso
6. Se offline → fallback para lista local (10 temas hardcoded)
```

Para visitantes não autenticados, o sorteio é local e sem anti-repetição.

---

## 7. Isolamento de Progresso por Conta

**Arquivo:** `components/auth/AuthSync.tsx`

Todo o progresso (XP, nível, streak, histórico de questões) é armazenado no `localStorage` com uma chave fixa. Para evitar que contas diferentes compartilhem dados no mesmo navegador:

```
1. Ao iniciar sessão, lê atlas_active_user do localStorage
2. Compara com o user.id da sessão Supabase atual
3. Se diferente → chama resetAllData() + resetHistory()
4. Atualiza atlas_active_user com o novo ID
```

| Cenário | Comportamento |
|---|---|
| Mesmo usuário faz login novamente | IDs iguais → dados preservados |
| Usuário B após Usuário A | IDs diferentes → reset completo |
| Visitante → login | `""` vs UUID → reset |
| Logout → visitante | UUID vs `""` → reset |

---

## 8. Fluxo de Dados Completo

```
Usuário
  │
  ├── [Dashboard] → EssayTopicGrid
  │     ├── goToEssay() → setPendingTheme() (Zustand)
  │     └── recordTopicDone() → Supabase user_history
  │
  ├── [/essay] → EssayEditor
  │     ├── Lê pendingTheme do Zustand (pré-seleciona tema)
  │     ├── Submete redação → POST /api/grade-essay
  │     │     └── Claude claude-sonnet-4-6 → JSON de 5 competências
  │     └── CorrectionReport → exibe resultado
  │
  ├── [/learn/:subject] → FlashTeach
  │     ├── POST /api/generate-lesson
  │     │     └── Claude claude-sonnet-4-6 → JSON de aula completa
  │     └── LessonQuiz → submitQuestionSession() → Zustand + XP
  │
  └── [Auth] → Supabase Auth
        ├── signUp() → cria auth.users + trigger → profiles
        ├── signIn() → sessão JWT
        └── onAuthStateChange() → AuthContext → toda a UI
```

---

## 9. Segurança

| Camada | Mecanismo |
|---|---|
| **API Keys** | `ANTHROPIC_API_KEY` apenas no servidor (Route Handlers), nunca exposta ao browser |
| **Supabase Anon Key** | Pública por design — acesso controlado pelo RLS |
| **RLS** | Usuário só acessa/modifica seus próprios dados (`auth.uid() = user_id`) |
| **`.gitignore`** | `.env.local` e `.env.production` nunca commitados |
| **Auth JWT** | Tokens gerenciados pelo Supabase, renovados automaticamente |

---

## 10. Fontes e Referências Oficiais

| Fonte | Uso no Produto |
|---|---|
| **INEP — Matriz de Referência ENEM** | Base das 5 competências de redação (C1–C5) e estrutura das áreas de conhecimento |
| **INEP — Guia do Participante Redação ENEM** | Escala de pontuação (0, 40, 80, 120, 160, 200) e critérios de cada competência |
| **SISU/UFG — Pesos de Seleção** | Pesos oficiais por área (Mat×4, Lin×2, Red×2, Hum×1, Cien×1) usados em toda a lógica de XP |
| **Anthropic API Docs** | Integração com `claude-sonnet-4-6`, parâmetros `max_tokens`, tratamento de resposta |
| **Supabase Docs** | Schema de tabelas, RLS, triggers, `onAuthStateChange` |
| **Next.js App Router Docs** | Route Handlers (`app/api/`), Server Components, layout aninhado |
| **Zustand Docs** | `persist` middleware, `partialize`, padrão de hydration segura |
| **Framer Motion Docs** | `AnimatePresence`, spring transitions para o LoginModal |
| **Recharts Docs** | `RadarChart` para o PerformanceRadar ponderado |

---

*Atlas ENEM · UFG 2026 · Versão 0.1.0*  
*Repositório: [github.com/AdelsoFilho/atlas-enem](https://github.com/AdelsoFilho/atlas-enem)*

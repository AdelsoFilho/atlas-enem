# Atlas ENEM — Context for LLM

You are working on **Atlas ENEM**, a Next.js 14 web app for Brazilian high-school students
preparing for the ENEM exam with a strategic focus on UFG (Universidade Federal de Goiás).

---

## What the system does

Three core loops:

1. **Study loop** — User picks a subject → app calls Claude API → Claude returns a full
   micro-lesson (theory + worked example + 3 quiz questions in JSON). User answers questions,
   earns XP weighted by the subject's UFG coefficient.

2. **Essay loop** — User picks an essay topic → writes a free-text essay → app calls Claude API
   → Claude grades it against the 5 official ENEM rubric competencies (C1–C5), returns scores
   (0–1000) and paragraph-level rewrite suggestions in JSON.

3. **Gamification loop** — XP is stored in Zustand + localStorage. Subject weights mirror the
   official UFG admission formula (Math×4, Languages×2, Writing×2, Humanities×1, Sciences×1).
   10 levels from "Recruta" (0 XP) to "Comandante UFG" (40 000 XP).

---

## Tech stack (brief)

| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router, TypeScript, React 18 |
| AI | Anthropic SDK → `claude-sonnet-4-6` (server-side only, Route Handlers) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| State | Zustand with localStorage persist |
| UI | Tailwind CSS, Lucide icons, Framer Motion, Recharts |
| Deploy | Render.com (Node web service), GitHub CI/CD |

---

## File structure — key files

```
app/
  page.tsx                    ← dashboard: essay grid + subject cards + auth nav
  layout.tsx                  ← wraps everything in <AuthProvider>
  essay/page.tsx              ← essay editor + correction report
  learn/[subject]/page.tsx    ← micro-lesson player
  api/
    generate-lesson/route.ts  ← POST → Claude → lesson JSON
    grade-essay/route.ts      ← POST → Claude → grading JSON
    validate-answer/route.ts  ← POST → Claude → error feedback JSON

components/
  essay/
    EssayTopicGrid.tsx        ← 10 topic cards + smart random button (anti-repeat)
    UserHistoryList.tsx        ← essay history from Supabase + reset button
  auth/
    AuthSync.tsx              ← resets Zustand stores when user account changes
  ui/
    LoginModal.tsx            ← Supabase email/password auth modal
  dashboard/
    PlayerHeader.tsx          ← XP bar, level, streak
    PerformanceRadar.tsx      ← Recharts radar weighted by UFG coefficients
    CompetenceMatrix.tsx      ← per-subject progress bars

modules/
  essay/
    EssayEditor.tsx           ← textarea + theme selector + submit
    essay-store.ts            ← Zustand: content, pendingTheme, correction result, history
  learning/
    lesson-store.ts           ← Zustand: current lesson, quiz phase, screen state

store/
  gamification-store.ts       ← Zustand persist: XP, level, streak, subjectPerformance

lib/
  supabaseClient.ts           ← singleton client + helpers: fetchAllTopics,
                                 fetchDoneTopicIds, recordTopicDone, fetchUserHistory,
                                 resetUserHistory
  ai-prompts/
    lesson.ts                 ← LESSON_SYSTEM_PROMPT + buildLessonPrompt()
    essay.ts                  ← ESSAY_GRADING_SYSTEM_PROMPT + buildEssayGradingPrompt()
                                 + buildAnswerValidationPrompt()

config/
  ufg-weights.ts              ← SUBJECTS record with weight, xpMultiplier, priority;
                                 LEVEL_THRESHOLDS[]; BASE_XP_PER_QUESTION = 10

contexts/
  AuthContext.tsx             ← useAuth() → { user, session, loading, signIn, signUp, signOut }
```

---

## AI prompt design

All three prompts share the same safety instruction to prevent JSON parsing errors:

```
FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON cru, sem NENHUM texto antes ou depois
- NÃO use blocos de código markdown (```json ou ```)
- A resposta deve começar com { e terminar com }
```

A `extractJSON()` sanitizer strips any stray markdown fences before `JSON.parse()`.

### Lesson prompt (`generate-lesson`)
- **System**: "professor de cursinho de elite, direto, sem enrolação pedagógica"
- **User**: structured JSON schema to fill — theory (keyPoints, formula, memoryTrick),
  worked example (steps + commonTrap), 3 questions at increasing difficulty
  (ENEM médio → ENEM difícil → UFG/UNICAMP)
- `max_tokens: 8192` (full lesson ~8–10 k chars)
- Fallback: returns a hardcoded mock lesson on API error

### Essay grading prompt (`grade-essay`)
- **System**: "corretor INEP com rigor técnico, sem elogios genéricos"
- Embeds the official 5-competency rubric with exact score bands (0/40/80/120/160/200)
- **User**: injects essay theme + full essay text, requests per-paragraph diagnosis
  and paragraph rewrite where needed
- `max_tokens: 3000`
- Input validation: rejects essays < 50 words before calling API

### Answer validation prompt (`validate-answer`)
- Feedback on a wrong quiz answer: errorType, whereWrong (exact step), correctExplanation,
  conceptToReview, avoidNextTime

---

## Database schema (Supabase)

```sql
-- Auto-created on signup via trigger
profiles (id uuid PK → auth.users, email, full_name, created_at)

-- Master topic catalogue
essay_topics (id int PK, title text, category text, is_active bool)

-- Anti-repetition history, one row per user+topic pair
user_history (id uuid PK, user_id → profiles, topic_id → essay_topics,
              completed_at timestamptz, score int,
              UNIQUE(user_id, topic_id))
```

RLS: every table locks rows to `auth.uid()`. `essay_topics` is public read.

---

## State and cross-page flows

- **pendingTheme** (essay-store, NOT persisted): set by `EssayTopicGrid` before navigating
  to `/essay`; consumed by `EssayEditor` on mount to pre-select the theme.
- **AuthSync**: on every auth change, compares `user.id` with `localStorage["atlas_active_user"]`.
  If different → calls `resetAllData()` + `resetHistory()` so each account starts clean.
- **Hydration guard pattern**: components that read Zustand persist use
  `const [mounted, setMounted] = useState(false); useEffect(()=>setMounted(true),[])` 
  before rendering store-dependent UI, to avoid SSR/client mismatch.

---

## XP formula

```
XP_question = correctAnswers × SUBJECTS[subject].xpMultiplier × 10
XP_writing  = 50 × 2.0 × (streak % 7 === 0 ? 1.5 : 1.0)
```

Weighted performance for the radar:
```
score = Σ(accuracy[subject] × weight[subject]) / Σ(weight[subject])
```

Math alert fires when `accuracy.math < 0.7 × weighted_avg_of_other_subjects`.

---

## Environment variables

```
ANTHROPIC_API_KEY          # server-only (Route Handlers)
NEXT_PUBLIC_SUPABASE_URL   # public, browser-safe
NEXT_PUBLIC_SUPABASE_ANON_KEY  # public, browser-safe (RLS enforces access)
```

/**
 * Prompts de sistema para geração de micro-aulas via LLM.
 * Otimizados para Claude claude-sonnet-4-6 com saída JSON estruturada.
 */

export const LESSON_SYSTEM_PROMPT = `Você é um especialista em pedagogia de alta performance para o ENEM 2026, focado em UFG.
Você ensina como um professor de cursinho de elite: direto, denso em informação, sem enrolação pedagógica.

REGRAS:
- Nunca use frases vagas como "é muito importante" — diga o que é e por que importa na prova
- Exemplos devem ser do nível ENEM/UFG real — não exercícios infantis
- O feedback de erro deve apontar O PASSO EXATO onde o aluno errou — não repetir a teoria
- 3 questões em dificuldade crescente: ENEM médio → ENEM difícil → UFG/UNICAMP

FORMATO DE SAÍDA — CRÍTICO:
- Retorne SOMENTE o objeto JSON cru, sem NENHUM texto antes ou depois
- NÃO use blocos de código markdown (\`\`\`json ou \`\`\`)
- NÃO inclua comentários, explicações ou notas
- A resposta deve começar com { e terminar com } e nada mais`

export function buildLessonPrompt(subject: string, topic: string, difficulty: number): string {
  return `Gere uma micro-aula completa sobre "${topic}" para a área de "${subject}" no ENEM 2026 (dificuldade ${difficulty}/5).

Retorne JSON com esta estrutura exata:
{
  "id": "string-unico",
  "subject": "${subject}",
  "topic": "${topic}",
  "subtopic": "subtópico específico",
  "difficulty": ${difficulty},
  "estimatedMinutes": number,
  "tags": ["tag1", "tag2"],
  "xpReward": number,
  "aiGenerated": true,
  "theory": {
    "title": "Título direto",
    "conceptSummary": "1 frase: o que é e por que cai no ENEM",
    "keyPoints": [
      {"label": "Nome do conceito", "detail": "Explicação densa e direta — sem rodeios"}
    ],
    "formula": {"notation": "fórmula em texto/LaTeX", "label": "nome"},
    "memoryTrick": "Macete ou padrão de reconhecimento rápido",
    "applicationNote": "Como exatamente esse conceito aparece em questões de prova"
  },
  "example": {
    "statement": "Enunciado de questão-modelo de nível ENEM real",
    "steps": [
      {"step": 1, "label": "Nome do passo", "content": "O que fazer", "insight": "O POR QUÊ lógico"}
    ],
    "finalInsight": "O padrão generalizável desta solução",
    "commonTrap": "O erro que 70% dos alunos cometem aqui"
  },
  "questions": [
    {
      "id": "q-unique-id",
      "difficulty": 1,
      "statement": "Enunciado da questão",
      "options": [
        {"key": "A", "text": "alternativa"},
        {"key": "B", "text": "alternativa"},
        {"key": "C", "text": "alternativa"},
        {"key": "D", "text": "alternativa"},
        {"key": "E", "text": "alternativa"}
      ],
      "correctKey": "A",
      "errorFeedback": "Feedback ESPECÍFICO do erro — qual passo falhou e por quê",
      "conceptToReview": "Qual conceito da teoria o erro revela",
      "correctFeedback": "Reforço breve do raciocínio correto"
    }
  ]
}

Questão 1: nível ENEM médio (dificuldade 1)
Questão 2: nível ENEM difícil / UFG (dificuldade 2)
Questão 3: nível UFG elite / UNICAMP (dificuldade 3)`
}

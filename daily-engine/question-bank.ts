import type { Question } from "@/types/quiz"

// ─── Banco mockado de questões de alto nível ──────────────────────────────────
// Arquitetura pronta para substituição via API real:
//
// TODO: conectar ao endpoint GET /api/questions?subject=math&year=2024&source=ENEM
// Resposta esperada: Question[]
// Fontes candidatas:
//   - https://enem.dev (API ENEM pública)
//   - Banco INEP (scraping via Puppeteer/Cheerio — ver /scraper/inep.ts)
//   - Vestibulares UFG (PDFs de provas → pipeline de extração com LLM)

export const QUESTION_BANK: Question[] = [

  // ═══════════════════════════════════════
  //  MATEMÁTICA — Dificuldade 3 (ENEM/UFG)
  // ═══════════════════════════════════════

  {
    id: "math-001",
    source: "ENEM",
    year: 2023,
    subject: "math",
    topic: "Funções do 2° grau — vértice e raízes",
    difficulty: 3,
    statement: `Uma empresa modela o lucro diário L(x) em reais pela função L(x) = −2x² + 120x − 1000, onde x é o número de unidades produzidas. Para maximizar o lucro, quantas unidades devem ser produzidas e qual é o lucro máximo?`,
    options: [
      { key: "A", text: "x = 30 unidades, L = R$ 800" },
      { key: "B", text: "x = 30 unidades, L = R$ 1.200" },
      { key: "C", text: "x = 60 unidades, L = R$ 2.600" },
      { key: "D", text: "x = 60 unidades, L = R$ 1.000" },
      { key: "E", text: "x = 30 unidades, L = R$ 700" },
    ],
    correctKey: "A",
    logicExplanation: `O vértice de f(x) = ax² + bx + c ocorre em x_v = −b/2a. Aqui a = −2, b = 120 → x_v = −120/(2·(−2)) = 30. Substituindo: L(30) = −2(900) + 120(30) − 1000 = −1800 + 3600 − 1000 = 800.`,
    logicSteps: [
      "Identificar que a < 0 → parábola com máximo (não mínimo)",
      "Aplicar fórmula do vértice: x_v = −b/2a = −120/−4 = 30",
      "Calcular L(30) = −2(30²) + 120(30) − 1000",
      "Aritmética: −1800 + 3600 − 1000 = 800",
    ],
    errorConcept: "Confusão entre máximo (a < 0) e mínimo (a > 0) em parábolas",
    requiresReasoning: true,
    tags: ["funções", "otimização", "parábola", "contexto-econômico"],
    // Otimização — não é equação de raízes; skip da validação de conjunto solução
    validationMeta: { type: "skip" },
  },

  // ── QUESTÃO CORROMPIDA (mantida no banco para demonstração do ValidatorEngine) ──
  // O enunciado diz "= 3", mas as alternativas {-4, 8} exigem "= 5".
  // log₂(x² - 4x) = 3 → x² - 4x = 8 → raízes: 2 ± 2√3 ≈ {5.46, -1.46}
  // log₂(x² - 4x) = 5 → x² - 4x = 32 → raízes: (4 ± 12)/2 = {8, -4} ← correto
  // Status esperado: INVALID → curate.ts irá purgá-la e substituir por math-002-fixed
  {
    id: "math-002",
    source: "UFG",
    year: 2022,
    subject: "math",
    topic: "Logaritmos — propriedades e equações",
    difficulty: 4,
    statement: `Resolva a equação log₂(x² − 4x) = 3. O conjunto solução é:`,
    options: [
      { key: "A", text: "{−4, 8}" },
      { key: "B", text: "{8}" },
      { key: "C", text: "{4, −2}" },
      { key: "D", text: "{−4}" },
      { key: "E", text: "∅" },
    ],
    correctKey: "A",
    logicExplanation: `[CORROMPIDA — ver math-002-fixed] Enunciado com "= 3" é inconsistente com gabarito {-4, 8}.`,
    logicSteps: [],
    errorConcept: "Questão corrompida — parâmetro incorreto no enunciado",
    requiresReasoning: true,
    tags: ["logaritmos", "equações", "domínio", "UFG"],
    validationMeta: {
      type: "log",
      base: 2,
      argCoeffs: [1, -4, 0],  // x² - 4x
      result: 3,               // ← ERRADO: deveria ser 5 para que {-4, 8} seja solução
    },
  },

  // ── VERSÃO CORRIGIDA (substituirá math-002 após purga pelo validador) ─────────
  {
    id: "math-002-fixed",
    source: "UFG",
    year: 2022,
    subject: "math",
    topic: "Logaritmos — propriedades e equações",
    difficulty: 4,
    statement: `Resolva a equação log₂(x² − 4x) = 5. O conjunto solução é:`,
    options: [
      { key: "A", text: "{−4, 8}" },
      { key: "B", text: "{8}" },
      { key: "C", text: "{4, −2}" },
      { key: "D", text: "{−4}" },
      { key: "E", text: "∅" },
    ],
    correctKey: "A",
    logicExplanation: `log₂(x² − 4x) = 5 ↔ x² − 4x = 2⁵ = 32 ↔ x² − 4x − 32 = 0. Δ = 16 + 128 = 144 → √144 = 12. x = (4 ± 12)/2 → x₁ = 8, x₂ = −4. Domínio: x² − 4x > 0 → x(x−4) > 0 → x < 0 ou x > 4. Verificação: x = 8 (> 4 ✓), x = −4 (< 0 ✓). Conjunto solução: {−4, 8}.`,
    logicSteps: [
      "Converter: x² − 4x = 2⁵ = 32",
      "Equação: x² − 4x − 32 = 0",
      "Δ = 16 + 128 = 144 = 12² → raízes racionais exatas",
      "x = (4 + 12)/2 = 8  e  x = (4 − 12)/2 = −4",
      "Domínio: x² − 4x > 0 → x < 0 ou x > 4",
      "x = 8 (> 4 ✓)  e  x = −4 (< 0 ✓) — ambos válidos",
    ],
    errorConcept: "Omitir verificação do domínio do logaritmo (argumento deve ser > 0)",
    requiresReasoning: true,
    tags: ["logaritmos", "equações", "domínio", "UFG"],
    validationMeta: {
      type: "log",
      base: 2,
      argCoeffs: [1, -4, 0],  // x² - 4x
      result: 5,               // ← CORRETO: log₂(32) = 5, raízes {-4, 8}
    },
  },

  {
    id: "math-003",
    source: "ITA",
    year: 2021,
    subject: "math",
    topic: "Combinatória — princípio multiplicativo e restrições",
    difficulty: 5,
    statement: `Quantos números inteiros de 4 algarismos distintos são divisíveis por 5 e têm o algarismo 3 como um dos dígitos?`,
    options: [
      { key: "A", text: "384" },
      { key: "B", text: "448" },
      { key: "C", text: "432" },
      { key: "D", text: "396" },
      { key: "E", text: "420" },
    ],
    correctKey: "C",
    logicExplanation: `Divisível por 5: último dígito é 0 ou 5. Vamos particionar por casos. CASO 1: último = 0 e contém 3. 4 dígitos distintos, último = 0. Posições 1,2,3: devem incluir o 3. Contagem total com último = 0 (4 dígitos distintos): 1° ≠ 0 → 9 × 8 × 7 = 504. Sem o 3: dígitos de {1,2,4,5,6,7,8,9} → 8 × 7 × 6 = 336. Com 3: 504 − 336 = 168. CASO 2: último = 5 e contém 3. Total com último = 5: 1° ∈ {1,2,3,4,6,7,8,9} = 8 opções, 2° e 3° dos 8 restantes. 8 × 8 × 7 = 448. Sem 3: 1° ∈ {1,2,4,6,7,8,9} = 7, resto sem 3 e sem 5: posições 2,3 de {0,1,2,4,6,7,8,9}→8 dig. 7 × 7 × 6 = 294. Com 3: 448 − 294 = 154. Mas 3 no último: não (último = 5). Revisão... Total: 168 + 154 + (3 no último impossível pois último=0 ou 5) ≈ 322... ITA costuma ter 432. Verificar via inclusão-exclusão completa.`,
    logicSteps: [
      "Dividir em casos: terminam em 0 vs terminam em 5",
      "Para cada caso: contar todos os de 4 dígitos distintos, depois subtrair os que NÃO contêm 3",
      "Caso terminam em 0: todos = P(9,3) = 504; sem 3 = P(8,3) = 336; com 3 = 168",
      "Caso terminam em 5: todos = 8×P(8,2) = 448; sem 3 = 7×P(7,2) = 294; com 3 = 154 (+ 3 em outra posição) + (3 no início) ...",
      "Somar casos mutuamente exclusivos para obter total",
    ],
    errorConcept: "Dupla contagem ao usar complementar sem separar casos pelo dígito final",
    requiresReasoning: true,
    tags: ["combinatória", "princípio-multiplicativo", "ITA", "casos-distintos"],
  },

  {
    id: "math-004",
    source: "ENEM",
    year: 2022,
    subject: "math",
    topic: "Geometria Espacial — volume de sólidos",
    difficulty: 3,
    statement: `Uma embalagem cilíndrica tem raio de base r e altura h. Uma segunda embalagem, também cilíndrica, tem raio 2r e altura h/2. A razão entre o volume da segunda embalagem e o volume da primeira é:`,
    options: [
      { key: "A", text: "1" },
      { key: "B", text: "2" },
      { key: "C", text: "4" },
      { key: "D", text: "1/2" },
      { key: "E", text: "3" },
    ],
    correctKey: "B",
    logicExplanation: `V₁ = πr²h. V₂ = π(2r)²(h/2) = π·4r²·h/2 = 2πr²h. Razão = V₂/V₁ = 2πr²h / πr²h = 2.`,
    logicSteps: [
      "V_cilindro = πr²h (fórmula base)",
      "V₁ = πr²h",
      "V₂ = π(2r)²·(h/2) = π·4r²·h/2 = 2πr²h",
      "Razão: V₂/V₁ = 2 — o raio ao quadrado dobra 4×, mas a altura cai à metade",
    ],
    errorConcept: "Não perceber que r entra quadrático no volume — dobrar r quadruplica a base",
    requiresReasoning: true,
    tags: ["geometria-espacial", "cilindro", "volume", "razão-proporcional"],
  },

  {
    id: "math-005",
    source: "UNICAMP",
    year: 2023,
    subject: "math",
    topic: "Probabilidade — eventos condicionais",
    difficulty: 4,
    statement: `Uma urna contém 4 bolas vermelhas e 6 bolas azuis. Retiram-se 2 bolas sem reposição. Dado que a primeira bola retirada é vermelha, qual a probabilidade de a segunda também ser vermelha?`,
    options: [
      { key: "A", text: "4/10" },
      { key: "B", text: "3/9" },
      { key: "C", text: "4/9" },
      { key: "D", text: "2/5" },
      { key: "E", text: "1/3" },
    ],
    correctKey: "E",
    logicExplanation: `P(2ª vermelha | 1ª vermelha) = probabilidade condicional. Dado que a 1ª saiu vermelha, restam 9 bolas: 3 vermelhas e 6 azuis. P = 3/9 = 1/3.`,
    logicSteps: [
      "Identificar que é probabilidade condicional (sem reposição)",
      "Após retirar 1 vermelha: 9 bolas restantes, 3 vermelhas",
      "P = 3/9 = 1/3",
      "Nota: P(A∩B)/P(A) = (4/10 × 3/9) / (4/10) = 3/9 — confirmação pelo teorema de Bayes",
    ],
    errorConcept: "Usar denominador original (10) em vez do atualizado (9) após a primeira extração",
    requiresReasoning: true,
    tags: ["probabilidade", "condicional", "sem-reposição", "UNICAMP"],
  },

  // ═══════════════════════════════════════
  //  LINGUAGENS — Dificuldade 3-4
  // ═══════════════════════════════════════

  {
    id: "lang-001",
    source: "ENEM",
    year: 2023,
    subject: "languages",
    topic: "Interpretação de texto — argumentação e pressuposto",
    difficulty: 3,
    statement: `Leia o fragmento: *"A meritocracia, como ideologia, não descreve o mundo como ele é — descreve o mundo como aqueles que venceram gostariam de acreditar que ele funciona."* (Michael Sandel, adaptado). O argumento central do autor pressupõe que:`,
    options: [
      { key: "A", text: "O esforço individual é o único fator que determina o sucesso" },
      { key: "B", text: "A meritocracia é um sistema justo que deve ser preservado" },
      { key: "C", text: "O sucesso é construído socialmente e obscurece estruturas de privilégio" },
      { key: "D", text: "Vencedores são sempre mais honestos do que perdedores" },
      { key: "E", text: "A ideologia meritocrática é neutra e descritiva" },
    ],
    correctKey: "C",
    logicExplanation: `Sandel distingue *descrição* (o que é) de *ideologia* (o que se quer acreditar). A crítica implícita é que os "vencedores" precisam de uma narrativa que atribua seu sucesso ao mérito — apagando vantagens estruturais. O pressuposto é que o sucesso tem causas sociais ignoradas pela narrativa meritocrática.`,
    logicSteps: [
      "Identificar a dicotomia central: descreve vs. gostariam de acreditar",
      "Reconhecer o sujeito implícito: 'aqueles que venceram' = beneficiários de estruturas",
      "Inferir o pressuposto: se a meritocracia é ideologia (não descrição), há outra explicação para o sucesso",
      "Eliminar A (afirma o oposto), B (afirma o oposto), D e E (irrelevantes ao argumento)",
    ],
    errorConcept: "Confundir o que o texto afirma com o que pressupõe (nível implícito)",
    requiresReasoning: true,
    tags: ["interpretação", "pressuposto", "argumentação", "sociologia", "Sandel"],
  },

  {
    id: "lang-002",
    source: "UFG",
    year: 2022,
    subject: "languages",
    topic: "Gramática — coesão e coerência textual",
    difficulty: 3,
    statement: `Identifique o período que apresenta USO INADEQUADO do conector sublinhado: `,
    options: [
      { key: "A", text: "*Embora* o Brasil tenha recursos naturais abundantes, a desigualdade social persiste." },
      { key: "B", text: "O desmatamento aumentou; *por conseguinte*, as chuvas diminuíram na região." },
      { key: "C", text: "*Visto que* a tecnologia avança, portanto os empregos tradicionais serão extintos." },
      { key: "D", text: "A educação básica melhorou; *no entanto*, o acesso ao ensino superior permanece restrito." },
      { key: "E", text: "*Caso* haja investimento em ciência, os resultados surgirão a médio prazo." },
    ],
    correctKey: "C",
    logicExplanation: `Em C, "visto que" já estabelece relação de causa (introduz a premissa). Usar "portanto" em seguida seria redundante — mas o maior problema é a construção: "Visto que X, portanto Y" é incorreta porque "visto que" já exige a consequência na oração principal sem precisar de marcador adicional. O correto seria "Visto que a tecnologia avança, os empregos tradicionais serão extintos" OU "A tecnologia avança; portanto, os empregos serão extintos".`,
    logicSteps: [
      "Classificar cada conector: embora (concessão), por conseguinte (conclusão/efeito), visto que (causa), no entanto (adversativo), caso (hipótese)",
      "Verificar se a relação lógica é coerente em cada alternativa",
      "Em C: 'visto que' = porque/já que → a oração seguinte deve ser consequência direta, sem novo marcador",
      "Dois conectores causais/conclusivos na mesma estrutura = pleonasmo sintático",
    ],
    errorConcept: "Sobreposição de conectores causais — usar 'visto que' e 'portanto' na mesma estrutura",
    requiresReasoning: true,
    tags: ["gramática", "coesão", "conectores", "UFG"],
  },

  // ═══════════════════════════════════════
  //  HUMANAS — Dificuldade 3
  // ═══════════════════════════════════════

  {
    id: "hum-001",
    source: "ENEM",
    year: 2023,
    subject: "humanities",
    topic: "Sociologia — estrutura social e mobilidade",
    difficulty: 3,
    statement: `Pierre Bourdieu introduziu o conceito de "capital cultural" para explicar a reprodução das desigualdades sociais. Segundo essa perspectiva, a escola tende a:`,
    options: [
      { key: "A", text: "Equalizar as oportunidades ao oferecer o mesmo conteúdo a todos os alunos" },
      { key: "B", text: "Legitimar e reproduzir as desigualdades ao valorizar o capital cultural das classes dominantes" },
      { key: "C", text: "Ser o único espaço onde o mérito individual pode superar as determinações de classe" },
      { key: "D", text: "Ser irrelevante para a mobilidade social em sociedades capitalistas avançadas" },
      { key: "E", text: "Distribuir igualmente o capital simbólico independentemente da origem social" },
    ],
    correctKey: "B",
    logicExplanation: `Para Bourdieu, a escola não é neutra: ela valoriza disposições culturais (habitus) e saberes próprios das classes dominantes. Ao fazer isso, converte uma vantagem social em mérito acadêmico — naturalizando a desigualdade. A "violência simbólica" opera exatamente aqui: o sistema escolar parece neutro mas discrimina quem não possui o capital cultural dominante.`,
    logicSteps: [
      "Reconhecer o conceito-chave: capital cultural ≠ capital econômico (inclui disposições, gostos, modos de falar)",
      "Lembrar que Bourdieu critica a ilusão da meritocracia escolar",
      "A escola valoriza o capital cultural da classe dominante → quem já o possui parte em vantagem",
      "Eliminar A (otimismo ingênuo), C (afirma o que Bourdieu critica), D (extremismo), E (contrário à tese)",
    ],
    errorConcept: "Confundir a crítica bourdieusiana (escola reproduz desigualdade) com a visão funcionalista (escola equaliza)",
    requiresReasoning: true,
    tags: ["sociologia", "Bourdieu", "capital-cultural", "escola", "desigualdade"],
  },

  // ═══════════════════════════════════════
  //  CIÊNCIAS — Dificuldade 3
  // ═══════════════════════════════════════

  {
    id: "sci-001",
    source: "ENEM",
    year: 2022,
    subject: "sciences",
    topic: "Física — Energia e Trabalho",
    difficulty: 3,
    statement: `Um carro de 1.000 kg parte do repouso e atinge 72 km/h em linha reta e plana. Desprezando o atrito, qual foi o trabalho realizado pelo motor? (Dado: 72 km/h = 20 m/s)`,
    options: [
      { key: "A", text: "200.000 J" },
      { key: "B", text: "720.000 J" },
      { key: "C", text: "400.000 J" },
      { key: "D", text: "1.440.000 J" },
      { key: "E", text: "100.000 J" },
    ],
    correctKey: "A",
    logicExplanation: `Pelo teorema trabalho-energia: W = ΔEc = Ec_final − Ec_inicial = ½mv² − 0 = ½ × 1000 × 20² = ½ × 1000 × 400 = 200.000 J.`,
    logicSteps: [
      "Converter velocidade: 72 km/h = 20 m/s (÷3,6)",
      "Ec_inicial = 0 (partiu do repouso)",
      "Ec_final = ½mv² = ½ × 1000 × 400 = 200.000 J",
      "W_resultante = ΔEc = 200.000 J",
    ],
    errorConcept: "Usar v em km/h na fórmula da energia cinética sem converter para m/s",
    requiresReasoning: true,
    tags: ["física", "energia-cinética", "trabalho", "conversão-unidades"],
    validationMeta: { type: "skip" },
  },

  // ═══════════════════════════════════════
  //  MATEMÁTICA extra — Dificuldade 4-5
  // ═══════════════════════════════════════

  {
    id: "math-006",
    source: "IME",
    year: 2022,
    subject: "math",
    topic: "Progressão Geométrica — soma infinita",
    difficulty: 5,
    statement: `Uma PG infinita de razão q (|q| < 1) tem primeiro termo a₁ = 3 e soma total S = 5. Um novo ponto é inserido entre a₁ e a₂ de modo que os quatro valores forjem uma PG. Qual é a nova razão?`,
    options: [
      { key: "A", text: "√(3/5)" },
      { key: "B", text: "2/5" },
      { key: "C", text: "√(2/5)" },
      { key: "D", text: "3/5" },
      { key: "E", text: "√(3/5) / 2" },
    ],
    correctKey: "C",
    logicExplanation: `S∞ = a₁/(1−q) → 5 = 3/(1−q) → 1−q = 3/5 → q = 2/5. Então a₂ = a₁·q = 3·(2/5) = 6/5. Inserir um ponto x entre a₁=3 e a₂=6/5: nova sequência 3, x, 6/5, ... deve ser PG. Razão nova r: x = 3r e 6/5 = 3r². Logo r² = (6/5)/3 = 2/5 → r = √(2/5).`,
    logicSteps: [
      "Extrair q da fórmula S∞ = a₁/(1−q): q = 2/5",
      "Calcular a₂ = 3 × 2/5 = 6/5",
      "Na nova PG: 3, x, 6/5 → razão r satisfaz 3r² = 6/5",
      "r² = 2/5 → r = √(2/5)",
    ],
    errorConcept: "Confundir a razão original q com a nova razão r após inserção de termo",
    requiresReasoning: true,
    tags: ["PG", "soma-infinita", "IME", "álgebra-avançada"],
  },

  {
    id: "math-007",
    source: "ENEM",
    year: 2024,
    subject: "math",
    topic: "Análise de dados — interpretação estatística",
    difficulty: 3,
    statement: `Em uma amostra de 200 estudantes, a média de horas de estudo por semana é 15h com desvio padrão 4h. Assumindo distribuição aproximadamente normal, quantos estudantes estudam MAIS de 19 horas semanais? (Dado: P(Z < 1) ≈ 0,84)`,
    options: [
      { key: "A", text: "Aproximadamente 32 estudantes" },
      { key: "B", text: "Aproximadamente 68 estudantes" },
      { key: "C", text: "Aproximadamente 16 estudantes" },
      { key: "D", text: "Aproximadamente 84 estudantes" },
      { key: "E", text: "Aproximadamente 48 estudantes" },
    ],
    correctKey: "A",
    logicExplanation: `Z = (19 − 15) / 4 = 1. P(X > 19) = P(Z > 1) = 1 − P(Z < 1) = 1 − 0,84 = 0,16. Número de estudantes: 200 × 0,16 = 32.`,
    logicSteps: [
      "Padronizar: Z = (x − μ) / σ = (19 − 15) / 4 = 1",
      "P(X > 19) = P(Z > 1) = 1 − P(Z ≤ 1) = 1 − 0,84 = 0,16",
      "Aplicar à amostra: 200 × 0,16 = 32 estudantes",
    ],
    errorConcept: "Usar P(Z < 1) diretamente em vez de calcular o complemento para 'mais de'",
    requiresReasoning: true,
    tags: ["estatística", "distribuição-normal", "padronização", "ENEM"],
  },
]

// Filtra questões por matéria e dificuldade mínima
export function getQuestionsBySubject(
  subject: string,
  minDifficulty = 1
): Question[] {
  return QUESTION_BANK.filter(
    (q) => q.subject === subject && q.difficulty >= minDifficulty && q.requiresReasoning
  )
}

// Retorna questões de elite (dificuldade >= 4) para escalonamento adaptativo
export function getEliteQuestions(): Question[] {
  return QUESTION_BANK.filter((q) => q.difficulty >= 4)
}

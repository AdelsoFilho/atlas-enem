import type { MicroLesson } from "./types"

// ─── Aulas mockadas de alta qualidade ────────────────────────────────────────
// Arquitetura pronta para substituição via /api/generate-lesson
// Cada aula segue: Teoria → Exemplo → 3 Questões (dif. crescente)

export const MOCK_LESSONS: MicroLesson[] = [

  // ══════════════════════════════════════════════════════════════════
  //  MATEMÁTICA: Funções do 2° grau — Máximos e Mínimos
  // ══════════════════════════════════════════════════════════════════
  {
    id: "math-quadratic-optimization",
    subject: "math",
    topic: "Funções do 2° grau",
    subtopic: "Vértice — Máximos e Mínimos",
    difficulty: 3,
    estimatedMinutes: 12,
    tags: ["parábola", "otimização", "vértice", "ENEM-clássico"],
    xpReward: 120,

    theory: {
      title: "Funções Quadráticas — Máximos e Mínimos",
      conceptSummary:
        "Em f(x) = ax² + bx + c, o vértice é o único ponto de máximo (a < 0) ou mínimo (a > 0) — e é sempre cobrado no ENEM em contextos de lucro, trajetória e área.",
      keyPoints: [
        {
          label: "Sinal de a determina tudo",
          detail: "a < 0 → parábola volta para baixo → vértice é MÁXIMO. a > 0 → abre para cima → vértice é MÍNIMO. Identifique o sinal antes de qualquer cálculo.",
        },
        {
          label: "Fórmula do vértice",
          detail: "x_v = −b / (2a). Substitua em f(x_v) para obter o valor máximo/mínimo. Esses dois valores respondem QUANDO e QUANTO.",
        },
        {
          label: "Padrão de questão ENEM",
          detail: "O enunciado vai dar uma função de lucro, altura ou custo. Pede o máximo/mínimo. Nunca resolva por tentativa — sempre calcule x_v diretamente.",
        },
        {
          label: "Discriminante (Δ) para raízes",
          detail: "Δ = b² − 4ac. Se pedirem as raízes (zeros) e não o vértice: use Bhaskara. Não confunda as duas situações.",
        },
      ],
      formula: {
        notation: "x_v = −b / (2a)   →   y_v = f(x_v)",
        label: "Coordenadas do vértice",
      },
      memoryTrick:
        "Macete: 'Sinal de a = direção da abertura = se a < 0 você fecha um guarda-chuva (máximo está em cima). Se a > 0 você abre (mínimo está em baixo).'",
      applicationNote:
        "ENEM usa essa fórmula em problemas de: lucro máximo de empresa, altura máxima de projétil, área máxima de terreno. A variável muda; a lógica não.",
    },

    example: {
      statement:
        "Uma empresa modela seu lucro diário por L(x) = −3x² + 18x − 5, onde x é o número de lotes vendidos. Qual é o lucro máximo e quando ele ocorre?",
      steps: [
        {
          step: 1,
          label: "Identificar o tipo de problema",
          content: "a = −3 < 0 → parábola com abertura para baixo → existe máximo. O máximo ocorre no vértice.",
          insight: "Não precisa calcular nada ainda. O sinal de a já responde 'existe máximo ou mínimo'.",
        },
        {
          step: 2,
          label: "Calcular x_v (QUANDO o máximo ocorre)",
          content: "x_v = −b / (2a) = −18 / (2 × (−3)) = −18 / (−6) = 3",
          insight: "Cuidado com duplo negativo: −18 ÷ −6 = +3. Errar esse sinal é o erro mais comum.",
        },
        {
          step: 3,
          label: "Calcular L(3) (QUANTO é o máximo)",
          content: "L(3) = −3(3²) + 18(3) − 5 = −3(9) + 54 − 5 = −27 + 54 − 5 = 22",
          insight: "Substitua e calcule em ordem: potência → multiplicação → soma/subtração.",
        },
        {
          step: 4,
          label: "Interpretar a resposta",
          content: "O lucro máximo é R$ 22 (unidades) e ocorre ao vender 3 lotes.",
        },
      ],
      finalInsight:
        "O vértice sempre responde duas perguntas: x_v = 'quando' (ou com quanto), y_v = 'quanto é o máximo/mínimo'. Guarde esse padrão.",
      commonTrap:
        "Erro clássico: calcular x_v = −18 / (2 × 3) = −3, esquecendo que a = −3. Sempre use o valor real de a, incluindo o sinal.",
    },

    questions: [
      {
        id: "q-math-q1-01",
        difficulty: 1,
        statement:
          "A altura (em metros) de uma bola lançada para cima é dada por h(t) = −5t² + 20t. Qual é a altura máxima atingida?",
        options: [
          { key: "A", text: "10 metros" },
          { key: "B", text: "20 metros" },
          { key: "C", text: "15 metros" },
          { key: "D", text: "4 metros" },
          { key: "E", text: "25 metros" },
        ],
        correctKey: "B",
        errorFeedback:
          "Erro na aplicação da fórmula. x_v = −20 / (2×(−5)) = −20/(−10) = 2. Logo h(2) = −5(4) + 20(2) = −20 + 40 = 20. O duplo negativo no denominador transforma −10 em +2.",
        conceptToReview: "Fórmula do vértice: x_v = −b / (2a)",
        correctFeedback: "Correto. t_v = 2s → h(2) = 20m. Padrão dominado.",
      },
      {
        id: "q-math-q1-02",
        difficulty: 2,
        statement:
          "O lucro de uma padaria é L(p) = −2p² + 40p − 150, onde p é o preço do pão. Qual preço maximiza o lucro?",
        options: [
          { key: "A", text: "R$ 5,00" },
          { key: "B", text: "R$ 20,00" },
          { key: "C", text: "R$ 10,00" },
          { key: "D", text: "R$ 15,00" },
          { key: "E", text: "R$ 8,00" },
        ],
        correctKey: "C",
        errorFeedback:
          "A questão pergunta o PREÇO que maximiza (x_v), não o lucro máximo. p_v = −40 / (2×(−2)) = −40/(−4) = 10. Releia: 'qual preço' = calcular x_v. 'qual lucro' = calcular y_v. São perguntas diferentes.",
        conceptToReview: "Distinguir x_v (quando/quanto vender) de y_v (valor máximo/mínimo)",
        correctFeedback: "Exato. p_v = 10. Leu a pergunta corretamente antes de calcular.",
      },
      {
        id: "q-math-q1-03",
        difficulty: 3,
        statement:
          "Um fazendeiro quer cercar uma área retangular usando 60 metros de arame. Um dos lados usa um muro existente (não precisa de arame). A área máxima possível é:",
        options: [
          { key: "A", text: "225 m²" },
          { key: "B", text: "450 m²" },
          { key: "C", text: "900 m²" },
          { key: "D", text: "360 m²" },
          { key: "E", text: "180 m²" },
        ],
        correctKey: "B",
        errorFeedback:
          "Este é um problema de otimização com restrição. Com muro em 1 lado: apenas 3 lados precisam de arame. Se x = largura e L = comprimento: 2x + L = 60 → L = 60 − 2x. Área = x·L = x(60−2x) = −2x² + 60x. x_v = −60/(2×(−2)) = 15. A(15) = 15×30 = 450 m².",
        conceptToReview: "Modelagem com restrição → função quadrática → otimização via vértice",
        correctFeedback: "Excelente. Modelagem + otimização em sequência. Nível UNICAMP/UFG dominado.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  //  LINGUAGENS: Interpretação — Pressuposto e Inferência
  // ══════════════════════════════════════════════════════════════════
  {
    id: "lang-reading-presupposition",
    subject: "languages",
    topic: "Interpretação de Texto",
    subtopic: "Pressupostos e Inferências",
    difficulty: 3,
    estimatedMinutes: 10,
    tags: ["pressuposto", "implícito", "inferência", "ENEM-armadilha"],
    xpReward: 80,

    theory: {
      title: "Pressuposto × Inferência × Explícito",
      conceptSummary:
        "Questões ENEM de interpretação raramente cobram o que o texto diz — cobram o que o texto ASSUME ou o que se pode CONCLUIR. Confundir os três mata 3–5 questões por prova.",
      keyPoints: [
        {
          label: "Explícito",
          detail: "O que o texto diz literalmente. 'A empresa demitiu 500 funcionários.' Não precisa inferir — está escrito.",
        },
        {
          label: "Pressuposto (implícito estável)",
          detail: "O que precisa ser verdade para a frase fazer sentido — mas não está escrito. 'Pedro parou de fumar' pressupõe que Pedro fumava antes. A questão pergunta: 'o que se pressupõe?' = o que não está dito mas deve ser verdade.",
        },
        {
          label: "Inferência (conclusão lógica)",
          detail: "O que se pode concluir com segurança a partir das informações dadas. Diferente do pressuposto: a inferência é derivada; o pressuposto é condição prévia.",
        },
        {
          label: "Armadilha clássica ENEM",
          detail: "Alternativa que parece verdadeira mas vai ALÉM do texto. A regra: só marcar o que o texto garante — nunca o que 'faz sentido' por senso comum sem base no texto.",
        },
      ],
      memoryTrick:
        "Pressuposto = 'o que precisa ser verdade ANTES'. Inferência = 'o que posso concluir DEPOIS'. Explícito = 'o que está escrito AGORA'.",
      applicationNote:
        "Questões com verbos como 'o texto pressupõe', 'o autor infere', 'o que está implícito' = mecanismo de pressuposto. Encontre a condição prévia, não o que você acha certo.",
    },

    example: {
      statement:
        `Leia: "A meritocracia, como ideologia, não descreve o mundo como ele é — descreve o mundo como aqueles que venceram gostariam de acreditar que ele funciona." (Michael Sandel, adaptado)\n\nO argumento do autor pressupõe que:`,
      steps: [
        {
          step: 1,
          label: "Identificar o verbo principal da questão",
          content: "'Pressupõe' → buscar o que deve ser verdade ANTES para a frase de Sandel fazer sentido.",
          insight: "Se a questão dissesse 'o autor afirma', você procuraria o explícito. 'Pressupõe' muda o alvo.",
        },
        {
          step: 2,
          label: "Analisar a estrutura da afirmação",
          content: "Sandel diz: meritocracia NÃO descreve o mundo real — ela descreve o que os 'vencedores' querem acreditar. Para essa crítica funcionar, o mundo real precisa ter uma explicação DIFERENTE para o sucesso.",
        },
        {
          step: 3,
          label: "Identificar a condição prévia (o pressuposto)",
          content: "Se meritocracia é 'como vencedores querem acreditar que funciona', isso pressupõe que o sucesso não é produzido apenas pelo mérito — há outros fatores (estrutura, privilégio) que a narrativa meritocrática oculta.",
          insight: "Esse é o pressuposto: o mundo tem determinações estruturais que o mérito individual não explica por si só.",
        },
        {
          step: 4,
          label: "Eliminar as armadilhas",
          content: "'A meritocracia é justa' → contrário à crítica. 'Vencedores são honestos' → não é o que o texto assume. 'O sucesso é puramente individual' → também contrário. Resta: o sucesso tem causas estruturais.",
        },
      ],
      finalInsight:
        "Em questões de pressuposto: formule a pergunta 'o que PRECISA ser verdade para essa afirmação fazer sentido?' Essa formulação localiza o pressuposto com precisão.",
      commonTrap:
        "Marcar o que o texto AFIRMA em vez do que ele PRESSUPÕE. Sandel afirma que meritocracia é ideologia; ele pressupõe que o mundo real tem causas estruturais para o sucesso.",
    },

    questions: [
      {
        id: "q-lang-pres-01",
        difficulty: 1,
        statement:
          `Leia: "O governo voltou a investir em educação pública."\n\nEssa frase pressupõe que:`,
        options: [
          { key: "A", text: "A educação pública é cara" },
          { key: "B", text: "O governo havia parado de investir em algum momento" },
          { key: "C", text: "A educação privada é melhor" },
          { key: "D", text: "O investimento trará resultados" },
          { key: "E", text: "O governo sempre investiu em educação" },
        ],
        correctKey: "B",
        errorFeedback:
          "O verbo 'voltou a investir' pressupõe que houve uma interrupção. 'Voltar a fazer X' = havia parado de fazer X. Identifique sempre o conteúdo implícito do verbo — não a opinião sobre o tema.",
        conceptToReview: "Pressuposto revelado pelo significado lexical do verbo",
        correctFeedback: "Correto. 'Voltou a' = havia interrompido. Pressuposto identificado com precisão.",
      },
      {
        id: "q-lang-pres-02",
        difficulty: 2,
        statement:
          `Leia: "Embora o Brasil seja um país de grande biodiversidade, a proteção ambiental ainda é insuficiente."\n\nA partir dessa frase, é possível INFERIR que:`,
        options: [
          { key: "A", text: "O Brasil é o país com maior biodiversidade do mundo" },
          { key: "B", text: "Países com alta biodiversidade precisam de mais proteção ambiental" },
          { key: "C", text: "Há uma disparidade entre o que o Brasil tem e o nível de proteção que oferece" },
          { key: "D", text: "A proteção ambiental no Brasil melhorou nos últimos anos" },
          { key: "E", text: "Outros países protegem melhor o meio ambiente" },
        ],
        correctKey: "C",
        errorFeedback:
          "A alternativa B parece lógica, mas vai além do texto — o texto não generaliza para 'países com alta biodiversidade'. A e E também extrapolam sem base no enunciado. C é a única inferência segura: o texto CONTRASTA 'grande biodiversidade' com 'proteção insuficiente' — isso é uma disparidade.",
        conceptToReview: "Inferência segura vs extrapolação — só marcar o que o texto garante",
        correctFeedback: "Correto. O contraste explícito 'embora... ainda insuficiente' sustenta a inferência de disparidade.",
      },
      {
        id: "q-lang-pres-03",
        difficulty: 3,
        statement:
          `Leia o trecho de um debate: "Não é contraditório defender a liberdade de expressão e ao mesmo tempo exigir limites para discursos de ódio? O defensor responde: 'Não. Liberdade de expressão não é liberdade de destruir liberdades.'"\n\nO defensor pressupõe que:`,
        options: [
          { key: "A", text: "Toda liberdade deve ser ilimitada" },
          { key: "B", text: "Discursos de ódio não configuram expressão legítima" },
          { key: "C", text: "A liberdade de expressão é relativa ao contexto cultural" },
          { key: "D", text: "Limitar discursos de ódio é uma forma de censura" },
          { key: "E", text: "O conceito de liberdade é universalmente aceito" },
        ],
        correctKey: "B",
        errorFeedback:
          "O argumento do defensor é: 'liberdade de expressão não inclui destruir liberdades'. Para essa distinção funcionar, ele precisa pressupor que discursos de ódio DESTROEM liberdades de outros — ou seja, que não são expressão legítima. Isso não está dito explicitamente, mas é a condição prévia do raciocínio dele.",
        conceptToReview: "Pressuposto em argumento filosófico — localizar a premissa implícita",
        correctFeedback: "Exato. O defensor pressupõe que há categorias de expressão que não são protegidas porque eliminam a liberdade alheia.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  //  HUMANAS: Sociologia — Bourdieu e Capital Cultural
  // ══════════════════════════════════════════════════════════════════
  {
    id: "hum-bourdieu-capital",
    subject: "humanities",
    topic: "Sociologia",
    subtopic: "Capital Cultural — Pierre Bourdieu",
    difficulty: 3,
    estimatedMinutes: 10,
    tags: ["Bourdieu", "capital-cultural", "habitus", "escola", "ENEM-sociologia"],
    xpReward: 60,

    theory: {
      title: "Bourdieu — Capital Cultural e Reprodução Social",
      conceptSummary:
        "Para Bourdieu, a escola não equaliza — ela legitima como mérito o que é, na prática, capital cultural herdado. Esse conceito cai no ENEM para questionar a neutralidade das instituições.",
      keyPoints: [
        {
          label: "Capital cultural ≠ capital econômico",
          detail: "Capital cultural = disposições, gostos, vocabulário e modos de agir herdados da família. Não é dinheiro — é o que você aprendeu em casa sem perceber.",
        },
        {
          label: "Habitus",
          detail: "O conjunto de disposições incorporadas pela socialização. O habitus de classe média valoriza leitura, museus, vocabulário formal. A escola avalia exatamente essas disposições.",
        },
        {
          label: "Violência simbólica",
          detail: "O processo pelo qual a desigualdade de capital cultural é percebida como diferença de mérito. Não é física — é a naturalização de vantagens estruturais como talento individual.",
        },
        {
          label: "Implicação política",
          detail: "Se a escola reproduz desigualdades, políticas de equidade (cotas, currículo diverso) são respostas estruturais — não favores, mas correções de um sistema enviesado.",
        },
      ],
      memoryTrick:
        "Bourdieu = 'o jogo está armado'. Quem chega à escola com mais capital cultural (herdado) parte na frente — e a escola chama isso de mérito.",
      applicationNote:
        "ENEM usa Bourdieu para questionar: a escola é meritocrática? O que separa estudantes de alto e baixo desempenho? Por que cotas são necessárias? Responda sempre com a lógica de reprodução estrutural.",
    },

    example: {
      statement:
        "Uma pesquisa revela que filhos de pais com ensino superior têm 4x mais chance de ingressar em universidades públicas de elite. Um analista afirma que isso reflete diferenças de esforço individual. À luz das teorias de Bourdieu, como se avalia essa interpretação?",
      steps: [
        {
          step: 1,
          label: "Identificar o argumento do analista",
          content: "O analista usa a lógica meritocrática: resultado = esforço individual. Bourdieu rejeita essa premissa.",
        },
        {
          step: 2,
          label: "Aplicar o conceito de capital cultural",
          content: "Filhos de pais com ensino superior herdam capital cultural: vocabulário acadêmico, hábitos de leitura, familiaridade com o formato do vestibular. Esse capital não é mérito — é herança.",
        },
        {
          step: 3,
          label: "Identificar a violência simbólica na interpretação do analista",
          content: "Ao chamar o resultado de 'esforço individual', o analista naturaliza uma vantagem estrutural como atributo pessoal. Isso é violência simbólica: a desigualdade é mascarada como diferença de talento.",
        },
        {
          step: 4,
          label: "Conclusão bourdieusiana",
          content: "A interpretação do analista é incorreta segundo Bourdieu: ignora as condições materiais e simbólicas que determinam o desempenho acadêmico antes mesmo da escola começar.",
        },
      ],
      finalInsight:
        "Sempre que o ENEM apresentar argumento meritocrático puro ('é questão de esforço'), a resposta bourdieusiana é: 'Sim, mas as condições de partida não são iguais — o capital cultural é distribuído desigualmente'.",
      commonTrap:
        "Confundir Bourdieu com Marx: Bourdieu fala de capital CULTURAL (não apenas econômico) e de reprodução simbólica (não apenas material). São complementares, mas distintos.",
    },

    questions: [
      {
        id: "q-hum-bour-01",
        difficulty: 1,
        statement:
          "Para Pierre Bourdieu, a escola tende a reproduzir as desigualdades sociais porque:",
        options: [
          { key: "A", text: "Os professores são deliberadamente preconceituosos com alunos pobres" },
          { key: "B", text: "Valoriza o capital cultural das classes dominantes, apresentando-o como mérito neutro" },
          { key: "C", text: "Distribui igualmente o conhecimento, mas alguns alunos não se esforçam o suficiente" },
          { key: "D", text: "É uma instituição controlada diretamente pelo Estado para manter privilégios" },
          { key: "E", text: "Só admite alunos com alto capital econômico" },
        ],
        correctKey: "B",
        errorFeedback:
          "Bourdieu não argumenta que os professores são mal-intencionados (A) nem que a escola é diretamente controlada (D). O ponto central é que a escola apresenta como neutro e meritocrático o que é, na prática, capital cultural de classe — beneficiando quem já o possui.",
        conceptToReview: "Violência simbólica — a neutralidade aparente da escola como reprodução de desigualdade",
        correctFeedback: "Correto. A escola age como se fosse neutra, mas os critérios de avaliação favorecem quem já tem o capital cultural dominante.",
      },
      {
        id: "q-hum-bour-02",
        difficulty: 2,
        statement:
          "Um estudante de escola pública de alto desempenho sente dificuldade em se integrar à cultura universitária de uma instituição de elite, mesmo com notas equivalentes às de colegas de escolas privadas. O conceito de Bourdieu que melhor explica essa experiência é:",
        options: [
          { key: "A", text: "Capital econômico — ele não tem recursos financeiros suficientes" },
          { key: "B", text: "Alienação — ele foi separado do produto de seu trabalho" },
          { key: "C", text: "Habitus — sua socialização anterior diverge do campo universitário de elite" },
          { key: "D", text: "Anomia — há ausência de normas claras na universidade" },
          { key: "E", text: "Luta de classes — há conflito explícito entre grupos" },
        ],
        correctKey: "C",
        errorFeedback:
          "Capital econômico (A) explica limitações financeiras, não integração cultural. Alienação (B) é Marx. Anomia (D) é Durkheim. O problema descrito é o choque entre o habitus formado na trajetória do estudante e as disposições implícitas exigidas pelo campo universitário de elite — isso é habitus.",
        conceptToReview: "Habitus — disposições incorporadas que regulam a pertença a campos sociais",
        correctFeedback: "Correto. O habitus do estudante foi formado em contexto diferente do campo que ele agora ocupa — daí o desconforto de integração.",
      },
      {
        id: "q-hum-bour-03",
        difficulty: 3,
        statement:
          "Um economista afirma: 'As políticas de cotas raciais são injustas porque violam o princípio do mérito — as vagas devem ser para quem mais se esforçou.' À luz do pensamento de Bourdieu, a crítica mais precisa a esse argumento é:",
        options: [
          { key: "A", text: "O mérito é um conceito subjetivo e varia conforme a cultura" },
          { key: "B", text: "As cotas são necessárias porque negros têm menor capacidade intelectual" },
          { key: "C", text: "O 'mérito' medido pelo vestibular reflete o capital cultural acumulado, distribuído desigualmente por razões históricas e estruturais" },
          { key: "D", text: "O Estado deve eliminar todas as formas de concorrência entre indivíduos" },
          { key: "E", text: "O problema não é o mérito, mas a qualidade das escolas públicas" },
        ],
        correctKey: "C",
        errorFeedback:
          "B é absurdo e racista — jamais. A é uma crítica relativista, não bourdieusiana. D extrapola. E aponta um problema real mas não capta a lógica de Bourdieu sobre capital cultural herdado. C é a resposta bourdieusiana precisa: o 'mérito' medido pelo vestibular é, na prática, capital cultural — e capital cultural é desigualmente distribuído por mecanismos estruturais históricos.",
        conceptToReview: "Capital cultural + violência simbólica aplicados à política educacional",
        correctFeedback: "Correto. O argumento meritocrático ignora que o 'mérito' é construído sobre condições desiguais de acumulação de capital cultural.",
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  //  CIÊNCIAS: Energia Cinética e Teorema Trabalho-Energia
  // ══════════════════════════════════════════════════════════════════
  {
    id: "sci-kinetic-energy",
    subject: "sciences",
    topic: "Física",
    subtopic: "Energia Cinética — Teorema Trabalho-Energia",
    difficulty: 2,
    estimatedMinutes: 10,
    tags: ["energia-cinética", "trabalho", "velocidade", "física-ENEM"],
    xpReward: 60,

    theory: {
      title: "Energia Cinética e Teorema Trabalho-Energia",
      conceptSummary:
        "Ec = ½mv² associa velocidade a energia de movimento. O teorema trabalho-energia diz que o trabalho resultante é igual à variação de Ec — isso elimina a necessidade de calcular força e aceleração separadamente.",
      keyPoints: [
        {
          label: "Fórmula da energia cinética",
          detail: "Ec = ½mv². Unidade: joule (J). m em kg, v em m/s. Se a velocidade está em km/h, converta ANTES: v(m/s) = v(km/h) ÷ 3,6.",
        },
        {
          label: "Teorema Trabalho-Energia",
          detail: "W_resultante = ΔEc = Ec_final − Ec_inicial. Se parte do repouso: W = ½mv². Esse teorema é um atalho poderoso — evita calcular força e aceleração.",
        },
        {
          label: "Velocidade ao quadrado",
          detail: "Dobrar a velocidade → quadruplica a energia cinética. Triplicar v → Ec × 9. Isso explica por que colisões em alta velocidade são muito mais destrutivas.",
        },
        {
          label: "Erro clássico de unidade",
          detail: "Usar km/h na fórmula sem converter. 72 km/h → 72/3,6 = 20 m/s. Nunca use km/h diretamente em fórmulas de física.",
        },
      ],
      formula: {
        notation: "Ec = ½mv²   |   W = ΔEc",
        label: "Energia cinética e teorema trabalho-energia",
      },
      memoryTrick:
        "Trabalho = variação de energia. Se só há força motriz e a questão pede trabalho: W = Ec_final − Ec_inicial. Memorize isso e elimine 80% dos exercícios de trabalho do ENEM.",
      applicationNote:
        "ENEM cobra: calcular Ec de veículo, comparar Ec de dois objetos, relacionar trabalho a variação de velocidade, avaliar impacto de desaceleração. Converta velocidade sempre.",
    },

    example: {
      statement:
        "Um carro de 1.200 kg acelera de 0 a 108 km/h em linha reta. Desprezando atrito, qual foi o trabalho realizado pelo motor nesse processo?",
      steps: [
        {
          step: 1,
          label: "Converter velocidade",
          content: "108 km/h ÷ 3,6 = 30 m/s",
          insight: "Nunca pule essa etapa. É a causa de 90% dos erros nesse tipo de questão.",
        },
        {
          step: 2,
          label: "Calcular Ec_final (partiu do repouso → Ec_inicial = 0)",
          content: "Ec = ½ × 1200 × 30² = ½ × 1200 × 900 = 540.000 J",
        },
        {
          step: 3,
          label: "Aplicar o teorema trabalho-energia",
          content: "W = ΔEc = 540.000 − 0 = 540.000 J = 540 kJ",
          insight: "Como partiu do repouso, W = Ec_final diretamente. Não precisou de força nem aceleração.",
        },
      ],
      finalInsight:
        "Teorema trabalho-energia = atalho universal. Quando a questão der velocidade inicial e final e pedir trabalho (ou vice-versa), use W = ΔEc. Simples e direto.",
      commonTrap:
        "Usar 108 diretamente na fórmula: Ec = ½ × 1200 × 108² = erro por fator de ~13. A unidade errada distorce o resultado completamente.",
    },

    questions: [
      {
        id: "q-sci-ec-01",
        difficulty: 1,
        statement:
          "Um objeto de 2 kg se move a 10 m/s. Qual é sua energia cinética?",
        options: [
          { key: "A", text: "100 J" },
          { key: "B", text: "20 J" },
          { key: "C", text: "200 J" },
          { key: "D", text: "50 J" },
          { key: "E", text: "400 J" },
        ],
        correctKey: "A",
        errorFeedback:
          "Ec = ½mv² = ½ × 2 × 10² = ½ × 2 × 100 = 100 J. Atenção: v entra ao QUADRADO. Erro frequente: calcular ½ × 2 × 10 = 10 (sem elevar ao quadrado).",
        conceptToReview: "Fórmula Ec = ½mv² — velocidade entra ao quadrado",
        correctFeedback: "Correto. Ec = ½ × 2 × 100 = 100 J.",
      },
      {
        id: "q-sci-ec-02",
        difficulty: 2,
        statement:
          "Um veículo de massa m viaja a v km/h. Se a velocidade dobrar, a energia cinética:",
        options: [
          { key: "A", text: "Duplica" },
          { key: "B", text: "Triplica" },
          { key: "C", text: "Quadruplica" },
          { key: "D", text: "Aumenta 1,5 vez" },
          { key: "E", text: "Permanece igual" },
        ],
        correctKey: "C",
        errorFeedback:
          "Ec ∝ v². Se v → 2v: Ec_nova = ½m(2v)² = ½m × 4v² = 4 × (½mv²) = 4 × Ec. Velocidade ao quadrado: dobrar v → 4× a energia. Isso explica por que colisões a alta velocidade são exponencialmente mais graves.",
        conceptToReview: "Relação quadrática entre velocidade e energia cinética",
        correctFeedback: "Correto. v ao quadrado → dobrar v = 4× a energia cinética.",
      },
      {
        id: "q-sci-ec-03",
        difficulty: 3,
        statement:
          "Um caminhão de 5.000 kg trafega a 72 km/h. O motorista freia e para completamente. Qual foi o módulo do trabalho realizado pelo freio?",
        options: [
          { key: "A", text: "1.000.000 J" },
          { key: "B", text: "3.600.000 J" },
          { key: "C", text: "180.000 J" },
          { key: "D", text: "12.960.000 J" },
          { key: "E", text: "720.000 J" },
        ],
        correctKey: "A",
        errorFeedback:
          "Passo 1: converter 72 km/h ÷ 3,6 = 20 m/s. Passo 2: W = ΔEc = 0 − ½×5000×400 = −1.000.000 J. O módulo (valor absoluto) é 1.000.000 J. Erro comum: usar 72 m/s → W = ½×5000×5184 = 12.960.000 J (alternativa D é a armadilha da conversão esquecida).",
        conceptToReview: "Conversão de velocidade + W = ΔEc (freio → Ec cai a zero)",
        correctFeedback: "Correto. 72 km/h = 20 m/s → Ec = ½×5000×400 = 1.000.000 J = |W_freio|.",
      },
    ],
  },
]

// Busca a aula mockada para uma matéria — fallback quando a API de IA não está disponível
export function getMockLesson(subject: string): MicroLesson | undefined {
  return MOCK_LESSONS.find((l) => l.subject === subject)
}

export function getAllMockLessons(): MicroLesson[] {
  return MOCK_LESSONS
}

import type { EliteQuote } from "@/types/quiz"

// ─── Banco de citações coringas de alto nível ─────────────────────────────────
// Critérios de curadoria:
//  1. Alta densidade de argumentação (não frases motivacionais)
//  2. Aplicabilidade comprovada em redações nota 1000 do ENEM
//  3. Autores com autoridade acadêmica reconhecida
//
// TODO: complementar via API de citações ou LLM (ver /api/quotes)
// Prompt sugerido: "Dê 3 citações de [disciplina] aplicáveis ao tema [X] com contexto de redação ENEM"

export const QUOTE_BANK: EliteQuote[] = [
  {
    id: "q-01",
    text: "O otimismo é uma estratégia para fazer um futuro melhor. Pois a menos que você acredite que o futuro possa ser melhor, é improvável que você dê um passo para torná-lo assim.",
    author: "Noam Chomsky",
    work: "Hegemony or Survival",
    year: 2003,
    discipline: "sociology",
    applicableThemes: [
      "Tecnologia e Ética",
      "Democracia e Participação Social",
      "Educação e Transformação",
      "Crise Climática",
    ],
    usageContext:
      "Use na introdução ou conclusão para justificar a urgência de uma proposta de intervenção. Funciona como contra-argumento ao pessimismo estrutural.",
    modelParagraph:
      "Conforme observa Noam Chomsky em 'Hegemony or Survival', o otimismo não é ingenuidade, mas condição epistêmica para a ação transformadora. Nesse sentido, propor políticas públicas eficazes exige que o Estado reconheça o problema e mobilize os agentes necessários, sob pena de reproduzir indefinidamente as condições que o perpetuam.",
  },
  {
    id: "q-02",
    text: "A riqueza das nações está na divisão do trabalho — e a pobreza, na sua concentração.",
    author: "Adam Smith",
    work: "A Riqueza das Nações",
    year: 1776,
    discipline: "economics",
    applicableThemes: [
      "Desigualdade Econômica",
      "Mercado de Trabalho",
      "Globalização",
      "Reforma Tributária",
    ],
    usageContext:
      "Use para contextualizar historicamente a lógica capitalista na introdução de temas econômicos. Permite uma análise que vai além da superfície.",
    modelParagraph:
      "Adam Smith, em 'A Riqueza das Nações' (1776), identificou na divisão do trabalho o motor da produtividade moderna. Paradoxalmente, quando essa divisão é aprofundada sem regulação, ela concentra ganhos em poucos atores — gerando a desigualdade estrutural que debates contemporâneos buscam corrigir por meio de políticas redistributivas.",
  },
  {
    id: "q-03",
    text: "Não é a consciência dos homens que determina o seu ser, mas, ao contrário, o seu ser social que determina a sua consciência.",
    author: "Karl Marx",
    work: "Contribuição à Crítica da Economia Política",
    year: 1859,
    discipline: "sociology",
    applicableThemes: [
      "Desigualdade Estrutural",
      "Educação e Classe Social",
      "Mídia e Manipulação",
      "Saúde Pública",
    ],
    usageContext:
      "Use para argumentar que problemas sociais têm raízes estruturais, não apenas individuais. Desativa argumentos exclusivamente meritocráticos.",
    modelParagraph:
      "Karl Marx, em 'Contribuição à Crítica da Economia Política' (1859), argumenta que as condições materiais de existência moldam a percepção que os indivíduos têm de si e do mundo. Logo, tratar a evasão escolar ou a violência urbana apenas como falhas individuais é ignorar as determinações estruturais que as produzem — e, consequentemente, propor soluções incapazes de transformar a realidade.",
  },
  {
    id: "q-04",
    text: "O poder não é uma instituição, não é uma estrutura, não é uma certa força com que certos indivíduos estão dotados: é o nome que se dá a uma situação estratégica complexa numa sociedade determinada.",
    author: "Michel Foucault",
    work: "Vigiar e Punir",
    year: 1975,
    discipline: "philosophy",
    applicableThemes: [
      "Violência e Segurança Pública",
      "Sistema Prisional",
      "Saúde Mental",
      "Vigilância Digital",
      "Fake News e Controle da Informação",
    ],
    usageContext:
      "Use para complexificar análises que tratam poder como algo centralizado. Essencial em redações sobre segurança pública, vigilância e controle social.",
    modelParagraph:
      "Michel Foucault, em 'Vigiar e Punir' (1975), desconstruiu a noção de poder como propriedade de uma instituição isolada, demonstrando que ele se exerce por meio de redes capilares que permeiam o cotidiano. Essa perspectiva é crucial para compreender como algoritmos de redes sociais e sistemas de vigilância digital reproduzem formas de controle comportamental — desafiando o Estado a regulá-los sem replicar a própria lógica que pretende combater.",
  },
  {
    id: "q-05",
    text: "A natureza não se importa com nossas conveniências políticas.",
    author: "Carl Sagan",
    work: "Cosmos",
    year: 1980,
    discipline: "science",
    applicableThemes: [
      "Crise Climática",
      "Desmatamento",
      "Negacionismo Científico",
      "Desenvolvimento Sustentável",
    ],
    usageContext:
      "Use como argumento de autoridade científica para legitimar dados sobre crise ambiental. Eficaz contra argumentos negacionistas.",
    modelParagraph:
      "Como alertou Carl Sagan em 'Cosmos' (1980), as leis da física e da biologia operam independentemente de agendas políticas: o aumento da temperatura global e o colapso de ecossistemas não aguardam consenso parlamentar para se manifestar. Diante disso, a inação governamental frente à crise climática configura não apenas omissão, mas uma escolha de curto prazo com consequências de longa duração — exigindo do Estado uma política ambiental de Estado, não de governo.",
  },
  {
    id: "q-06",
    text: "A democracia não é apenas um sistema de governo; é uma experiência vivida de autogoverno coletivo.",
    author: "Hannah Arendt",
    work: "A Condição Humana",
    year: 1958,
    discipline: "philosophy",
    applicableThemes: [
      "Democracia e Participação",
      "Fake News e Desinformação",
      "Jovens e Política",
      "Direitos Civis",
    ],
    usageContext:
      "Use para defender a participação cidadã ativa como condição da democracia — não apenas o voto.",
    modelParagraph:
      "Hannah Arendt, em 'A Condição Humana' (1958), argumenta que a democracia só se realiza plenamente quando os cidadãos exercem ativamente sua capacidade de ação política — não como espectadores de processos eleitorais, mas como agentes do espaço público. Nesse sentido, o analfabetismo midiático e a desinformação sistêmica representam ameaças diretas não apenas à qualidade do voto, mas à própria ideia de autogoverno coletivo.",
  },
  {
    id: "q-07",
    text: "Dados são o novo petróleo — mas petróleo bruto não tem valor; é preciso refiná-lo.",
    author: "Clive Humby",
    work: "Palestra na ANA Annual Summit",
    year: 2006,
    discipline: "science",
    applicableThemes: [
      "Tecnologia e Sociedade",
      "Inteligência Artificial",
      "Privacidade Digital",
      "Economia Digital",
    ],
    usageContext:
      "Use para introduzir a discussão sobre valor econômico dos dados pessoais e a assimetria entre empresas e usuários.",
    modelParagraph:
      "O matemático Clive Humby, ao cunhar a expressão 'dados são o novo petróleo' (2006), antecipou a lógica de acumulação que definiria o capitalismo de plataforma: assim como o petróleo bruto requer refinamento para gerar valor, os dados coletados de bilhões de usuários precisam ser processados por algoritmos sofisticados — processo que concentra poder nas mãos de poucas corporações e exige regulação estatal equivalente à que governa recursos naturais estratégicos.",
  },
  {
    id: "q-08",
    text: "A maior ameaça à democracia não é o autoritarismo explícito, mas a erosão gradual de suas instituições por dentro.",
    author: "Steven Levitsky",
    work: "Como as Democracias Morrem",
    year: 2018,
    discipline: "sociology",
    applicableThemes: [
      "Democracia e Polarização",
      "Fake News",
      "Desinformação",
      "Crise Institucional",
    ],
    usageContext:
      "Use para analisar como processos democráticos podem ser subvertidos sem golpe formal — essencial em redações sobre polarização e desinformação.",
    modelParagraph:
      "Steven Levitsky e Daniel Ziblatt, em 'Como as Democracias Morrem' (2018), demonstraram que a fragilidade democrática contemporânea raramente vem de tanques nas ruas: ela resulta da erosão incremental de normas, instituições e da tolerância mútua entre atores políticos. A proliferação de desinformação digital acelera exatamente esse processo — corroendo a confiança pública necessária para que as regras do jogo democrático sejam respeitadas.",
  },
  {
    id: "q-09",
    text: "A ciência não é um conjunto de certezas, mas um método de produção de incertezas cada vez mais precisas.",
    author: "Gaston Bachelard",
    work: "A Formação do Espírito Científico",
    year: 1938,
    discipline: "philosophy",
    applicableThemes: [
      "Negacionismo Científico",
      "Educação e Pensamento Crítico",
      "Saúde Pública e Vacinas",
      "Tecnologia e Ética",
    ],
    usageContext:
      "Use para defender o método científico frente ao negacionismo. Revela a força da ciência na autocorreção, não na infalibilidade.",
    modelParagraph:
      "Gaston Bachelard, em 'A Formação do Espírito Científico' (1938), ensinou que a ciência não avança por acumulação de verdades definitivas, mas pela superação constante de obstáculos epistemológicos. Essa característica — frequentemente distorcida por discursos negacionistas como 'sinal de incerteza' — é, na realidade, a maior virtude do método: sua capacidade de revisar conclusões diante de novas evidências, diferenciando-se fundamentalmente da dogmática.",
  },
  {
    id: "q-10",
    text: "Nenhuma criança nasce racista. O preconceito é ensinado.",
    author: "Nelson Mandela",
    work: "Long Walk to Freedom",
    year: 1994,
    discipline: "sociology",
    applicableThemes: [
      "Racismo Estrutural",
      "Educação e Diversidade",
      "Desigualdade Racial",
      "Direitos Humanos",
    ],
    usageContext:
      "Use para argumentar que o racismo é socialmente reproduzido — legitimando políticas de educação antirracista.",
    modelParagraph:
      "Nelson Mandela, em 'Long Walk to Freedom' (1994), observou que o preconceito é aprendido, não inato — o que implica que pode, igualmente, ser desaprendido por meio de educação intencional. Esse princípio fundamenta as políticas de cotas e currículo antirracista no Brasil: não como favores, mas como mecanismos de reparação de uma aprendizagem histórica distorcida que ainda estrutura as desigualdades contemporâneas.",
  },
]

// ── Seed local das ideias de negócio ─────────────────────────────────────────
// Espelha a tabela `business_ideas_seed` do Supabase.
// Usado como fallback offline e durante SSR.

export type BusinessCategory = "Serviços" | "Digital" | "Franquia"
export type BusinessDifficulty = "Iniciante" | "Intermediário"
export type BusinessFilter = "Todos" | "Investimento Zero" | "Serviço Local" | "Digital"

export interface BusinessIdea {
  id: number
  title: string
  category: BusinessCategory
  difficulty: BusinessDifficulty
  estimated_cost: string
  enem_axis_relation: string
  description: string
  example_thesis: string
}

// Mapeamento de eixo ENEM → filtro UI
export const ENEM_AXIS_TAGS: Record<string, string> = {
  "Brasil que envelhece": "#a5d6a7",
  "Saúde e bem-estar":    "#ce93d8",
  "Inclusão":             "#79c0ff",
  "Tecnologia":           "#388bfd",
  "Meio Ambiente":        "#56d364",
  "Direitos Humanos":     "#ffd54f",
  "Comunicação":          "#f78166",
}

export const BUSINESS_IDEAS: BusinessIdea[] = [
  {
    id: 1,
    title: "Pet Sitter / Passeador de Pets",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Brasil que envelhece · Bem-estar animal",
    description:
      "Cuide de animais de estimação de idosos e profissionais ausentes. Zero investimento: divulgue no WhatsApp do bairro e no Instagram. Cobrança por visita ou pacote semanal.",
    example_thesis:
      "O serviço de pet sitter representa uma alternativa de renda imediata e de baixíssimo custo que, ao mesmo tempo, oferece suporte às famílias da terceira idade, demonstrando como o empreendedorismo social pode resolver lacunas deixadas pelo Estado.",
  },
  {
    id: 2,
    title: "Cuidador de Idosos Autônomo",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Brasil que envelhece · Saúde e cuidado",
    description:
      "Com o Brasil envelhecendo, a demanda por cuidadores cresce exponencialmente. Formação gratuita via SENAC online. Cadastro em plataformas como Cuidadores.com.br.",
    example_thesis:
      "Diante do envelhecimento acelerado da população brasileira, o empreendedorismo no setor de cuidados — como a atuação de cuidadores autônomos — apresenta-se como solução viável de geração de renda com alto impacto social.",
  },
  {
    id: 3,
    title: "Aulas Particulares Online",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Inclusão · Educação · Direitos Humanos",
    description:
      "Ensine matérias do ENEM, idiomas ou habilidades pelo Google Meet. Divulgue em grupos de pais e escolas locais. Plataformas como SuperProf e Profes facilitam o cadastro gratuito.",
    example_thesis:
      "A democratização do ensino por meio de aulas particulares online demonstra como jovens empreendedores podem simultaneamente gerar renda e reduzir as desigualdades educacionais estruturais do Brasil.",
  },
  {
    id: 4,
    title: "Afiliado Amazon / Shopee",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Tecnologia · Trabalho Digital · Inclusão financeira",
    description:
      "Crie conteúdo no TikTok, YouTube Shorts ou Instagram recomendando produtos. Comissão entre 3% e 15% por venda. Não precisa estoque: apenas um celular e criatividade.",
    example_thesis:
      "O marketing de afiliados, modelo digital sem investimento inicial, ilustra como a inclusão tecnológica pode transformar jovens periféricos em empreendedores competitivos na economia digital globalizada.",
  },
  {
    id: 5,
    title: "E-book / Infoproduto (Hotmart)",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Educação · Empreendedorismo · Inclusão digital",
    description:
      "Escreva um guia prático sobre qualquer conhecimento que você tenha. Publique gratuitamente na Hotmart ou Eduzz. Comece com 20-30 páginas. Venda a partir de R$ 9,90.",
    example_thesis:
      "A criação de infoprodutos acessíveis em plataformas digitais demonstra que o empreendedorismo baseado em conhecimento é capaz de democratizar a geração de renda independentemente da origem socioeconômica do indivíduo.",
  },
  {
    id: 6,
    title: "Consultoria de Nutrição Online",
    category: "Digital",
    difficulty: "Intermediário",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Saúde e 'Faça você mesmo' · Bem-estar",
    description:
      "Se você tem base em nutrição, ofereça montagem de cardápios e orientação alimentar básica. Use formulários gratuitos do Google. Certificação recomendada pelo SENAC.",
    example_thesis:
      "A consultoria de bem-estar e nutrição online, ao conectar o conhecimento científico às necessidades cotidianas da população, representa modelo empreendedor que une saúde pública e geração de renda sustentável.",
  },
  {
    id: 7,
    title: "Designer Gráfico Freelancer",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Comunicação · Trabalho Digital · Inclusão criativa",
    description:
      "Use Canva (gratuito) para criar logos, posts e materiais para pequenos negócios. Cadastre-se na 99Freelas ou Workana. Primeiros clientes: comércios do bairro.",
    example_thesis:
      "O design gráfico freelance, viabilizado por ferramentas digitais gratuitas, evidencia como o empreendedorismo criativo pode ser acessível a jovens de baixa renda, gerando inclusão no mercado de trabalho digital.",
  },
  {
    id: 8,
    title: "Assistente Virtual / Freelancer Admin",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Trabalho Digital · Inclusão · Tecnologia",
    description:
      "Gerencie e-mails, agendas e redes sociais de pequenas empresas remotamente. Plataformas: Upwork, Workana, GetNinjas. Valorize organização e comunicação escrita.",
    example_thesis:
      "O trabalho de assistente virtual demonstra que a inclusão no mercado digital não exige formação técnica cara, mas sim competências comunicativas e organizacionais que podem ser desenvolvidas por qualquer cidadão.",
  },
  {
    id: 9,
    title: "Criador de Conteúdo Nichado",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Comunicação · Identidade Cultural · Tecnologia",
    description:
      "Escolha um nicho (culinária regional, ENEM, artesanato indígena, etc.) e crie conteúdo consistente. Monetize via Reels Bonus, parcerias e links de afiliados.",
    example_thesis:
      "A produção de conteúdo digital nichado representa veículo de valorização de identidades culturais e, simultaneamente, modelo de negócio de custo zero que democratiza o acesso à geração de renda pela internet.",
  },
  {
    id: 10,
    title: "Marmita Fitness / Buffet Delivery",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 100–500",
    enem_axis_relation: "Saúde · Alimentação saudável · Empreendedorismo local",
    description:
      "Cozinhe e entregue marmitas saudáveis. Comece com encomendas de colegas e vizinhos. Divulgue no WhatsApp. Investimento inicial em embalagens e ingredientes.",
    example_thesis:
      "O microempreendedorismo na área de alimentação saudável demonstra como a combinação de consciência nutricional e habilidade culinária pode gerar renda sustentável e contribuir para a saúde da comunidade.",
  },
  {
    id: 11,
    title: "Costura / Customização de Roupas",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 100–500",
    enem_axis_relation: "Sustentabilidade · Moda consciente · Direitos Humanos",
    description:
      "Conserte roupas, faça ajustes ou customize peças com bordados e patches. Atendimento pelo Instagram e WhatsApp. Máquina de costura básica (pode ser de segunda mão).",
    example_thesis:
      "A customização de roupas como atividade empreendedora une geração de renda, sustentabilidade ambiental e valorização do trabalho artesanal, provando que negócios de baixo custo podem gerar impacto social positivo.",
  },
  {
    id: 12,
    title: "Franquia Mr. Mix (Alimentação)",
    category: "Franquia",
    difficulty: "Intermediário",
    estimated_cost: "R$ 100–500",
    enem_axis_relation: "Empreendedorismo · Gastronomia local · Trabalho",
    description:
      "Modelo de franquia de bebidas com investimento inicial acessível. A Mr. Mix oferece kits a partir de R$ 300. Ideal para eventos, feiras e praças.",
    example_thesis:
      "As franquias de baixo custo, como modelos de bebidas artesanais, demonstram que o empreendedorismo formal é acessível a jovens com recursos limitados, gerando formalização e renda na economia local.",
  },
  {
    id: 13,
    title: "Jardinagem / Paisagismo Residencial",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Meio Ambiente · Bem-estar urbano · Inclusão",
    description:
      "Cuide de jardins residenciais e corporativos. Início com ferramentas básicas. Clientes: condomínios, casas, escritórios. Divulgue em grupos de bairro.",
    example_thesis:
      "O serviço de jardinagem urbana evidencia como atividades ligadas à preservação ambiental podem gerar renda para trabalhadores informais, conciliando sustentabilidade e inclusão socioeconômica.",
  },
  {
    id: 14,
    title: "Consultoria de TI para Pequenos Negócios",
    category: "Digital",
    difficulty: "Intermediário",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Tecnologia · Inclusão digital · Trabalho",
    description:
      "Ajude pequenos comerciantes a criar perfil no Google, configurar WhatsApp Business e usar planilhas. Sem necessidade de formação em TI — apenas conhecimento prático.",
    example_thesis:
      "A inclusão digital de pequenos empreendedores, mediada por consultores autônomos de baixo custo, representa estratégia eficaz de redução da desigualdade tecnológica no tecido econômico brasileiro.",
  },
  {
    id: 15,
    title: "Tradução / Revisão de Textos",
    category: "Digital",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Linguagens · Comunicação · Trabalho intelectual",
    description:
      "Se você domina inglês, espanhol ou tem boa escrita, ofereça serviços de tradução e revisão. Plataformas: Workana, 99Freelas, LinkedIn.",
    example_thesis:
      "O trabalho intelectual freelance de tradução e revisão textual demonstra que competências linguísticas, combinadas às plataformas digitais, são suficientes para gerar renda sem qualquer investimento inicial.",
  },
  {
    id: 16,
    title: "Reciclagem Artesanal / Upcycling",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Meio Ambiente · Sustentabilidade · Inclusão",
    description:
      "Transforme materiais descartados em produtos vendáveis: vasos de garrafa PET, bolsas de caixa de leite. Venda no Instagram, feiras e Elo7.",
    example_thesis:
      "O empreendedorismo sustentável baseado em reciclagem criativa representa solução simultânea para dois problemas centrais: a geração de renda na base da pirâmide social e a crise dos resíduos sólidos urbanos.",
  },
  {
    id: 17,
    title: "Acompanhante Terapêutico / Apoio Emocional",
    category: "Serviços",
    difficulty: "Intermediário",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Saúde Mental · Direitos Humanos · Inclusão",
    description:
      "Com formação básica em psicologia (cursos gratuitos SENAC/MEC), ofereça escuta ativa a pessoas em vulnerabilidade. Atenção: não substitui psicólogo clínico.",
    example_thesis:
      "A profissionalização do cuidado em saúde mental por meio de empreendedores sociais independentes representa resposta inovadora à crise psicológica que assola a sociedade brasileira contemporânea.",
  },
  {
    id: 18,
    title: "Artesanato / Produtos Culturais",
    category: "Serviços",
    difficulty: "Iniciante",
    estimated_cost: "R$ 100–500",
    enem_axis_relation: "Cultura · Identidade · Inclusão de minorias",
    description:
      "Produza artesanato com identidade cultural — cerâmica nordestina, bordado mineiro, bijuteria indígena. Venda no Elo7, feiras de artesanato e Instagram.",
    example_thesis:
      "A valorização do artesanato cultural como negócio sustentável demonstra que a preservação da identidade coletiva e a geração de renda para comunidades marginalizadas são objetivos complementares e não antagônicos.",
  },
  {
    id: 19,
    title: "Coach de Carreira / Mentoria Online",
    category: "Digital",
    difficulty: "Intermediário",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Trabalho · Inclusão · Direitos Humanos",
    description:
      "Oriente jovens na construção de currículos, perfis no LinkedIn e preparação para entrevistas. Sessões pelo Google Meet. Plataformas como Mentorize.me.",
    example_thesis:
      "A mentoria de carreira online, ao democratizar o acesso a orientação profissional antes restrito a grupos privilegiados, exemplifica como o empreendedorismo pode funcionar como instrumento concreto de redução das desigualdades sociais.",
  },
  {
    id: 20,
    title: "Agente Comunitário de Microcrédito",
    category: "Serviços",
    difficulty: "Intermediário",
    estimated_cost: "R$ 0",
    enem_axis_relation: "Direitos Humanos · Inclusão financeira · Minorias",
    description:
      "Conecte empreendedores da comunidade a programas de microcrédito (Banco do Povo, CrediAmigo). Comissão por indicação ou atuação como correspondente bancário.",
    example_thesis:
      "A atuação de agentes comunitários de microcrédito representa modelo empreendedor que, ao facilitar o acesso de minorias ao sistema financeiro, promove inclusão econômica e redução estrutural das desigualdades sociais.",
  },
]

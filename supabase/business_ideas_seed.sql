-- ============================================================
-- MIGRATION: business_ideas_seed + redaction_business_plans
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Tabela de ideias de negócio
CREATE TABLE IF NOT EXISTS business_ideas_seed (
  id              serial PRIMARY KEY,
  title           text NOT NULL,
  category        text NOT NULL CHECK (category IN ('Serviços', 'Digital', 'Franquia')),
  difficulty      text NOT NULL CHECK (difficulty IN ('Iniciante', 'Intermediário')),
  estimated_cost  text NOT NULL,
  enem_axis_relation text NOT NULL,
  description     text NOT NULL,
  example_thesis  text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: leitura pública (anon pode ler)
ALTER TABLE business_ideas_seed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_business_ideas"
  ON business_ideas_seed FOR SELECT
  USING (true);

-- 2. Tabela de planos de negócio (redações salvas)
CREATE TABLE IF NOT EXISTS redaction_business_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_idea_id int REFERENCES business_ideas_seed(id),
  theme           text NOT NULL,
  essay_text      text NOT NULL,
  word_count      int NOT NULL DEFAULT 0,
  -- Nota ENEM tradicional
  nota_total      int,
  nivel           text,
  competencias    jsonb,
  -- Viabilidade do negócio
  viability_score int,
  viability_nivel text,
  viability_data  jsonb,
  -- Badge e XP bônus
  badge_earned    boolean NOT NULL DEFAULT false,
  bonus_xp        int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE redaction_business_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_business_plans"
  ON redaction_business_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Seed: 20 ideias de negócio
INSERT INTO business_ideas_seed
  (title, category, difficulty, estimated_cost, enem_axis_relation, description, example_thesis)
VALUES
  (
    'Pet Sitter / Passeador de Pets',
    'Serviços', 'Iniciante', 'R$ 0',
    'Brasil que envelhece · Bem-estar animal',
    'Cuide de animais de estimação de idosos e profissionais ausentes. Zero investimento: divulgue no WhatsApp do bairro e no Instagram. Cobrança por visita ou pacote semanal.',
    'O serviço de pet sitter representa uma alternativa de renda imediata e de baixíssimo custo que, ao mesmo tempo, oferece suporte às famílias da terceira idade, demonstrando como o empreendedorismo social pode resolver lacunas deixadas pelo Estado.'
  ),
  (
    'Cuidador de Idosos Autônomo',
    'Serviços', 'Iniciante', 'R$ 0',
    'Brasil que envelhece · Saúde e cuidado',
    'Com o Brasil envelhecendo, a demanda por cuidadores cresce exponencialmente. Formação gratuita via SENAC online. Cadastro em plataformas como Cuidadores.com.br.',
    'Diante do envelhecimento acelerado da população brasileira, o empreendedorismo no setor de cuidados — como a atuação de cuidadores autônomos — apresenta-se como solução viável de geração de renda com alto impacto social.'
  ),
  (
    'Aulas Particulares Online',
    'Digital', 'Iniciante', 'R$ 0',
    'Inclusão · Educação · Direitos Humanos',
    'Ensine matérias do ENEM, idiomas ou habilidades pelo Google Meet. Divulgue em grupos de pais e escolas locais. Plataformas como SuperProf e Profes facilitam o cadastro gratuito.',
    'A democratização do ensino por meio de aulas particulares online demonstra como jovens empreendedores podem simultaneamente gerar renda e reduzir as desigualdades educacionais estruturais do Brasil.'
  ),
  (
    'Afiliado Amazon / Shopee',
    'Digital', 'Iniciante', 'R$ 0',
    'Tecnologia · Trabalho Digital · Inclusão financeira',
    'Crie conteúdo no TikTok, YouTube Shorts ou Instagram recomendando produtos. Comissão entre 3% e 15% por venda. Não precisa estoque: apenas um celular e criatividade.',
    'O marketing de afiliados, modelo digital sem investimento inicial, ilustra como a inclusão tecnológica pode transformar jovens periféricos em empreendedores competitivos na economia digital globalizada.'
  ),
  (
    'E-book / Infoproduto (Hotmart)',
    'Digital', 'Iniciante', 'R$ 0',
    'Educação · Empreendedorismo · Inclusão digital',
    'Escreva um guia prático sobre qualquer conhecimento que você tenha. Publique gratuitamente na Hotmart ou Eduzz. Comece com 20-30 páginas. Venda a partir de R$ 9,90.',
    'A criação de infoprodutos acessíveis em plataformas digitais demonstra que o empreendedorismo baseado em conhecimento é capaz de democratizar a geração de renda independentemente da origem socioeconômica do indivíduo.'
  ),
  (
    'Consultoria de Nutrição Online',
    'Digital', 'Intermediário', 'R$ 0',
    'Saúde e "Faça você mesmo" · Bem-estar',
    'Se você tem base em nutrição ou está estudando a área, ofereça consultas básicas e montagem de cardápios. Use formulários gratuitos do Google. Regulamentação via CRN é exigida para diagnóstico clínico.',
    'A consultoria de bem-estar e nutrição online, ao conectar o conhecimento científico às necessidades cotidianas da população, representa modelo empreendedor que une saúde pública e geração de renda sustentável.'
  ),
  (
    'Designer Gráfico Freelancer',
    'Digital', 'Iniciante', 'R$ 0',
    'Comunicação · Trabalho Digital · Inclusão criativa',
    'Use Canva (gratuito) para criar logos, posts e materiais para pequenos negócios. Cadastre-se na 99Freelas ou Workana. Primeiros clientes: comércios do bairro.',
    'O design gráfico freelance, viabilizado por ferramentas digitais gratuitas, evidencia como o empreendedorismo criativo pode ser acessível a jovens de baixa renda, gerando inclusão no mercado de trabalho digital.'
  ),
  (
    'Assistente Virtual / Freelancer Admin',
    'Digital', 'Iniciante', 'R$ 0',
    'Trabalho Digital · Inclusão · Tecnologia',
    'Gerencie e-mails, agendas e redes sociais de pequenas empresas remotamente. Plataformas: Upwork, Workana, GetNinjas. Valorize organização e comunicação escrita.',
    'O trabalho de assistente virtual demonstra que a inclusão no mercado digital não exige formação técnica cara, mas sim competências comunicativas e organizacionais que podem ser desenvolvidas por qualquer cidadão.'
  ),
  (
    'Criador de Conteúdo Nichado',
    'Digital', 'Iniciante', 'R$ 0',
    'Comunicação · Identidade Cultural · Tecnologia',
    'Escolha um nicho (culinária regional, ENEM, artesanato indígena, etc.) e crie conteúdo consistente. Monetize via Reels Bonus, parcerias e links de afiliados.',
    'A produção de conteúdo digital nichado representa veículo de valorização de identidades culturais e, simultaneamente, modelo de negócio de custo zero que democratiza o acesso à geração de renda pela internet.'
  ),
  (
    'Marmita Fitness / Buffet Delivery',
    'Serviços', 'Iniciante', 'R$ 100–500',
    'Saúde · Alimentação saudável · Empreendedorismo local',
    'Cozinhe e entregue marmitas saudáveis. Comece com encomendas de colegas e vizinhos. Divulgue no WhatsApp. Investimento inicial em embalagens e ingredientes.',
    'O microempreendedorismo na área de alimentação saudável demonstra como a combinação de consciência nutricional e habilidade culinária pode gerar renda sustentável e contribuir para a saúde da comunidade.'
  ),
  (
    'Costura / Customização de Roupas',
    'Serviços', 'Iniciante', 'R$ 100–500',
    'Sustentabilidade · Moda consciente · Direitos Humanos',
    'Conserte roupas, faça ajustes ou customize peças com bordados e patches. Atendimento pelo Instagram e WhatsApp. Máquina de costura básica (pode ser de segunda mão).',
    'A customização de roupas como atividade empreendedora une geração de renda, sustentabilidade ambiental e valorização do trabalho artesanal, provando que negócios de baixo custo podem gerar impacto social positivo.'
  ),
  (
    'Franquia Mr. Mix (Alimentação)',
    'Franquia', 'Intermediário', 'R$ 100–500',
    'Empreendedorismo · Gastronomia local · Trabalho',
    'Modelo de franquia de bebidas com investimento inicial acessível. A Mr. Mix oferece kits a partir de R$ 300. Ideal para eventos, feiras e praças.',
    'As franquias de baixo custo, como modelos de bebidas artesanais, demonstram que o empreendedorismo formal é acessível a jovens com recursos limitados, gerando formalização e renda na economia local.'
  ),
  (
    'Jardinagem / Paisagismo Residencial',
    'Serviços', 'Iniciante', 'R$ 0',
    'Meio Ambiente · Bem-estar urbano · Inclusão',
    'Cuide de jardins residenciais e corporativos. Início com ferramentas básicas (enxada, tesoura de poda). Clientes: condomínios, casas, escritórios. Divulgue em grupos de bairro.',
    'O serviço de jardinagem urbana evidencia como atividades ligadas à preservação ambiental podem gerar renda para trabalhadores informais, conciliando sustentabilidade e inclusão socioeconômica.'
  ),
  (
    'Consultoria de TI para Pequenos Negócios',
    'Digital', 'Intermediário', 'R$ 0',
    'Tecnologia · Inclusão digital · Trabalho',
    'Ajude pequenos comerciantes a criar perfil no Google, configurar WhatsApp Business e usar planilhas. Sem necessidade de formação em TI — apenas conhecimento prático.',
    'A inclusão digital de pequenos empreendedores, mediada por consultores autônomos de baixo custo, representa estratégia eficaz de redução da desigualdade tecnológica no tecido econômico brasileiro.'
  ),
  (
    'Tradução / Revisão de Textos',
    'Digital', 'Iniciante', 'R$ 0',
    'Linguagens · Comunicação · Trabalho intelectual',
    'Se você domina inglês, espanhol ou tem boa escrita, ofereça serviços de tradução e revisão. Plataformas: Workana, 99Freelas, LinkedIn.',
    'O trabalho intelectual freelance de tradução e revisão textual demonstra que competências linguísticas, quando combinadas à plataformas digitais, são suficientes para gerar renda sem qualquer investimento inicial.'
  ),
  (
    'Reciclagem Artesanal / Upcycling',
    'Serviços', 'Iniciante', 'R$ 0',
    'Meio Ambiente · Sustentabilidade · Inclusão',
    'Transforme materiais descartados em produtos vendáveis: vasos de garrafa PET, bolsas de caixa de leite, bijuterias de jornal. Venda no Instagram, feiras e Elo7.',
    'O empreendedorismo sustentável baseado em reciclagem criativa representa solução simultânea para dois problemas centrais do Brasil contemporâneo: a geração de renda na base da pirâmide social e a crise dos resíduos sólidos urbanos.'
  ),
  (
    'Acompanhante Terapêutico / Apoio Emocional',
    'Serviços', 'Intermediário', 'R$ 0',
    'Saúde Mental · Direitos Humanos · Inclusão',
    'Com formação básica em psicologia ou assistência social (cursos gratuitos no SEBRAE/MEC), ofereça escuta ativa e acompanhamento a pessoas em vulnerabilidade.',
    'A profissionalização do cuidado em saúde mental por meio de empreendedores sociais independentes representa resposta inovadora à crise de saúde psicológica que assola a sociedade brasileira contemporânea.'
  ),
  (
    'Artesanato / Produtos Culturais',
    'Serviços', 'Iniciante', 'R$ 100–500',
    'Cultura · Identidade · Inclusão de minorias',
    'Produza artesanato com identidade cultural — cerâmica nordestina, bordado mineiro, bijuteria indígena. Venda no Elo7, feiras de artesanato e Instagram.',
    'A valorização do artesanato cultural como negócio sustentável demonstra que a preservação da identidade coletiva e a geração de renda para comunidades marginalizadas são objetivos complementares e não antagônicos.'
  ),
  (
    'Coach de Carreira / Mentoria Online',
    'Digital', 'Intermediário', 'R$ 0',
    'Trabalho · Inclusão · Direitos Humanos',
    'Oriente jovens na construção de currículos, perfis no LinkedIn e preparação para entrevistas. Sessões pelo Google Meet. Plataformas como Mentorize.me para encontrar clientes.',
    'A mentoria de carreira online, ao democratizar o acesso a orientação profissional antes restrito a grupos privilegiados, exemplifica como o empreendedorismo pode funcionar como instrumento concreto de redução das desigualdades sociais.'
  ),
  (
    'Microcrédito Orientado / Agente Comunitário',
    'Serviços', 'Intermediário', 'R$ 0',
    'Direitos Humanos · Inclusão financeira · Minorias',
    'Conecte empreendedores da comunidade a programas de microcrédito (Banco do Povo, CrediAmigo) e cooperativas. Comissão por indicação ou atuação como correspondente bancário.',
    'A atuação de agentes comunitários de microcrédito representa modelo empreendedor que, ao facilitar o acesso de minorias ao sistema financeiro, promove inclusão econômica e redução estrutural das desigualdades sociais.'
  )
;

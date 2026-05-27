-- ══════════════════════════════════════════════════════════════════════════════
-- writing_skill_tree: Currículo do módulo "Do Zero ao 1000"
-- Cada linha é uma lição dentro de um nível (0-5).
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS writing_skill_tree (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number        int         NOT NULL CHECK (level_number BETWEEN 0 AND 5),
  level_name          text        NOT NULL,
  lesson_order        int         NOT NULL,
  lesson_id           text        NOT NULL UNIQUE,
  lesson_type         text        NOT NULL
    CHECK (lesson_type IN ('theory','thesis_builder','paragraph_puzzle','connector_fill','intervention_builder','multiple_choice','full_essay')),
  title               text        NOT NULL,
  instructions        text        NOT NULL,
  exercise_data       jsonb,
  requires_lesson     text        REFERENCES writing_skill_tree(lesson_id),
  min_score_to_pass   int         NOT NULL DEFAULT 70,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- RLS: conteúdo é público (leitura) — nenhum dado sensível aqui
ALTER TABLE writing_skill_tree ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill_tree_public_read"
  ON writing_skill_tree FOR SELECT USING (true);

-- ── ÍNDICES ───────────────────────────────────────────────────────────────────
CREATE INDEX ON writing_skill_tree (level_number, lesson_order);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED — 6 Níveis × 3 lições cada = 18 lições
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── NÍVEL 0: Alfabetização ENEM ─────────────────────────────────────────────
INSERT INTO writing_skill_tree
  (level_number, level_name, lesson_order, lesson_id, lesson_type, title, instructions, exercise_data, min_score_to_pass)
VALUES
(
  0, 'Alfabetização ENEM', 1, 'L0_teoria', 'theory',
  'O que é a Redação ENEM?',
  'Leia com atenção os conceitos fundamentais antes de começar a escrever.',
  '{
    "content": "A redação do ENEM é um texto **dissertativo-argumentativo** sobre um tema social, científico ou cultural.\n\n**Dissertar** significa expor ideias de forma organizada.\n**Argumentar** significa defender uma posição com provas e raciocínio lógico.\n\n### O que a banca avalia?\n- **C1** – Você escreve corretamente em Português?\n- **C2** – Seu texto é uma dissertação, não uma narrativa ou poema?\n- **C3** – Seus argumentos fazem sentido e sustentam sua tese?\n- **C4** – Suas frases estão bem conectadas?\n- **C5** – Você propôs uma solução concreta ao problema?\n\n### Erros que zeram a nota:\n- Texto em branco\n- Cópia do texto motivador (sem ideia própria)\n- Fuga total ao tema\n- Proposta de intervenção que viola os Direitos Humanos\n\n### A estrutura é simples:\n1. **Introdução** — apresente o tema e diga sua posição (tese)\n2. **Desenvolvimento 1** — argumento + evidência\n3. **Desenvolvimento 2** — argumento diferente + evidência\n4. **Conclusão** — retome a tese e proponha uma solução",
    "keyPoints": [
      "Dissertativo-argumentativo: expor + defender",
      "4 parágrafos (Intro, D1, D2, Conclusão)",
      "Máximo 30 linhas — use bem o espaço",
      "Proposta de intervenção é obrigatória na conclusão"
    ]
  }',
  100
),
(
  0, 'Alfabetização ENEM', 2, 'L0_tese', 'multiple_choice',
  'Tese ou Não-Tese?',
  'Uma tese é uma afirmação clara, específica e que pode ser provada com argumentos. Identifique qual frase abaixo é uma tese válida para o ENEM.',
  '{
    "theme": "Impacto das redes sociais na saúde mental dos jovens",
    "question": "Qual das frases abaixo representa uma TESE válida para o ENEM?",
    "options": [
      {
        "id": "a",
        "text": "As redes sociais são ruins para os jovens?",
        "correct": false,
        "explanation": "❌ Uma tese é uma AFIRMAÇÃO, nunca uma pergunta. Reformule: 'As redes sociais prejudicam a saúde mental dos jovens.'"
      },
      {
        "id": "b",
        "text": "O uso excessivo das redes sociais intensifica transtornos de ansiedade em adolescentes, impulsionado pela cultura da comparação virtual.",
        "correct": true,
        "explanation": "✅ Perfeita! É uma afirmação clara, específica e que permite argumentação. Menciona causa (uso excessivo) e consequência (ansiedade)."
      },
      {
        "id": "c",
        "text": "Desde os primórdios da humanidade, a comunicação sempre foi importante.",
        "correct": false,
        "explanation": "❌ Clichê e vaga. 'Desde os primórdios' é proibido no ENEM. Além disso, não responde ao tema."
      },
      {
        "id": "d",
        "text": "Neste texto, vou falar sobre as redes sociais e seus problemas.",
        "correct": false,
        "explanation": "❌ Nunca use primeira pessoa ('vou falar'). A tese deve ser uma afirmação sobre o mundo, não sobre o texto."
      }
    ]
  }',
  100
),
(
  0, 'Alfabetização ENEM', 3, 'L0_construir', 'thesis_builder',
  'Construa sua Primeira Tese',
  'Preencha os campos abaixo para montar a estrutura de uma tese completa. A IA vai avaliar se sua tese é clara e argumentável.',
  '{
    "theme": "O impacto da fome no desenvolvimento infantil no Brasil",
    "fields": ["contexto", "tese", "argumento1", "argumento2"],
    "hints": {
      "contexto": "Um dado, fato histórico ou situação que introduce o tema. Ex: ''Segundo o IBGE, 33 milhões de brasileiros vivem em insegurança alimentar''",
      "tese": "Sua posição CLARA sobre o tema (afirmação, não pergunta). Ex: ''A fome compromete irreversivelmente o desenvolvimento cognitivo de crianças brasileiras''",
      "argumento1": "Primeiro motivo que PROVA sua tese. Ex: ''A desnutrição prejudica a formação cerebral nos primeiros 1000 dias de vida''",
      "argumento2": "Segundo motivo (ângulo DIFERENTE do primeiro). Ex: ''A fome gera evasão escolar, perpetuando o ciclo de pobreza geracional''"
    },
    "example": {
      "contexto": "Com 33 milhões de brasileiros em insegurança alimentar (IBGE, 2023)",
      "tese": "a fome na infância compromete tanto o desenvolvimento cognitivo quanto a trajetória educacional dessas crianças",
      "argumento1": "A desnutrição nos primeiros 1.000 dias de vida prejudica a formação das sinapses cerebrais de forma irreversível",
      "argumento2": "Além disso, a fome força a evasão escolar precoce, perpetuando o ciclo intergeracional de pobreza"
    }
  }',
  70
),

-- ─── NÍVEL 1: Arquitetura do Texto ───────────────────────────────────────────
(
  1, 'Arquitetura do Texto', 1, 'L1_teoria', 'theory',
  'A Estrutura dos 4 Parágrafos',
  'Compreenda a função de cada parágrafo antes de escrever qualquer palavra.',
  '{
    "content": "Todo texto dissertativo-argumentativo do ENEM tem **4 parágrafos** com funções distintas:\n\n### 🔵 Introdução (70-90 palavras)\n- Apresenta o tema com um **contexto** (dado, citação, fato)\n- Termina com a **tese** — sua posição sobre o tema\n- **NÃO** usa 'Desde os primórdios' ou 'Ao longo da história'\n\n### 🟡 Desenvolvimento 1 (100-130 palavras)\n- 1 argumento = 1 parágrafo (nunca misture dois argumentos)\n- Começa com o **tópico frasal** (a afirmação central do parágrafo)\n- Traz uma **evidência** (dado, lei, autor, pesquisa)\n- Fecha ligando ao tema\n\n### 🟠 Desenvolvimento 2 (100-130 palavras)\n- Argumento **diferente** do D1 (cause vs. consequence, local vs. global, economic vs. social)\n- Mesmo formato: tópico frasal → evidência → fechamento\n- Começa com conectivo de adição: 'Além disso', 'Outrossim', 'Ademais'\n\n### 🟢 Conclusão (80-100 palavras)\n- Retoma a tese com outras palavras\n- Proposta de Intervenção com **5 elementos**: Agente + Ação + Meio + Efeito + Detalhamento\n- **NUNCA** termina com 'Portanto, devemos pensar nisso'",
    "keyPoints": [
      "Intro: contexto + tese",
      "D1: tópico frasal + evidência (1 ângulo)",
      "D2: tópico frasal + evidência (ângulo DIFERENTE)",
      "Conclusão: retomada da tese + proposta de 5 elementos"
    ]
  }',
  100
),
(
  1, 'Arquitetura do Texto', 2, 'L1_puzzle', 'paragraph_puzzle',
  'Monte o Texto na Ordem Certa',
  'Os parágrafos estão embaralhados. Arraste-os para reconstruir a estrutura correta de uma redação nota 880.',
  '{
    "theme": "Violência contra a mulher no Brasil",
    "instructions": "Coloque os parágrafos na ordem correta: Introdução → D1 → D2 → Conclusão",
    "sentences": [
      {
        "id": "p1",
        "text": "A violência doméstica configura grave violação dos direitos humanos no Brasil, afetando 1 em cada 4 mulheres ao longo da vida, segundo o IBGE. Nesse contexto, a cultura machista estrutural é a causa central do ciclo de abusos que impede o desenvolvimento pleno das mulheres brasileiras.",
        "correct_position": 0,
        "type": "intro",
        "label": "Introdução"
      },
      {
        "id": "p2",
        "text": "O patriarcado histórico normaliza a dominação masculina, criando ambiente propício à violência. Pesquisa do Datafolha (2019) revelou que 42% dos brasileiros ainda acreditam que ''roupa provocativa causa assédio'', evidenciando como crenças misóginas legitimam o abuso e dificultam a condenação social dos agressores.",
        "correct_position": 1,
        "type": "dev1",
        "label": "Desenvolvimento 1"
      },
      {
        "id": "p3",
        "text": "Ademais, a fragilidade das políticas públicas de proteção agrava o problema. Embora a Lei Maria da Penha (2006) seja um marco legal importante, apenas 7% dos municípios brasileiros possuem Casas-Abrigo para mulheres em situação de risco, deixando as vítimas sem alternativa segura para romper o ciclo de violência.",
        "correct_position": 2,
        "type": "dev2",
        "label": "Desenvolvimento 2"
      },
      {
        "id": "p4",
        "text": "Logo, combater a violência de gênero exige ação coordenada do Estado e da sociedade. O Governo Federal deve ampliar o financiamento de Casas-Abrigo municipais, por meio de repasses do Fundo de Garantia de Direitos, com o objetivo de oferecer suporte integral às vítimas, garantindo sua autonomia e dignidade.",
        "correct_position": 3,
        "type": "conclusion",
        "label": "Conclusão"
      }
    ]
  }',
  75
),
(
  1, 'Arquitetura do Texto', 3, 'L1_identificar', 'multiple_choice',
  'Diagnose o Texto',
  'Leia o trecho abaixo e identifique o problema estrutural principal.',
  '{
    "theme": "Desemprego juvenil no Brasil",
    "text": "O desemprego é ruim para todos. Os jovens sofrem muito com isso. Eles ficam sem dinheiro e não conseguem comprar as coisas que precisam. Além disso, ficam tristes. O governo deveria fazer alguma coisa. A educação também é importante. Portanto, devemos pensar nisso e agir juntos para um Brasil melhor.",
    "question": "Qual é o PRINCIPAL problema estrutural deste texto?",
    "options": [
      {
        "id": "a",
        "text": "Falta de dados e evidências concretas",
        "correct": false,
        "explanation": "Verdade, mas não é o problema PRINCIPAL. O texto tem problemas estruturais mais graves antes disso."
      },
      {
        "id": "b",
        "text": "Ausência de parágrafo de introdução, desenvolvimento e conclusão distintos — tudo está misturado em um bloco único",
        "correct": true,
        "explanation": "✅ Correto! O texto é um bloco único sem estrutura. Não há tese clara, os argumentos são vagos e a conclusão não tem proposta de intervenção. É o erro mais grave."
      },
      {
        "id": "c",
        "text": "Uso de linguagem muito formal",
        "correct": false,
        "explanation": "Na verdade, o problema é o oposto: linguagem informal demais ('ficam tristes', 'comprar as coisas')."
      },
      {
        "id": "d",
        "text": "A conclusão está muito longa",
        "correct": false,
        "explanation": "A conclusão está curta demais, não longa. E não tem proposta de intervenção com os 5 elementos."
      }
    ]
  }',
  100
),

-- ─── NÍVEL 2: O Parágrafo Perfeito ───────────────────────────────────────────
(
  2, 'O Parágrafo Perfeito', 1, 'L2_teoria', 'theory',
  'A Microestrutura do Parágrafo',
  'Aprenda os 4 componentes internos de todo parágrafo bem construído.',
  '{
    "content": "Todo parágrafo de desenvolvimento tem **4 partes** em sequência obrigatória:\n\n### 1. 🟦 Tópico Frasal\nA **primeira frase** do parágrafo. É uma afirmação que resume o argumento inteiro. Deve ser claro e direto.\n\n> ✅ ''A precariedade do transporte público aprofunda a desigualdade social no Brasil.''\n> ❌ ''Vou falar sobre o transporte.''\n\n### 2. 🟨 Explicação\nExpanda o tópico frasal. Explique **por que** sua afirmação é verdadeira. Use lógica causal.\n\n> ''Isso ocorre porque trabalhadores de baixa renda dependem exclusivamente do ônibus, que frequentemente atrasa ou cancela corridas.''\n\n### 3. 🟩 Repertório Sociocultural\nProva externa à sua opinião: **dado estatístico, lei, obra literária, filósofo, pesquisa ou fato histórico**.\n\n> ''Segundo o IBGE (2022), 70% dos brasileiros usam transporte coletivo como principal meio de locomoção, mas apenas 30% das cidades têm mobilidade considerada ''adequada''.''\n\n### 4. 🟥 Fechamento\nUma frase que **liga o parágrafo de volta à tese** da introdução. Use um conectivo conclusivo.\n\n> ''Portanto, sem investimento em mobilidade urbana, a desigualdade estrutural brasileira permanece intocável.''\n\n---\n\n### Repertórios Curingas (funcionam para vários temas)\n| Repertório | Temas que serve |\n|---|---|\n| Lei Maria da Penha (2006) | Gênero, violência, direitos |\n| Pirâmide de Maslow | Saúde mental, desigualdade, educação |\n| Revolução Industrial | Trabalho, tecnologia, meio ambiente |\n| Constituição de 1988, Art. 6° | Direitos sociais, saúde, educação |\n| IBGE 2022 | Qualquer dado social ou econômico |\n| Hannah Arendt (''A Banalidade do Mal'') | Violência, política, ética |",
    "keyPoints": [
      "Tópico Frasal: afirmação-âncora (1ª frase)",
      "Explicação: o ''por quê'' da afirmação",
      "Repertório: prova externa (dado, lei, autor)",
      "Fechamento: liga ao tema/tese com conectivo conclusivo"
    ]
  }',
  100
),
(
  2, 'O Parágrafo Perfeito', 2, 'L2_puzzle', 'paragraph_puzzle',
  'Monte o Parágrafo na Ordem Certa',
  'As frases do parágrafo estão embaralhadas. Coloque-as na ordem correta: Tópico Frasal → Explicação → Repertório → Fechamento.',
  '{
    "theme": "Desmatamento na Amazônia",
    "instructions": "Ordene as frases para formar um parágrafo de desenvolvimento perfeito",
    "sentences": [
      {
        "id": "s1",
        "text": "O desmatamento na Amazônia ameaça tanto a biodiversidade global quanto a regulação climática do planeta.",
        "correct_position": 0,
        "type": "topico_frasal",
        "label": "Tópico Frasal"
      },
      {
        "id": "s2",
        "text": "A destruição florestal elimina habitats essenciais para espécies endêmicas e reduz a capacidade da floresta de absorver dióxido de carbono, acelerando as mudanças climáticas.",
        "correct_position": 1,
        "type": "explicacao",
        "label": "Explicação"
      },
      {
        "id": "s3",
        "text": "Dados do INPE (2023) apontam que o Brasil perdeu 11.568 km² de floresta nativa apenas em 2022 — área equivalente ao Estado de Alagoas —, com pressão constante do agronegócio ilegal.",
        "correct_position": 2,
        "type": "repertorio",
        "label": "Repertório"
      },
      {
        "id": "s4",
        "text": "Logo, sem políticas ambientais rigorosas de fiscalização e reflorestamento, o Brasil corre o risco de ultrapassar o chamado ''ponto de não retorno'' ecológico.",
        "correct_position": 3,
        "type": "fechamento",
        "label": "Fechamento"
      }
    ]
  }',
  75
),
(
  2, 'O Parágrafo Perfeito', 3, 'L2_topico', 'thesis_builder',
  'Escreva Apenas o Tópico Frasal',
  'Não precisa escrever o parágrafo inteiro. Escreva APENAS a primeira frase (tópico frasal) para o argumento abaixo. A IA avaliará se é claro e específico.',
  '{
    "theme": "Acesso à internet como direito social no Brasil",
    "fields": ["topico_frasal"],
    "hints": {
      "topico_frasal": "Escreva uma afirmação clara sobre o argumento: ''A exclusão digital aprofunda desigualdades''. Deve ser uma frase completa, sem ser vaga demais ou específica demais."
    },
    "argument_to_develop": "A exclusão digital aprofunda as desigualdades sociais no Brasil",
    "focus": "Escreva APENAS a primeira frase do parágrafo — o tópico frasal. Deve conter o argumento central de forma direta e argumentável.",
    "example": {
      "topico_frasal": "A ausência de acesso à internet em regiões periféricas aprofunda a exclusão social, privando milhões de brasileiros de oportunidades educacionais e profissionais na era digital."
    }
  }',
  70
),

-- ─── NÍVEL 3: Conectivos e Coesão ────────────────────────────────────────────
(
  3, 'Conectivos e Coesão', 1, 'L3_teoria', 'theory',
  'O Arsenal de Conectivos do ENEM',
  'Os conectivos são a ''cola'' do texto. Use-os errado e a coesão vai a zero.',
  '{
    "content": "Os conectivos ligam ideias e mostram a **relação lógica** entre elas. O ENEM avalia isso na **Competência 4 (Coesão)**.\n\n### Conectivos por Função\n\n| Função | Conectivos | Quando Usar |\n|--------|-----------|-------------|\n| **Adição** | Além disso · Ademais · Outrossim · Bem como | Acrescentar argumento de mesmo peso |\n| **Causa** | Visto que · Pois · Porquanto · Dado que | Introduzir a CAUSA de algo |\n| **Consequência** | Portanto · Logo · Assim · Por conseguinte | Introduzir a CONSEQUÊNCIA |\n| **Contraste** | Contudo · Todavia · Entretanto · No entanto | Opor duas ideias |\n| **Concessão** | Embora · Ainda que · Apesar de · Mesmo que | Admitir uma exceção antes de refutar |\n| **Explicação** | Ou seja · Isto é · A saber | Reformular ou detalhar |\n| **Finalidade** | A fim de · Para que · Com o objetivo de | Mostrar propósito |\n\n### Erros Clássicos\n❌ ''Portanto, existem vários fatores.'' → 'Portanto' é conclusivo — não abre novos pontos\n❌ ''Contudo, o problema é grave.'' → 'Contudo' opõe — o que está sendo refutado?\n❌ Repetir ''Além disso'' 4 vezes no mesmo texto\n\n### Conectivos para a Conclusão (C5)\nUse para introduzir a proposta de intervenção:\n> ''Diante disso, o Estado deve...''\n> ''Nesse sentido, cabe ao poder público...''\n> ''Logo, torna-se imprescindível que...''",
    "keyPoints": [
      "Adição: Além disso, Ademais (não repita o mesmo)",
      "Consequência: Portanto, Logo (apenas para fechar raciocínio)",
      "Contraste: Contudo, Entretanto (exige duas ideias opostas)",
      "Conclusão/C5: Diante disso, Nesse sentido, Portanto"
    ]
  }',
  100
),
(
  3, 'Conectivos e Coesão', 2, 'L3_fill1', 'connector_fill',
  'Preencha os Conectivos — Nível Básico',
  'Complete o texto escolhendo o conectivo que estabelece a relação lógica correta entre as ideias.',
  '{
    "theme": "Obesidade infantil no Brasil",
    "instructions": "Escolha o conectivo correto para cada lacuna",
    "segments": [
      {"type": "text", "content": "A obesidade infantil cresceu 300% no Brasil nas últimas décadas. "},
      {"type": "blank", "id": "b1", "correct": "Esse fenômeno ocorre", "options": ["Esse fenômeno ocorre", "Portanto", "Embora", "Logo"], "hint": "Você precisa EXPLICAR a causa — use uma transição que introduza a razão"},
      {"type": "text", "content": " porque o ultraprocessado substituiu alimentos naturais na dieta das crianças. "},
      {"type": "blank", "id": "b2", "correct": "Além disso", "options": ["Além disso", "Portanto", "Contudo", "Visto que"], "hint": "Você quer ACRESCENTAR outro fator"},
      {"type": "text", "content": ", a redução de aulas de educação física nas escolas agrava o sedentarismo. "},
      {"type": "blank", "id": "b3", "correct": "Portanto", "options": ["Portanto", "Embora", "Além disso", "Visto que"], "hint": "Você quer apresentar a CONSEQUÊNCIA/CONCLUSÃO"},
      {"type": "text", "content": ", políticas de alimentação saudável nas escolas públicas são urgentes."}
    ]
  }',
  70
),
(
  3, 'Conectivos e Coesão', 3, 'L3_fill2', 'connector_fill',
  'Preencha os Conectivos — Nível Avançado',
  'Texto mais complexo com relações de concessão e contraste. Mostre que domina os conectivos sofisticados.',
  '{
    "theme": "Inteligência Artificial e o mercado de trabalho",
    "instructions": "Escolha o conectivo mais adequado para cada contexto",
    "segments": [
      {"type": "blank", "id": "b1", "correct": "Embora", "options": ["Embora", "Portanto", "Além disso", "Pois"], "hint": "Você vai admitir uma exceção ANTES de refutar — use concessão"},
      {"type": "text", "content": " a inteligência artificial crie novas oportunidades de emprego em áreas tecnológicas, sua adoção em massa elimina postos de trabalho de forma mais rápida do que a requalificação pode acompanhar. "},
      {"type": "blank", "id": "b2", "correct": "Nesse sentido", "options": ["Nesse sentido", "Contudo", "Visto que", "Embora"], "hint": "Você quer continuar na mesma direção — conectivo de sequência lógica"},
      {"type": "text", "content": ", estudo do Fórum Econômico Mundial (2023) projeta que 85 milhões de empregos serão extintos até 2025, mas apenas 97 milhões de novos cargos surgirão — e com perfil técnico que a maioria dos trabalhadores atuais não possui. "},
      {"type": "blank", "id": "b3", "correct": "Diante disso", "options": ["Diante disso", "Embora", "Visto que", "Outrossim"], "hint": "Você vai propor uma ação em resposta ao que foi exposto — conectivo de conclusão/intervenção"},
      {"type": "text", "content": ", torna-se imprescindível que o Estado invista em programas de requalificação profissional voltados às populações mais vulneráveis à automação."}
    ]
  }',
  70
),

-- ─── NÍVEL 4: Proposta de Intervenção (C5) ───────────────────────────────────
(
  4, 'Proposta de Intervenção', 1, 'L4_teoria', 'theory',
  'Os 5 Elementos Obrigatórios da Conclusão',
  'A Competência 5 (C5) vale 200 pontos. Aprenda os 5 elementos que uma proposta de intervenção precisa ter.',
  '{
    "content": "A proposta de intervenção é a parte **mais pontuada e mais errada** das redações ENEM. Para nota máxima na C5, você precisa de **5 elementos obrigatórios**:\n\n### Mnemônico: **A-A-M-E-D**\n\n| # | Elemento | O que é | Exemplo |\n|---|----------|---------|--------|\n| 1 | **A**gente | Quem vai agir | O Governo Federal, as ONGs, as universidades |\n| 2 | **A**ção | O que vai fazer | ampliar, criar, implementar, financiar |\n| 3 | **M**eio | Como vai fazer | por meio de políticas públicas, mediante campanhas |\n| 4 | **E**feito | Com que objetivo | a fim de reduzir, com o objetivo de garantir |\n| 5 | **D**etalhamento | Impacto final | assegurando a dignidade, promovendo a equidade |\n\n### Exemplo de proposta NOTA 200:\n> ''**O Ministério da Educação** [Agente] deve **implementar programas de letramento digital nas escolas públicas** [Ação] **por meio de parcerias com empresas de tecnologia** [Meio], **a fim de reduzir a exclusão digital** [Efeito], **assegurando o acesso equitativo ao mercado de trabalho para jovens de baixa renda** [Detalhamento].''\n\n### Erros que zeram a C5:\n❌ ''O governo deveria fazer alguma coisa'' — sem agente específico, sem ação, sem meio\n❌ ''Portanto, devemos pensar nisso'' — não é proposta de intervenção\n❌ Proposta que viola direitos humanos (ex: ''prender todos os dependentes químicos'')\n❌ Proposta inviável ou vaga demais\n\n### Tip: Um parágrafo pode ter 2 propostas complementares\n> Agente 1 (Estado) → Agente 2 (Sociedade) — valoriza ainda mais a C5",
    "keyPoints": [
      "A = Agente específico (quem age — não ''as pessoas'' ou ''a sociedade'')",
      "A = Ação verbal concreta (ampliar, criar, implementar)",
      "M = Meio / modo de execução (por meio de, mediante)",
      "E = Efeito / objetivo (a fim de, com o objetivo de)",
      "D = Detalhamento do impacto social esperado"
    ]
  }',
  100
),
(
  4, 'Proposta de Intervenção', 2, 'L4_build', 'intervention_builder',
  'Monte sua Proposta de Intervenção',
  'Preencha os 5 campos abaixo. A IA vai montar a proposta no formato correto e avaliar se está completa.',
  '{
    "theme": "Acesso à saúde mental para jovens brasileiros",
    "fields": ["agente", "acao", "meio", "efeito", "detalhamento"],
    "hints": {
      "agente": "Quem deve agir? (Ex: O Ministério da Saúde, as prefeituras municipais, as universidades públicas)",
      "acao": "O que vai fazer? Use um verbo no infinitivo. (Ex: implementar centros de apoio, ampliar o CAPS, criar linhas de atendimento)",
      "meio": "Como vai executar? (Ex: por meio de parcerias com o SUS, mediante repasses do Fundo Nacional de Saúde)",
      "efeito": "Com que objetivo? (Ex: a fim de reduzir os índices de suicídio juvenil, com o objetivo de democratizar o acesso)",
      "detalhamento": "Qual o impacto social esperado? (Ex: garantindo saúde mental como direito constitucional, promovendo bem-estar e produtividade)"
    },
    "mnemonic": "A-A-M-E-D: Agente · Ação · Meio · Efeito · Detalhamento"
  }',
  70
),
(
  4, 'Proposta de Intervenção', 3, 'L4_critique', 'intervention_builder',
  'Corrija a Proposta Falha',
  'A proposta abaixo tem elementos faltando ou incorretos. Reescreva-a com os 5 elementos completos.',
  '{
    "theme": "Violência nas escolas",
    "flawed_proposal": "O governo deveria fazer alguma coisa para acabar com a violência nas escolas. Isso é muito importante para o futuro do Brasil e todos deveriam se conscientizar.",
    "missing_elements": ["agente_especifico", "acao_concreta", "meio", "efeito", "detalhamento"],
    "fields": ["agente", "acao", "meio", "efeito", "detalhamento"],
    "hints": {
      "agente": "''O governo'' é vago. Quem especificamente? (Ex: O Ministério da Educação, as Secretarias Estaduais de Educação)",
      "acao": "''Fazer alguma coisa'' não é ação. O que exatamente? (Ex: implementar protocolos de mediação de conflitos, criar equipes de psicólogos escolares)",
      "meio": "Como seria executado? (Ex: por meio de parceria com o CFP — Conselho Federal de Psicologia)",
      "efeito": "Para quê? (Ex: a fim de reduzir episódios de bullying e violência física)",
      "detalhamento": "Qual o impacto humano? (Ex: garantindo ambiente seguro e favorável ao aprendizado)"
    },
    "mode": "critique"
  }',
  70
),

-- ─── NÍVEL 5: Redação Completa ────────────────────────────────────────────────
(
  5, 'Redação Completa', 1, 'L5_simulado', 'full_essay',
  'Simulado Completo — 60 Minutos',
  'Hora de aplicar tudo que aprendeu. Escreva uma redação completa. O timer conta 60 minutos — mesmo tempo que você tem na prova real.',
  '{
    "theme": "O impacto do trabalho infantil no desenvolvimento humano no Brasil",
    "motivation_texts": [
      "''Toda criança tem direito à educação, ao lazer e à proteção contra o trabalho.'' — Estatuto da Criança e do Adolescente (ECA), Art. 60",
      "Segundo o IBGE (2022), 1,8 milhão de crianças e adolescentes entre 5 e 17 anos trabalham no Brasil, sendo 66% deles em condições consideradas prejudiciais ao desenvolvimento.",
      "O Brasil tem a 4ª maior taxa de trabalho infantil da América Latina, concentrada principalmente nas regiões Norte e Nordeste, onde a pobreza é mais intensa."
    ],
    "time_limit_minutes": 60,
    "min_words": 200,
    "max_words": 400,
    "checklist": [
      "Introdução com contexto + tese clara",
      "D1 com tópico frasal + evidência",
      "D2 com argumento diferente do D1",
      "Conclusão com proposta A-A-M-E-D",
      "Conectivos variados",
      "Sem fuga ao tema"
    ]
  }',
  60
),
(
  5, 'Redação Completa', 2, 'L5_avancado', 'full_essay',
  'Simulado Avançado — Tema Abstrato',
  'Temas abstratos são os mais difíceis do ENEM. Demonstre domínio completo com este simulado.',
  '{
    "theme": "O papel da memória cultural na construção da identidade nacional brasileira",
    "motivation_texts": [
      "''A memória é o único paraíso do qual não podemos ser expulsos.'' — Jean Paul Richter",
      "O Brasil é o país com maior número de línguas indígenas vivas na América Latina — são 274 línguas de 305 etnias distintas (IBGE, 2022) —, mas apenas 2% da população reconhece patrimônio cultural indígena como parte de sua identidade.",
      "O movimento de patrimonialização do UNESCO busca preservar bens culturais imateriais, como o Frevo (PE) e o Carimbó (PA), como expressões únicas da identidade brasileira."
    ],
    "time_limit_minutes": 60,
    "min_words": 250,
    "max_words": 400,
    "checklist": [
      "Tema abstrato exige definição conceitual na introdução",
      "D1: dimensão histórica ou cultural",
      "D2: consequência social da perda de memória ou solução",
      "Conclusão com proposta viável de valorização cultural",
      "Evite generalizar: ''os brasileiros fazem...'' → cite dados"
    ]
  }',
  60
);

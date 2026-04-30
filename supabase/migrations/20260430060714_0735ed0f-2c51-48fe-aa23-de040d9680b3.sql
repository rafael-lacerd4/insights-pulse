-- Tabelas para os dados do dashboard, alimentadas via sync com Google Sheets
CREATE TABLE public.funcionarios (
  id BIGSERIAL PRIMARY KEY,
  funcionario TEXT NOT NULL,
  setor TEXT NOT NULL,
  cargo TEXT NOT NULL,
  tempo_empresa NUMERIC,
  salario_base NUMERIC,
  horas_extras NUMERIC,
  adicional_noturno NUMERIC,
  faltas INTEGER,
  atrasos INTEGER,
  produtividade NUMERIC,
  projetos_entregues INTEGER,
  consumo_energia_kwh NUMERIC,
  uso_papel NUMERIC,
  deslocamento_km NUMERIC,
  emissao_co2 NUMERIC,
  custo_total NUMERIC,
  custo_por_resultado NUMERIC,
  nivel_risco TEXT,
  impacto_sustentabilidade NUMERIC,
  sugestao_ia TEXT,
  score_desperdicio NUMERIC,
  faixa_desperdicio TEXT,
  alerta_qualidade TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.padroes_criticos (
  id BIGSERIAL PRIMARY KEY,
  setor TEXT NOT NULL,
  padrao TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostico (
  id BIGSERIAL PRIMARY KEY,
  pergunta TEXT NOT NULL,
  setor TEXT,
  detalhamento TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dataset_meta (
  id INTEGER PRIMARY KEY DEFAULT 1,
  spreadsheet_id TEXT,
  sheet_name TEXT DEFAULT 'base',
  last_sync_at TIMESTAMPTZ,
  total_rows INTEGER,
  source TEXT,
  CONSTRAINT only_one_row CHECK (id = 1)
);
INSERT INTO public.dataset_meta (id) VALUES (1);

-- Habilita RLS e libera leitura pública (dashboard é uma visualização aberta)
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.padroes_criticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read funcionarios" ON public.funcionarios FOR SELECT USING (true);
CREATE POLICY "Public read padroes" ON public.padroes_criticos FOR SELECT USING (true);
CREATE POLICY "Public read diagnostico" ON public.diagnostico FOR SELECT USING (true);
CREATE POLICY "Public read meta" ON public.dataset_meta FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.funcionarios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dataset_meta;

CREATE INDEX idx_funcionarios_setor ON public.funcionarios(setor);
CREATE INDEX idx_funcionarios_cargo ON public.funcionarios(cargo);
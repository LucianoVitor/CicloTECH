CREATE TABLE public.equipamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  categoria text NOT NULL,
  condicao text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipamentos TO authenticated;
GRANT ALL ON public.equipamentos TO service_role;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner CRUD equipamentos" ON public.equipamentos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX equipamentos_user_id_idx ON public.equipamentos(user_id);
CREATE TRIGGER equipamentos_updated_at BEFORE UPDATE ON public.equipamentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.doacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  equipamento_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'Ativo',
  observacoes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT doacoes_equipamento_owner_fkey FOREIGN KEY (equipamento_id, user_id) REFERENCES public.equipamentos(id, user_id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doacoes TO authenticated;
GRANT ALL ON public.doacoes TO service_role;
ALTER TABLE public.doacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner CRUD doacoes" ON public.doacoes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX doacoes_user_id_idx ON public.doacoes(user_id);
CREATE INDEX doacoes_equipamento_owner_idx ON public.doacoes(equipamento_id, user_id);
CREATE TRIGGER doacoes_updated_at BEFORE UPDATE ON public.doacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
COMMENT ON TABLE public.doacoes IS 'Doações vinculadas a equipamentos do mesmo proprietário; excluir o equipamento exclui suas doações.';
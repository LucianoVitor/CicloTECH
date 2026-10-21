import type { Database } from '@/integrations/supabase/types';

export interface Equipamento {
  id: string;
  user_id: string;
  titulo: string;
  categoria: string;
  condicao: string;
  descricao: string;
  imagem_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Doacao {
  id: string;
  user_id: string;
  equipamento_id: string;
  status: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export type NovoEquipamento = Pick<Equipamento, 'titulo' | 'categoria' | 'condicao'> &
  Partial<Pick<Equipamento, 'descricao' | 'imagem_url'>>;
export type AtualizarEquipamento = Partial<NovoEquipamento>;
export type NovaDoacao = Pick<Doacao, 'equipamento_id'> &
  Partial<Pick<Doacao, 'status' | 'observacoes'>>;
export type AtualizarDoacao = Partial<NovaDoacao>;

// Usa o esquema regenerado automaticamente após a criação das tabelas.
export type EquipamentosDatabase = Database;
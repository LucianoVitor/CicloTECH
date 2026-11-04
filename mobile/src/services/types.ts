import type { Tables } from '@/types/database';

export type Equipamento = Tables<'equipamentos'>;
export type Doacao = Tables<'doacoes'>;
export type Perfil = Tables<'profiles'>;

export type NovoEquipamento = Pick<Equipamento, 'titulo' | 'categoria' | 'condicao'> &
  Partial<Pick<Equipamento, 'descricao' | 'imagem_url'>>;
export type AtualizarEquipamento = Partial<NovoEquipamento>;

export type NovaDoacao = Pick<Doacao, 'equipamento_id'> &
  Partial<Pick<Doacao, 'status' | 'observacoes'>>;
export type AtualizarDoacao = Partial<NovaDoacao>;

export type AtualizarPerfil = Partial<Pick<Perfil, 'full_name' | 'phone' | 'address' | 'avatar_url'>>;

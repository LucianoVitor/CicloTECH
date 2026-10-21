import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { EquipamentosDatabase } from './equipamentos.types';
import { EquipamentosService, DoacoesService } from './EquipamentosService';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

function criarClient() {
  const resultado = { data: { id: 'registro-1' }, error: null };
  const query = {
    select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [resultado.data], error: null }),
    single: vi.fn().mockResolvedValue(resultado),
  };
  const client = { from: vi.fn(() => query), auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'dono-1' } }, error: null }) } };
  return { client: client as unknown as SupabaseClient<EquipamentosDatabase>, raw: client, query };
}

describe.each([
  { Classe: EquipamentosService, tabela: 'equipamentos', dados: { titulo: 'RAM', categoria: 'RAM', condicao: 'Usado' }, alteracao: { titulo: 'RAM atualizada' } },
  { Classe: DoacoesService, tabela: 'doacoes', dados: { equipamento_id: 'equipamento-1' }, alteracao: { observacoes: 'Retirada combinada' } },
])('CRUD $tabela', ({ Classe, tabela, dados, alteracao }) => {
  let mock: ReturnType<typeof criarClient>;
  beforeEach(() => { mock = criarClient(); });

  it('busca pelo ID e retorna dados persistidos', async () => {
    expect(await new Classe(mock.client).buscar('registro-1')).toEqual([{ id: 'registro-1' }]);
    expect(mock.raw.from).toHaveBeenCalledWith(tabela);
    expect(mock.query.eq).toHaveBeenCalledWith('id', 'registro-1');
  });

  it('insere usando o dono autenticado, não o dono enviado', async () => {
    const service = new Classe(mock.client);
    // A união de construtores exige os campos das duas entidades neste teste parametrizado.
    const entrada = { titulo: 'RAM', categoria: 'RAM', condicao: 'Usado', equipamento_id: 'equipamento-1', ...dados, user_id: 'outro-dono' };
    await service.inserir(entrada);
    expect(mock.query.insert).toHaveBeenCalledWith({ ...dados, user_id: 'dono-1' });
  });

  it('atualiza somente campos editáveis e filtra o ID', async () => {
    const entrada = { ...alteracao, user_id: 'outro-dono' };
    await new Classe(mock.client).atualizar('registro-1', entrada);
    expect(mock.query.update).toHaveBeenCalledWith(alteracao);
    expect(mock.query.eq).toHaveBeenCalledWith('id', 'registro-1');
  });

  it('deleta apenas o registro solicitado', async () => {
    await new Classe(mock.client).deletar('registro-1');
    expect(mock.query.delete).toHaveBeenCalledOnce();
    expect(mock.query.eq).toHaveBeenCalledWith('id', 'registro-1');
  });

  it('propaga erros do banco', async () => {
    mock.query.single.mockResolvedValueOnce({ data: null, error: { message: 'Registro indisponível' } });
    await expect(new Classe(mock.client).deletar('registro-1')).rejects.toEqual({ message: 'Registro indisponível' });
  });

  it('recusa atualização vazia', async () => {
    await expect(new Classe(mock.client).atualizar('registro-1', {})).rejects.toThrow('Informe ao menos um campo');
    expect(mock.query.update).not.toHaveBeenCalled();
  });
});
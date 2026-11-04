import { ServicoAutenticado, camposPermitidos } from './ServicoAutenticado';
import type { AtualizarDoacao, Doacao, NovaDoacao } from './types';

const campos = ['equipamento_id', 'status', 'observacoes'] as const;

export type DoacaoComEquipamento = Doacao & {
  equipamentos: { titulo: string; categoria: string } | null;
};

/**
 * CRUD de doações. A FK composta (equipamento_id, user_id) garante que a doação
 * só referencie equipamentos do mesmo proprietário.
 */
export class DoacoesService extends ServicoAutenticado {
  async buscar(id?: string): Promise<DoacaoComEquipamento[]> {
    let query = this.client.from('doacoes').select('*, equipamentos(titulo, categoria)');
    if (id) query = query.eq('id', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DoacaoComEquipamento[];
  }

  async inserir(dados: NovaDoacao): Promise<Doacao> {
    const user_id = await this.usuarioAtual();
    const { data, error } = await this.client
      .from('doacoes')
      .insert({ ...camposPermitidos(dados, campos), equipamento_id: dados.equipamento_id, user_id })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async atualizar(id: string, dados: AtualizarDoacao): Promise<Doacao> {
    const alteracoes = camposPermitidos(dados, campos);
    this.validarAlteracoes(alteracoes);
    const { data, error } = await this.client
      .from('doacoes')
      .update(alteracoes)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  /** Remove somente a doação, sem excluir o equipamento. */
  async deletar(id: string): Promise<void> {
    const { error } = await this.client.from('doacoes').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
}

export const doacoesService = new DoacoesService();

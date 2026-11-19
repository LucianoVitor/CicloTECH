import { ServicoAutenticado, camposPermitidos } from './ServicoAutenticado';
import type { AtualizarDoacao, Doacao, Equipamento, NovaDoacao } from './types';

const campos = ['equipamento_id', 'status', 'observacoes', 'autor_nome'] as const;

export type DoacaoComEquipamento = Doacao & {
  equipamentos: Pick<Equipamento, 'titulo' | 'categoria' | 'condicao' | 'imagem_url' | 'descricao'> | null;
};

const SELECT_COM_EQUIPAMENTO = '*, equipamentos(titulo, categoria, condicao, imagem_url, descricao)';

/**
 * CRUD de doações. A FK composta (equipamento_id, user_id) garante que a doação
 * só referencie equipamentos do mesmo proprietário.
 */
export class DoacoesService extends ServicoAutenticado {
  /** "Minhas doações": só as do usuário logado (a RLS também libera ver as ativas de outros, para a vitrine). */
  async buscar(id?: string): Promise<DoacaoComEquipamento[]> {
    const uid = await this.usuarioAtual();
    let query = this.client.from('doacoes').select(SELECT_COM_EQUIPAMENTO).eq('user_id', uid);
    if (id) query = query.eq('id', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DoacaoComEquipamento[];
  }

  /** Vitrine: doações ATIVAS de todos os usuários, com os dados do equipamento. */
  async vitrine(): Promise<DoacaoComEquipamento[]> {
    const { data, error } = await this.client
      .from('doacoes')
      .select(SELECT_COM_EQUIPAMENTO)
      .eq('status', 'Ativo')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DoacaoComEquipamento[]).filter((d) => d.equipamentos);
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

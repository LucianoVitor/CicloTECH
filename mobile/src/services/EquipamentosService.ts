import { ServicoAutenticado, camposPermitidos } from './ServicoAutenticado';
import type { AtualizarEquipamento, Equipamento, NovoEquipamento } from './types';

const campos = ['titulo', 'categoria', 'condicao', 'descricao', 'imagem_url'] as const;

/** CRUD de equipamentos do usuário autenticado (a RLS também libera ver equipamentos em doação de outros). */
export class EquipamentosService extends ServicoAutenticado {
  /** "Meus equipamentos": sem ID lista os do usuário (mais recentes primeiro); com ID filtra um registro. */
  async buscar(id?: string): Promise<Equipamento[]> {
    const uid = await this.usuarioAtual();
    let query = this.client.from('equipamentos').select('*').eq('user_id', uid);
    if (id) query = query.eq('id', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async inserir(dados: NovoEquipamento): Promise<Equipamento> {
    const user_id = await this.usuarioAtual();
    const { data, error } = await this.client
      .from('equipamentos')
      .insert({
        ...camposPermitidos(dados, campos),
        titulo: dados.titulo,
        categoria: dados.categoria,
        condicao: dados.condicao,
        user_id,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  /** Atualização parcial, sempre filtrada por ID. */
  async atualizar(id: string, dados: AtualizarEquipamento): Promise<Equipamento> {
    const alteracoes = camposPermitidos(dados, campos);
    this.validarAlteracoes(alteracoes);
    const { data, error } = await this.client
      .from('equipamentos')
      .update(alteracoes)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  /** Exclui por ID; as doações vinculadas são removidas em cascata pelo banco. */
  async deletar(id: string): Promise<void> {
    const { error } = await this.client.from('equipamentos').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
}

export const equipamentosService = new EquipamentosService();

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type {
  EquipamentosDatabase, Equipamento, Doacao, NovoEquipamento,
  AtualizarEquipamento, NovaDoacao, AtualizarDoacao,
} from './equipamentos.types';

type Client = SupabaseClient<EquipamentosDatabase>;

/** Mantém somente campos editáveis; IDs, proprietário e datas pertencem ao banco. */
function camposPermitidos<T extends object>(dados: T, campos: readonly (keyof T)[]): Partial<T> {
  const resultado: Partial<T> = {};
  for (const campo of campos) {
    if (dados[campo] !== undefined) resultado[campo] = dados[campo];
  }
  return resultado;
}

const equipamentoCampos = ['titulo', 'categoria', 'condicao', 'descricao', 'imagem_url'] as const;
const doacaoCampos = ['equipamento_id', 'status', 'observacoes'] as const;

/** Base compartilhada: a conexão existente conserva a sessão e aplica as regras RLS. */
class ServicoAutenticado {
  constructor(protected readonly client: Client = supabase) {}

  protected async usuarioAtual(): Promise<string> {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('Faça login para cadastrar equipamentos ou doações.');
    return data.user.id;
  }

  protected validarAlteracoes(dados: object): void {
    if (Object.keys(dados).length === 0) throw new Error('Informe ao menos um campo para atualizar.');
  }
}

/** CRUD de equipamentos. A RLS permite acesso apenas aos registros do usuário autenticado. */
export class EquipamentosService extends ServicoAutenticado {
  /** GET/select: sem ID lista registros, do mais recente ao mais antigo. Com ID filtra um registro. */
  async buscar(id?: string): Promise<Equipamento[]> {
    let query = this.client.from('equipamentos').select('*');
    if (id) query = query.eq('id', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** POST/insert: obtém o proprietário da sessão, insere e retorna o registro salvo pelo banco. */
  async inserir(dados: NovoEquipamento): Promise<Equipamento> {
    const user_id = await this.usuarioAtual();
    const campos = camposPermitidos(dados, equipamentoCampos);
    const { data, error } = await this.client.from('equipamentos')
      .insert({ ...campos, titulo: dados.titulo, categoria: dados.categoria, condicao: dados.condicao, user_id })
      .select('*').single();
    if (error) throw error;
    return data;
  }

  /** PUT/update: altera somente os campos enviados e filtra pelo ID para não atualizar toda a tabela. */
  async atualizar(id: string, dados: AtualizarEquipamento): Promise<Equipamento> {
    const campos = camposPermitidos(dados, equipamentoCampos);
    this.validarAlteracoes(campos);
    const { data, error } = await this.client.from('equipamentos').update(campos)
      .eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  /** DELETE/delete: exclui por ID e confirma o registro afetado; doações vinculadas são excluídas em cascata. */
  async deletar(id: string): Promise<void> {
    const { error } = await this.client.from('equipamentos').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
}

/** CRUD de doações, separadas dos dados descritivos de equipamentos. */
export class DoacoesService extends ServicoAutenticado {
  /** GET/select: lista as doações acessíveis à sessão ou filtra por ID. */
  async buscar(id?: string): Promise<Doacao[]> {
    let query = this.client.from('doacoes').select('*');
    if (id) query = query.eq('id', id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** POST/insert: vincula a doação a um equipamento do mesmo proprietário e retorna os valores persistidos. */
  async inserir(dados: NovaDoacao): Promise<Doacao> {
    const user_id = await this.usuarioAtual();
    const campos = camposPermitidos(dados, doacaoCampos);
    const { data, error } = await this.client.from('doacoes')
      .insert({ ...campos, equipamento_id: dados.equipamento_id, user_id }).select('*').single();
    if (error) throw error;
    return data;
  }

  /** PUT/update: permite atualização parcial; a chave estrangeira também valida mudanças de equipamento. */
  async atualizar(id: string, dados: AtualizarDoacao): Promise<Doacao> {
    const campos = camposPermitidos(dados, doacaoCampos);
    this.validarAlteracoes(campos);
    const { data, error } = await this.client.from('doacoes').update(campos)
      .eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  /** DELETE/delete: remove somente a doação solicitada, sem excluir seu equipamento. */
  async deletar(id: string): Promise<void> {
    const { error } = await this.client.from('doacoes').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
}

// Instâncias prontas para uso: await equipamentosService.buscar();
// await equipamentosService.inserir({ titulo: 'Memória RAM', categoria: 'RAM', condicao: 'Usado' });
// await doacoesService.inserir({ equipamento_id: equipamento.id });
export const equipamentosService = new EquipamentosService();
export const doacoesService = new DoacoesService();
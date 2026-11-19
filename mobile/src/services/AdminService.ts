import { ServicoAutenticado } from './ServicoAutenticado';
import type { DoacaoComEquipamento } from './DoacoesService';
import type { Perfil } from './types';

/** Operações do painel de administração. A RLS só as permite para usuários com papel "admin". */
export class AdminService extends ServicoAutenticado {
  async usuarios(): Promise<Perfil[]> {
    const { data, error } = await this.client.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async idsAdmins(): Promise<Set<string>> {
    const { data, error } = await this.client.from('user_roles').select('user_id').eq('role', 'admin');
    if (error) throw error;
    return new Set((data ?? []).map((r) => r.user_id));
  }

  async definirAdmin(userId: string, admin: boolean): Promise<void> {
    const meuId = await this.usuarioAtual();
    if (userId === meuId && !admin) throw new Error('Você não pode remover o seu próprio acesso de administrador.');
    const { error } = admin
      ? await this.client.from('user_roles').insert({ user_id: userId, role: 'admin' })
      : await this.client.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    if (error) throw error;
  }

  async todasDoacoes(): Promise<DoacaoComEquipamento[]> {
    const { data, error } = await this.client
      .from('doacoes')
      .select('*, equipamentos(titulo, categoria, condicao, imagem_url, descricao)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DoacaoComEquipamento[];
  }

  async removerDoacao(id: string): Promise<void> {
    const { error } = await this.client.from('doacoes').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }
}

export const adminService = new AdminService();

import { ServicoAutenticado, camposPermitidos } from './ServicoAutenticado';
import type { AtualizarPerfil, Perfil } from './types';

const campos = ['full_name', 'phone', 'address', 'avatar_url'] as const;

/** Leitura e edição do perfil do usuário logado (tabela profiles, id = auth.uid()). */
export class PerfilService extends ServicoAutenticado {
  async meuPerfil(): Promise<Perfil | null> {
    const id = await this.usuarioAtual();
    const { data, error } = await this.client.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async atualizar(dados: AtualizarPerfil): Promise<Perfil> {
    const id = await this.usuarioAtual();
    const alteracoes = camposPermitidos(dados, campos);
    this.validarAlteracoes(alteracoes);
    const { data, error } = await this.client
      .from('profiles')
      .update(alteracoes)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

export const perfilService = new PerfilService();

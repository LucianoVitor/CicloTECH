import { ServicoAutenticado } from './ServicoAutenticado';
import type { Troca } from './types';

export type NovaTroca = Pick<Troca, 'titulo' | 'categoria' | 'descricao' | 'quer_trocar_por'> &
  Partial<Pick<Troca, 'imagem_url' | 'autor_nome'>>;

/** Anúncios de troca no banco (tabela trocas). Todos os logados veem os ativos; só o dono edita. */
export class TrocasService extends ServicoAutenticado {
  /** Vitrine: anúncios ativos de todos os usuários. */
  async ativas(): Promise<Troca[]> {
    const { data, error } = await this.client
      .from('trocas')
      .select('*')
      .eq('status', 'Ativo')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  /** "Minhas trocas": todos os anúncios do usuário, inclusive encerrados. */
  async minhas(): Promise<Troca[]> {
    const uid = await this.usuarioAtual();
    const { data, error } = await this.client
      .from('trocas')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async publicar(dados: NovaTroca): Promise<Troca> {
    const user_id = await this.usuarioAtual();
    const { data, error } = await this.client
      .from('trocas')
      .insert({
        user_id,
        titulo: dados.titulo,
        categoria: dados.categoria,
        descricao: dados.descricao,
        quer_trocar_por: dados.quer_trocar_por,
        imagem_url: dados.imagem_url ?? null,
        autor_nome: dados.autor_nome ?? '',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async definirStatus(id: string, status: 'Ativo' | 'Encerrada'): Promise<void> {
    const { error } = await this.client.from('trocas').update({ status }).eq('id', id).select('id').single();
    if (error) throw error;
  }

  /** Remove o anúncio (dono ou admin). */
  async remover(id: string): Promise<void> {
    const { error } = await this.client.from('trocas').delete().eq('id', id).select('id').single();
    if (error) throw error;
  }

  /** Admin: todos os anúncios (a RLS só devolve tudo para administradores). */
  async todas(): Promise<Troca[]> {
    const { data, error } = await this.client.from('trocas').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}

export const trocasService = new TrocasService();

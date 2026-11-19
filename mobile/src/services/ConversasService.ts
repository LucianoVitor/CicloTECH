import type { RealtimeChannel } from '@supabase/supabase-js';
import { ServicoAutenticado } from './ServicoAutenticado';
import type { Conversa, Mensagem } from './types';

export type ItemDaConversa = {
  item_tipo: 'doacao' | 'troca';
  item_id: string;
  item_titulo: string;
  item_categoria: string;
  item_imagem_url: string | null;
  dono_id: string;
  dono_nome: string;
};

/** Conversas reais entre usuários (tabelas conversas + mensagens). Só os 2 participantes acessam. */
export class ConversasService extends ServicoAutenticado {
  async meuId(): Promise<string> {
    return this.usuarioAtual();
  }

  /** Conversas em que o usuário é dono do item ou interessado. */
  async minhas(): Promise<Conversa[]> {
    const uid = await this.usuarioAtual();
    const { data, error } = await this.client
      .from('conversas')
      .select('*')
      .or(`dono_id.eq.${uid},interessado_id.eq.${uid}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async buscar(id: string): Promise<Conversa | null> {
    const { data, error } = await this.client.from('conversas').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  /** Reabre a conversa existente do usuário sobre o item, ou cria uma nova com a primeira mensagem. */
  async abrirOuCriar(item: ItemDaConversa, meuNome: string, primeiraMensagem: string): Promise<string> {
    const uid = await this.usuarioAtual();
    if (uid === item.dono_id) throw new Error('Este anúncio é seu.');

    const { data: existente, error: erroBusca } = await this.client
      .from('conversas')
      .select('id')
      .eq('item_tipo', item.item_tipo)
      .eq('item_id', item.item_id)
      .eq('interessado_id', uid)
      .maybeSingle();
    if (erroBusca) throw erroBusca;
    if (existente) return existente.id;

    const { data, error } = await this.client
      .from('conversas')
      .insert({ ...item, interessado_id: uid, interessado_nome: meuNome })
      .select('id')
      .single();
    if (error) throw error;
    await this.enviar(data.id, primeiraMensagem);
    return data.id;
  }

  async mensagens(conversaId: string): Promise<Mensagem[]> {
    const { data, error } = await this.client
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversaId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /** Última mensagem de cada conversa (para a lista "Minhas conversas"). */
  async ultimasMensagens(conversaIds: string[]): Promise<Record<string, Mensagem>> {
    if (conversaIds.length === 0) return {};
    const { data, error } = await this.client
      .from('mensagens')
      .select('*')
      .in('conversa_id', conversaIds)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    const ultimas: Record<string, Mensagem> = {};
    for (const m of data ?? []) if (!ultimas[m.conversa_id]) ultimas[m.conversa_id] = m;
    return ultimas;
  }

  async enviar(conversaId: string, texto: string): Promise<Mensagem> {
    const autor_id = await this.usuarioAtual();
    const { data, error } = await this.client
      .from('mensagens')
      .insert({ conversa_id: conversaId, autor_id, texto: texto.trim() })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  /** Recebe mensagens novas ao vivo (Supabase Realtime). Retorna a função para cancelar. */
  assinar(conversaId: string, aoReceber: (m: Mensagem) => void): () => void {
    const canal: RealtimeChannel = this.client
      .channel(`mensagens-${conversaId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `conversa_id=eq.${conversaId}` },
        (payload) => aoReceber(payload.new as Mensagem),
      )
      .subscribe();
    return () => {
      this.client.removeChannel(canal);
    };
  }
}

export const conversasService = new ConversasService();

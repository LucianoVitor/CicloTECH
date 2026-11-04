import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type Client = SupabaseClient<Database>;

/** Mantém somente campos editáveis; IDs, proprietário e datas pertencem ao banco. */
export function camposPermitidos<T extends object>(dados: T, campos: readonly (keyof T)[]): Partial<T> {
  const resultado: Partial<T> = {};
  for (const campo of campos) {
    if (dados[campo] !== undefined) resultado[campo] = dados[campo];
  }
  return resultado;
}

/** Base compartilhada: reutiliza o cliente único (sessão + RLS) em vez de duplicar configuração. */
export abstract class ServicoAutenticado {
  constructor(protected readonly client: Client = supabase) {}

  protected async usuarioAtual(): Promise<string> {
    const { data, error } = await this.client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('Faça login para continuar.');
    return data.user.id;
  }

  protected validarAlteracoes(dados: object): void {
    if (Object.keys(dados).length === 0) throw new Error('Informe ao menos um campo para atualizar.');
  }
}

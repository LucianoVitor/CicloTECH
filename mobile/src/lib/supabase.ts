import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import type { Database } from '@/types/database';

// O Expo só embute variáveis EXPO_PUBLIC_* lidas assim, de forma literal (process.env.NOME).
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

// Valores de exemplo do .env.example contam como "não configurado".
const PLACEHOLDERS = ['SEU-PROJETO', 'sua-chave-publica'];

function urlValida(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/** Lista o que falta configurar; vazia quando as duas variáveis estão corretas. */
function problemasDeConfiguracao(): string[] {
  const problemas: string[] = [];
  if (!SUPABASE_URL || PLACEHOLDERS.some((p) => SUPABASE_URL.includes(p))) {
    problemas.push('EXPO_PUBLIC_SUPABASE_URL não preenchida');
  } else if (!urlValida(SUPABASE_URL)) {
    problemas.push('EXPO_PUBLIC_SUPABASE_URL não é uma URL válida');
  }
  if (!SUPABASE_PUBLISHABLE_KEY || PLACEHOLDERS.includes(SUPABASE_PUBLISHABLE_KEY)) {
    problemas.push('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY não preenchida');
  }
  return problemas;
}

export const problemasSupabase = problemasDeConfiguracao();
export const supabaseConfigurado = problemasSupabase.length === 0;

export const MENSAGEM_CONFIGURACAO =
  'Supabase não configurado. Crie mobile/.env a partir de mobile/.env.example, ' +
  'preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
  'e reinicie com "npx expo start -c".';

export class SupabaseNaoConfiguradoError extends Error {
  constructor() {
    super(`${MENSAGEM_CONFIGURACAO} (${problemasSupabase.join('; ')})`);
    this.name = 'SupabaseNaoConfiguradoError';
  }
}

function criarCliente(): SupabaseClient<Database> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      // No web (expo start --web) o supabase-js usa localStorage por padrão.
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  // Em apps nativos, renova o token apenas com o app em primeiro plano.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
  }
  return client;
}

/**
 * Sem configuração, importar este módulo NÃO quebra o app: o cliente vira um substituto
 * que só lança SupabaseNaoConfiguradoError quando alguém tenta usá-lo de fato.
 * O _layout.tsx consulta `supabaseConfigurado` e mostra uma tela de instruções antes disso.
 */
function criarClienteIndisponivel(): SupabaseClient<Database> {
  return new Proxy({} as SupabaseClient<Database>, {
    get() {
      throw new SupabaseNaoConfiguradoError();
    },
  });
}

if (!supabaseConfigurado && __DEV__) {
  console.warn(`[CicloTECH] ${MENSAGEM_CONFIGURACAO}\nProblemas: ${problemasSupabase.join('; ')}`);
}

/** Cliente único do app: a sessão fica no AsyncStorage e as regras RLS do banco se aplicam a cada consulta. */
export const supabase: SupabaseClient<Database> = supabaseConfigurado ? criarCliente() : criarClienteIndisponivel();

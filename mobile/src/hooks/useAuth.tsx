import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { mensagemDeErro } from '@/lib/erros';
import { supabase, supabaseConfigurado } from '@/lib/supabase';

export type TipoUsuario = 'donor' | 'student';

type AuthContextValue = {
  session: Session | null;
  carregando: boolean;
  /** false quando mobile/.env não tem URL/chave válidas; o _layout mostra as instruções. */
  configurado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  /** Retorna true quando o Supabase exige confirmação por e-mail antes do primeiro login. */
  cadastrar: (dados: { email: string; senha: string; nome: string; tipo: TipoUsuario }) => Promise<boolean>;
  recuperarSenha: (email: string) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Lança sempre um Error com mensagem legível em português. */
function falhar(erro: unknown): never {
  throw new Error(mensagemDeErro(erro));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(supabaseConfigurado);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    supabase.auth
      .getSession()
      .then(({ data }) => ativo && setSession(data.session))
      .catch((e) => console.warn('[CicloTECH] Falha ao restaurar a sessão:', mensagemDeErro(e)))
      .finally(() => ativo && setCarregando(false));
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => setSession(novaSessao));
    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    carregando,
    configurado: supabaseConfigurado,

    async entrar(email, senha) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) falhar(error);
      } catch (e) {
        falhar(e);
      }
    },

    async cadastrar({ email, senha, nome, tipo }) {
      try {
        // Mesmo formato da Web: o trigger handle_new_user lê full_name e user_type destes metadados.
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { full_name: nome, user_type: tipo } },
        });
        if (error) falhar(error);
        return !data.session;
      } catch (e) {
        falhar(e);
      }
    },

    async recuperarSenha(email) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) falhar(error);
      } catch (e) {
        falhar(e);
      }
    },

    async sair() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch {
        // Sem rede o logout global falha; ainda assim a sessão deste aparelho é encerrada.
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
        setSession(null);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}

import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (email: string, senha: string, nome: string) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => setSession(novaSessao));
    return () => data.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    carregando,
    async entrar(email, senha) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
    },
    async cadastrar(email, senha, nome) {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { full_name: nome } },
      });
      if (error) throw error;
    },
    async sair() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}

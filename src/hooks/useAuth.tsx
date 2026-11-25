import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  /** true até a sessão E o papel de admin terem sido verificados. */
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

/**
 * O papel de administrador vem SOMENTE do banco: função has_role (tabela user_roles), que roda
 * com as políticas de segurança do Supabase. Não há e-mail nem senha de admin no código.
 */
async function verificarAdmin(uid: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
  if (error) return false;
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    const aplicarSessao = async (s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);
      const admin = s?.user ? await verificarAdmin(s.user.id) : false;
      if (ativo) setIsAdmin(admin);
    };

    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Ao entrar/sair, segura o "loading" até saber se é admin (evita redirecionar a tela de admin por engano).
      const trocouUsuario = event === "SIGNED_IN" || event === "SIGNED_OUT";
      if (trocouUsuario) setLoading(true);
      // setTimeout evita chamar o Supabase dentro do callback do próprio Auth.
      setTimeout(async () => {
        await aplicarSessao(newSession);
        if (trocouUsuario && ativo) setLoading(false);
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      await aplicarSessao(s);
      if (ativo) setLoading(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

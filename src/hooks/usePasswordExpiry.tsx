import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { senhaVencida } from "@/lib/passwordExpiry";

interface PasswordExpiryCtx {
  carregando: boolean;
  vencida: boolean;
  trocadaEm: string | null;
  /** Mensagem quando não foi possível consultar a data (ex.: migration ainda não aplicada). */
  erro: string | null;
  recarregar: () => Promise<void>;
}

const Ctx = createContext<PasswordExpiryCtx>({
  carregando: false,
  vencida: false,
  trocadaEm: null,
  erro: null,
  recarregar: async () => {},
});

export function PasswordExpiryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [estado, setEstado] = useState({ carregando: false, vencida: false, trocadaEm: null as string | null, erro: null as string | null });

  const recarregar = useCallback(async () => {
    if (!user) {
      setEstado({ carregando: false, vencida: false, trocadaEm: null, erro: null });
      return;
    }
    setEstado((e) => ({ ...e, carregando: true }));
    const { data, error } = await supabase
      .from("profiles")
      .select("password_changed_at")
      .eq("id", user.id)
      .maybeSingle());
    if (error || !data) {
      // Sem a data não dá para afirmar que venceu: não bloqueia o usuário, mas registra o motivo.
      setEstado({ carregando: false, vencida: false, trocadaEm: null, erro: error?.message ?? "Perfil não encontrado" });
      return;
    }
    setEstado({ carregando: false, vencida: senhaVencida(data.password_changed_at), trocadaEm: data.password_changed_at, erro: null });
  }, [user]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return <Ctx.Provider value={{ ...estado, recarregar }}>{children}</Ctx.Provider>;
}

export const usePasswordExpiry = () => useContext(Ctx);

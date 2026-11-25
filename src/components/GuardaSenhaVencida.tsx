import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePasswordExpiry } from "@/hooks/usePasswordExpiry";

/** Rotas liberadas mesmo com a senha vencida (a própria troca e a saída). */
const ROTAS_LIBERADAS = ["/trocar-senha", "/auth", "/esqueci-senha", "/redefinir-senha"];

/** Se a senha do usuário logado passou de 90 dias, só a tela /trocar-senha fica acessível. */
export default function GuardaSenhaVencida({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { vencida } = usePasswordExpiry();
  const { pathname } = useLocation();

  if (user && vencida && !ROTAS_LIBERADAS.includes(pathname)) {
    return <Navigate to="/trocar-senha" replace />;
  }
  return <>{children}</>;
}

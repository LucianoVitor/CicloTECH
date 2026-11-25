import { Navigate, useLocation } from "react-router-dom";

/** Redireciona mantendo query string e hash (o Supabase envia os tokens de recuperação no hash). */
export default function RedirecionarComHash({ para }: { para: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={`${para}${search}${hash}`} replace />;
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePasswordExpiry } from "@/hooks/usePasswordExpiry";
import { PasswordStrength } from "@/components/PasswordStrength";
import { DIAS_VALIDADE_SENHA } from "@/lib/passwordExpiry";
import { novaSenhaSchema, type NovaSenha } from "@/lib/passwordPolicy";
import { toast } from "sonner";

const CLASSE_INPUT =
  "w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-foreground placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm";

/** Troca obrigatória quando a senha passa de 90 dias (também pode ser usada a qualquer momento). */
export default function TrocarSenha() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { vencida, recarregar } = usePasswordExpiry();
  const [busy, setBusy] = useState(false);
  const form = useForm<NovaSenha>({ resolver: zodResolver(novaSenhaSchema), mode: "onTouched", defaultValues: { senha: "", confirmacao: "" } });
  const erros = form.formState.errors;

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const onSubmit = async ({ senha }: NovaSenha) => {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setBusy(false);
      toast.error(error.message.includes("different") ? "A nova senha precisa ser diferente da atual" : error.message);
      return;
    }
    // Registra no servidor a data da troca (o cliente não informa a data).
    const { error: rpcErro } = await supabase.rpc("registrar_troca_de_senha");
    if (rpcErro) console.error("registrar_troca_de_senha:", rpcErro.message);
    await recarregar();
    setBusy(false);
    toast.success("Senha trocada com sucesso");
    navigate("/perfil", { replace: true });
  };

  return (
    <section className="py-24 px-6 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-surface/60 backdrop-blur-xl border border-border/60 p-8">
        <h1 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase text-center mb-4">
          Trocar senha
        </h1>
        {vencida && (
          <p role="alert" className="mb-6 text-center text-sm text-yellow-400">
            Sua senha tem mais de {DIAS_VALIDADE_SENHA} dias. Para continuar usando o CicloTECH, crie uma nova senha.
          </p>
        )}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input type="password" placeholder="Nova senha" aria-label="Nova senha" className={CLASSE_INPUT} {...form.register("senha")} />
            </div>
            <PasswordStrength senha={form.watch("senha")} />
            {erros.senha && <p role="alert" className="text-[11px] text-destructive">{erros.senha.message}</p>}
          </div>
          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input type="password" placeholder="Confirmar senha" aria-label="Confirmar senha" className={CLASSE_INPUT} {...form.register("confirmacao")} />
            </div>
            {erros.confirmacao && <p role="alert" className="text-[11px] text-destructive">{erros.confirmacao.message}</p>}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar nova senha
          </button>
          <button type="button" onClick={() => void signOut()} className="w-full text-center text-[10px] font-data uppercase text-accent hover:underline">
            Sair da conta
          </button>
        </form>
      </div>
    </section>
  );
}

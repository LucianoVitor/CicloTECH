import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrength } from "@/components/PasswordStrength";
import { novaSenhaSchema, type NovaSenha } from "@/lib/passwordPolicy";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];
const CLASSE_INPUT =
  "w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-white placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const form = useForm<NovaSenha>({
    resolver: zodResolver(novaSenhaSchema),
    mode: "onTouched",
    defaultValues: { senha: "", confirmacao: "" },
  });
  const senha = form.watch("senha");
  const erros = form.formState.errors;

  useEffect(() => {
    // Supabase appends recovery tokens to the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else {
        toast.error("Link de recuperação inválido ou expirado");
        setTimeout(() => navigate("/esqueci-senha"), 1500);
      }
    });
  }, [navigate]);

  const onSubmit = async ({ senha: novaSenha }: NovaSenha) => {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    // Registra no servidor a data da troca (o cliente não informa a data).
    const { error: rpcErro } = await supabase.rpc("registrar_troca_de_senha");
    if (rpcErro) console.error("registrar_troca_de_senha:", rpcErro.message);
    // Encerra a sessão de recuperação: o usuário entra de novo já com a senha nova.
    await supabase.auth.signOut();
    setBusy(false);
    toast.success("Senha atualizada. Entre com a nova senha.");
    navigate("/auth", { replace: true });
  };

  return (
    <section className="py-24 px-6 flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
        className="w-full max-w-md"
      >
        <div className="bg-surface/60 backdrop-blur-xl border border-border/60 p-8 relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-primary/15 blur-[60px] rounded-full pointer-events-none" />
          <h1 className="text-2xl font-bold font-data text-white tracking-tighter uppercase text-center mb-8">
            Nova Senha
          </h1>
          {!ready ? (
            <p className="text-center text-white/70 font-data text-xs uppercase">Validando link...</p>
          ) : (
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary" />
                  <input type="password" placeholder="Nova senha" aria-label="Nova senha" className={CLASSE_INPUT} {...form.register("senha")} />
                </div>
                <PasswordStrength senha={senha} />
                {erros.senha && <p role="alert" className="text-[11px] text-destructive">{erros.senha.message}</p>}
              </div>
              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary" />
                  <input type="password" placeholder="Confirmar senha" aria-label="Confirmar senha" className={CLASSE_INPUT} {...form.register("confirmacao")} />
                </div>
                {erros.confirmacao && <p role="alert" className="text-[11px] text-destructive">{erros.confirmacao.message}</p>}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Atualizar Senha
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const schema = z.object({ email: z.string().trim().email("Email inválido").max(255) });
type Form = z.infer<typeof schema>;

/** Mensagem única: não revela se o e-mail está ou não cadastrado (evita enumeração de contas). */
export const MENSAGEM_ENVIO =
  "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha em instantes. Verifique também a caixa de spam.";

export default function EsqueciSenha() {
  const [enviado, setEnviado] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: Form) => {
    try {
      // O resultado é ignorado de propósito: a resposta na tela é sempre a mesma.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
    } catch {
      // Falha de rede também cai na mesma mensagem.
    }
    setEnviado(true);
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
          <h1 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase text-center mb-8">
            Esqueci minha senha
          </h1>
          {enviado ? (
            <div className="space-y-6 text-center">
              <p role="status" className="text-sm text-foreground/90">{MENSAGEM_ENVIO}</p>
              <Link to="/auth" className="text-xs font-data uppercase text-accent hover:underline">
                ← Voltar ao login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <p className="text-xs text-foreground/80 font-data uppercase tracking-wider">
                Informe seu e-mail para receber o link de redefinição
              </p>
              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary" />
                  <input
                    type="email"
                    placeholder="Email"
                    aria-label="Email"
                    autoComplete="email"
                    className="w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-foreground placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p role="alert" className="text-[11px] text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar link
              </button>
              <Link to="/auth" className="block text-center text-[10px] font-data uppercase text-accent hover:underline">
                ← Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}

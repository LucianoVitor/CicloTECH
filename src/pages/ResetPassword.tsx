import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase appends recovery tokens to the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else {
        toast.error("Link de recuperação inválido ou expirado");
        setTimeout(() => navigate("/auth"), 1500);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message);
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada");
    navigate("/perfil");
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary" />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-white placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary" />
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-white placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm"
                />
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(100);

function GlowInput({
  icon: Icon,
  ...props
}: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary transition-colors" />
      <input
        {...props}
        className="w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-foreground placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm transition-all"
      />
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder = "Senha",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative group">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary transition-colors" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full bg-background border border-border py-3 pl-12 pr-12 text-sm font-data text-foreground placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm transition-all"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-accent transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) navigate("/perfil", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Dados inválidos");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message);
      return;
    }
    toast.success("Bem-vindo ao Ciclo Tech");
    navigate("/perfil");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(fullName);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Dados inválidos");
      return;
    }
    setBusy(true);
    const redirectUrl = `${window.location.origin}/perfil`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, user_type: "donor" },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Este email já está cadastrado" : error.message);
      return;
    }
    toast.success("Conta criada! Verifique seu email para confirmar.");
    setTab("login");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Email inválido");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Link de recuperação enviado para seu email");
    setTab("login");
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

          <h1 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase text-center mb-8 relative">
            {tab === "login" ? "Entrar" : tab === "register" ? "Criar Conta" : "Recuperar Senha"}
          </h1>

          {tab !== "forgot" && (
            <div className="flex mb-8 border border-border relative">
              <button
                onClick={() => setTab("login")}
                className={`flex-1 py-3 text-xs font-data uppercase tracking-widest transition-all ${
                  tab === "login" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-accent"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab("register")}
                className={`flex-1 py-3 text-xs font-data uppercase tracking-widest transition-all ${
                  tab === "register" ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-accent"
                }`}
              >
                Cadastro
              </button>
            </div>
          )}

          {tab === "login" && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <GlowInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Entrar
              </button>
              <p className="text-center text-[10px] font-data text-foreground/70 uppercase">
                <button type="button" onClick={() => setTab("forgot")} className="text-accent hover:underline">
                  Esqueceu a senha?
                </button>
              </p>
            </form>
          )}

          {tab === "register" && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <GlowInput icon={User} type="text" placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <GlowInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mín. 8 caracteres)" />

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Conta
              </button>
            </form>
          )}

          {tab === "forgot" && (
            <form className="space-y-4" onSubmit={handleForgot}>
              <p className="text-xs text-foreground/80 font-data uppercase tracking-wider mb-4">
                Informe seu email para receber o link de recuperação
              </p>
              <GlowInput icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar Link
              </button>
              <button
                type="button"
                onClick={() => setTab("login")}
                className="w-full text-center text-[10px] font-data text-accent hover:underline uppercase"
              >
                ← Voltar ao login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}

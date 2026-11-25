import { forwardRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PasswordStrength } from "@/components/PasswordStrength";
import { senhaForte } from "@/lib/passwordPolicy";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const emailSchema = z.string().trim().email("Email inválido").max(255);
// No login só se exige a senha preenchida: contas antigas podem ter senhas anteriores à política.
const passwordSchema = z.string().min(1, "Informe a senha").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(100);

const cadastroSchema = z
  .object({
    nome: nameSchema,
    email: emailSchema,
    senha: senhaForte,
    confirmacao: z.string(),
  })
  .refine((v) => v.senha === v.confirmacao, { message: "As senhas não coincidem", path: ["confirmacao"] });
type Cadastro = z.infer<typeof cadastroSchema>;

function ErroCampo({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p role="alert" className="text-[11px] text-destructive">
      {mensagem}
    </p>
  );
}

const GlowInput = forwardRef<
  HTMLInputElement,
  { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>
>(function GlowInput({ icon: Icon, ...props }, ref) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-primary transition-colors" />
      <input
        ref={ref}
        {...props}
        className="w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-foreground placeholder:text-white/50 focus:outline-none focus:border-primary focus:glow-sm transition-all"
      />
    </div>
  );
});

function PasswordInput({
  value,
  onChange,
  onBlur,
  placeholder = "Senha",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
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
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label={placeholder}
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
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user && !loading) navigate(isAdmin ? "/admin" : "/perfil", { replace: true });
  }, [user, isAdmin, loading, navigate]);

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
    // useEffect handles redirect based on isAdmin
  };

  const cadastro = useForm<Cadastro>({
    resolver: zodResolver(cadastroSchema),
    mode: "onTouched",
    defaultValues: { nome: "", email: "", senha: "", confirmacao: "" },
  });
  const senhaCadastro = cadastro.watch("senha");

  const handleRegister = async ({ nome, email: emailCadastro, senha }: Cadastro) => {
    setBusy(true);
    const redirectUrl = `${window.location.origin}/perfil`;
    const { error } = await supabase.auth.signUp({
      email: emailCadastro,
      password: senha,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: nome, user_type: "donor" },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Este email já está cadastrado" : error.message);
      return;
    }
    toast.success("Conta criada! Verifique seu email para confirmar.");
    cadastro.reset();
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
            {tab === "login" ? "Entrar" : "Criar Conta"}
          </h1>

          {(
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
                <Link to="/esqueci-senha" className="text-accent hover:underline">
                  Esqueci minha senha
                </Link>
              </p>
            </form>
          )}

          {tab === "register" && (
            <form className="space-y-4" onSubmit={cadastro.handleSubmit(handleRegister)} noValidate>
              <div className="space-y-1">
                <GlowInput icon={User} type="text" placeholder="Nome completo" aria-label="Nome completo" {...cadastro.register("nome")} />
                <ErroCampo mensagem={cadastro.formState.errors.nome?.message} />
              </div>
              <div className="space-y-1">
                <GlowInput icon={Mail} type="email" placeholder="Email" aria-label="Email" {...cadastro.register("email")} />
                <ErroCampo mensagem={cadastro.formState.errors.email?.message} />
              </div>
              <div className="space-y-2">
                <Controller
                  control={cadastro.control}
                  name="senha"
                  render={({ field }) => (
                    <PasswordInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Senha" />
                  )}
                />
                <PasswordStrength senha={senhaCadastro} />
                <ErroCampo mensagem={cadastro.formState.errors.senha?.message} />
              </div>
              <div className="space-y-1">
                <Controller
                  control={cadastro.control}
                  name="confirmacao"
                  render={({ field }) => (
                    <PasswordInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Confirmar senha" />
                  )}
                />
                <ErroCampo mensagem={cadastro.formState.errors.confirmacao?.message} />
              </div>

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

        </div>
      </motion.div>
    </section>
  );
}

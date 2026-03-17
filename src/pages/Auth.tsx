import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, GraduationCap } from "lucide-react";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GlowInput({
  icon: Icon,
  ...props
}: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        {...props}
        className="w-full bg-background border border-border py-3 pl-12 pr-4 text-sm font-data text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-sm transition-all"
      />
    </div>
  );
}

export default function Auth() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"donor" | "student">("student");

  return (
    <section className="py-24 px-6 flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
        className="w-full max-w-md"
      >
        {/* Glassmorphism card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border/60 p-8 relative overflow-hidden">
          {/* Top glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-primary/15 blur-[60px] rounded-full pointer-events-none" />

          <h1 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase text-center mb-8 relative">
            {tab === "login" ? "Entrar" : "Criar Conta"}
          </h1>

          {/* Tab switcher */}
          <div className="flex mb-8 border border-border relative">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-xs font-data uppercase tracking-widest transition-all ${
                tab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-accent"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-3 text-xs font-data uppercase tracking-widest transition-all ${
                tab === "register"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-accent"
              }`}
            >
              Cadastro
            </button>
          </div>

          {tab === "login" ? (
            <form
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <GlowInput icon={Mail} type="email" placeholder="Email" />
              <GlowInput icon={Lock} type="password" placeholder="Senha" />
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all"
              >
                Entrar
              </button>
              <p className="text-center text-[10px] font-data text-muted-foreground uppercase">
                Esqueceu a senha?{" "}
                <a href="#" className="text-accent hover:underline">
                  Recuperar
                </a>
              </p>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* User type selector */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setUserType("donor")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-data uppercase tracking-widest border transition-all ${
                    userType === "donor"
                      ? "border-primary text-accent glow-sm"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Sou Doador
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("student")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-data uppercase tracking-widest border transition-all ${
                    userType === "student"
                      ? "border-primary text-accent glow-sm"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Sou Estudante
                </button>
              </div>

              <GlowInput icon={User} type="text" placeholder="Nome completo" />
              <GlowInput icon={Mail} type="email" placeholder={userType === "student" ? "Email institucional (.edu)" : "Email"} />
              <GlowInput icon={Lock} type="password" placeholder="Senha" />

              {userType === "student" && (
                <div className="bg-background border border-border p-3">
                  <p className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">
                    ⚡ Use seu email institucional (@fatec.sp.gov.br) para validação automática
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all"
              >
                Criar Conta
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}

import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import ctLogo from "@/assets/ct-logo.png";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Como Doar", path: "/como-doar" },
  { label: "Solicitar Hardware", path: "/solicitar" },
  { label: "Impacto ODS", path: "/impacto" },
  { label: "Sobre Nós", path: "/sobre" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground font-display">
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(217_33%_17%/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(217_33%_17%/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={ctLogo}
              alt="Ciclo Tech logo"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_hsl(217_91%_60%/0.5)]"
            />
            <span className="font-data font-bold tracking-tighter text-primary-foreground text-lg">
              CICLO TECH
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-data uppercase tracking-widest transition-colors duration-200 ${
                  location.pathname === link.path
                    ? "text-accent"
                    : "text-muted-foreground hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="px-6 py-2 text-xs font-data uppercase tracking-tighter bg-primary border border-accent text-primary-foreground glow-sm hover:glow-md transition-all duration-300"
            >
              Entrar / Cadastro
            </Link>
            <button
              className="xl:hidden text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`text-xs font-data uppercase tracking-widest py-2 ${
                  location.pathname === link.path
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="relative z-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-surface relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={ctLogo} alt="CT" className="w-8 h-8 object-contain opacity-60" />
                <span className="font-data font-bold tracking-tighter text-primary-foreground">
                  CICLO TECH
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tecnologia Circular para a Zona Leste. Transformando e-waste em oportunidade.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-data uppercase tracking-widest text-accent mb-4">Links Rápidos</h4>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-xs font-data text-muted-foreground hover:text-accent transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-data uppercase tracking-widest text-accent mb-4">Ações</h4>
              <div className="flex flex-col gap-2">
                <Link to="/doar" className="text-xs font-data text-muted-foreground hover:text-accent transition-colors uppercase tracking-wider">
                  Quero Doar
                </Link>
                <Link to="/solicitar" className="text-xs font-data text-muted-foreground hover:text-accent transition-colors uppercase tracking-wider">
                  Solicitar Hardware
                </Link>
                <Link to="/auth" className="text-xs font-data text-muted-foreground hover:text-accent transition-colors uppercase tracking-wider">
                  Entrar / Cadastro
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-data text-muted-foreground uppercase tracking-widest">
              © 2024 Ciclo Tech — Tecnologia Circular para a Zona Leste
            </div>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

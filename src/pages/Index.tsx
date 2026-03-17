import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Weight,
  Users,
  RefreshCcw,

import heroCpu from "@/assets/hero-cpu.png";
import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const navLinks = [
  "Início",
  "Como Doar",
  "Solicitar Hardware",
  "Impacto ODS",
  "Sobre Nós",
  "Acessibilidade (VLibras)",
];

const impactData = [
  {
    icon: Weight,
    value: "1,250 KG",
    label: "E-Waste Evitado",
    subtext:
      "Redução direta de metais pesados em aterros sanitários locais através da logística reversa.",
  },
  {
    icon: Users,
    value: "450+",
    label: "Estudantes Beneficiados",
    subtext:
      "Inclusão digital para alunos de baixa renda da Zona Leste, focando em educação técnica.",
  },
  {
    icon: RefreshCcw,
    value: "780",
    label: "Componentes Recirculados",
    subtext:
      "Peças testadas e certificadas que voltaram ao ciclo produtivo em vez do descarte.",
  },
];

const categories = [
  { title: "Processadores (CPU)", count: 30, image: catCpu },
  { title: "Memória RAM", count: 20, image: catRam },
  { title: "Armazenamento (SSD/HDD)", count: 10, image: catStorage },
  { title: "Placas de Vídeo (GPU)", count: 20, image: catGpu },
  { title: "Monitores", count: 20, image: catMonitor },
  { title: "Periféricos", count: 15, image: catPeripherals },
];

export default function Index() {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl border border-accent glow-sm">
              CT
            </div>
            <span className="font-data font-bold tracking-tighter text-primary-foreground text-lg">
              CICLO TECH
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-data uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-2 text-xs font-data uppercase tracking-tighter bg-primary border border-accent text-primary-foreground glow-sm hover:glow-md transition-all duration-300">
              Entrar / Cadastro
            </button>
            <button className="xl:hidden text-muted-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: BEZIER }}
            >
              {/* Partnership Badge */}
              <div className="inline-flex items-center gap-4 px-4 py-2 bg-surface border border-border mb-8">
                <span className="text-[10px] font-data text-muted-foreground uppercase tracking-widest">
                  Partners:
                </span>
                <span className="text-[10px] font-data text-accent font-bold uppercase">
                  Fatec Zona Leste
                </span>
                <div className="w-px h-3 bg-border" />
                <span className="text-[10px] font-data text-accent font-bold uppercase">
                  Shopee - Apoio Social
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-primary-foreground leading-[0.9] tracking-tighter mb-8 font-data">
                RECONECTANDO
                <br />
                FUTUROS:
                <br />
                <span className="text-primary glow-text">
                  DOE SEU HARDWARE
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-12 leading-relaxed">
                Transforme lixo eletrônico em oportunidade para estudantes da
                Zona Leste. Tecnologia circular e inclusiva.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all">
                  Quero Doar Agora
                </button>
                <button className="px-8 py-4 bg-transparent text-accent font-data text-sm uppercase tracking-widest border border-primary/30 hover:border-primary transition-all">
                  Sou Estudante, Preciso de Peças
                </button>
              </div>
            </motion.div>

            {/* Hero CPU Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: BEZIER }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
              <img
                src={heroCpu}
                alt="Holographic CPU centerpiece representing circular tech economy"
                className="relative z-10 w-full max-w-lg mx-auto drop-shadow-[0_0_40px_hsl(217_91%_60%/0.3)]"
              />
            </motion.div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-16">
              <div>
                <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
                  Metric Analysis
                </div>
                <h2 className="text-4xl font-bold text-primary-foreground font-data tracking-tighter uppercase">
                  Nosso Impacto
                </h2>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-muted-foreground font-data text-[10px] uppercase">
                  Data Refresh: 24.05.2024
                </p>
                <p className="text-muted-foreground font-data text-[10px] uppercase">
                  Source: ODS Global Report
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
              {impactData.map((item) => (
                <div
                  key={item.label}
                  className="p-8 bg-surface relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                  <item.icon className="w-6 h-6 text-primary mb-6" />
                  <div className="text-4xl font-bold font-data text-primary-foreground mb-2 tabular-nums tracking-tighter">
                    {item.value}
                  </div>
                  <div className="text-xs font-data uppercase text-accent tracking-widest mb-4">
                    {item.label}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
              Categorias de Doação
            </h2>
            <div className="h-1 w-24 bg-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="border border-border bg-background hover:border-primary/50 transition-all group overflow-hidden"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-bold text-primary-foreground font-data tracking-tight">
                      {cat.title}
                    </h3>
                    <span className="text-[10px] font-data text-muted-foreground uppercase tracking-widest">
                      {cat.count} itens disponíveis
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 text-[10px] font-data uppercase border border-border text-accent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                      Doar
                    </button>
                    <button className="py-2 text-[10px] font-data uppercase border border-border text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all">
                      Solicitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-surface relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-8 h-8 bg-secondary flex items-center justify-center font-bold text-secondary-foreground text-sm">
              CT
            </div>
            <span className="font-data font-bold tracking-tighter text-primary-foreground">
              CICLO TECH
            </span>
          </div>
          <div className="text-[10px] font-data text-muted-foreground uppercase tracking-widest">
            © 2024 Ciclo Tech — Tecnologia Circular para a Zona Leste
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

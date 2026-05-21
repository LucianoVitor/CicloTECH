import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Weight, Users, RefreshCcw } from "lucide-react";
import { useRef, type ReactNode } from "react";

import heroCpu from "@/assets/hero-cpu.png";
import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";
import RotatingPart from "@/components/RotatingPart";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const impactData = [
  {
    icon: Weight,
    value: "1,250 KG",
    label: "E-Waste Evitado",
    subtext: "Redução direta de metais pesados em aterros sanitários locais através da logística reversa.",
  },
  {
    icon: Users,
    value: "450+",
    label: "Estudantes Beneficiados",
    subtext: "Inclusão digital para alunos de baixa renda da Zona Leste, focando em educação técnica.",
  },
  {
    icon: RefreshCcw,
    value: "780",
    label: "Componentes Recirculados",
    subtext: "Peças testadas e certificadas que voltaram ao ciclo produtivo em vez do descarte.",
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
    <>
      {/* Hero Section */}
      <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: BEZIER }}
          >
            
            <h1 className="text-5xl lg:text-7xl font-bold text-primary-foreground leading-[0.9] tracking-tighter mb-8 font-data">
              RECONECTANDO<br />FUTUROS:<br />
              <span className="text-primary glow-text">DOE SEU HARDWARE</span>
            </h1>

            <p className="text-lg text-white max-w-lg mb-12 leading-relaxed">
              Transforme lixo eletrônico em oportunidade para estudantes da Zona Leste. Tecnologia circular e inclusiva.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/doar" className="px-8 py-4 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all">
                Quero Doar Agora
              </Link>
              <Link to="/solicitar" className="px-8 py-4 bg-transparent text-accent font-data text-sm uppercase tracking-widest border border-primary/30 hover:border-primary transition-all">
                Sou Estudante, Preciso de Peças
              </Link>
            </div>
          </motion.div>

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

      {/* Categories Section (moved up) */}
      <Reveal>
        <section className="relative py-32 px-6 max-w-7xl mx-auto overflow-hidden">
          <RotatingPart src={catGpu} size={420} className="-right-32 top-10" reverse />
          <RotatingPart src={catRam} size={280} className="-left-20 bottom-20" />
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">Categorias de Doação</h2>
            <div className="h-1 w-24 bg-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 0.06}>
                <div className="border border-border bg-background hover:border-primary/50 transition-all group overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-bold text-primary-foreground font-data tracking-tight">{cat.title}</h3>
                      <span className="text-[10px] font-data text-white/80 uppercase tracking-widest">{cat.count} itens disponíveis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/doar" className="py-2 text-center text-[10px] font-data uppercase border border-border text-accent hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                        Doar
                      </Link>
                      <Link to="/solicitar" className="py-2 text-center text-[10px] font-data uppercase border border-border text-white hover:bg-secondary hover:text-secondary-foreground transition-all">
                        Solicitar
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Impact Section (now above footer) */}
      <Reveal>
        <section className="py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-16">
              <div>
                <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">Metric Analysis</div>
                <h2 className="text-4xl font-bold text-primary-foreground font-data tracking-tighter uppercase">Nosso Impacto</h2>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-white/60 font-data text-[10px] uppercase">Data Refresh: 24.05.2026</p>
                <p className="text-white/60 font-data text-[10px] uppercase">Source: ODS Global Report</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
              {impactData.map((item, i) => (
                <Reveal key={item.label} delay={i * 0.1}>
                  <div className="p-8 bg-surface relative overflow-hidden group h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                    <item.icon className="w-6 h-6 text-primary mb-6" />
                    <div className="text-4xl font-bold font-data text-primary-foreground mb-2 tabular-nums tracking-tighter">{item.value}</div>
                    <div className="text-xs font-data uppercase text-accent tracking-widest mb-4">{item.label}</div>
                    <p className="text-sm text-slate-200 leading-relaxed">{item.subtext}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: BEZIER }}
    >
      {children}
    </motion.div>
  );
}
import { motion } from "framer-motion";
import { Target, Leaf, GraduationCap, Cpu } from "lucide-react";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pillars = [
  {
    icon: GraduationCap,
    title: "Inclusão Digital",
    description:
      "Garantir que estudantes de baixa renda tenham acesso à tecnologia funcional para seus estudos e desenvolvimento profissional.",
  },
  {
    icon: Leaf,
    title: "Responsabilidade Ambiental",
    description:
      "Reduzir o volume de lixo eletrônico através da economia circular, dando nova vida a componentes descartados.",
  },
  {
    icon: Target,
    title: "Impacto Social",
    description:
      "Criar uma ponte entre doadores e estudantes, gerando impacto mensurável alinhado aos Objetivos de Desenvolvimento Sustentável da ONU.",
  },
  {
    icon: Cpu,
    title: "Educação Técnica",
    description:
      "Fomentar o aprendizado prático em hardware e manutenção, preparando estudantes para o mercado de tecnologia.",
  },
];

export default function SobreNos() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
      >
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
          About Us
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
          Sobre Nós
        </h1>
        <div className="h-1 w-24 bg-primary mb-16" />
      </motion.div>

      {/* Origin story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: BEZIER }}
        className="bg-surface border border-border p-10 mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <h2 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase mb-6">
          Nossa Origem
        </h2>
        <div className="space-y-4 text-white/80 leading-relaxed max-w-3xl">
          <p>
            O <span className="text-accent font-semibold">Ciclo Tech</span> nasceu como projeto acadêmico na{" "}
            <span className="text-accent font-semibold">Fatec Zona Leste</span>, motivado por uma realidade
            urgente: milhares de componentes eletrônicos funcionais são descartados diariamente, enquanto
            estudantes da periferia não possuem equipamentos básicos para estudar.
          </p>
          <p>
            A proposta é simples e poderosa: conectar doadores de hardware usado a estudantes que precisam,
            criando um ciclo virtuoso de tecnologia circular. Cada peça doada é avaliada, certificada e
            direcionada para quem mais precisa.
          </p>
        </div>
      </motion.div>

      {/* Mission pillars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: BEZIER }}
      >
        <h2 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase mb-8">
          Nossos Pilares
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: BEZIER }}
              className="bg-surface border border-border p-8 group hover:border-primary/40 transition-all"
            >
              <pillar.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-sm font-bold font-data text-accent uppercase tracking-wider mb-3">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team section placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-20 bg-surface border border-border p-10 text-center"
      >
        <h2 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase mb-4">
          Equipe
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Um time de estudantes e professores da Fatec Zona Leste, unidos pela missão de democratizar
          o acesso à tecnologia na periferia de São Paulo.
        </p>
      </motion.div>
    </section>
  );
}

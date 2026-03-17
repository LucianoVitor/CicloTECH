import { motion } from "framer-motion";
import { UserPlus, ClipboardCheck, Handshake, Truck } from "lucide-react";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "CADASTRO",
    description:
      "Crie sua conta na plataforma como doador (pessoa física ou empresa). Preencha seus dados e confirme seu e-mail institucional ou pessoal.",
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "AVALIAÇÃO",
    description:
      "Cadastre o hardware que deseja doar com fotos e descrições. Nossa equipe técnica avalia o estado e potencial de reutilização da peça.",
  },
  {
    icon: Handshake,
    number: "03",
    title: "MATCH COM ESTUDANTE",
    description:
      "O sistema faz o match inteligente entre sua doação e as necessidades dos estudantes cadastrados da Zona Leste.",
  },
  {
    icon: Truck,
    number: "04",
    title: "ENTREGA",
    description:
      "Agende a entrega no ponto de coleta da Fatec Zona Leste ou solicite uma retirada. O estudante recebe o componente certificado.",
  },
];

export default function ComoDoar() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
      >
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
          Process Flow
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
          Como Doar
        </h1>
        <div className="h-1 w-24 bg-primary mb-8" />
        <p className="text-lg text-muted-foreground max-w-2xl mb-20 leading-relaxed">
          Doar hardware usado é simples, seguro e gera impacto real na vida de estudantes.
          Siga os 4 passos abaixo para transformar tecnologia ociosa em oportunidade.
        </p>
      </motion.div>

      <div className="relative">
        {/* Vertical line connector */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

        <div className="space-y-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: BEZIER }}
              className="relative flex gap-8 items-start"
            >
              {/* Step indicator */}
              <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-surface border border-primary/50 flex items-center justify-center glow-sm">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              <div className="flex-1 bg-surface border border-border p-8 group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold font-data text-primary/30 tracking-tighter">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-bold font-data text-primary-foreground tracking-tight uppercase">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-20 text-center"
      >
        <a
          href="/doar"
          className="inline-block px-10 py-4 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all"
        >
          Começar a Doar Agora
        </a>
      </motion.div>
    </section>
  );
}

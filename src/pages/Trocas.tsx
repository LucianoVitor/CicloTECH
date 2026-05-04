import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeftRight, X, Send } from "lucide-react";
import { toast } from "sonner";
import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Item = {
  id: string;
  title: string;
  owner: string;
  category: string;
  wants: string;
  description: string;
  image: string;
};

const items: Item[] = [
  {
    id: "1",
    title: "GPU NVIDIA GTX 1660 Super",
    owner: "Carlos M.",
    category: "Placa de Vídeo",
    wants: "SSD 500GB ou superior",
    description: "Placa em ótimo estado, usada por 1 ano em PC secundário. Acompanha caixa original.",
    image: catGpu,
  },
  {
    id: "2",
    title: "16GB DDR4 Corsair Vengeance",
    owner: "Aline R.",
    category: "Memória RAM",
    wants: "Monitor 21\" ou superior",
    description: "Kit 2x8GB 3200MHz. Funcionando perfeitamente, troquei por DDR5.",
    image: catRam,
  },
  {
    id: "3",
    title: "Monitor LG 24\" IPS",
    owner: "Pedro L.",
    category: "Monitor",
    wants: "Processador Intel i5 9ª gen+",
    description: "Tela sem riscos, bom estado de uso. Cabo HDMI incluso.",
    image: catMonitor,
  },
  {
    id: "4",
    title: "Intel Core i5-10400",
    owner: "Mariana S.",
    category: "Processador",
    wants: "RAM 16GB DDR4",
    description: "CPU testada e funcionando. Sem cooler.",
    image: catCpu,
  },
  {
    id: "5",
    title: "SSD Kingston A400 480GB",
    owner: "Rafael T.",
    category: "Armazenamento",
    wants: "HD externo 1TB",
    description: "Pouco tempo de uso, velocidade nominal mantida.",
    image: catStorage,
  },
  {
    id: "6",
    title: "Teclado Mecânico Redragon Kumara",
    owner: "Júlia F.",
    category: "Periférico",
    wants: "Mouse gamer ou headset",
    description: "Switches blue, RGB funcionando. Pequeno desgaste nas teclas WASD.",
    image: catPeripherals,
  },
];

export default function Trocas() {
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState({ offer: "", message: "", contact: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Proposta enviada!", {
      description: `Sua oferta para "${selected?.title}" foi enviada para ${selected?.owner}.`,
    });
    setSelected(null);
    setForm({ offer: "", message: "", contact: "" });
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
      >
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
          Peer-to-Peer Exchange
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
          Trocas
        </h1>
        <div className="h-1 w-24 bg-primary mb-8" />
        <p className="text-lg text-white/80 max-w-2xl mb-12 leading-relaxed">
          Troque peças com outros membros da comunidade. Encontre um anúncio interessante e envie
          sua proposta — sem dinheiro, só ciclo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: BEZIER }}
            className="border border-border bg-background hover:border-primary/50 transition-all group overflow-hidden flex flex-col"
          >
            <div className="h-44 overflow-hidden bg-surface">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="text-[10px] font-data text-primary uppercase tracking-widest mb-2">
                {item.category}
              </div>
              <h3 className="text-base font-bold text-primary-foreground font-data tracking-tight mb-1">
                {item.title}
              </h3>
              <div className="text-[10px] font-data text-white/60 uppercase mb-3">
                Por: {item.owner}
              </div>
              <p className="text-xs text-white/80 leading-relaxed mb-4 flex-1">
                {item.description}
              </p>
              <div className="border-t border-border pt-3 mb-4">
                <div className="text-[10px] font-data text-accent uppercase tracking-widest mb-1">
                  Quer trocar por
                </div>
                <div className="text-xs text-white/90">{item.wants}</div>
              </div>
              <button
                onClick={() => setSelected(item)}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-data uppercase tracking-widest border border-primary/50 text-accent hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ArrowLeftRight className="w-3 h-3" />
                Fazer Proposta
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Proposal modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: BEZIER }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="bg-surface border border-primary/40 glow-md max-w-lg w-full p-8 relative"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-primary font-data text-[10px] uppercase tracking-[0.3em] mb-2">
              Nova Proposta
            </div>
            <h2 className="text-xl font-bold font-data text-primary-foreground tracking-tighter uppercase mb-1">
              {selected.title}
            </h2>
            <div className="text-xs text-white/60 font-data mb-6">Anúncio de {selected.owner}</div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-data text-accent uppercase tracking-widest mb-2 block">
                  O que você oferece
                </label>
                <input
                  required
                  value={form.offer}
                  onChange={(e) => setForm({ ...form, offer: e.target.value })}
                  placeholder="Ex: SSD Crucial MX500 500GB"
                  className="w-full bg-background border border-border focus:border-primary outline-none px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-data text-accent uppercase tracking-widest mb-2 block">
                  Mensagem
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Detalhes do item, estado de uso, ponto de encontro..."
                  className="w-full bg-background border border-border focus:border-primary outline-none px-4 py-2.5 text-sm text-white resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-data text-accent uppercase tracking-widest mb-2 block">
                  Contato (email ou telefone)
                </label>
                <input
                  required
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full bg-background border border-border focus:border-primary outline-none px-4 py-2.5 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-data text-xs uppercase tracking-widest border border-accent glow-sm hover:glow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar Proposta
            </button>
          </motion.form>
        </div>
      )}
    </section>
  );
}

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Heart, Flag } from "lucide-react";
import { toast } from "sonner";
import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";
import { useAppStore } from "@/store/AppStore";
import { useAuth } from "@/hooks/useAuth";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Item = {
  id: string;
  title: string;
  category: string;
  condition: string;
  image: string;
  owner: string;
  ownerEmail: string;
};

const seedHardware: Item[] = [
  { id: "seed-1", title: "Intel Core i5-12400", category: "Processadores (CPU)", condition: "Bom estado", image: catCpu, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-2", title: "AMD Ryzen 5 5600X", category: "Processadores (CPU)", condition: "Excelente", image: catCpu, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-3", title: "Corsair Vengeance 16GB DDR4", category: "Memória RAM", condition: "Novo", image: catRam, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-4", title: "Kingston Fury 8GB DDR4", category: "Memória RAM", condition: "Bom estado", image: catRam, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-5", title: "Samsung 970 EVO 500GB", category: "Armazenamento (SSD)", condition: "Excelente", image: catStorage, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-6", title: "WD Blue 1TB HDD", category: "Armazenamento (HDD)", condition: "Funcional", image: catStorage, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-7", title: "NVIDIA GTX 1660 Super", category: "Placas de Vídeo (GPU)", condition: "Bom estado", image: catGpu, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-8", title: "AMD RX 580 8GB", category: "Placas de Vídeo (GPU)", condition: "Funcional", image: catGpu, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-9", title: "LG 24\" IPS Full HD", category: "Monitores", condition: "Excelente", image: catMonitor, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-10", title: "Dell 21.5\" LED", category: "Monitores", condition: "Bom estado", image: catMonitor, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-11", title: "Logitech MK270 Combo", category: "Periféricos", condition: "Novo", image: catPeripherals, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
  { id: "seed-12", title: "Headset HyperX Cloud Stinger", category: "Periféricos", condition: "Bom estado", image: catPeripherals, owner: "Voluntários CicloTech", ownerEmail: "voluntarios@ciclotech.com" },
];

const categories = ["Todos", "Processadores (CPU)", "Memória RAM", "Armazenamento (SSD)", "Armazenamento (HDD)", "Placas de Vídeo (GPU)", "Monitores", "Periféricos"];

export default function SolicitarHardware() {
  const [filter, setFilter] = useState("Todos");
  const { donations, toggleFavorite, isFavorite, reportItem } = useAppStore();
  const { user } = useAuth();

  const allItems: Item[] = useMemo(() => {
    const fromStore: Item[] = donations.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      condition: d.condition,
      image: d.image,
      owner: d.owner,
      ownerEmail: d.ownerEmail,
    }));
    return [...fromStore, ...seedHardware];
  }, [donations]);

  const filtered = filter === "Todos" ? allItems : allItems.filter((h) => h.category === filter);

  const handleInterest = (item: Item) => {
    if (!user) {
      toast.info("Faça login para registrar interesse");
      return;
    }
    console.log(
      `[EMAIL SIMULADO]\nPara: ${item.ownerEmail}, ${user.email}\nAssunto: CicloTECH — Confirmação de interesse em "${item.title}"\n\nOlá,\n\nO usuário ${user.email} demonstrou interesse na doação "${item.title}" (${item.category}) publicada por ${item.owner}.\n\nPróximo passo: entrem em contato por este e-mail para combinar a entrega do equipamento.\n\nObrigado por fazer parte do ciclo!\nEquipe CicloTECH`
    );
    toast.success("Confirmação de troca enviada para o e-mail dos usuários com sucesso!", {
      description: `${item.owner} e você receberão os detalhes para combinar a entrega.`,
    });
  };

  const handleReport = (item: Item) => {
    reportItem({
      itemId: item.id,
      itemType: "donation",
      itemTitle: item.title,
      reportedBy: user?.email || "anônimo",
    });
    toast.success("Conteúdo reportado", {
      description: "O anúncio foi enviado para verificação da nossa equipe.",
    });
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
      >
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
          Hardware Gallery
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
          Doações
        </h1>
        <div className="h-1 w-24 bg-primary mb-8" />
        <p className="text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          Navegue pelos componentes disponíveis para doação. Se você é estudante da Zona Leste,
          registre seu interesse e nossa equipe fará o match.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 text-[10px] font-data uppercase tracking-widest border transition-all ${
              filter === cat
                ? "bg-primary text-primary-foreground border-accent glow-sm"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <Link
          to="/doar"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground font-data text-xs uppercase tracking-widest border border-accent glow-sm hover:glow-md transition-all"
        >
          + Doar Equipamento
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item, i) => {
          const fav = isFavorite(item.id);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4), ease: BEZIER }}
              className="border border-border bg-background hover:border-primary/50 transition-all group overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <button
                  onClick={() => {
                    toggleFavorite({ id: item.id, type: "donation", title: item.title, category: item.category, image: item.image });
                    toast.success(fav ? "Removido dos favoritos" : "Adicionado aos favoritos");
                  }}
                  className={`w-8 h-8 flex items-center justify-center border bg-background/80 backdrop-blur transition-all ${
                    fav ? "border-destructive text-destructive" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                  }`}
                  aria-label="Favoritar"
                  title="Favoritar"
                >
                  <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => handleReport(item)}
                  className="w-8 h-8 flex items-center justify-center border border-border bg-background/80 backdrop-blur text-muted-foreground hover:text-yellow-500 hover:border-yellow-500 transition-all"
                  aria-label="Denunciar"
                  title="Denunciar"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
              <div className="h-36 overflow-hidden bg-surface">
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
                <h3 className="text-sm font-bold text-primary-foreground font-data tracking-tight mb-2">
                  {item.title}
                </h3>
                <div className="text-[10px] font-data text-muted-foreground uppercase mb-1">
                  Estado: {item.condition}
                </div>
                <div className="text-[10px] font-data text-muted-foreground uppercase mb-4">
                  Por: {item.owner}
                </div>
                <button
                  onClick={() => handleInterest(item)}
                  className="mt-auto block w-full py-2 text-center text-[10px] font-data uppercase tracking-widest bg-primary text-primary-foreground border border-accent hover:glow-md transition-all"
                >
                  Tenho Interesse
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

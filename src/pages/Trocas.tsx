import { motion } from "framer-motion";
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Heart, Flag, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";
import { useAppStore, fileToDataURL } from "@/store/AppStore";
import { useAuth } from "@/hooks/useAuth";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Item = {
  id: string;
  title: string;
  owner: string;
  ownerEmail: string;
  category: string;
  wants: string;
  description: string;
  image: string;
};

const seedItems: Item[] = [
  { id: "tseed-1", title: "GPU NVIDIA GTX 1660 Super", owner: "Carlos M.", ownerEmail: "carlos@ciclotech.com", category: "Placa de Vídeo", wants: "SSD 500GB ou superior", description: "Placa em ótimo estado, usada por 1 ano em PC secundário.", image: catGpu },
  { id: "tseed-2", title: "16GB DDR4 Corsair Vengeance", owner: "Aline R.", ownerEmail: "aline@ciclotech.com", category: "Memória RAM", wants: "Monitor 21\" ou superior", description: "Kit 2x8GB 3200MHz. Funcionando perfeitamente.", image: catRam },
  { id: "tseed-3", title: "Monitor LG 24\" IPS", owner: "Pedro L.", ownerEmail: "pedro@ciclotech.com", category: "Monitor", wants: "Processador Intel i5 9ª gen+", description: "Tela sem riscos, bom estado de uso.", image: catMonitor },
  { id: "tseed-4", title: "Intel Core i5-10400", owner: "Mariana S.", ownerEmail: "mariana@ciclotech.com", category: "Processador", wants: "RAM 16GB DDR4", description: "CPU testada e funcionando. Sem cooler.", image: catCpu },
  { id: "tseed-5", title: "SSD Kingston A400 480GB", owner: "Rafael T.", ownerEmail: "rafael@ciclotech.com", category: "Armazenamento", wants: "HD externo 1TB", description: "Pouco tempo de uso, velocidade nominal mantida.", image: catStorage },
  { id: "tseed-6", title: "Teclado Mecânico Redragon Kumara", owner: "Júlia F.", ownerEmail: "julia@ciclotech.com", category: "Periférico", wants: "Mouse gamer ou headset", description: "Switches blue, RGB funcionando.", image: catPeripherals },
];

export default function Trocas() {
  const { trades, addTrade, toggleFavorite, isFavorite, reportItem, startChat } = useAppStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  // New trade form
  const [showNew, setShowNew] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nCategory, setNCategory] = useState("");
  const [nDescription, setNDescription] = useState("");
  const [nWants, setNWants] = useState("");
  const [nImage, setNImage] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(() => {
    const fromStore: Item[] = trades
      .filter((t) => t.status !== "Cancelada")
      .map((t) => ({
        id: t.id,
        title: t.title,
        owner: t.owner,
        ownerEmail: t.ownerEmail,
        category: t.category,
        wants: t.wants,
        description: t.description,
        image: t.image,
      }));
    return [...fromStore, ...seedItems];
  }, [trades]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    console.log(
      `[EMAIL SIMULADO]\nPara: ${selected.ownerEmail}, ${user?.email || form.contact}\nAssunto: CicloTECH — Proposta de troca para "${selected.title}"\n\nOlá,\n\nUma nova proposta de troca foi registrada:\n• Item desejado: ${selected.title} (de ${selected.owner})\n• Oferta: ${form.offer}\n• Mensagem: ${form.message}\n• Contato: ${form.contact}\n\nPróximo passo: combinem a troca por este e-mail.\n\nEquipe CicloTECH`
    );
    toast.success("Confirmação de troca enviada para o e-mail dos usuários com sucesso!", {
      description: `${selected.owner} e você receberão os detalhes da proposta.`,
    });
    setSelected(null);
    setForm({ offer: "", message: "", contact: "" });
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      toast.error("Use imagem (PNG/JPG) até 4MB");
      return;
    }
    setNImage(await fileToDataURL(file));
  };

  const submitNewTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle.trim() || !nCategory.trim() || !nDescription.trim() || !nWants.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (!nImage) {
      toast.error("Adicione uma foto");
      return;
    }
    const owner = user?.email?.split("@")[0] || "Anônimo";
    addTrade({
      title: nTitle.trim(),
      category: nCategory.trim(),
      description: nDescription.trim(),
      wants: nWants.trim(),
      image: nImage,
      owner,
      ownerEmail: user?.email || "anon@ciclotech.com",
    });
    toast.success("Anúncio de troca publicado!");
    setShowNew(false);
    setNTitle(""); setNCategory(""); setNDescription(""); setNWants(""); setNImage("");
  };

  const handleReport = (item: Item) => {
    reportItem({
      itemId: item.id,
      itemType: "trade",
      itemTitle: item.title,
      reportedBy: user?.email || "anônimo",
    });
    toast.success("Conteúdo reportado", { description: "O anúncio foi enviado para verificação." });
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
        <p className="text-lg text-white/80 max-w-2xl mb-8 leading-relaxed">
          Troque peças com outros membros da comunidade. Encontre um anúncio interessante e envie
          sua proposta — sem dinheiro, só ciclo.
        </p>

        <button
          onClick={() => setShowNew((v) => !v)}
          className="mb-10 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-data text-xs uppercase tracking-widest border border-accent glow-sm hover:glow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Anunciar Troca
        </button>
      </motion.div>

      {showNew && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submitNewTrade}
          className="mb-12 bg-surface border border-primary/40 p-6 space-y-4"
        >
          <h3 className="text-sm font-data uppercase tracking-widest text-accent">Novo anúncio de troca</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={nTitle}
              onChange={(e) => setNTitle(e.target.value)}
              placeholder="Item que você oferece"
              className="bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none"
            />
            <input
              value={nCategory}
              onChange={(e) => setNCategory(e.target.value)}
              placeholder="Categoria (ex: GPU, RAM, Monitor)"
              className="bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none"
            />
          </div>
          <textarea
            value={nDescription}
            onChange={(e) => setNDescription(e.target.value)}
            placeholder="Descrição do item (estado, especificações...)"
            rows={3}
            className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none resize-none"
          />
          <input
            value={nWants}
            onChange={(e) => setNWants(e.target.value)}
            placeholder="O que você quer em troca"
            className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none"
          />
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-primary/50 p-6 text-center transition-all"
          >
            {nImage ? (
              <img src={nImage} alt="preview" className="max-h-32 mx-auto" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="w-6 h-6" />
                <span className="text-[10px] font-data uppercase tracking-widest">Adicionar foto do item</span>
              </div>
            )}
          </button>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-primary-foreground font-data text-xs uppercase tracking-widest border border-accent glow-sm hover:glow-md transition-all"
            >
              Publicar troca
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="px-6 py-3 border border-border text-foreground hover:border-destructive hover:text-destructive font-data text-xs uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const fav = isFavorite(item.id);
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4), ease: BEZIER }}
              className="border border-border bg-background hover:border-primary/50 transition-all group overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <button
                  onClick={() => {
                    toggleFavorite({ id: item.id, type: "trade", title: item.title, category: item.category, image: item.image });
                    toast.success(fav ? "Removido dos favoritos" : "Adicionado aos favoritos");
                  }}
                  className={`w-8 h-8 flex items-center justify-center border bg-background/80 backdrop-blur transition-all ${
                    fav ? "border-destructive text-destructive" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                  }`}
                  aria-label="Favoritar"
                >
                  <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => handleReport(item)}
                  className="w-8 h-8 flex items-center justify-center border border-border bg-background/80 backdrop-blur text-muted-foreground hover:text-yellow-500 hover:border-yellow-500 transition-all"
                  aria-label="Denunciar"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
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
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-data uppercase tracking-widest bg-primary text-primary-foreground border border-accent hover:glow-md transition-all"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Fazer Proposta
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

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
                  className="w-full bg-background border border-border focus:border-primary outline-none px-4 py-2.5 text-sm text-foreground"
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
                  className="w-full bg-background border border-border focus:border-primary outline-none px-4 py-2.5 text-sm text-foreground resize-none"
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
                  className="w-full bg-background border border-border focus:border-primary outline-none px-4 py-2.5 text-sm text-foreground"
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

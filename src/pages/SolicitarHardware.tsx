import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const hardware = [
  { title: "Intel Core i5-12400", category: "Processadores (CPU)", condition: "Bom estado", image: catCpu },
  { title: "AMD Ryzen 5 5600X", category: "Processadores (CPU)", condition: "Excelente", image: catCpu },
  { title: "Corsair Vengeance 16GB DDR4", category: "Memória RAM", condition: "Novo", image: catRam },
  { title: "Kingston Fury 8GB DDR4", category: "Memória RAM", condition: "Bom estado", image: catRam },
  { title: "Samsung 970 EVO 500GB", category: "Armazenamento (SSD)", condition: "Excelente", image: catStorage },
  { title: "WD Blue 1TB HDD", category: "Armazenamento (HDD)", condition: "Funcional", image: catStorage },
  { title: "NVIDIA GTX 1660 Super", category: "Placas de Vídeo (GPU)", condition: "Bom estado", image: catGpu },
  { title: "AMD RX 580 8GB", category: "Placas de Vídeo (GPU)", condition: "Funcional", image: catGpu },
  { title: "LG 24\" IPS Full HD", category: "Monitores", condition: "Excelente", image: catMonitor },
  { title: "Dell 21.5\" LED", category: "Monitores", condition: "Bom estado", image: catMonitor },
  { title: "Logitech MK270 Combo", category: "Periféricos", condition: "Novo", image: catPeripherals },
  { title: "Headset HyperX Cloud Stinger", category: "Periféricos", condition: "Bom estado", image: catPeripherals },
];

const categories = ["Todos", "Processadores (CPU)", "Memória RAM", "Armazenamento (SSD)", "Armazenamento (HDD)", "Placas de Vídeo (GPU)", "Monitores", "Periféricos"];

import { useState } from "react";

export default function SolicitarHardware() {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? hardware : hardware.filter((h) => h.category === filter);

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
          Solicitar Hardware
        </h1>
        <div className="h-1 w-24 bg-primary mb-8" />
        <p className="text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          Navegue pelos componentes disponíveis para doação. Se você é estudante da Zona Leste,
          registre seu interesse e nossa equipe fará o match.
        </p>
      </motion.div>

      {/* Filters */}
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: BEZIER }}
            className="border border-border bg-background hover:border-primary/50 transition-all group overflow-hidden"
          >
            <div className="h-36 overflow-hidden bg-surface">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <div className="text-[10px] font-data text-primary uppercase tracking-widest mb-2">
                {item.category}
              </div>
              <h3 className="text-sm font-bold text-primary-foreground font-data tracking-tight mb-2">
                {item.title}
              </h3>
              <div className="text-[10px] font-data text-muted-foreground uppercase mb-4">
                Estado: {item.condition}
              </div>
              <Link
                to="/auth"
                className="block w-full py-2 text-center text-[10px] font-data uppercase tracking-widest border border-primary/50 text-accent hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Tenho Interesse
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

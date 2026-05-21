import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import catCpu from "@/assets/cat-cpu.png";
import catRam from "@/assets/cat-ram.png";
import catStorage from "@/assets/cat-storage.png";
import catGpu from "@/assets/cat-gpu.png";
import catMonitor from "@/assets/cat-monitor.png";
import catPeripherals from "@/assets/cat-peripherals.png";

const parts = [
  { src: catCpu, label: "Processador" },
  { src: catRam, label: "Memória RAM" },
  { src: catStorage, label: "Armazenamento" },
  { src: catGpu, label: "Placa de Vídeo" },
  { src: catMonitor, label: "Monitor" },
  { src: catPeripherals, label: "Periféricos" },
];

/** High-fidelity hero carousel: rotating hardware piece with 180° Y-axis spin. */
export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % parts.length), 3800);
    return () => clearInterval(id);
  }, []);

  const current = parts[index];

  return (
    <div className="relative flex items-center justify-center w-full aspect-square max-w-lg mx-auto">
      {/* Glow halo */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute inset-6 rounded-full border border-primary/30" />
      <div className="absolute inset-16 rounded-full border border-accent/20" />

      <div className="relative w-full h-full" style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.src}
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.img
              src={current.src}
              alt={current.label}
              className="w-4/5 h-4/5 object-contain drop-shadow-[0_0_60px_hsl(217_91%_60%/0.7)]"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Label */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-background/80 backdrop-blur border border-primary/40 font-data text-[10px] uppercase tracking-[0.3em] text-accent">
        {current.label}
      </div>

      {/* Dots */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {parts.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setIndex(i)}
            aria-label={p.label}
            className={`h-1.5 transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-accent"}`}
          />
        ))}
      </div>
    </div>
  );
}

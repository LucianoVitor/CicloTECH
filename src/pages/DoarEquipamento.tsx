import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Package, FileText, Image } from "lucide-react";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const categoryOptions = [
  "Processadores (CPU)",
  "Memória RAM",
  "Armazenamento (SSD/HDD)",
  "Placas de Vídeo (GPU)",
  "Monitores",
  "Periféricos",
];

export default function DoarEquipamento() {
  const [category, setCategory] = useState("");

  return (
    <section className="py-24 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
      >
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
          Donation Form
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
          Doar Equipamento
        </h1>
        <div className="h-1 w-24 bg-primary mb-8" />
        <p className="text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          Preencha as informações abaixo para cadastrar seu hardware para doação.
          Nossa equipe irá avaliar e fazer o match com um estudante.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: BEZIER }}
        className="space-y-6 bg-surface border border-border p-8"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Title */}
        <div>
          <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
            <Package className="inline w-3.5 h-3.5 mr-1" />
            Título do Equipamento
          </label>
          <input
            type="text"
            placeholder="Ex: Intel Core i5-12400"
            className="w-full bg-background border border-border py-3 px-4 text-sm font-data text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-sm transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-background border border-border py-3 px-4 text-sm font-data text-primary-foreground focus:outline-none focus:border-primary focus:glow-sm transition-all appearance-none"
          >
            <option value="">Selecione a categoria</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
            <FileText className="inline w-3.5 h-3.5 mr-1" />
            Descrição
          </label>
          <textarea
            rows={4}
            placeholder="Descreva o estado do equipamento, especificações técnicas, ano de fabricação..."
            className="w-full bg-background border border-border py-3 px-4 text-sm font-data text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-sm transition-all resize-none"
          />
        </div>

        {/* Image upload placeholder */}
        <div>
          <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
            <Image className="inline w-3.5 h-3.5 mr-1" />
            Fotos do Equipamento
          </label>
          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all p-8 text-center cursor-pointer group">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
            <p className="text-xs font-data text-muted-foreground uppercase tracking-wider">
              Clique ou arraste imagens aqui
            </p>
            <p className="text-[10px] font-data text-muted-foreground/60 mt-1">
              PNG, JPG até 5MB
            </p>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
            Estado de Conservação
          </label>
          <div className="flex flex-wrap gap-2">
            {["Novo", "Excelente", "Bom estado", "Funcional", "Para peças"].map((state) => (
              <button
                key={state}
                type="button"
                className="px-4 py-2 text-[10px] font-data uppercase tracking-widest border border-border text-muted-foreground hover:border-primary hover:text-accent transition-all focus:border-primary focus:text-accent focus:glow-sm"
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all"
        >
          Enviar para Avaliação
        </button>
      </motion.form>
    </section>
  );
}

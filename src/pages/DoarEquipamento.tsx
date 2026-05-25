import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Package, FileText, Image as ImageIcon, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const categoryOptions = [
  "Processadores (CPU)",
  "Memória RAM",
  "Armazenamento (SSD/HDD)",
  "Placas de Vídeo (GPU)",
  "Monitores",
  "Periféricos",
];

const conditions = ["Novo", "Excelente", "Bom estado", "Funcional", "Para peças"];

export default function DoarEquipamento() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const imgs = Array.from(incoming).filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (imgs.length === 0) {
      toast.error("Selecione imagens (PNG/JPG) de até 5MB");
      return;
    }
    setFiles((prev) => [...prev, ...imgs].slice(0, 6));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim() || !condition) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (files.length === 0) {
      toast.error("Adicione pelo menos uma foto do equipamento");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    setSuccess(true);
    toast.success("Doação enviada com sucesso!", {
      description: "Nossa equipe entrará em contato em breve para retirada.",
    });
  };

  const reset = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setCondition("");
    setFiles([]);
    setSuccess(false);
  };

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

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: BEZIER }}
          className="bg-surface border border-primary/50 glow-md p-10 text-center"
        >
          <CheckCircle2 className="w-14 h-14 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-data uppercase tracking-tighter text-primary-foreground mb-2">
            Doação enviada com sucesso!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Recebemos seu equipamento <strong className="text-accent">{title}</strong>. Nossa equipe
            avaliará as fotos e entrará em contato para combinar a retirada.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-primary-foreground font-data text-xs uppercase tracking-widest border border-accent glow-sm hover:glow-md transition-all"
          >
            Cadastrar outra doação
          </button>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: BEZIER }}
          className="space-y-6 bg-surface border border-border p-8"
          onSubmit={handleSubmit}
        >
          {/* Title */}
          <div>
            <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
              <Package className="inline w-3.5 h-3.5 mr-1" />
              Título do Equipamento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o estado do equipamento, especificações técnicas, ano de fabricação..."
              className="w-full bg-background border border-border py-3 px-4 text-sm font-data text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-sm transition-all resize-none"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
              <ImageIcon className="inline w-3.5 h-3.5 mr-1" />
              Fotos do Equipamento
            </label>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
            <div
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed p-8 text-center cursor-pointer group transition-all ${
                dragOver ? "border-primary bg-primary/5 glow-sm" : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
              <p className="text-xs font-data text-muted-foreground uppercase tracking-wider">
                Clique ou arraste imagens aqui
              </p>
              <p className="text-[10px] font-data text-muted-foreground/60 mt-1">
                PNG, JPG até 5MB · máx. 6 fotos
              </p>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square bg-background border border-border overflow-hidden group">
                    <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[10px] font-data uppercase tracking-widest text-accent mb-2">
              Estado de Conservação
            </label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setCondition(state)}
                  className={`px-4 py-2 text-[10px] font-data uppercase tracking-widest border transition-all ${
                    condition === state
                      ? "border-primary text-accent glow-sm bg-primary/10"
                      : "border-border text-muted-foreground hover:border-primary hover:text-accent"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-4 bg-primary text-primary-foreground font-data text-sm uppercase tracking-widest border border-accent glow-md hover:glow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? "Enviando..." : "Enviar para Avaliação"}
          </button>
        </motion.form>
      )}
    </section>
  );
}

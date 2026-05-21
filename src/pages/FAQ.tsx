import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, MessageSquare, Star, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const faqCategories = [
  {
    title: "Para Doadores",
    items: [
      { q: "Como faço para doar um equipamento?", a: "Acesse a página 'Quero Doar', preencha o formulário com a descrição da peça, fotos e endereço para retirada. Nossa equipe entrará em contato em até 48h." },
      { q: "Quem avalia o hardware doado?", a: "Voluntários técnicos parceiros (Fatec Zona Leste) testam, higienizam e classificam cada peça antes de cadastrá-la no catálogo." },
      { q: "Posso emitir nota fiscal ou recibo de doação?", a: "Sim. Após a coleta, enviamos por e-mail um recibo digital que pode ser usado para fins contábeis e de ESG." },
      { q: "Quais peças não são aceitas?", a: "Não aceitamos itens com queima visível, baterias inchadas ou monitores CRT (descarte regulado)." },
    ],
  },
  {
    title: "Para Estudantes",
    items: [
      { q: "Quem pode solicitar peças?", a: "Qualquer estudante cadastrado. Damos prioridade para alunos da Zona Leste de São Paulo." },
      { q: "Como sei se meu match foi aceito?", a: "Você recebe uma notificação no painel e por e-mail assim que um doador confirma a destinação da peça para você." },
      { q: "Há custo de retirada?", a: "Não. Coordenamos pontos de retirada gratuitos em parceiros institucionais." },
      { q: "Posso trocar peças com outros estudantes?", a: "Sim, através da página 'Trocas', usando o sistema de match interno." },
    ],
  },
  {
    title: "Plataforma & Conta",
    items: [
      { q: "Como recupero minha senha?", a: "Na tela de login, clique em 'Esqueceu a senha?' e enviaremos um link de redefinição para o e-mail cadastrado." },
      { q: "Meus dados estão seguros?", a: "Sim. Usamos autenticação JWT, RLS no banco de dados e seguimos a LGPD." },
      { q: "Posso excluir minha conta?", a: "Sim, entre em contato pelo suporte ou exclua diretamente no seu perfil." },
    ],
  },
];

type Feedback = {
  id: string;
  author_name: string;
  rating: number;
  message: string;
  created_at: string;
};

export default function FAQ() {
  const { user } = useAuth();
  const [open, setOpen] = useState<string | null>("0-0");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setFeedback(data as Feedback[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para deixar um comentário");
      return;
    }
    if (message.trim().length < 5) {
      toast.error("Escreva pelo menos 5 caracteres");
      return;
    }
    setSubmitting(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    const author = profile?.full_name || user.email?.split("@")[0] || "Usuário";
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      author_name: author,
      rating,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Comentário enviado");
    setMessage("");
    setRating(5);
    load();
  };

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: BEZIER }}>
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-3">Suporte / Help Center</div>
        <h1 className="text-5xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">Dúvidas Frequentes</h1>
        <div className="h-1 w-24 bg-primary mb-12" />
      </motion.div>

      <div className="space-y-12">
        {faqCategories.map((cat, ci) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: BEZIER, delay: ci * 0.05 }}
          >
            <h2 className="text-xs font-data uppercase tracking-[0.3em] text-accent mb-4">{cat.title}</h2>
            <div className="border border-border bg-surface/40 backdrop-blur-sm">
              {cat.items.map((it, qi) => {
                const key = `${ci}-${qi}`;
                const isOpen = open === key;
                return (
                  <div key={key} className="border-b border-border last:border-b-0">
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-primary/5 transition-colors"
                    >
                      <span className="text-sm font-data text-primary-foreground">{it.q}</span>
                      <ChevronDown className={`w-4 h-4 text-accent shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 text-sm text-white/80 leading-relaxed"
                      >
                        {it.a}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Satisfaction Survey */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: BEZIER }}
        className="mt-24"
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-3xl font-bold text-primary-foreground font-data tracking-tighter uppercase">Pesquisa de Satisfação</h2>
        </div>
        <p className="text-sm text-white/70 mb-8 max-w-2xl">
          Sua opinião direciona a próxima versão da plataforma. Deixe um comentário sobre sua experiência com o Ciclo Tech.
        </p>

        <form onSubmit={submit} className="bg-surface/60 border border-border p-6 mb-12 backdrop-blur-xl">
          <label className="block text-[10px] font-data uppercase tracking-widest text-white/70 mb-2">Sua nota</label>
          <div className="flex gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`${n} estrelas`}
              >
                <Star className={`w-7 h-7 ${n <= rating ? "fill-primary text-primary" : "text-white/30"}`} />
              </button>
            ))}
          </div>

          <label className="block text-[10px] font-data uppercase tracking-widest text-white/70 mb-2">Comentário</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={user ? "Escreva sua experiência com o software..." : "Faça login para comentar"}
            disabled={!user}
            className="w-full bg-background border border-border p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:glow-sm transition-all resize-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] font-data text-white/50 uppercase">{message.length}/500</span>
            {user ? (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-data text-xs uppercase tracking-widest border border-accent glow-sm hover:glow-md transition-all disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar
              </button>
            ) : (
              <Link to="/auth" className="text-[10px] font-data text-accent uppercase tracking-widest hover:underline">
                Entrar para comentar →
              </Link>
            )}
          </div>
        </form>

        <h3 className="text-xs font-data uppercase tracking-[0.3em] text-accent mb-4">Últimos comentários</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="border border-dashed border-border p-8 text-center text-sm text-white/60 font-data uppercase tracking-wider">
            Seja o primeiro a comentar
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {feedback.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="border border-border bg-surface/40 p-5 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-data text-accent uppercase tracking-wider">{f.author_name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className={`w-3 h-3 ${k < f.rating ? "fill-primary text-primary" : "text-white/20"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/85 leading-relaxed">{f.message}</p>
                <p className="text-[10px] font-data text-white/40 uppercase tracking-widest mt-3">
                  {new Date(f.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

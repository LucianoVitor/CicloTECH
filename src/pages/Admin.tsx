import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Users, Package, RefreshCw, Trash2, Edit, Ban, Loader2,
  MessageSquare, Search, UserCog, Star, Activity, TrendingUp, Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

type TabId = "overview" | "users" | "ads" | "trades" | "feedback";

const mockAds = [
  { id: 1, title: "Memória RAM 8GB DDR4 Corsair", owner: "joao@email.com", status: "Ativo", category: "RAM", date: "2026-05-10" },
  { id: 2, title: "GPU GTX 1050 Ti", owner: "maria@email.com", status: "Ativo", category: "GPU", date: "2026-05-12" },
  { id: 3, title: "SSD 240GB Kingston", owner: "carlos@email.com", status: "Pausado", category: "Storage", date: "2026-05-14" },
  { id: 4, title: "Monitor LG 24'' Full HD", owner: "ana@email.com", status: "Ativo", category: "Monitor", date: "2026-05-18" },
  { id: 5, title: "Teclado Mecânico Redragon", owner: "pedro@email.com", status: "Ativo", category: "Periférico", date: "2026-05-20" },
];

const mockTrades = [
  { id: 1, item: "Processador i5-7400", from: "ana@email.com", to: "lucas@email.com", status: "Em andamento" },
  { id: 2, item: "Monitor LG 22''", from: "pedro@email.com", to: "julia@email.com", status: "Reportado" },
  { id: 3, item: "HD 500GB Seagate", from: "marco@email.com", to: "bia@email.com", status: "Concluída" },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [ads, setAds] = useState(mockAds);
  const [trades, setTrades] = useState(mockTrades);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    if (!isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate("/perfil", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const loadData = async () => {
    setRefreshing(true);
    const [{ data: profiles }, { data: fb }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, user_type, phone, address, created_at").order("created_at", { ascending: false }),
      supabase.from("feedback").select("id, author_name, rating, message, created_at").order("created_at", { ascending: false }),
    ]);
    setUsers(profiles ?? []);
    setFeedback(fb ?? []);
    setRefreshing(false);
  };

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin]);

  const stats = useMemo(() => {
    const avg = feedback.length ? feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length : 0;
    return {
      users: users.length,
      ads: ads.filter(a => a.status === "Ativo").length,
      trades: trades.length,
      feedback: feedback.length,
      avgRating: avg.toFixed(1),
      donors: users.filter(u => u.user_type === "donor").length,
      students: users.filter(u => u.user_type === "student").length,
    };
  }, [users, ads, trades, feedback]);

  const filteredUsers = users.filter(u =>
    !query || (u.full_name || "").toLowerCase().includes(query.toLowerCase()) ||
    (u.phone || "").includes(query)
  );

  const deleteAd = (id: number) => { setAds(ads.filter(a => a.id !== id)); toast.success("Anúncio removido"); };
  const editAd = (id: number) => toast.info(`Editar anúncio #${id} (mock)`);
  const cancelTrade = (id: number) => {
    setTrades(trades.map(t => t.id === id ? { ...t, status: "Cancelada" } : t));
    toast.success("Troca cancelada por irregularidade");
  };
  const deleteFeedback = async (id: string) => {
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover feedback");
    setFeedback(feedback.filter(f => f.id !== id));
    toast.success("Feedback removido");
  };

  const exportCSV = () => {
    const rows = [["Nome", "Tipo", "Telefone", "Endereço", "Cadastro"]];
    users.forEach(u => rows.push([u.full_name || "", u.user_type || "", u.phone || "", u.address || "", new Date(u.created_at).toLocaleDateString("pt-BR")]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ciclotech-usuarios-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Visão Geral", icon: Activity },
    { id: "users", label: "Usuários", icon: Users },
    { id: "ads", label: "Anúncios", icon: Package },
    { id: "trades", label: "Trocas", icon: RefreshCw },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: BEZIER }}>
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-primary font-data text-xs uppercase tracking-[0.4em]">Admin Panel</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground font-data tracking-tighter uppercase mb-3">
              Painel Administrativo
            </h1>
            <div className="h-1 w-24 bg-primary" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-data uppercase tracking-widest border border-border text-foreground hover:border-accent hover:text-accent transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} /> Atualizar
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-data uppercase tracking-widest border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <Download className="w-3 h-3" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat icon={Users} label="Usuários" value={stats.users} accent="primary" />
          <Stat icon={Package} label="Anúncios Ativos" value={stats.ads} accent="accent" />
          <Stat icon={RefreshCw} label="Trocas" value={stats.trades} accent="primary" />
          <Stat icon={Star} label="Avaliação Média" value={stats.avgRating} accent="accent" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border border-border mb-6 bg-surface">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 flex-1 min-w-[140px] py-3 px-4 text-[10px] font-data uppercase tracking-widest transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-accent hover:bg-background"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border p-6 overflow-x-auto min-h-[300px]">
          {tab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-data uppercase tracking-widest text-primary">Distribuição de Usuários</h3>
                <Bar label="Doadores" value={stats.donors} total={stats.users || 1} />
                <Bar label="Estudantes" value={stats.students} total={stats.users || 1} />
                <Bar label="Outros" value={stats.users - stats.donors - stats.students} total={stats.users || 1} />
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-data uppercase tracking-widest text-primary">Atividade</h3>
                <Metric icon={TrendingUp} label="Total de feedbacks" value={stats.feedback} />
                <Metric icon={Package} label="Anúncios cadastrados" value={ads.length} />
                <Metric icon={Ban} label="Trocas reportadas" value={trades.filter(t => t.status === "Reportado").length} />
              </div>
            </div>
          )}

          {tab === "users" && (
            <>
              <div className="flex items-center gap-2 mb-4 max-w-sm border border-border bg-background px-3">
                <Search className="w-3.5 h-3.5 text-foreground/60" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar por nome ou telefone..."
                  className="flex-1 bg-transparent py-2 text-xs font-data text-foreground placeholder:text-foreground/40 outline-none"
                />
              </div>
              <table className="w-full text-sm font-data">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest text-foreground/70">
                    <th className="text-left py-3 px-2">Nome</th>
                    <th className="text-left py-3 px-2">Tipo</th>
                    <th className="text-left py-3 px-2">Telefone</th>
                    <th className="text-left py-3 px-2">Cadastro</th>
                    <th className="text-right py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-foreground/60">Nenhum usuário encontrado</td></tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-border/40 text-foreground hover:bg-background/40 transition">
                        <td className="py-3 px-2">{u.full_name || "—"}</td>
                        <td className="py-3 px-2">
                          <span className="text-[10px] font-data uppercase px-2 py-0.5 border border-accent/50 text-accent">
                            {u.user_type || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-foreground/80">{u.phone || "—"}</td>
                        <td className="py-3 px-2 text-foreground/60 text-xs">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => toast.info(`Gerenciar ${u.full_name || "usuário"} (em breve)`)}
                            className="p-2 border border-border hover:border-accent text-foreground/70 hover:text-accent transition"
                            aria-label="Gerenciar usuário"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}

          {tab === "ads" && (
            <div className="space-y-3">
              {ads.map(ad => (
                <div key={ad.id} className="flex items-center justify-between p-4 bg-background border border-border hover:border-primary/40 transition-all">
                  <div>
                    <p className="text-sm font-data text-foreground">{ad.title}</p>
                    <p className="text-[11px] font-data text-foreground/60 uppercase mt-1">
                      {ad.category} • {ad.owner} • {new Date(ad.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-data uppercase border ${
                      ad.status === "Ativo" ? "border-accent/50 text-accent" : "border-foreground/30 text-foreground/60"
                    }`}>{ad.status}</span>
                    <button onClick={() => editAd(ad.id)} className="p-2 border border-border hover:border-accent text-foreground/70 hover:text-accent transition">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteAd(ad.id)} className="p-2 border border-border hover:border-destructive text-foreground/70 hover:text-destructive transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "trades" && (
            <div className="space-y-3">
              {trades.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-background border border-border">
                  <div>
                    <p className="text-sm font-data text-foreground">{t.item}</p>
                    <p className="text-[11px] font-data text-foreground/60 uppercase mt-1">{t.from} → {t.to}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-data uppercase border ${
                      t.status === "Cancelada" ? "border-destructive/60 text-destructive" :
                      t.status === "Reportado" ? "border-yellow-500/60 text-yellow-500" :
                      "border-accent/50 text-accent"
                    }`}>{t.status}</span>
                    {t.status !== "Cancelada" && (
                      <button onClick={() => cancelTrade(t.id)} className="flex items-center gap-1 p-2 px-3 border border-border hover:border-destructive text-foreground/70 hover:text-destructive transition text-[10px] font-data uppercase">
                        <Ban className="w-3 h-3" /> Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "feedback" && (
            <div className="space-y-3">
              {feedback.length === 0 ? (
                <p className="py-8 text-center text-foreground/60 font-data text-xs uppercase tracking-widest">Nenhum feedback recebido</p>
              ) : feedback.map(f => (
                <div key={f.id} className="p-4 bg-background border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-data text-foreground">{f.author_name}</span>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < f.rating ? "fill-accent text-accent" : "text-foreground/30"}`} />
                        ))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-data text-foreground/50">{new Date(f.created_at).toLocaleDateString("pt-BR")}</span>
                      <button onClick={() => deleteFeedback(f.id)} className="p-1.5 border border-border hover:border-destructive text-foreground/70 hover:text-destructive transition">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent: "primary" | "accent" }) {
  const cls = accent === "primary" ? "text-primary border-primary/40 bg-primary/10" : "text-accent border-accent/40 bg-accent/10";
  return (
    <div className="bg-surface border border-border p-5 flex items-center gap-4 hover:border-primary/40 transition">
      <div className={`w-12 h-12 border flex items-center justify-center ${cls}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-data uppercase tracking-widest text-foreground/70">{label}</p>
        <p className="text-2xl font-bold font-data text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-data uppercase tracking-widest text-foreground/70 mb-1">
        <span>{label}</span>
        <span className="text-accent">{value}</span>
      </div>
      <div className="h-2 bg-background border border-border overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-background border border-border">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-xs font-data text-foreground/80">{label}</span>
      </div>
      <span className="text-lg font-bold font-data text-foreground">{value}</span>
    </div>
  );
}

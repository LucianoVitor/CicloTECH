import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Package, RefreshCw, Trash2, Edit, Ban, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Mock data for ads & trades (no schema for these yet)
const mockAds = [
  { id: 1, title: "Memória RAM 8GB DDR4 Corsair", owner: "joao@email.com", status: "Ativo", category: "RAM" },
  { id: 2, title: "GPU GTX 1050 Ti", owner: "maria@email.com", status: "Ativo", category: "GPU" },
  { id: 3, title: "SSD 240GB Kingston", owner: "carlos@email.com", status: "Pausado", category: "Storage" },
];
const mockTrades = [
  { id: 1, item: "Processador i5-7400", from: "ana@email.com", to: "lucas@email.com", status: "Em andamento" },
  { id: 2, item: "Monitor LG 22''", from: "pedro@email.com", to: "julia@email.com", status: "Reportado" },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<"users" | "ads" | "trades">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [ads, setAds] = useState(mockAds);
  const [trades, setTrades] = useState(mockTrades);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate("/perfil", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("profiles")
      .select("id, full_name, user_type, phone, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setUsers(data ?? []));
  }, [isAdmin]);

  const deleteAd = (id: number) => {
    setAds(ads.filter((a) => a.id !== id));
    toast.success("Anúncio removido");
  };
  const cancelTrade = (id: number) => {
    setTrades(trades.map((t) => (t.id === id ? { ...t, status: "Cancelada" } : t)));
    toast.success("Troca cancelada por irregularidade");
  };
  const editAd = (id: number) => toast.info(`Editar anúncio #${id} (mock)`);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: BEZIER }}>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="text-primary font-data text-xs uppercase tracking-[0.4em]">Admin Panel</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-white font-data tracking-tighter uppercase mb-4">
          Painel Administrativo
        </h1>
        <div className="h-1 w-24 bg-primary mb-8" />

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Stat icon={Users} label="Usuários" value={users.length} />
          <Stat icon={Package} label="Anúncios Ativos" value={ads.filter((a) => a.status === "Ativo").length} />
          <Stat icon={RefreshCw} label="Trocas" value={trades.length} />
        </div>

        {/* Tabs */}
        <div className="flex border border-border mb-6">
          {[
            { id: "users", label: "Usuários" },
            { id: "ads", label: "Anúncios" },
            { id: "trades", label: "Trocas" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 py-3 text-xs font-data uppercase tracking-widest transition-all ${
                tab === t.id ? "bg-primary text-white" : "text-white/70 hover:text-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border p-6 overflow-x-auto">
          {tab === "users" && (
            <table className="w-full text-sm font-data">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest text-white/70">
                  <th className="text-left py-3 px-2">Nome</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Telefone</th>
                  <th className="text-left py-3 px-2">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-white/60">Nenhum usuário</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-border/40 text-white">
                      <td className="py-3 px-2">{u.full_name || "—"}</td>
                      <td className="py-3 px-2 text-accent">{u.user_type || "—"}</td>
                      <td className="py-3 px-2 text-white/80">{u.phone || "—"}</td>
                      <td className="py-3 px-2 text-white/60 text-xs">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === "ads" && (
            <div className="space-y-3">
              {ads.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-4 bg-background border border-border hover:border-primary/40 transition-all">
                  <div>
                    <p className="text-sm font-data text-white">{ad.title}</p>
                    <p className="text-[11px] font-data text-white/60 uppercase mt-1">
                      {ad.category} • {ad.owner}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-data uppercase border border-accent/50 text-accent">{ad.status}</span>
                    <button onClick={() => editAd(ad.id)} className="p-2 border border-border hover:border-accent text-white/70 hover:text-accent transition">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteAd(ad.id)} className="p-2 border border-border hover:border-destructive text-white/70 hover:text-destructive transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "trades" && (
            <div className="space-y-3">
              {trades.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-background border border-border">
                  <div>
                    <p className="text-sm font-data text-white">{t.item}</p>
                    <p className="text-[11px] font-data text-white/60 uppercase mt-1">
                      {t.from} → {t.to}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-data uppercase border ${
                      t.status === "Cancelada" ? "border-destructive/60 text-destructive" : "border-accent/50 text-accent"
                    }`}>
                      {t.status}
                    </span>
                    {t.status !== "Cancelada" && (
                      <button onClick={() => cancelTrade(t.id)} className="flex items-center gap-1 p-2 px-3 border border-border hover:border-destructive text-white/70 hover:text-destructive transition text-[10px] font-data uppercase">
                        <Ban className="w-3 h-3" /> Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-surface border border-border p-5 flex items-center gap-4">
      <div className="w-12 h-12 bg-primary/10 border border-primary/40 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-data uppercase tracking-widest text-white/70">{label}</p>
        <p className="text-2xl font-bold font-data text-white">{value}</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Heart, RefreshCw, ClipboardList, LogOut, Camera, Loader2, ShieldCheck, X, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/AppStore";
import { toast } from "sonner";
import ChatPanel from "@/components/ChatPanel";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Tab = "solicitacoes" | "trocas" | "favoritos" | "chat";


export default function Perfil() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, isAdmin, signOut } = useAuth();
  const { favorites, toggleFavorite, donations, trades } = useAppStore();
  const initialTab = (searchParams.get("tab") as Tab) || "solicitacoes";
  const [tab, setTab] = useState<Tab>(initialTab);
  const chatIdParam = searchParams.get("chatId") || undefined;
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // editable fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Perfil atualizado");
    setEditing(false);
    setProfile({ ...profile, full_name: fullName, phone, address });
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter menos de 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setProfile({ ...profile, avatar_url: url });
    setUploading(false);
    toast.success("Avatar atualizado");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: BEZIER }}
        className="grid lg:grid-cols-[320px_1fr] gap-8"
      >
        {/* Sidebar */}
        <aside className="bg-surface border border-border p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4 group">
              <div className="w-full h-full bg-background border border-primary/40 rounded-full flex items-center justify-center overflow-hidden glow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary border border-accent rounded-full flex items-center justify-center cursor-pointer hover:glow-md transition-all">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Camera className="w-4 h-4 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
              </label>
            </div>
            <h2 className="font-data font-bold uppercase tracking-tight text-white">{profile?.full_name || "Usuário"}</h2>
            <p className="text-[10px] font-data uppercase text-white/70 mt-1">{user.email}</p>
            {profile?.user_type && (
              <span className="mt-3 px-3 py-1 text-[10px] font-data uppercase tracking-widest border border-accent/50 text-accent">
                {profile.user_type === "student" ? "Estudante" : "Doador"}
              </span>
            )}
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="mt-3 flex items-center gap-2 px-3 py-1 text-[10px] font-data uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                <ShieldCheck className="w-3 h-3" /> Painel Admin
              </button>
            )}
          </div>

          <div className="mt-8 space-y-2">
            {[
              { id: "solicitacoes", label: "Minhas Solicitações", icon: ClipboardList },
              { id: "trocas", label: "Minhas Trocas", icon: RefreshCw },
              { id: "favoritos", label: "Meus Favoritos", icon: Heart },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-data uppercase tracking-widest border transition-all ${
                  tab === t.id
                    ? "border-primary text-accent bg-primary/10 glow-sm"
                    : "border-border text-white/80 hover:border-primary/40 hover:text-white"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-data uppercase tracking-widest border border-border text-white/70 hover:border-destructive hover:text-destructive transition-all mt-6"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          {/* Profile editor */}
          <div className="bg-surface border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-data uppercase tracking-widest text-white">Dados Pessoais</h3>
              <button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                disabled={saving}
                className="px-4 py-1.5 text-[10px] font-data uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                {saving ? "Salvando..." : editing ? "Salvar" : "Editar"}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome" value={fullName} editing={editing} onChange={setFullName} />
              <Field label="Telefone" value={phone} editing={editing} onChange={setPhone} />
              <Field label="Endereço" value={address} editing={editing} onChange={setAddress} className="sm:col-span-2" />
            </div>
          </div>

          {/* Tabs content */}
          <div className="bg-surface border border-border p-6 min-h-[300px]">
            {tab === "solicitacoes" && (
              <ListBlock
                title="Minhas Solicitações"
                empty="Nenhuma solicitação feita ainda"
                items={donations
                  .filter((d) => d.ownerEmail === user.email)
                  .map((d) => ({
                    primary: d.title,
                    secondary: `Categoria: ${d.category}`,
                    meta: new Date(d.createdAt).toLocaleDateString("pt-BR"),
                    badge: d.status ?? "Ativo",
                  }))}
              />
            )}
            {tab === "trocas" && (
              <ListBlock
                title="Minhas Trocas"
                empty="Nenhuma troca em andamento"
                items={trades
                  .filter((t) => t.ownerEmail === user.email)
                  .map((t) => ({
                    primary: t.title,
                    secondary: `Quer trocar por: ${t.wants}`,
                    meta: new Date(t.createdAt).toLocaleDateString("pt-BR"),
                    badge: t.status ?? "Ativo",
                  }))}
              />
            )}
            {tab === "favoritos" && (
              <div>
                <h3 className="text-sm font-data uppercase tracking-widest text-white mb-6">Meus Favoritos</h3>
                {favorites.length === 0 ? (
                  <p className="text-white/60 font-data text-xs uppercase text-center py-12">Nenhum item favoritado</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {favorites.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 bg-background border border-border hover:border-primary/40 transition-all">
                        {f.image && <img src={f.image} alt="" className="w-14 h-14 object-cover border border-border" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-data text-white truncate">{f.title}</p>
                          <p className="text-[10px] font-data text-white/60 uppercase mt-1">
                            {f.type === "donation" ? "Doação" : "Troca"} • {f.category}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            toggleFavorite(f);
                            toast.success("Removido dos favoritos");
                          }}
                          className="p-2 border border-border text-white/60 hover:text-destructive hover:border-destructive transition"
                          aria-label="Remover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
  className,
}: { label: string; value: string; editing: boolean; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[10px] font-data uppercase tracking-widest text-white/70 block mb-1">{label}</label>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background border border-border px-3 py-2 text-sm font-data text-white focus:outline-none focus:border-primary focus:glow-sm"
        />
      ) : (
        <p className="text-sm font-data text-white py-2">{value || "—"}</p>
      )}
    </div>
  );
}

function ListBlock({
  title,
  empty,
  items,
}: { title: string; empty: string; items: { primary: string; secondary: string; meta?: string; badge?: string }[] }) {
  return (
    <>
      <h3 className="text-sm font-data uppercase tracking-widest text-white mb-6">{title}</h3>
      {items.length === 0 ? (
        <p className="text-white/60 font-data text-xs uppercase text-center py-12">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-background border border-border hover:border-primary/40 transition-all">
              <div>
                <p className="text-sm font-data text-white">{it.primary}</p>
                <p className="text-[11px] font-data text-white/60 uppercase mt-1">{it.secondary}</p>
              </div>
              <div className="text-right">
                {it.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-data uppercase border border-accent/50 text-accent">{it.badge}</span>
                )}
                {it.meta && <p className="text-[10px] font-data text-white/50 uppercase mt-1">{it.meta}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

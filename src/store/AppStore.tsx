import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type Donation = {
  id: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  image: string;
  owner: string;
  ownerEmail: string;
  createdAt: number;
  status?: "Ativo" | "Pausado" | "Removido";
};

export type Trade = {
  id: string;
  title: string;
  category: string;
  description: string;
  wants: string;
  image: string;
  owner: string;
  ownerEmail: string;
  createdAt: number;
  status?: "Ativo" | "Cancelada" | "Concluída";
};

export type FavoriteItem = {
  id: string;
  type: "donation" | "trade";
  title: string;
  category: string;
  image?: string;
};

export type Report = {
  id: string;
  itemId: string;
  itemType: "donation" | "trade";
  itemTitle: string;
  reportedBy: string;
  reason?: string;
  createdAt: number;
  resolved?: boolean;
};

type Ctx = {
  donations: Donation[];
  trades: Trade[];
  favorites: FavoriteItem[];
  reports: Report[];
  addDonation: (d: Omit<Donation, "id" | "createdAt" | "status">) => Donation;
  addTrade: (t: Omit<Trade, "id" | "createdAt" | "status">) => Trade;
  removeDonation: (id: string) => void;
  removeTrade: (id: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  reportItem: (r: Omit<Report, "id" | "createdAt" | "resolved">) => void;
  resolveReport: (id: string, deleteItem: boolean) => void;
};

const AppCtx = createContext<Ctx | null>(null);

const KEY = "ciclotech-store-v1";

function load<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${KEY}:${k}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(k: string, v: T) {
  try { localStorage.setItem(`${KEY}:${k}`, JSON.stringify(v)); } catch {}
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>(() => load("donations", []));
  const [trades, setTrades] = useState<Trade[]>(() => load("trades", []));
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => load("favorites", []));
  const [reports, setReports] = useState<Report[]>(() => load("reports", []));

  useEffect(() => save("donations", donations), [donations]);
  useEffect(() => save("trades", trades), [trades]);
  useEffect(() => save("favorites", favorites), [favorites]);
  useEffect(() => save("reports", reports), [reports]);

  const addDonation: Ctx["addDonation"] = useCallback((d) => {
    const item: Donation = { ...d, id: `don-${Date.now()}`, createdAt: Date.now(), status: "Ativo" };
    setDonations((p) => [item, ...p]);
    return item;
  }, []);

  const addTrade: Ctx["addTrade"] = useCallback((t) => {
    const item: Trade = { ...t, id: `tra-${Date.now()}`, createdAt: Date.now(), status: "Ativo" };
    setTrades((p) => [item, ...p]);
    return item;
  }, []);

  const removeDonation = useCallback((id: string) => setDonations((p) => p.filter((d) => d.id !== id)), []);
  const removeTrade = useCallback((id: string) => setTrades((p) => p.filter((t) => t.id !== id)), []);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((p) => (p.some((f) => f.id === item.id) ? p.filter((f) => f.id !== item.id) : [item, ...p]));
  }, []);
  const isFavorite = useCallback((id: string) => favorites.some((f) => f.id === id), [favorites]);

  const reportItem: Ctx["reportItem"] = useCallback((r) => {
    setReports((p) => [{ ...r, id: `rep-${Date.now()}`, createdAt: Date.now(), resolved: false }, ...p]);
  }, []);

  const resolveReport = useCallback((id: string, deleteItem: boolean) => {
    setReports((prev) => {
      const r = prev.find((x) => x.id === id);
      if (r && deleteItem) {
        if (r.itemType === "donation") setDonations((d) => d.filter((x) => x.id !== r.itemId));
        else setTrades((t) => t.filter((x) => x.id !== r.itemId));
      }
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  return (
    <AppCtx.Provider
      value={{
        donations, trades, favorites, reports,
        addDonation, addTrade, removeDonation, removeTrade,
        toggleFavorite, isFavorite, reportItem, resolveReport,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

export const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
  status?: "Ativo" | "Pausado" | "Removido" | "Concluído";
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

export type ChatMessage = {
  id: string;
  chatId: string;
  authorEmail: string; // or "system"
  text: string;
  createdAt: number;
  system?: boolean;
};

export type Chat = {
  id: string;
  itemId: string;
  itemType: "donation" | "trade";
  itemTitle: string;
  itemImage?: string;
  ownerEmail: string;          // anunciante
  ownerName: string;
  interestedEmail: string;     // interessado
  interestedName: string;
  createdAt: number;
  accepted?: boolean;
  acceptedAt?: number;
};

type Ctx = {
  donations: Donation[];
  trades: Trade[];
  favorites: FavoriteItem[];
  reports: Report[];
  chats: Chat[];
  messages: ChatMessage[];
  addDonation: (d: Omit<Donation, "id" | "createdAt" | "status">) => Donation;
  addTrade: (t: Omit<Trade, "id" | "createdAt" | "status">) => Trade;
  removeDonation: (id: string) => void;
  removeTrade: (id: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  reportItem: (r: Omit<Report, "id" | "createdAt" | "resolved">) => void;
  resolveReport: (id: string, deleteItem: boolean) => void;
  startChat: (args: {
    itemId: string;
    itemType: "donation" | "trade";
    itemTitle: string;
    itemImage?: string;
    ownerEmail: string;
    ownerName: string;
    interestedEmail: string;
    interestedName: string;
    firstMessage?: string;
  }) => Chat;
  sendMessage: (chatId: string, authorEmail: string, text: string, system?: boolean) => void;
  acceptDeal: (chatId: string) => void;
  getMessages: (chatId: string) => ChatMessage[];
};

const AppCtx = createContext<Ctx | null>(null);
const KEY = "ciclotech-store-v1";

function load<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${KEY}:${k}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function save<T>(k: string, v: T) {
  try { localStorage.setItem(`${KEY}:${k}`, JSON.stringify(v)); } catch {}
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>(() => load("donations", []));
  const [trades, setTrades] = useState<Trade[]>(() => load("trades", []));
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => load("favorites", []));
  const [reports, setReports] = useState<Report[]>(() => load("reports", []));
  const [chats, setChats] = useState<Chat[]>(() => load("chats", []));
  const [messages, setMessages] = useState<ChatMessage[]>(() => load("messages", []));

  useEffect(() => save("donations", donations), [donations]);
  useEffect(() => save("trades", trades), [trades]);
  useEffect(() => save("favorites", favorites), [favorites]);
  useEffect(() => save("reports", reports), [reports]);
  useEffect(() => save("chats", chats), [chats]);
  useEffect(() => save("messages", messages), [messages]);

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
    setFavorites((p) => (p.some((f) => f.id === item.id) ? p.filter((f) => f.id === item.id ? false : true) : [item, ...p]));
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

  const pushMessage = useCallback((m: ChatMessage) => setMessages((p) => [...p, m]), []);

  const startChat: Ctx["startChat"] = useCallback((args) => {
    const existing = chats.find(
      (c) => c.itemId === args.itemId && c.interestedEmail === args.interestedEmail,
    );
    if (existing) return existing;
    const chat: Chat = {
      id: `chat-${Date.now()}`,
      itemId: args.itemId,
      itemType: args.itemType,
      itemTitle: args.itemTitle,
      itemImage: args.itemImage,
      ownerEmail: args.ownerEmail,
      ownerName: args.ownerName,
      interestedEmail: args.interestedEmail,
      interestedName: args.interestedName,
      createdAt: Date.now(),
      accepted: false,
    };
    setChats((p) => [chat, ...p]);
    const first = args.firstMessage ?? `Olá! Tenho interesse no seu anúncio de ${args.itemTitle}. Vamos combinar a entrega?`;
    pushMessage({
      id: `msg-${Date.now()}`,
      chatId: chat.id,
      authorEmail: args.interestedEmail,
      text: first,
      createdAt: Date.now(),
    });
    // simulate reply from owner after 2s
    setTimeout(() => {
      pushMessage({
        id: `msg-${Date.now()}-r`,
        chatId: chat.id,
        authorEmail: args.ownerEmail,
        text: "Olá! Perfeito, posso entregar na Fatec na próxima terça-feira.",
        createdAt: Date.now(),
      });
    }, 2000);
    return chat;
  }, [chats, pushMessage]);

  const sendMessage: Ctx["sendMessage"] = useCallback((chatId, authorEmail, text, system) => {
    if (!text.trim()) return;
    pushMessage({
      id: `msg-${Date.now()}`,
      chatId,
      authorEmail: system ? "system" : authorEmail,
      text: text.trim(),
      createdAt: Date.now(),
      system,
    });
  }, [pushMessage]);

  const acceptDeal: Ctx["acceptDeal"] = useCallback((chatId) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, accepted: true, acceptedAt: Date.now() } : c)));
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      if (chat.itemType === "donation") {
        setDonations((p) => p.map((d) => (d.id === chat.itemId ? { ...d, status: "Concluído" } : d)));
      } else {
        setTrades((p) => p.map((t) => (t.id === chat.itemId ? { ...t, status: "Concluída" } : t)));
      }
      pushMessage({
        id: `msg-sys-${Date.now()}`,
        chatId,
        authorEmail: "system",
        text: "Doação/Troca aceita pelo doador. Combinem os detalhes finais abaixo.",
        createdAt: Date.now(),
        system: true,
      });
    }
  }, [chats, pushMessage]);

  const getMessages = useCallback((chatId: string) => messages.filter((m) => m.chatId === chatId), [messages]);

  return (
    <AppCtx.Provider
      value={{
        donations, trades, favorites, reports, chats, messages,
        addDonation, addTrade, removeDonation, removeTrade,
        toggleFavorite, isFavorite, reportItem, resolveReport,
        startChat, sendMessage, acceptDeal, getMessages,
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

import { useEffect, useRef, useState } from "react";
import { useAppStore, type Chat } from "@/store/AppStore";
import { useAuth } from "@/hooks/useAuth";
import { Send, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ChatPanel({ initialChatId }: { initialChatId?: string }) {
  const { user } = useAuth();
  const { chats, messages, sendMessage, acceptDeal, getMessages } = useAppStore();
  const myEmail = user?.email || "";

  const myChats = chats.filter(
    (c) => c.ownerEmail === myEmail || c.interestedEmail === myEmail,
  );

  const [activeId, setActiveId] = useState<string | null>(
    initialChatId && myChats.some((c) => c.id === initialChatId)
      ? initialChatId
      : myChats[0]?.id ?? null,
  );
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialChatId && myChats.some((c) => c.id === initialChatId)) {
      setActiveId(initialChatId);
    } else if (!activeId && myChats[0]) {
      setActiveId(myChats[0].id);
    }
  }, [initialChatId, myChats, activeId]);

  const active = myChats.find((c) => c.id === activeId) || null;
  const msgs = active ? getMessages(active.id) : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length, activeId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim() || !myEmail) return;
    sendMessage(active.id, myEmail, text);
    setText("");
    // simulate reply from the other side after 2s
    const other = active.ownerEmail === myEmail ? active.interestedEmail : active.ownerEmail;
    setTimeout(() => {
      sendMessage(
        active.id,
        other,
        "Combinado! Te aviso assim que estiver tudo certo. 👍",
      );
    }, 2000);
  };

  const handleAccept = () => {
    if (!active) return;
    acceptDeal(active.id);
    toast.success("Negociação aprovada! O anúncio foi marcado como concluído.");
  };

  if (myChats.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="w-10 h-10 text-white/40 mx-auto mb-4" />
        <p className="text-white/60 font-data text-xs uppercase">Nenhuma conversa ainda</p>
        <p className="text-white/40 font-data text-[10px] uppercase mt-2">
          Clique em "Tenho Interesse" ou "Fazer Proposta" para iniciar um chat.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[560px]">
      {/* Sidebar list */}
      <aside className="border border-border bg-background overflow-y-auto">
        {myChats.map((c) => {
          const isMe = c.ownerEmail === myEmail;
          const otherName = isMe ? c.interestedName : c.ownerName;
          const lastMsg = [...messages].reverse().find((m) => m.chatId === c.id);
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left flex gap-3 p-3 border-b border-border transition-colors ${
                activeId === c.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-primary/5"
              }`}
            >
              {c.itemImage ? (
                <img src={c.itemImage} alt="" className="w-12 h-12 object-cover border border-border flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-surface border border-border flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-data text-white truncate">{otherName}</p>
                <p className="text-[10px] font-data text-white/60 uppercase truncate">{c.itemTitle}</p>
                {lastMsg && (
                  <p className="text-[10px] text-white/50 truncate mt-0.5">
                    {lastMsg.system ? "● " : ""}{lastMsg.text}
                  </p>
                )}
                {c.accepted && (
                  <span className="inline-block mt-1 text-[9px] font-data uppercase border border-accent text-accent px-1.5">
                    Concluído
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </aside>

      {/* Active chat */}
      <div className="border border-border bg-background flex flex-col min-h-0">
        {active ? (
          <>
            {/* Header / negotiation card */}
            <div className="p-3 border-b border-border flex items-center gap-3 bg-surface">
              {active.itemImage && (
                <img src={active.itemImage} alt="" className="w-12 h-12 object-cover border border-border" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-data text-primary uppercase tracking-widest">
                  {active.itemType === "donation" ? "Doação" : "Troca"}
                </p>
                <p className="text-sm font-data text-white truncate">{active.itemTitle}</p>
                <p className="text-[10px] font-data text-white/60 uppercase">
                  Com: {active.ownerEmail === myEmail ? active.interestedName : active.ownerName}
                </p>
              </div>
              {active.ownerEmail === myEmail && !active.accepted && (
                <button
                  onClick={handleAccept}
                  className="px-3 py-2 text-[10px] font-data uppercase tracking-widest bg-primary text-primary-foreground border border-accent hover:glow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {active.itemType === "donation" ? "Concluir Doação" : "Aceitar Troca"}
                </button>
              )}
              {active.accepted && (
                <span className="px-2 py-1 text-[10px] font-data uppercase border border-accent text-accent">
                  Concluído
                </span>
              )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
              {msgs.map((m) => {
                if (m.system) {
                  return (
                    <div key={m.id} className="text-center">
                      <span className="inline-block text-[10px] font-data uppercase tracking-widest text-accent border border-accent/40 bg-accent/5 px-3 py-1">
                        {m.text}
                      </span>
                    </div>
                  );
                }
                const mine = m.authorEmail === myEmail;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 text-sm border ${
                        mine
                          ? "bg-primary text-primary-foreground border-accent"
                          : "bg-surface text-white border-border"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={`text-[9px] mt-1 font-data uppercase ${mine ? "text-primary-foreground/70" : "text-white/50"}`}>
                        {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2 bg-surface">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-background border border-border focus:border-primary outline-none px-3 py-2 text-sm text-foreground"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground border border-accent text-[10px] font-data uppercase tracking-widest hover:glow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50 font-data text-xs uppercase">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  );
}

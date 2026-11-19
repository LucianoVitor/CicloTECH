import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Solicitações, trocas e conversas do app — equivalente ao AppStore da Web (src/store/AppStore.tsx),
 * que também guarda esses dados localmente (localStorage). Aqui ficam no aparelho (AsyncStorage),
 * separados por usuário. Mantido separado dos serviços CRUD do Supabase (ver AGENTS.md).
 */

export type Solicitacao = {
  id: string;
  itemId: string;
  titulo: string;
  categoria: string;
  condicao: string;
  dono: string;
  conversaId: string;
  criadaEm: number;
  status: 'Aguardando match' | 'Cancelada' | 'Concluída';
};

export type MinhaTroca = {
  id: string;
  titulo: string;
  categoria: string;
  descricao: string;
  querTrocarPor: string;
  criadaEm: number;
  status: 'Ativo' | 'Cancelada' | 'Concluída';
};

export type Conversa = {
  id: string;
  itemId: string;
  tipo: 'doacao' | 'troca';
  itemTitulo: string;
  itemCategoria: string;
  contato: string;
  criadaEm: number;
};

export type Mensagem = {
  id: string;
  conversaId: string;
  autor: 'eu' | 'contato' | 'sistema';
  texto: string;
  criadaEm: number;
};

type Dados = {
  solicitacoes: Solicitacao[];
  trocas: MinhaTroca[];
  conversas: Conversa[];
  mensagens: Mensagem[];
};

const VAZIO: Dados = { solicitacoes: [], trocas: [], conversas: [], mensagens: [] };

type ItemDoacaoBase = { id: string; titulo: string; categoria: string; condicao: string; dono: string };
type ItemTrocaBase = { id: string; titulo: string; categoria: string; dono: string; querTrocarPor: string };

type StoreValue = Dados & {
  carregado: boolean;
  /** "Tenho interesse": cria a solicitação + conversa com o doador. Retorna o id da conversa. */
  registrarInteresse: (item: ItemDoacaoBase) => string;
  cancelarSolicitacao: (id: string) => void;
  /** "Fazer proposta": abre (ou reabre) a conversa com o anunciante. Retorna o id da conversa. */
  iniciarProposta: (item: ItemTrocaBase) => string;
  publicarTroca: (t: Omit<MinhaTroca, 'id' | 'criadaEm' | 'status'>) => void;
  cancelarTroca: (id: string) => void;
  enviarMensagem: (conversaId: string, texto: string) => void;
  mensagensDa: (conversaId: string) => Mensagem[];
  solicitacaoDoItem: (itemId: string) => Solicitacao | undefined;
};

const StoreContext = createContext<StoreValue | null>(null);

let sequencia = 0;
const novoId = (prefixo: string) => `${prefixo}-${Date.now()}-${++sequencia}`;

// Mesma resposta simulada da Web (AppStore.startChat).
const RESPOSTA_DONO = 'Olá! Perfeito, posso entregar na Fatec na próxima terça-feira.';
const RESPOSTA_TROCA = 'Oi! Tenho interesse sim. Podemos testar as peças na bancada do Lab 04 da Fatec ZL?';

export function CicloStoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const chave = session ? `ciclotech:store:${session.user.id}` : 'ciclotech:store:convidado';
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [carregado, setCarregado] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Cópia síncrona do estado: as ações calculam o próximo estado NA HORA (e devolvem ids corretos),
  // em vez de depender de um updater de setState, que o React pode executar depois.
  const atual = useRef<Dados>(VAZIO);
  const commit = useCallback((proximo: Dados) => {
    atual.current = proximo;
    setDados(proximo);
  }, []);

  // Carrega os dados do usuário atual.
  useEffect(() => {
    let ativo = true;
    setCarregado(false);
    commit(VAZIO);
    AsyncStorage.getItem(chave)
      .then((bruto) => {
        if (!ativo || !bruto) return;
        const salvo = JSON.parse(bruto) as Partial<Dados>;
        commit({
          solicitacoes: Array.isArray(salvo.solicitacoes) ? salvo.solicitacoes : [],
          trocas: Array.isArray(salvo.trocas) ? salvo.trocas : [],
          conversas: Array.isArray(salvo.conversas) ? salvo.conversas : [],
          mensagens: Array.isArray(salvo.mensagens) ? salvo.mensagens : [],
        });
      })
      .catch((e) => console.warn('[CicloTECH] Não foi possível ler os dados locais:', e?.message ?? e))
      .finally(() => ativo && setCarregado(true));
    return () => {
      ativo = false;
    };
  }, [chave, commit]);

  // Salva a cada mudança (depois do carregamento, para não sobrescrever com a lista vazia).
  useEffect(() => {
    if (!carregado) return;
    AsyncStorage.setItem(chave, JSON.stringify(dados)).catch((e) =>
      console.warn('[CicloTECH] Não foi possível salvar os dados locais:', e?.message ?? e),
    );
  }, [dados, carregado, chave]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const responderDepois = useCallback(
    (conversaId: string, texto: string) => {
      const t = setTimeout(() => {
        const d = atual.current;
        commit({
          ...d,
          mensagens: [...d.mensagens, { id: novoId('msg'), conversaId, autor: 'contato', texto, criadaEm: Date.now() }],
        });
      }, 2000);
      timers.current.push(t);
    },
    [commit],
  );

  /** Garante uma conversa para o item; retorna [id, criadaAgora]. Precisa do estado atual. */
  const abrirConversa = useCallback(
    (d: Dados, base: Omit<Conversa, 'id' | 'criadaEm'>, primeira: string): [Dados, string, boolean] => {
      const existente = d.conversas.find((c) => c.itemId === base.itemId);
      if (existente) return [d, existente.id, false];
      const id = novoId('chat');
      const agora = Date.now();
      return [
        {
          ...d,
          conversas: [{ ...base, id, criadaEm: agora }, ...d.conversas],
          mensagens: [
            ...d.mensagens,
            {
              id: novoId('msg'),
              conversaId: id,
              autor: 'sistema',
              texto: 'Realize testes de bancada e trocas físicas nos pontos credenciados da Fatec Zona Leste.',
              criadaEm: agora,
            },
            { id: novoId('msg'), conversaId: id, autor: 'eu', texto: primeira, criadaEm: agora + 1 },
          ],
        },
        id,
        true,
      ];
    },
    [],
  );

  const registrarInteresse = useCallback(
    (item: ItemDoacaoBase) => {
      const [comConversa, conversaId, criada] = abrirConversa(
        atual.current,
        { itemId: item.id, tipo: 'doacao', itemTitulo: item.titulo, itemCategoria: item.categoria, contato: item.dono },
        `Olá! Tenho interesse no seu anúncio de ${item.titulo}. Vamos combinar a entrega?`,
      );
      const jaAtiva = comConversa.solicitacoes.some((s) => s.itemId === item.id && s.status !== 'Cancelada');
      commit(
        jaAtiva
          ? comConversa
          : {
              ...comConversa,
              solicitacoes: [
                {
                  id: novoId('sol'),
                  itemId: item.id,
                  titulo: item.titulo,
                  categoria: item.categoria,
                  condicao: item.condicao,
                  dono: item.dono,
                  conversaId,
                  criadaEm: Date.now(),
                  status: 'Aguardando match',
                },
                ...comConversa.solicitacoes.filter((s) => s.itemId !== item.id),
              ],
            },
      );
      if (criada) responderDepois(conversaId, RESPOSTA_DONO);
      return conversaId;
    },
    [abrirConversa, responderDepois, commit],
  );

  const iniciarProposta = useCallback(
    (item: ItemTrocaBase) => {
      const [novo, conversaId, criada] = abrirConversa(
        atual.current,
        { itemId: item.id, tipo: 'troca', itemTitulo: item.titulo, itemCategoria: item.categoria, contato: item.dono },
        `Olá! Tenho interesse na sua troca de ${item.titulo}. Posso oferecer algo que combine com o que você procura (${item.querTrocarPor}). Vamos conversar?`,
      );
      commit(novo);
      if (criada) responderDepois(conversaId, RESPOSTA_TROCA);
      return conversaId;
    },
    [abrirConversa, responderDepois, commit],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...dados,
      carregado,
      registrarInteresse,
      iniciarProposta,
      cancelarSolicitacao: (id) => {
        const d = atual.current;
        commit({ ...d, solicitacoes: d.solicitacoes.map((s) => (s.id === id ? { ...s, status: 'Cancelada' } : s)) });
      },
      publicarTroca: (t) => {
        const d = atual.current;
        commit({ ...d, trocas: [{ ...t, id: novoId('tra'), criadaEm: Date.now(), status: 'Ativo' }, ...d.trocas] });
      },
      cancelarTroca: (id) => {
        const d = atual.current;
        commit({ ...d, trocas: d.trocas.map((t) => (t.id === id ? { ...t, status: 'Cancelada' } : t)) });
      },
      enviarMensagem: (conversaId, texto) => {
        const limpo = texto.trim();
        if (!limpo) return;
        const d = atual.current;
        commit({
          ...d,
          mensagens: [...d.mensagens, { id: novoId('msg'), conversaId, autor: 'eu', texto: limpo, criadaEm: Date.now() }],
        });
      },
      mensagensDa: (conversaId) => dados.mensagens.filter((m) => m.conversaId === conversaId),
      solicitacaoDoItem: (itemId) => dados.solicitacoes.find((s) => s.itemId === itemId && s.status !== 'Cancelada'),
    }),
    [dados, carregado, registrarInteresse, iniciarProposta, commit],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCicloStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useCicloStore deve ser usado dentro de <CicloStoreProvider>.');
  return ctx;
}

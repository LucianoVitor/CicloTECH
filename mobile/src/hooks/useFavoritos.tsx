import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type Favorito = { id: string; tipo: 'doacao' | 'troca'; titulo: string; categoria: string };

type FavoritosValue = {
  favoritos: Favorito[];
  ehFavorito: (id: string) => boolean;
  alternar: (item: Favorito) => void;
};

const FavoritosContext = createContext<FavoritosValue | null>(null);

/**
 * Favoritos ficam no aparelho (AsyncStorage), separados por usuário — como a Web faz com localStorage.
 * Falhas de leitura/gravação não quebram o app: no pior caso a lista começa vazia.
 */
export function FavoritosProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const chave = session ? `ciclotech:favoritos:${session.user.id}` : null;
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);

  useEffect(() => {
    let ativo = true;
    setFavoritos([]);
    if (!chave) return;
    AsyncStorage.getItem(chave)
      .then((bruto) => {
        if (!ativo || !bruto) return;
        const lista = JSON.parse(bruto);
        if (Array.isArray(lista)) setFavoritos(lista);
      })
      .catch((e) => console.warn('[CicloTECH] Não foi possível ler os favoritos:', e?.message ?? e));
    return () => {
      ativo = false;
    };
  }, [chave]);

  const alternar = useCallback(
    (item: Favorito) => {
      setFavoritos((atual) => {
        const nova = atual.some((f) => f.id === item.id) ? atual.filter((f) => f.id !== item.id) : [item, ...atual];
        if (chave) {
          AsyncStorage.setItem(chave, JSON.stringify(nova)).catch((e) =>
            console.warn('[CicloTECH] Não foi possível salvar os favoritos:', e?.message ?? e),
          );
        }
        return nova;
      });
    },
    [chave],
  );

  const value = useMemo<FavoritosValue>(
    () => ({ favoritos, alternar, ehFavorito: (id) => favoritos.some((f) => f.id === id) }),
    [favoritos, alternar],
  );

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos(): FavoritosValue {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error('useFavoritos deve ser usado dentro de <FavoritosProvider>.');
  return ctx;
}

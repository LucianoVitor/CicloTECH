import { router, type Href } from 'expo-router';

/** Volta uma tela; se não houver histórico (ex.: link direto ou web recarregada), vai para `destino`. */
export function voltar(destino: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(destino);
}

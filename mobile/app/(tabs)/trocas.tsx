import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { ItemCard } from '@/components/ItemCard';
import { AppHeader, Badge, Button, Eyebrow, Feedback, IconButton, Muted, Screen, Title } from '@/components/ui';
import { TROCAS, type ItemTroca } from '@/data/conteudo';
import { useAuth } from '@/hooks/useAuth';
import { useCicloStore } from '@/hooks/useCicloStore';
import { useFavoritos } from '@/hooks/useFavoritos';
import { imagemDaCategoria } from '@/lib/catalogo';
import { avisar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { conversasService, perfilService, trocasService, type Troca } from '@/services';
import { colors, spacing } from '@/theme/colors';

type Linha = {
  id: string;
  titulo: string;
  dono: string;
  categoria: string;
  querTrocarPor: string;
  descricao: string;
  imagem: ImageSourcePropType;
  real?: Troca; // anúncio do banco (tem dono de verdade)
};

const deDemonstracao = (t: ItemTroca): Linha => ({ ...t });

/** Trocas: anúncios reais do banco (todos os usuários) + anúncios de demonstração da Web. */
export default function TrocasScreen() {
  const { session } = useAuth();
  const meuId = session?.user.id;
  const { ehFavorito, alternar } = useFavoritos();
  const { iniciarProposta, conversas: conversasLocais } = useCicloStore();
  const [reais, setReais] = useState<Troca[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setReais(await trocasService.ativas());
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar as trocas.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const itens = useMemo<Linha[]>(
    () => [
      ...reais.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        dono: t.user_id === meuId ? 'Você' : t.autor_nome || 'Usuário CicloTECH',
        categoria: t.categoria,
        querTrocarPor: t.quer_trocar_por,
        descricao: t.descricao,
        imagem: t.imagem_url ? { uri: t.imagem_url } : imagemDaCategoria(t.categoria),
        real: t,
      })),
      ...TROCAS.map(deDemonstracao),
    ],
    [reais, meuId],
  );

  async function fazerProposta(item: Linha) {
    if (!item.real) {
      // Anúncio de demonstração: conversa simulada, salva no aparelho.
      const id = iniciarProposta({ id: item.id, titulo: item.titulo, categoria: item.categoria, dono: item.dono, querTrocarPor: item.querTrocarPor });
      router.push({ pathname: '/conversa/[id]', params: { id } });
      return;
    }
    setAbrindo(item.id);
    try {
      const meuNome = await perfilService.nomeExibicao();
      const id = await conversasService.abrirOuCriar(
        {
          item_tipo: 'troca',
          item_id: item.real.id,
          item_titulo: item.real.titulo,
          item_categoria: item.real.categoria,
          item_imagem_url: item.real.imagem_url,
          dono_id: item.real.user_id,
          dono_nome: item.real.autor_nome,
        },
        meuNome,
        `Olá! Tenho interesse na sua troca de ${item.real.titulo}. Posso oferecer algo que combine com o que você procura (${item.real.quer_trocar_por}). Vamos conversar?`,
      );
      router.push({ pathname: '/chat/[id]', params: { id } });
    } catch (e) {
      avisar('Não foi possível abrir a conversa', mensagemDeErro(e));
    } finally {
      setAbrindo(null);
    }
  }

  const cabecalho = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Eyebrow>PEER-TO-PEER EXCHANGE</Eyebrow>
          <Badge label="Peer-to-peer" dot />
        </View>
        <Title>Trocas</Title>
        <Muted>
          Troque peças com outros membros da comunidade. Encontre um anúncio interessante e envie sua proposta — sem
          dinheiro, só ciclo.
        </Muted>
      </View>
      <Button title="Anunciar troca" icon="add-circle-outline" onPress={() => router.push('/troca/nova')} />
      {erro && <Feedback tipo="erro" mensagem={erro} />}
    </View>
  );

  return (
    <Screen>
      <AppHeader
        right={
          <IconButton icon="person-outline" variant="primary" accessibilityLabel="Abrir perfil" onPress={() => router.navigate('/perfil')} />
        }
      />
      <FlatList
        data={itens}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={cabecalho}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} colors={[colors.primary]} progressBackgroundColor={colors.surface} />
        }
        renderItem={({ item }) => {
          const meu = !!item.real && item.real.user_id === meuId;
          const jaProposto = !item.real && conversasLocais.some((c) => c.itemId === item.id);
          return (
            <ItemCard
              imagem={item.imagem}
              categoria={item.categoria}
              titulo={item.titulo}
              selo={meu ? 'Seu anúncio' : item.real ? 'Comunidade' : undefined}
              meta={[{ rotulo: 'Por', valor: item.dono }]}
              descricao={item.descricao}
              destaque={{ rotulo: 'Quer trocar por', valor: item.querTrocarPor }}
              favorito={
                meu
                  ? undefined
                  : {
                      ativo: ehFavorito(item.id),
                      alternar: () => alternar({ id: item.id, tipo: 'troca', titulo: item.titulo, categoria: item.categoria }),
                    }
              }
              acao={
                meu
                  ? { titulo: 'Ver meus anúncios', icon: 'list-outline', variant: 'secondary', onPress: () => router.push('/minhas-trocas') }
                  : abrindo === item.id
                    ? { titulo: 'Abrindo conversa...', icon: 'hourglass-outline', variant: 'secondary', onPress: () => undefined }
                    : jaProposto
                      ? { titulo: 'Proposta enviada · Conversa', icon: 'chatbubble-outline', variant: 'secondary', onPress: () => fazerProposta(item) }
                      : { titulo: 'Fazer proposta', icon: 'swap-horizontal-outline', onPress: () => fazerProposta(item) }
              }
            />
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
});

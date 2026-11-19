import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from '@/components/ItemCard';
import { AppHeader, Button, Chip, EmptyState, Eyebrow, Feedback, IconButton, Muted, Screen, Title } from '@/components/ui';
import { DOACOES_DISPONIVEIS, FILTROS_DOACOES, type ItemDoacao } from '@/data/conteudo';
import { useAuth } from '@/hooks/useAuth';
import { useCicloStore } from '@/hooks/useCicloStore';
import { useFavoritos } from '@/hooks/useFavoritos';
import { imagemDaCategoria, tipoDaCategoria } from '@/lib/catalogo';
import { avisar, confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { conversasService, doacoesService, perfilService, type DoacaoComEquipamento } from '@/services';
import { colors, fonts, spacing } from '@/theme/colors';

type Linha = ItemDoacao & { real?: DoacaoComEquipamento };

function pertence(item: Linha, filtro: string) {
  if (filtro === 'Todos' || item.categoria === filtro) return true;
  // Doações reais usam as categorias do cadastro (ex.: "Armazenamento (SSD/HDD)").
  return !!item.real && tipoDaCategoria(item.categoria) === tipoDaCategoria(filtro);
}

/** Vitrine "Doações": doações reais de todos os usuários (banco) + catálogo de demonstração da Web. */
export default function DoacoesScreen() {
  const params = useLocalSearchParams<{ filtro?: string }>();
  const { session } = useAuth();
  const meuId = session?.user.id;
  const [filtro, setFiltro] = useState('Todos');
  const [reais, setReais] = useState<DoacaoComEquipamento[]>([]);
  const [comConversa, setComConversa] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState<string | null>(null);
  const { ehFavorito, alternar } = useFavoritos();
  const { registrarInteresse, solicitacaoDoItem } = useCicloStore();

  // Atalho vindo das categorias da tela Início (ex.: botão PEDIR).
  useEffect(() => {
    if (params.filtro && FILTROS_DOACOES.includes(params.filtro)) setFiltro(params.filtro);
  }, [params.filtro]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [vitrine, conversas] = await Promise.all([doacoesService.vitrine(), conversasService.minhas()]);
      setReais(vitrine);
      setComConversa(new Set(conversas.filter((c) => c.item_tipo === 'doacao' && c.interessado_id === meuId).map((c) => c.item_id)));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar as doações.'));
    } finally {
      setCarregando(false);
    }
  }, [meuId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const itens = useMemo<Linha[]>(() => {
    const doBanco: Linha[] = reais.map((d) => ({
      id: d.id,
      titulo: d.equipamentos!.titulo,
      categoria: d.equipamentos!.categoria,
      condicao: d.equipamentos!.condicao,
      imagem: d.equipamentos!.imagem_url ? { uri: d.equipamentos!.imagem_url } : imagemDaCategoria(d.equipamentos!.categoria),
      dono: d.user_id === meuId ? 'Você' : d.autor_nome || 'Usuário CicloTECH',
      real: d,
    }));
    return [...doBanco, ...DOACOES_DISPONIVEIS].filter((i) => pertence(i, filtro));
  }, [reais, filtro, meuId]);

  async function tenhoInteresse(item: Linha) {
    if (!item.real) {
      // Catálogo de demonstração: conversa simulada, salva no aparelho.
      if (!solicitacaoDoItem(item.id)) {
        const ok = await confirmar('Tenho interesse', `Registrar interesse em "${item.titulo}"? Abriremos uma conversa com ${item.dono}.`, {
          textoConfirmar: 'Registrar',
        });
        if (!ok) return;
      }
      const conversaId = registrarInteresse(item);
      router.push({ pathname: '/conversa/[id]', params: { id: conversaId } });
      return;
    }
    if (!comConversa.has(item.real.id)) {
      const ok = await confirmar(
        'Tenho interesse',
        `Registrar interesse em "${item.titulo}"? Abriremos uma conversa com ${item.dono} para combinar a entrega.`,
        { textoConfirmar: 'Registrar' },
      );
      if (!ok) return;
    }
    setAbrindo(item.id);
    try {
      const meuNome = await perfilService.nomeExibicao();
      const id = await conversasService.abrirOuCriar(
        {
          item_tipo: 'doacao',
          item_id: item.real.id,
          item_titulo: item.titulo,
          item_categoria: item.categoria,
          item_imagem_url: item.real.equipamentos?.imagem_url ?? null,
          dono_id: item.real.user_id,
          dono_nome: item.real.autor_nome,
        },
        meuNome,
        `Olá! Tenho interesse na sua doação de ${item.titulo}. Vamos combinar a entrega?`,
      );
      setComConversa((s) => new Set(s).add(item.real!.id));
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
        <Eyebrow>HARDWARE GALLERY</Eyebrow>
        <Title>Doações</Title>
        <Muted>
          Navegue pelos componentes disponíveis para doação. Se você é estudante da Zona Leste, registre seu interesse e
          nossa equipe fará o match.
        </Muted>
      </View>

      <Button title="+ Doar equipamento" onPress={() => router.push('/equipamento/novo')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
        style={{ marginRight: -spacing.md }}
      >
        {FILTROS_DOACOES.map((f) => (
          <Chip key={f} label={f} selected={filtro === f} onPress={() => setFiltro(f)} />
        ))}
      </ScrollView>

      <View style={styles.status}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.ponto} />
          <Text style={styles.statusTexto}>CIRCUITO ATIVO:</Text>
        </View>
        <Text style={[styles.statusTexto, { color: colors.accent }]}>
          {itens.length} {itens.length === 1 ? 'ITEM DISPONÍVEL' : 'ITENS DISPONÍVEIS'}
        </Text>
        <Text style={styles.statusTexto}>ZONA LESTE • SP</Text>
      </View>
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
        ListEmptyComponent={<EmptyState icon="filter-outline" title="Nada nesta categoria" text="Escolha outro filtro para ver mais peças." />}
        renderItem={({ item }) => {
          const minha = !!item.real && item.real.user_id === meuId;
          const interessado = item.real ? comConversa.has(item.real.id) : !!solicitacaoDoItem(item.id);
          return (
            <ItemCard
              imagem={item.imagem}
              categoria={item.categoria}
              titulo={item.titulo}
              selo={minha ? 'Sua doação' : item.real ? 'Comunidade' : undefined}
              meta={[
                { rotulo: 'Estado', valor: item.condicao },
                { rotulo: 'Por', valor: item.dono },
              ]}
              descricao={item.real?.equipamentos?.descricao || undefined}
              favorito={
                minha
                  ? undefined
                  : { ativo: ehFavorito(item.id), alternar: () => alternar({ id: item.id, tipo: 'doacao', titulo: item.titulo, categoria: item.categoria }) }
              }
              acao={
                minha
                  ? { titulo: 'Ver minhas doações', icon: 'list-outline', variant: 'secondary', onPress: () => router.push('/minhas-doacoes') }
                  : abrindo === item.id
                    ? { titulo: 'Abrindo conversa...', icon: 'hourglass-outline', variant: 'secondary', onPress: () => undefined }
                    : interessado
                      ? { titulo: 'Interesse registrado · Conversa', icon: 'chatbubble-outline', variant: 'secondary', onPress: () => tenhoInteresse(item) }
                      : { titulo: 'Tenho interesse', icon: 'hand-left-outline', onPress: () => tenhoInteresse(item) }
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
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  statusTexto: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2 },
});

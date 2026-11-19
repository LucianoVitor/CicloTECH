import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HardwareImage } from '@/components/HardwareImage';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Eyebrow,
  Feedback,
  IconButton,
  Muted,
  Screen,
  StackHeader,
  Title,
} from '@/components/ui';
import { FILTROS, tipoDaCategoria, type TipoCategoria } from '@/lib/catalogo';
import { avisar, confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { doacoesService, equipamentosService, perfilService, type Equipamento } from '@/services';
import { colors, fonts, spacing } from '@/theme/colors';

export default function MeusEquipamentosScreen() {
  const [itens, setItens] = useState<Equipamento[]>([]);
  const [doados, setDoados] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<TipoCategoria | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [equipamentos, doacoes] = await Promise.all([equipamentosService.buscar(), doacoesService.buscar()]);
      setItens(equipamentos);
      setDoados(new Set(doacoes.map((d) => d.equipamento_id)));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar seus equipamentos.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const visiveis = useMemo(
    () => (filtro ? itens.filter((i) => tipoDaCategoria(i.categoria) === filtro) : itens),
    [itens, filtro],
  );

  async function doar(item: Equipamento) {
    const ok = await confirmar('Registrar doação', `Disponibilizar "${item.titulo}" para doação?`, {
      textoConfirmar: 'Doar',
    });
    if (!ok) return;
    setProcessando(item.id);
    try {
      // autor_nome aparece na vitrine de Doações para os outros usuários.
      const autor_nome = await perfilService.nomeExibicao();
      await doacoesService.inserir({ equipamento_id: item.id, autor_nome });
      setDoados((atual) => new Set(atual).add(item.id));
      avisar('Doação registrada', 'Ela já aparece na vitrine de Doações para todos os usuários. Acompanhe em Perfil › Minhas doações.');
    } catch (e) {
      avisar('Erro ao doar', mensagemDeErro(e));
    } finally {
      setProcessando(null);
    }
  }

  async function excluir(item: Equipamento) {
    const ok = await confirmar(
      'Excluir equipamento',
      `"${item.titulo}" e as doações vinculadas a ele serão removidos.`,
      { textoConfirmar: 'Excluir', destrutivo: true },
    );
    if (!ok) return;
    setProcessando(item.id);
    try {
      await equipamentosService.deletar(item.id);
      await carregar();
    } catch (e) {
      avisar('Erro ao excluir', mensagemDeErro(e));
    } finally {
      setProcessando(null);
    }
  }

  const cabecalho = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <View style={{ gap: spacing.sm }}>
        <Title>Meus equipamentos</Title>
        <Muted>
          Seus componentes cadastrados. Registre a doação de uma peça e nossa equipe fará o match com estudantes da Zona
          Leste.
        </Muted>
      </View>

      <Button title="Doar equipamento" icon="add" onPress={() => router.push('/equipamento/novo')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
        style={{ marginRight: -spacing.md }}
      >
        {FILTROS.map((f) => {
          const total = f.tipo ? itens.filter((i) => tipoDaCategoria(i.categoria) === f.tipo).length : itens.length;
          return (
            <Chip
              key={f.rotulo}
              label={`${f.rotulo} (${total})`}
              selected={filtro === f.tipo}
              onPress={() => setFiltro(f.tipo)}
            />
          );
        })}
      </ScrollView>

      <View style={styles.statusLinha}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.pontoAtivo} />
          <Text style={styles.statusTexto}>CIRCUITO ATIVO:</Text>
        </View>
        <Text style={[styles.statusTexto, { color: colors.accent }]}>
          {visiveis.length} {visiveis.length === 1 ? 'ITEM' : 'ITENS'}
        </Text>
        <Text style={styles.statusTexto}>ZONA LESTE • SP</Text>
      </View>

      {erro && <Feedback tipo="erro" mensagem={erro} />}
    </View>
  );

  return (
    <Screen>
      <StackHeader title="Meu painel"onBack={() => voltar('/perfil')} />
      <FlatList
        data={visiveis}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={cabecalho}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregar}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        ListEmptyComponent={
          carregando ? undefined : filtro ? (
            <EmptyState icon="filter-outline" title="Nada nesta categoria" text="Escolha outro filtro ou cadastre uma peça." />
          ) : (
            <EmptyState
              icon="hardware-chip-outline"
              title="Nenhum equipamento"
              text="Toque em “Doar equipamento” para cadastrar sua primeira peça."
            />
          )
        }
        renderItem={({ item }) => {
          const doado = doados.has(item.id);
          const ocupado = processando === item.id;
          return (
            <Card>
              <View>
                <HardwareImage uri={item.imagem_url} categoria={item.categoria} />
                <View style={styles.imagemTopo}>
                  {doado ? <Badge label="Em doação" dot /> : <Badge label="Disponível" tone="muted" />}
                  <IconButton icon="trash-outline" accessibilityLabel={`Excluir ${item.titulo}`} onPress={() => excluir(item)} />
                </View>
              </View>
              <View style={styles.corpo}>
                <Eyebrow>{item.categoria.toUpperCase()}</Eyebrow>
                <Text style={styles.nome} numberOfLines={2}>
                  {item.titulo}
                </Text>
                <Text style={styles.meta}>
                  ESTADO: <Text style={{ color: colors.accent }}>{item.condicao.toUpperCase()}</Text>
                </Text>
                {!!item.descricao && (
                  <Muted style={{ fontSize: 13 }} numberOfLines={2}>
                    {item.descricao}
                  </Muted>
                )}
                <Button
                  title={doado ? 'Doação registrada' : 'Registrar doação'}
                  icon={doado ? 'checkmark-circle-outline' : 'heart-outline'}
                  variant={doado ? 'secondary' : 'primary'}
                  disabled={doado}
                  loading={ocupado}
                  onPress={() => doar(item)}
                  style={{ marginTop: spacing.xs }}
                />
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  pontoAtivo: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  statusTexto: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2 },
  imagemTopo: {
    position: 'absolute',
    top: spacing.sm + 4,
    left: spacing.sm + 4,
    right: spacing.sm + 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  corpo: { padding: spacing.md, gap: spacing.sm },
  nome: { color: colors.text, fontFamily: fonts.semibold, fontSize: 19 },
  meta: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.2 },
});

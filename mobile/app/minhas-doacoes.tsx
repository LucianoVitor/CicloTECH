import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { HardwareImage } from '@/components/HardwareImage';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Feedback,
  Muted,
  Screen,
  StackHeader,
  Title,
} from '@/components/ui';
import { avisar, confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { doacoesService, type DoacaoComEquipamento } from '@/services';
import { colors, fonts, radius, spacing } from '@/theme/colors';

type Tom = 'primary' | 'success' | 'warning' | 'muted';

/** Cor do badge por status (o banco grava texto livre; padrão "Ativo"). */
function tomDoStatus(status: string): Tom {
  const s = status.toLowerCase();
  if (s.includes('conclu') || s.includes('entreg')) return 'success';
  if (s.includes('match') || s.includes('andamento') || s.includes('negoci')) return 'warning';
  if (s.includes('cancel') || s.includes('inativ')) return 'muted';
  return 'primary';
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

export default function MinhasDoacoesScreen() {
  const [itens, setItens] = useState<DoacaoComEquipamento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setItens(await doacoesService.buscar());
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar suas doações.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function cancelar(item: DoacaoComEquipamento) {
    const nome = item.equipamentos?.titulo ?? 'este equipamento';
    const ok = await confirmar('Cancelar doação', `Retirar "${nome}" da doação? O equipamento continua cadastrado.`, {
      textoConfirmar: 'Cancelar doação',
      destrutivo: true,
    });
    if (!ok) return;
    setCancelando(item.id);
    try {
      await doacoesService.deletar(item.id);
      setItens((atual) => atual.filter((d) => d.id !== item.id));
    } catch (e) {
      avisar('Erro ao cancelar', mensagemDeErro(e));
    } finally {
      setCancelando(null);
    }
  }

  const ativas = itens.filter((d) => tomDoStatus(d.status) === 'primary').length;

  const cabecalho = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <View style={{ gap: spacing.sm }}>
        <Title>Minhas doações</Title>
        <Muted>Acompanhe as peças que você disponibilizou e o status de cada uma até chegar a um estudante.</Muted>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={styles.metrica}>
          <Text style={styles.metricaValor}>{itens.length}</Text>
          <Text style={styles.metricaRotulo}>TOTAL DE DOAÇÕES</Text>
        </View>
        <View style={styles.metrica}>
          <Text style={[styles.metricaValor, { color: colors.primary }]}>{ativas}</Text>
          <Text style={styles.metricaRotulo}>ATIVAS AGORA</Text>
        </View>
      </View>

      {erro && <Feedback tipo="erro" mensagem={erro} />}
    </View>
  );

  return (
    <Screen>
      <StackHeader title="Meu painel" onBack={() => voltar('/perfil')} />
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={cabecalho}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 4 }} />}
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
          carregando ? undefined : (
            <View style={{ gap: spacing.md }}>
              <EmptyState
                icon="heart-outline"
                title="Nenhuma doação ainda"
                text="Em Meus equipamentos, toque em “Registrar doação” em uma peça."
              />
              <Button
                title="Meus equipamentos"
                variant="outline"
                icon="grid-outline"
                onPress={() => router.push('/meus-equipamentos')}
              />
            </View>
          )
        }
        renderItem={({ item }) => {
          const eq = item.equipamentos;
          return (
            <Card style={{ padding: spacing.sm + 4, gap: spacing.sm + 4 }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm + 4 }}>
                <HardwareImage uri={eq?.imagem_url} categoria={eq?.categoria ?? ''} height={88} vinheta={false} style={styles.miniatura} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Eyebrow>{(eq?.categoria ?? 'Equipamento').toUpperCase()}</Eyebrow>
                  <Text style={styles.nome} numberOfLines={2}>
                    {eq?.titulo ?? 'Equipamento removido'}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                    <Badge label={item.status} tone={tomDoStatus(item.status)} dot />
                    {eq?.condicao && <Badge label={eq.condicao} tone="muted" />}
                  </View>
                </View>
              </View>

              {!!item.observacoes && <Muted style={{ fontSize: 13 }}>{item.observacoes}</Muted>}

              <View style={styles.rodape}>
                <Text style={styles.data}>REGISTRADA EM {formatarData(item.created_at)}</Text>
                <Button
                  title="Cancelar"
                  variant="danger"
                  size="sm"
                  icon="close"
                  loading={cancelando === item.id}
                  onPress={() => cancelar(item)}
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
  metrica: {
    flex: 1,
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  metricaValor: { color: colors.text, fontFamily: fonts.bold, fontSize: 28 },
  metricaRotulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2 },
  miniatura: { width: 88, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  nome: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  data: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, flexShrink: 1 },
});

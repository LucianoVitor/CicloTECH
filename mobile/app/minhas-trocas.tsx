import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from '@/components/ItemCard';
import { Badge, Button, EmptyState, Feedback, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCicloStore } from '@/hooks/useCicloStore';
import { imagemDaCategoria } from '@/lib/catalogo';
import { avisar, confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { conversasService, trocasService, type Conversa, type Troca } from '@/services';
import { colors, fonts, radius, spacing } from '@/theme/colors';

function LinhaConversa({ titulo, sub, onPress }: { titulo: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${sub}`}
      onPress={onPress}
      style={({ pressed }) => [styles.proposta, pressed && { borderColor: colors.primaryBorder }]}
    >
      <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.propostaTitulo} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={styles.propostaSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

/** "Minhas trocas": meus anúncios (banco), propostas recebidas e propostas enviadas. */
export default function MinhasTrocasScreen() {
  const { session } = useAuth();
  const meuId = session?.user.id;
  const local = useCicloStore();
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [t, c] = await Promise.all([trocasService.minhas(), conversasService.minhas()]);
      setTrocas(t);
      setConversas(c.filter((x) => x.item_tipo === 'troca'));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar suas trocas.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function alterarStatus(t: Troca) {
    const encerrar = t.status === 'Ativo';
    const ok = await confirmar(
      encerrar ? 'Encerrar anúncio' : 'Reativar anúncio',
      encerrar ? `Tirar "${t.titulo}" da vitrine de trocas?` : `Colocar "${t.titulo}" de volta na vitrine?`,
      { textoConfirmar: encerrar ? 'Encerrar' : 'Reativar', destrutivo: encerrar },
    );
    if (!ok) return;
    try {
      await trocasService.definirStatus(t.id, encerrar ? 'Encerrada' : 'Ativo');
      await carregar();
    } catch (e) {
      avisar('Erro', mensagemDeErro(e));
    }
  }

  const recebidas = conversas.filter((c) => c.dono_id === meuId);
  const enviadas = conversas.filter((c) => c.interessado_id === meuId);
  const enviadasDemo = local.conversas.filter((c) => c.tipo === 'troca');

  return (
    <Screen>
      <StackHeader title="Meu painel" onBack={() => voltar('/perfil')} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <View style={{ gap: spacing.sm }}>
          <Title>Minhas trocas</Title>
          <Muted>Seus anúncios na vitrine e as negociações com outros estudantes.</Muted>
          {erro && <Feedback tipo="erro" mensagem={erro} />}
        </View>

        <Button title="Anunciar troca" icon="add-circle-outline" onPress={() => router.push('/troca/nova')} />

        <View style={{ gap: spacing.md }}>
          <Text style={styles.secao}>MEUS ANÚNCIOS ({trocas.length})</Text>
          {trocas.length === 0 ? (
            <EmptyState icon="swap-horizontal-outline" title="Nenhum anúncio" text="Publique uma peça que você quer trocar." />
          ) : (
            trocas.map((t) => (
              <ItemCard
                key={t.id}
                imagem={t.imagem_url ? { uri: t.imagem_url } : imagemDaCategoria(t.categoria)}
                categoria={t.categoria}
                titulo={t.titulo}
                selo={t.status === 'Ativo' ? 'Na vitrine' : 'Encerrada'}
                descricao={t.descricao}
                destaque={{ rotulo: 'Quer trocar por', valor: t.quer_trocar_por }}
              >
                <Button
                  title={t.status === 'Ativo' ? 'Encerrar anúncio' : 'Reativar anúncio'}
                  variant={t.status === 'Ativo' ? 'danger' : 'outline'}
                  size="sm"
                  icon={t.status === 'Ativo' ? 'close' : 'refresh'}
                  onPress={() => alterarStatus(t)}
                />
              </ItemCard>
            ))
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={styles.secao}>PROPOSTAS RECEBIDAS ({recebidas.length})</Text>
          {recebidas.length === 0 ? (
            <Muted>Quando alguém fizer uma proposta num anúncio seu, ela aparece aqui.</Muted>
          ) : (
            recebidas.map((c) => (
              <LinhaConversa key={c.id} titulo={c.item_titulo} sub={`de ${c.interessado_nome || 'Interessado'}`} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })} />
            ))
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={styles.secao}>PROPOSTAS ENVIADAS ({enviadas.length + enviadasDemo.length})</Text>
          {enviadas.length + enviadasDemo.length === 0 ? (
            <Muted>Nenhuma proposta ainda. Na aba Trocas, toque em “Fazer proposta”.</Muted>
          ) : (
            <>
              {enviadas.map((c) => (
                <LinhaConversa key={c.id} titulo={c.item_titulo} sub={`para ${c.dono_nome || 'Anunciante'}`} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })} />
              ))}
              {enviadasDemo.map((c) => (
                <LinhaConversa key={c.id} titulo={c.itemTitulo} sub={`para ${c.contato} · demonstração`} onPress={() => router.push({ pathname: '/conversa/[id]', params: { id: c.id } })} />
              ))}
            </>
          )}
        </View>
        {trocas.length > 0 && <Badge label={`${trocas.filter((t) => t.status === 'Ativo').length} ativo(s) na vitrine`} tone="muted" />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  secao: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  proposta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  propostaTitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  propostaSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
});

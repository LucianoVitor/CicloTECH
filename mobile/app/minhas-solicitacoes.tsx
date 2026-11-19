import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { ItemCard } from '@/components/ItemCard';
import { Badge, Button, EmptyState, Feedback, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCicloStore } from '@/hooks/useCicloStore';
import { imagemDaCategoria } from '@/lib/catalogo';
import { confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { conversasService, type Conversa } from '@/services';
import { colors, fonts, spacing } from '@/theme/colors';

/** "Minhas solicitações": doações em que o usuário registrou interesse (reais + demonstração). */
export default function MinhasSolicitacoesScreen() {
  const { session } = useAuth();
  const meuId = session?.user.id;
  const { solicitacoes, cancelarSolicitacao } = useCicloStore();
  const [reais, setReais] = useState<Conversa[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const cs = await conversasService.minhas();
      setReais(cs.filter((c) => c.item_tipo === 'doacao' && c.interessado_id === meuId));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar suas solicitações.'));
    } finally {
      setCarregando(false);
    }
  }, [meuId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function cancelarDemo(id: string, titulo: string) {
    const ok = await confirmar('Cancelar solicitação', `Retirar seu interesse em "${titulo}"?`, { textoConfirmar: 'Cancelar solicitação', destrutivo: true });
    if (ok) cancelarSolicitacao(id);
  }

  const total = reais.length + solicitacoes.length;

  return (
    <Screen>
      <StackHeader title="Meu painel" onBack={() => voltar('/perfil')} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <View style={{ gap: spacing.sm }}>
          <Title>Minhas solicitações</Title>
          <Muted>Pedidos de componentes de hardware. Combine a entrega com o doador na conversa.</Muted>
          {erro && <Feedback tipo="erro" mensagem={erro} />}
        </View>

        {total === 0 && !carregando && (
          <View style={{ gap: spacing.md }}>
            <EmptyState icon="clipboard-outline" title="Nenhuma solicitação" text="Na aba Doações, toque em “Tenho interesse” numa peça." />
            <Button title="Ver doações" variant="outline" icon="grid-outline" onPress={() => router.navigate('/doacoes')} />
          </View>
        )}

        {reais.map((c) => (
          <ItemCard
            key={c.id}
            imagem={c.item_imagem_url ? { uri: c.item_imagem_url } : imagemDaCategoria(c.item_categoria)}
            categoria={c.item_categoria}
            titulo={c.item_titulo}
            selo="Em conversa"
            meta={[
              { rotulo: 'Doador', valor: c.dono_nome || 'Usuário CicloTECH' },
              { rotulo: 'Pedido em', valor: new Date(c.created_at).toLocaleDateString('pt-BR') },
            ]}
            acao={{ titulo: 'Abrir conversa', icon: 'chatbubble-outline', onPress: () => router.push({ pathname: '/chat/[id]', params: { id: c.id } }) }}
          />
        ))}

        {solicitacoes.length > 0 && (
          <Text style={{ color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6, marginTop: spacing.sm }}>
            CATÁLOGO DE DEMONSTRAÇÃO
          </Text>
        )}
        {solicitacoes.map((s) => (
          <ItemCard
            key={s.id}
            imagem={imagemDaCategoria(s.categoria)}
            categoria={s.categoria}
            titulo={s.titulo}
            selo={s.status}
            meta={[
              { rotulo: 'Estado', valor: s.condicao },
              { rotulo: 'Por', valor: s.dono },
            ]}
            acao={{ titulo: 'Abrir conversa', icon: 'chatbubble-outline', onPress: () => router.push({ pathname: '/conversa/[id]', params: { id: s.conversaId } }) }}
          >
            {s.status !== 'Cancelada' ? (
              <Button title="Cancelar solicitação" variant="danger" size="sm" icon="close" onPress={() => cancelarDemo(s.id, s.titulo)} />
            ) : (
              <Badge label="Cancelada" tone="muted" />
            )}
          </ItemCard>
        ))}
      </ScrollView>
    </Screen>
  );
}

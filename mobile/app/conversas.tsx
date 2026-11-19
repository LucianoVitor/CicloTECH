import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { HardwareImage } from '@/components/HardwareImage';
import { Badge, Button, EmptyState, Feedback, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCicloStore } from '@/hooks/useCicloStore';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { conversasService, type Conversa, type Mensagem } from '@/services';
import { colors, fonts, radius, spacing } from '@/theme/colors';

type Linha = {
  chave: string;
  real: boolean;
  id: string;
  tipo: string;
  titulo: string;
  categoria: string;
  imagemUrl: string | null;
  contato: string;
  papel: string;
  previa: string;
  quando: number;
};

/** "Minhas conversas": conversas reais entre usuários (banco) + conversas do catálogo de demonstração. */
export default function ConversasScreen() {
  const { session } = useAuth();
  const meuId = session?.user.id;
  const local = useCicloStore();
  const [reais, setReais] = useState<Conversa[]>([]);
  const [ultimas, setUltimas] = useState<Record<string, Mensagem>>({});
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const cs = await conversasService.minhas();
      setReais(cs);
      setUltimas(await conversasService.ultimasMensagens(cs.map((c) => c.id)));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar as conversas.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const linhas = useMemo<Linha[]>(() => {
    const doBanco: Linha[] = reais.map((c) => {
      const souDono = c.dono_id === meuId;
      const u = ultimas[c.id];
      return {
        chave: `r-${c.id}`,
        real: true,
        id: c.id,
        tipo: c.item_tipo,
        titulo: c.item_titulo,
        categoria: c.item_categoria,
        imagemUrl: c.item_imagem_url,
        contato: souDono ? c.interessado_nome || 'Interessado' : c.dono_nome || 'Anunciante',
        papel: souDono ? 'Recebida' : 'Enviada',
        previa: u ? `${u.autor_id === meuId ? 'Você: ' : ''}${u.texto}` : 'Sem mensagens',
        quando: new Date(u?.created_at ?? c.created_at).getTime(),
      };
    });
    const simuladas: Linha[] = local.conversas.map((c) => {
      const ms = local.mensagens.filter((m) => m.conversaId === c.id && m.autor !== 'sistema');
      const u = ms[ms.length - 1];
      return {
        chave: `l-${c.id}`,
        real: false,
        id: c.id,
        tipo: c.tipo,
        titulo: c.itemTitulo,
        categoria: c.itemCategoria,
        imagemUrl: null,
        contato: c.contato,
        papel: 'Demonstração',
        previa: u ? `${u.autor === 'eu' ? 'Você: ' : ''}${u.texto}` : 'Sem mensagens',
        quando: u?.criadaEm ?? c.criadaEm,
      };
    });
    return [...doBanco, ...simuladas].sort((a, b) => b.quando - a.quando);
  }, [reais, ultimas, local.conversas, local.mensagens, meuId]);

  function abrir(l: Linha) {
    if (l.real) router.push({ pathname: '/chat/[id]', params: { id: l.id } });
    else router.push({ pathname: '/conversa/[id]', params: { id: l.id } });
  }

  return (
    <Screen>
      <StackHeader title="Meu painel" onBack={() => voltar('/perfil')} />
      <FlatList
        data={linhas}
        keyExtractor={(l) => l.chave}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm + 4, paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} colors={[colors.primary]} progressBackgroundColor={colors.surface} />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
            <Title>Minhas conversas</Title>
            <Muted>Canal direto com doadores, interessados e anunciantes de trocas.</Muted>
            {erro && <Feedback tipo="erro" mensagem={erro} />}
          </View>
        }
        ListEmptyComponent={
          carregando ? undefined : (
            <View style={{ gap: spacing.md }}>
              <EmptyState icon="chatbubbles-outline" title="Nenhuma conversa" text="Toque em “Tenho interesse” numa doação ou em “Fazer proposta” numa troca." />
              <Button title="Ver doações" variant="outline" icon="grid-outline" onPress={() => router.navigate('/doacoes')} />
            </View>
          )
        }
        renderItem={({ item: l }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Conversa sobre ${l.titulo} com ${l.contato}`}
            onPress={() => abrir(l)}
            style={({ pressed }) => [styles.linha, pressed && { borderColor: colors.primaryBorder }]}
          >
            <HardwareImage uri={l.imagemUrl} categoria={l.categoria} height={56} vinheta={false} style={styles.imagem} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.tipo}>
                {l.tipo === 'doacao' ? 'DOAÇÃO' : 'TROCA'} · {l.contato.toUpperCase()}
              </Text>
              <Text style={styles.titulo} numberOfLines={1}>
                {l.titulo}
              </Text>
              <Text style={styles.previa} numberOfLines={1}>
                {l.previa}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Badge label={l.papel} tone={l.real ? 'primary' : 'muted'} />
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  imagem: { width: 56, borderRadius: radius.md },
  tipo: { color: colors.accent, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.1 },
  titulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  previa: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13 },
});

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { HardwareImage } from '@/components/HardwareImage';
import { Badge, EmptyState, Feedback, Screen, StackHeader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { conversasService, type Conversa, type Mensagem } from '@/services';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

const RESPOSTAS_RAPIDAS = ['Levo cabos extras', 'Qual o box do lab?', 'Posso amanhã às 19h', 'A peça foi testada?'];
const INTERVALO_ATUALIZACAO = 4000; // reserva caso o tempo real (Realtime) esteja indisponível

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Junta mensagens sem duplicar (tempo real + atualização periódica + envio local). */
function mesclar(atuais: Mensagem[], novas: Mensagem[]): Mensagem[] {
  const porId = new Map(atuais.map((m) => [m.id, m]));
  for (const m of novas) porId.set(m.id, m);
  return [...porId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/** Conversa real entre dois usuários (tabelas conversas + mensagens). */
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const meuId = session?.user.id;
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const lista = useRef<FlatList<Mensagem>>(null);

  const atualizar = useCallback(async () => {
    if (!id) return;
    try {
      const novas = await conversasService.mensagens(id);
      setMensagens((atuais) => mesclar(atuais, novas));
    } catch (e) {
      console.warn('[CicloTECH] Falha ao atualizar mensagens:', mensagemDeErro(e));
    }
  }, [id]);

  // Carga inicial.
  useEffect(() => {
    if (!id) return;
    let ativo = true;
    (async () => {
      try {
        const [c, ms] = await Promise.all([conversasService.buscar(id), conversasService.mensagens(id)]);
        if (!ativo) return;
        setConversa(c);
        setMensagens(ms);
      } catch (e) {
        if (ativo) setErro(mensagemDeErro(e, 'Não foi possível abrir a conversa.'));
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  // Tempo real + atualização periódica enquanto a tela está aberta.
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const cancelar = conversasService.assinar(id, (m) => setMensagens((atuais) => mesclar(atuais, [m])));
      const timer = setInterval(atualizar, INTERVALO_ATUALIZACAO);
      return () => {
        cancelar();
        clearInterval(timer);
      };
    }, [id, atualizar]),
  );

  useEffect(() => {
    const t = setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [mensagens.length]);

  async function enviar(valor = texto) {
    const limpo = valor.trim();
    if (!id || !limpo || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const m = await conversasService.enviar(id, limpo);
      setMensagens((atuais) => mesclar(atuais, [m]));
      if (valor === texto) setTexto('');
    } catch (e) {
      setErro(mensagemDeErro(e, 'Mensagem não enviada. Tente de novo.'));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <Screen>
        <StackHeader title="Conversa" onBack={() => voltar('/conversas')} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  if (!conversa) {
    return (
      <Screen>
        <StackHeader title="Conversa" onBack={() => voltar('/conversas')} />
        <View style={{ padding: spacing.md, gap: spacing.md }}>
          {erro && <Feedback tipo="erro" mensagem={erro} />}
          <EmptyState icon="chatbubble-outline" title="Conversa não encontrada" text="Ela pode ter sido removida." />
        </View>
      </Screen>
    );
  }

  const souDono = conversa.dono_id === meuId;
  const outro = souDono ? conversa.interessado_nome || 'Interessado' : conversa.dono_nome || 'Anunciante';

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <StackHeader title="Conversa" onBack={() => voltar('/conversas')} />

      <View style={styles.item}>
        <HardwareImage uri={conversa.item_imagem_url} categoria={conversa.item_categoria} height={52} vinheta={false} style={styles.itemImagem} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.itemTipo}>{conversa.item_tipo === 'doacao' ? 'DOAÇÃO' : 'ITEM EM TROCA'}{souDono ? ' · SEU ANÚNCIO' : ''}</Text>
          <Text style={styles.itemTitulo} numberOfLines={1}>
            {conversa.item_titulo}
          </Text>
          <Text style={styles.itemContato}>com {outro}</Text>
        </View>
        <Badge label="Ao vivo" dot />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={lista}
          data={mensagens}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          onContentSizeChange={() => lista.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={
            <View style={styles.sistema}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sistemaTitulo}>DIRETRIZ CICLOTECH</Text>
                <Text style={styles.sistemaTexto}>Realize testes de bancada e trocas físicas nos pontos credenciados da Fatec Zona Leste.</Text>
              </View>
            </View>
          }
          renderItem={({ item: m }) => {
            const meu = m.autor_id === meuId;
            return (
              <View style={{ alignItems: meu ? 'flex-end' : 'flex-start', gap: 4 }}>
                <Text style={styles.autor}>
                  {meu ? 'VOCÊ' : outro.toUpperCase()} · {hora(m.created_at)}
                </Text>
                <View style={[styles.balao, meu ? styles.balaoMeu : styles.balaoDele]}>
                  <Text style={[styles.balaoTexto, meu && { color: colors.background }]}>{m.texto}</Text>
                </View>
              </View>
            );
          }}
        />

        {erro && (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
            <Feedback tipo="erro" mensagem={erro} />
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
          style={{ flexGrow: 0 }}
          keyboardShouldPersistTaps="handled"
        >
          {RESPOSTAS_RAPIDAS.map((r) => (
            <Pressable key={r} accessibilityRole="button" accessibilityLabel={r} onPress={() => enviar(r)} style={styles.rapida}>
              <Text style={styles.rapidaTexto}>{r}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.entrada}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Digite sua mensagem técnica..."
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primary}
            style={styles.campo}
            multiline
            maxLength={2000}
            accessibilityLabel="Mensagem"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            onPress={() => enviar()}
            disabled={!texto.trim() || enviando}
            style={({ pressed }) => [styles.enviar, (!texto.trim() || enviando || pressed) && { opacity: 0.6 }]}
          >
            {enviando ? <ActivityIndicator color={colors.onPrimary} /> : <Ionicons name="send" size={18} color={colors.onPrimary} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  itemImagem: { width: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  itemTipo: { color: colors.accent, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.2 },
  itemTitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  itemContato: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
  sistema: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
  sistemaTitulo: { color: colors.accent, fontFamily: fonts.monoBold, fontSize: 10, letterSpacing: 1.2 },
  sistemaTexto: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  autor: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1 },
  balao: { maxWidth: '82%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, borderRadius: radius.lg },
  balaoMeu: { backgroundColor: colors.accent, borderBottomRightRadius: 4, boxShadow: glow.soft },
  balaoDele: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  balaoTexto: { color: colors.text, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  rapida: {
    paddingHorizontal: 12,
    height: 34,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rapidaTexto: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 13 },
  entrada: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    backgroundColor: colors.tabBar,
  },
  campo: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
  },
  enviar: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: glow.soft,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArteHardware } from '@/components/ArteHardware';
import { Badge, EmptyState, Screen, StackHeader } from '@/components/ui';
import { useCicloStore, type Mensagem } from '@/hooks/useCicloStore';
import { imagemDaCategoria } from '@/lib/catalogo';
import { voltar } from '@/lib/navegacao';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

const RESPOSTAS_RAPIDAS = ['Levo cabos extras', 'Qual o box do lab?', 'Posso amanhã às 19h', 'A peça foi testada?'];

function hora(ts: number) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function Balao({ m, contato }: { m: Mensagem; contato: string }) {
  if (m.autor === 'sistema') {
    return (
      <View style={styles.sistema}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sistemaTitulo}>DIRETRIZ CICLOTECH</Text>
          <Text style={styles.sistemaTexto}>{m.texto}</Text>
        </View>
      </View>
    );
  }
  const meu = m.autor === 'eu';
  return (
    <View style={{ alignItems: meu ? 'flex-end' : 'flex-start', gap: 4 }}>
      <Text style={styles.autor}>
        {meu ? 'VOCÊ' : contato.toUpperCase()} · {hora(m.criadaEm)}
      </Text>
      <View style={[styles.balao, meu ? styles.balaoMeu : styles.balaoDele]}>
        <Text style={[styles.balaoTexto, meu && { color: colors.background }]}>{m.texto}</Text>
      </View>
    </View>
  );
}

export default function ConversaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversas, mensagensDa, enviarMensagem, carregado } = useCicloStore();
  const conversa = conversas.find((c) => c.id === id);
  const mensagens = conversa ? mensagensDa(conversa.id) : [];
  const [texto, setTexto] = useState('');
  const lista = useRef<FlatList<Mensagem>>(null);

  // Rola para a última mensagem quando chega uma nova (inclusive a resposta simulada).
  useEffect(() => {
    const t = setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [mensagens.length]);

  function enviar(valor = texto) {
    if (!conversa || !valor.trim()) return;
    enviarMensagem(conversa.id, valor);
    setTexto('');
  }

  if (!conversa) {
    return (
      <Screen>
        <StackHeader title="Conversa" onBack={() => voltar('/conversas')} />
        <View style={{ padding: spacing.md }}>
          {carregado && (
            <EmptyState icon="chatbubble-outline" title="Conversa não encontrada" text="Ela pode ter sido removida deste aparelho." />
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <StackHeader title="Conversa" onBack={() => voltar('/conversas')} />

      <View style={styles.item}>
        <ArteHardware source={imagemDaCategoria(conversa.itemCategoria)} height={52} vinheta={false} style={styles.itemImagem} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.itemTipo}>{conversa.tipo === 'doacao' ? 'DOAÇÃO' : 'ITEM EM TROCA'}</Text>
          <Text style={styles.itemTitulo} numberOfLines={1}>
            {conversa.itemTitulo}
          </Text>
          <Text style={styles.itemContato}>com {conversa.contato}</Text>
        </View>
        <Badge label="Em negociação" dot />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={lista}
          data={mensagens}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          renderItem={({ item }) => <Balao m={item} contato={conversa.contato} />}
          onContentSizeChange={() => lista.current?.scrollToEnd({ animated: false })}
        />

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
            accessibilityLabel="Mensagem"
            onSubmitEditing={() => enviar()}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            onPress={() => enviar()}
            disabled={!texto.trim()}
            style={({ pressed }) => [styles.enviar, (!texto.trim() || pressed) && { opacity: 0.6 }]}
          >
            <Ionicons name="send" size={18} color={colors.onPrimary} />
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

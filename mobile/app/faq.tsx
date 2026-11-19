import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Eyebrow, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { FAQ } from '@/data/conteudo';
import { voltar } from '@/lib/navegacao';
import { colors, fonts, radius, spacing } from '@/theme/colors';

/** FAQ — perguntas da página Web (src/pages/FAQ.tsx), em acordeão. */
export default function FaqScreen() {
  // Igual à Web: a primeira pergunta começa aberta.
  const [aberta, setAberta] = useState<string | null>('0-0');

  return (
    <Screen>
      <StackHeader title="FAQ" onBack={() => voltar('/')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>SUPORTE / HELP CENTER</Eyebrow>
          <Title>Dúvidas frequentes</Title>
        </View>

        {FAQ.map((cat, ci) => (
          <View key={cat.titulo} style={{ gap: spacing.sm }}>
            <Text style={styles.categoria}>{cat.titulo.toUpperCase()}</Text>
            {cat.itens.map((item, ii) => {
              const id = `${ci}-${ii}`;
              const ativa = aberta === id;
              return (
                <View key={id} style={[styles.item, ativa && { borderColor: colors.primaryBorder }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.pergunta}
                    aria-expanded={ativa}
                    onPress={() => setAberta(ativa ? null : id)}
                    style={styles.pergunta}
                  >
                    <Text style={styles.perguntaTexto}>{item.pergunta}</Text>
                    <Ionicons name={ativa ? 'chevron-up' : 'chevron-down'} size={18} color={ativa ? colors.primary : colors.textMuted} />
                  </Pressable>
                  {ativa && <Muted style={styles.resposta}>{item.resposta}</Muted>}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  categoria: { color: colors.accent, fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.6 },
  item: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  pergunta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  perguntaTexto: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  resposta: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, fontSize: 14, lineHeight: 21 },
});

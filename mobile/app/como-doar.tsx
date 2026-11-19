import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Eyebrow, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { COMO_DOAR_INTRO, PASSOS } from '@/data/conteudo';
import { voltar } from '@/lib/navegacao';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

/** Como Doar — os 4 passos da página Web (src/pages/ComoDoar.tsx). */
export default function ComoDoarScreen() {
  return (
    <Screen>
      <StackHeader title="Como doar" onBack={() => voltar('/')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>PROCESS FLOW</Eyebrow>
          <Title>Como doar</Title>
          <Muted style={{ fontSize: 15, lineHeight: 22 }}>{COMO_DOAR_INTRO}</Muted>
        </View>

        <View>
          {/* Linha vertical ligando os passos */}
          <View style={styles.linha} />
          <View style={{ gap: spacing.md }}>
            {PASSOS.map((p) => (
              <View key={p.numero} style={styles.passo}>
                <View style={styles.indicador}>
                  <Ionicons name={p.icon} size={22} color={colors.primary} />
                </View>
                <Card style={{ flex: 1, padding: spacing.md, gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
                    <Text style={styles.numero}>{p.numero}</Text>
                    <Text style={styles.titulo}>{p.titulo}</Text>
                  </View>
                  <Muted style={{ fontSize: 13 }}>{p.descricao}</Muted>
                  <Text style={styles.passoRotulo}>PASSO {Number(p.numero)}</Text>
                </Card>
              </View>
            ))}
          </View>
        </View>

        <Button title="Começar a doar agora" icon="arrow-forward" onPress={() => router.push('/equipamento/novo')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  linha: { position: 'absolute', left: 25, top: 10, bottom: 10, width: 1, backgroundColor: colors.border },
  passo: { flexDirection: 'row', gap: spacing.sm + 4, alignItems: 'flex-start' },
  indicador: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    boxShadow: glow.soft,
  },
  numero: { color: 'rgba(59,130,246,0.45)', fontFamily: fonts.bold, fontSize: 22 },
  titulo: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 16, letterSpacing: 0.5 },
  passoRotulo: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2, alignSelf: 'flex-end' },
});

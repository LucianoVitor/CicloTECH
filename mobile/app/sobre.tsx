import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArteHardware } from '@/components/ArteHardware';
import { Card, Eyebrow, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { EQUIPE, HERO_CPU, ORIGEM, PILARES, RODAPE } from '@/data/conteudo';
import { voltar } from '@/lib/navegacao';
import { colors, fonts, spacing } from '@/theme/colors';

/** Sobre Nós — textos da página Web (src/pages/SobreNos.tsx). */
export default function SobreScreen() {
  return (
    <Screen>
      <StackHeader title="Sobre nós" onBack={() => voltar('/')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>ABOUT US</Eyebrow>
          <Title>Sobre nós</Title>
        </View>

        <Card>
          <ArteHardware source={HERO_CPU} aspectRatio={16 / 10} accessibilityLabel="Processador iluminado em azul" />
          <View style={styles.origem}>
            <View style={styles.barra} />
            <View style={{ flex: 1, gap: spacing.sm, padding: spacing.md }}>
              <Text style={styles.subtitulo}>NOSSA ORIGEM</Text>
              {ORIGEM.map((p) => (
                <Text key={p.slice(0, 20)} style={styles.paragrafo}>
                  {p}
                </Text>
              ))}
            </View>
          </View>
        </Card>

        <View style={{ gap: spacing.md }}>
          <Text style={styles.subtitulo}>NOSSOS PILARES</Text>
          {PILARES.map((p) => (
            <Card key={p.titulo} style={{ padding: spacing.md, gap: spacing.sm }}>
              <Ionicons name={p.icon} size={28} color={colors.primary} />
              <Text style={styles.pilarTitulo}>{p.titulo.toUpperCase()}</Text>
              <Muted style={{ fontSize: 13 }}>{p.descricao}</Muted>
            </Card>
          ))}
        </View>

        <Card style={{ padding: spacing.lg, gap: spacing.sm, alignItems: 'center' }}>
          <Text style={styles.subtitulo}>EQUIPE</Text>
          <Muted style={{ textAlign: 'center' }}>{EQUIPE}</Muted>
        </Card>

        <Text style={styles.rodape}>{RODAPE.toUpperCase()}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  origem: { flexDirection: 'row' },
  barra: { width: 3, backgroundColor: colors.primary },
  subtitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, letterSpacing: 1 },
  paragrafo: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  pilarTitulo: { color: colors.accent, fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.4 },
  rodape: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, textAlign: 'center' },
});

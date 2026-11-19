import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarrasHorizontais, BarrasVerticais } from '@/components/Graficos';
import { Card, Eyebrow, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { COMPONENTES_POR_TIPO, ESTUDANTES_MENSAL, EWASTE_MENSAL, ODS } from '@/data/conteudo';
import { voltar } from '@/lib/navegacao';
import { colors, fonts, spacing } from '@/theme/colors';

function Painel({ titulo, valor, sufixo, children }: { titulo: string; valor: string; sufixo: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: spacing.md, gap: spacing.sm }}>
      <Eyebrow color={colors.accent}>{titulo.toUpperCase()}</Eyebrow>
      <Text style={styles.valor}>
        {valor} <Text style={styles.sufixo}>{sufixo}</Text>
      </Text>
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </Card>
  );
}

/** Impacto ODS — mesmos dados da página Web (src/pages/ImpactoODS.tsx). */
export default function ImpactoScreen() {
  return (
    <Screen>
      <StackHeader title="Impacto ODS" onBack={() => voltar('/')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>SUSTAINABILITY DASHBOARD</Eyebrow>
          <Title>Impacto ODS</Title>
        </View>

        <Painel titulo="KG de e-waste evitado" valor="1,250" sufixo="KG total">
          <BarrasVerticais dados={EWASTE_MENSAL.map((d) => ({ rotulo: d.mes, valor: d.valor }))} unidade="kg" />
        </Painel>

        <Painel titulo="Estudantes beneficiados" valor="450+" sufixo="acumulado">
          <BarrasVerticais dados={ESTUDANTES_MENSAL.map((d) => ({ rotulo: d.mes, valor: d.valor }))} unidade="estudantes" />
        </Painel>

        <Painel titulo="Componentes recirculados por tipo" valor="780" sufixo="total">
          <BarrasHorizontais dados={COMPONENTES_POR_TIPO.map((d) => ({ rotulo: d.nome, valor: d.valor }))} unidade="componentes" />
        </Painel>

        <View style={{ gap: spacing.md }}>
          <Title underline={false}>Objetivos de Desenvolvimento Sustentável</Title>
          {ODS.map((o) => (
            <Card key={o.numero} style={styles.ods}>
              <View style={styles.odsBarra} />
              <View style={{ flex: 1, gap: 6, padding: spacing.md }}>
                <Text style={styles.odsNumero}>{o.numero}</Text>
                <Text style={styles.odsTitulo}>{o.titulo.toUpperCase()}</Text>
                <Muted style={{ fontSize: 13 }}>{o.descricao}</Muted>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  valor: { color: colors.text, fontFamily: fonts.bold, fontSize: 30, letterSpacing: -0.5 },
  sufixo: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13 },
  ods: { flexDirection: 'row' },
  odsBarra: { width: 3, backgroundColor: colors.primary },
  odsNumero: { color: 'rgba(59,130,246,0.45)', fontFamily: fonts.bold, fontSize: 28, letterSpacing: -0.5 },
  odsTitulo: { color: colors.accent, fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.4 },
});

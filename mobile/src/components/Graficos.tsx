import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/theme/colors';

type Ponto = { rotulo: string; valor: number };

/**
 * Barras verticais de série única (um tom de azul — magnitude ao longo do tempo).
 * Tocar numa barra mostra o valor dela; cada barra tem rótulo acessível (equivale à "tabela").
 */
export function BarrasVerticais({ dados, unidade, altura = 180 }: { dados: Ponto[]; unidade: string; altura?: number }) {
  const max = Math.max(...dados.map((d) => d.valor), 1);
  const [sel, setSel] = useState<number | null>(null);

  return (
    <View>
      <View style={[styles.area, { height: altura }]}>
        {/* Linhas de grade recessivas em 50% e 100% */}
        <View style={[styles.grade, { top: 0 }]} />
        <View style={[styles.grade, { top: altura / 2 }]} />
        {dados.map((d, i) => {
          const ativo = sel === i;
          return (
            <Pressable
              key={d.rotulo}
              accessibilityRole="button"
              accessibilityLabel={`${d.rotulo}: ${d.valor} ${unidade}`}
              onPress={() => setSel(ativo ? null : i)}
              style={styles.coluna}
            >
              {ativo && <Text style={styles.valor}>{d.valor}</Text>}
              <View
                style={[
                  styles.barra,
                  { height: Math.max((d.valor / max) * (altura - 22), 2) },
                  sel !== null && !ativo && { opacity: 0.45 },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.eixo}>
        {dados.map((d) => (
          <Text key={d.rotulo} style={styles.eixoTexto}>
            {d.rotulo.toUpperCase()}
          </Text>
        ))}
      </View>
      <Text style={styles.dica}>{sel === null ? 'TOQUE NUMA BARRA PARA VER O VALOR' : `${dados[sel].rotulo.toUpperCase()}: ${dados[sel].valor} ${unidade.toUpperCase()}`}</Text>
    </View>
  );
}

/** Barras horizontais rotuladas — comparação entre categorias (substitui a pizza da Web). */
export function BarrasHorizontais({ dados, unidade }: { dados: Ponto[]; unidade: string }) {
  const max = Math.max(...dados.map((d) => d.valor), 1);
  return (
    <View style={{ gap: spacing.sm + 2 }}>
      {dados.map((d) => (
        <View key={d.rotulo} accessible accessibilityLabel={`${d.rotulo}: ${d.valor} ${unidade}`} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.hRotulo}>{d.rotulo.toUpperCase()}</Text>
            <Text style={styles.hValor}>{d.valor}</Text>
          </View>
          <View style={styles.trilho}>
            <View style={[styles.hBarra, { width: `${(d.valor / max) * 100}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  grade: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border, opacity: 0.5 },
  coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  barra: { width: '78%', backgroundColor: colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  valor: { color: colors.text, fontFamily: fonts.monoBold, fontSize: 11, marginBottom: 4 },
  eixo: { flexDirection: 'row', gap: 2, marginTop: 6 },
  eixoTexto: { flex: 1, textAlign: 'center', color: colors.textMuted, fontFamily: fonts.mono, fontSize: 10 },
  dica: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, marginTop: spacing.sm },
  hRotulo: { color: colors.textSecondary, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1 },
  hValor: { color: colors.text, fontFamily: fonts.monoBold, fontSize: 12 },
  trilho: { height: 10, borderRadius: 4, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  hBarra: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
});

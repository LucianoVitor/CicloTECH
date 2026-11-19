import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { ArteHardware } from '@/components/ArteHardware';
import { Badge, Button, Card, Eyebrow, FavoriteButton, Muted, type IconName } from '@/components/ui';
import { colors, fonts, spacing } from '@/theme/colors';

type ItemCardProps = {
  imagem: ImageSourcePropType;
  categoria: string;
  titulo: string;
  /** Linhas técnicas em mono (ex.: "ESTADO: BOM ESTADO", "POR: VOLUNTÁRIOS"). */
  meta?: { rotulo: string; valor: string }[];
  descricao?: string;
  /** Caixa destacada "QUER TROCAR POR" das trocas. */
  destaque?: { rotulo: string; valor: string };
  selo?: string;
  favorito?: { ativo: boolean; alternar: () => void };
  acao?: { titulo: string; icon: IconName; onPress: () => void; variant?: 'primary' | 'secondary' };
  children?: ReactNode;
};

export function ItemCard({ imagem, categoria, titulo, meta, descricao, destaque, selo, favorito, acao, children }: ItemCardProps) {
  return (
    <Card>
      <ArteHardware source={imagem} accessibilityLabel={titulo}>
        <View style={styles.topo}>
          {selo ? <Badge label={selo} dot /> : <View />}
          {favorito && <FavoriteButton ativo={favorito.ativo} onPress={favorito.alternar} titulo={titulo} />}
        </View>
      </ArteHardware>

      <View style={styles.corpo}>
        <Eyebrow>{categoria.toUpperCase()}</Eyebrow>
        <Text style={styles.titulo}>{titulo}</Text>
        {meta?.map((m) => (
          <Text key={m.rotulo} style={styles.meta}>
            {m.rotulo.toUpperCase()}: <Text style={{ color: colors.accent }}>{m.valor.toUpperCase()}</Text>
          </Text>
        ))}
        {!!descricao && <Muted style={{ fontSize: 13 }}>{descricao}</Muted>}
        {destaque && (
          <View style={styles.destaque}>
            <Text style={styles.destaqueRotulo}>{destaque.rotulo.toUpperCase()}</Text>
            <Text style={styles.destaqueValor}>{destaque.valor}</Text>
          </View>
        )}
        {children}
        {acao && (
          <Button
            title={acao.titulo}
            icon={acao.icon}
            variant={acao.variant ?? 'primary'}
            onPress={acao.onPress}
            style={{ marginTop: spacing.xs }}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topo: {
    position: 'absolute',
    top: spacing.sm + 4,
    left: spacing.sm + 4,
    right: spacing.sm + 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  corpo: { padding: spacing.md, gap: spacing.sm },
  titulo: { color: colors.text, fontFamily: fonts.semibold, fontSize: 18 },
  meta: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.2 },
  destaque: {
    gap: 4,
    padding: spacing.sm + 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  destaqueRotulo: { color: colors.accent, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.4 },
  destaqueValor: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
});

import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  source: ImageSourcePropType;
  /** Proporção largura/altura da moldura (ex.: 16/10). Ignorada se `height` for informado. */
  aspectRatio?: number;
  height?: number;
  /** Escurece a base para texto sobreposto ler bem. */
  vinheta?: boolean;
  accessibilityLabel?: string;
  onError?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Exibe uma imagem SEM cortar, em qualquer moldura.
 * As artes do CicloTECH são quadradas (feitas para a Web); em molduras largas do celular, `cover` cortaria
 * metade da peça. Aqui a imagem inteira fica centralizada (`contain`) e as laterais são preenchidas pela
 * mesma imagem desfocada — sem faixas pretas, para qualquer proporção de foto.
 */
export function ArteHardware({
  source,
  aspectRatio = 16 / 10,
  height,
  vinheta = true,
  accessibilityLabel,
  onError,
  style,
  children,
}: Props) {
  return (
    <View style={[styles.moldura, height ? { height } : { aspectRatio }, style]}>
      {/* Fundo: a própria imagem ampliada e desfocada, preenchendo as laterais. */}
      <Image
        source={source}
        resizeMode="cover"
        blurRadius={28}
        style={[styles.camada, styles.fundo]}
        accessible={false}
        importantForAccessibility="no"
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.escurecer]} />

      {/* Frente: a imagem inteira, sem corte. */}
      <Image
        source={source}
        resizeMode="contain"
        onError={onError}
        style={styles.camada}
        accessibilityLabel={accessibilityLabel}
        accessibilityIgnoresInvertColors
      />

      {vinheta && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.vinheta]} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: { width: '100%', overflow: 'hidden', backgroundColor: colors.background },
  // Tamanho explícito: sem isso o react-native-web usa o tamanho do arquivo (512px) e a imagem estoura a moldura.
  camada: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  fundo: { opacity: 0.7, transform: [{ scale: 1.15 }] },
  escurecer: { backgroundColor: 'rgba(3,7,18,0.35)' },
  vinheta: { backgroundImage: 'linear-gradient(180deg, rgba(3,7,18,0) 60%, rgba(11,15,25,0.85) 100%)' },
});

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CARROSSEL } from '@/data/conteudo';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

const INTERVALO = 3800; // mesmo intervalo da Web (HeroCarousel.tsx)
const nativo = Platform.OS !== 'web';

/** Carrossel do topo da Início: peça girando/flutuando com halo azul, rótulo e indicadores. */
export function HeroCarousel() {
  const [indice, setIndice] = useState(0);
  const entrada = useRef(new Animated.Value(1)).current;
  const flutuar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(() => setIndice((i) => (i + 1) % CARROSSEL.length), INTERVALO);
    return () => clearInterval(id);
  }, []);

  // Giro de entrada a cada troca (equivalente ao rotateY da Web).
  useEffect(() => {
    entrada.setValue(0);
    Animated.timing(entrada, {
      toValue: 1,
      duration: 900,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: nativo,
    }).start();
  }, [indice, entrada]);

  // Flutuação contínua (y: 0 → -12 → 0 em 4s).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flutuar, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: nativo }),
        Animated.timing(flutuar, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: nativo }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flutuar]);

  const atual = CARROSSEL[indice];

  return (
    <View style={styles.box} accessibilityLabel={`Destaque: ${atual.rotulo}`}>
      <View style={styles.halo} />
      {/* Anéis concêntricos à imagem (centro em y = 132). */}
      <View style={[styles.anel, { top: 2, width: 260, height: 260, borderRadius: 130 }]} />
      <View
        style={[styles.anel, { top: 20, width: 224, height: 224, borderRadius: 112, borderColor: 'rgba(96,165,250,0.2)' }]}
      />

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.centro,
          {
            opacity: entrada,
            transform: [
              { perspective: 1400 },
              { rotateY: entrada.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] }) },
              { translateY: flutuar.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
            ],
          },
        ]}
      >
        <Image source={atual.imagem} resizeMode="cover" style={styles.imagem} accessibilityIgnoresInvertColors />
      </Animated.View>

      <View style={styles.rotulo}>
        <Text style={styles.rotuloTexto}>{atual.rotulo.toUpperCase()}</Text>
      </View>

      <View style={styles.pontos}>
        {CARROSSEL.map((p, i) => (
          <Pressable
            key={p.rotulo}
            accessibilityRole="button"
            accessibilityLabel={`Mostrar ${p.rotulo}`}
            onPress={() => setIndice(i)}
            hitSlop={8}
            style={[styles.ponto, i === indice && styles.pontoAtivo]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 300,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    top: 32,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59,130,246,0.18)',
    boxShadow: '0px 0px 80px rgba(59,130,246,0.45)',
  },
  anel: {
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  centro: { alignItems: 'center', justifyContent: 'center' },
  // Arte quadrada com fundo próprio: exibida como foto enquadrada para não parecer um bloco solto.
  imagem: {
    width: 200,
    height: 200,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: 36,
  },
  rotulo: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: 'rgba(3,7,18,0.8)',
    borderRadius: radius.sm,
  },
  rotuloTexto: { color: colors.accent, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 3 },
  pontos: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  pontoAtivo: { width: 22, backgroundColor: colors.primary, boxShadow: glow.soft },
});

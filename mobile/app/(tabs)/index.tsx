import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArteHardware } from '@/components/ArteHardware';
import { HeroCarousel } from '@/components/HeroCarousel';
import { AppHeader, Badge, Button, Card, Eyebrow, IconButton, Muted, Screen, Title, type IconName } from '@/components/ui';
import { CATEGORIAS_HOME, FILTROS_DOACOES, HERO, IMPACTO, IMPACTO_FONTE, RODAPE } from '@/data/conteudo';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

const EXPLORAR: { icon: IconName; titulo: string; descricao: string; rota: Href }[] = [
  { icon: 'footsteps-outline', titulo: 'Como doar', descricao: 'O processo em 4 passos', rota: '/como-doar' },
  { icon: 'bar-chart-outline', titulo: 'Impacto ODS', descricao: 'Painel de sustentabilidade', rota: '/impacto' },
  { icon: 'information-circle-outline', titulo: 'Sobre nós', descricao: 'Origem, pilares e equipe', rota: '/sobre' },
  { icon: 'help-circle-outline', titulo: 'FAQ', descricao: 'Perguntas frequentes', rota: '/faq' },
];

/** Leva ao catálogo já filtrado quando a categoria existe nos filtros da Web. */
function pedir(categoria: string) {
  const filtro = FILTROS_DOACOES.includes(categoria) ? categoria : undefined;
  router.navigate(filtro ? { pathname: '/doacoes', params: { filtro } } : '/doacoes');
}

export default function InicioScreen() {
  return (
    <Screen>
      <AppHeader
        right={
          <IconButton icon="person-outline" variant="primary" accessibilityLabel="Abrir perfil" onPress={() => router.navigate('/perfil')} />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={{ gap: spacing.md }}>
          <Badge label="Zona Leste // Rede ativa" dot />
          <Text style={styles.heroTitulo} accessibilityRole="header">
            {HERO.titulo.join(' ')}
            {'\n'}
            <Text style={styles.heroDestaque}>{HERO.destaque}</Text>
          </Text>
          <Muted style={{ fontSize: 15, lineHeight: 22 }}>{HERO.subtitulo}</Muted>
          <HeroCarousel />
          <Button title={HERO.ctaDoar} icon="heart-outline" onPress={() => router.push('/equipamento/novo')} />
          <Button title={HERO.ctaEstudante} icon="school-outline" variant="secondary" onPress={() => router.navigate('/doacoes')} />
        </View>

        {/* Categorias */}
        <View style={{ gap: spacing.md }}>
          <View style={styles.secaoTopo}>
            <View style={{ flex: 1, gap: 4 }}>
              <Title>Categorias de doação</Title>
              <Eyebrow color={colors.textMuted}>DISPONIBILIDADE EM TEMPO REAL</Eyebrow>
            </View>
          </View>
          <View style={styles.grade}>
            {CATEGORIAS_HOME.map((c) => (
              <View key={c.titulo} style={styles.celula}>
                <Card style={{ flex: 1 }}>
                  <ArteHardware source={c.imagem} aspectRatio={4 / 3} vinheta={false} accessibilityLabel={c.titulo}>
                    <View style={styles.catContagem}>
                      <Text style={styles.catContagemTexto}>{c.itens} ITENS</Text>
                    </View>
                  </ArteHardware>
                  <View style={{ padding: spacing.sm + 4, gap: spacing.sm, flex: 1, justifyContent: 'space-between' }}>
                    <Text style={styles.catTitulo}>{c.titulo}</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Button title="Doar" size="sm" variant="secondary" onPress={() => router.push('/equipamento/novo')} style={{ flex: 1, paddingHorizontal: 4 }} />
                      <Button title="Pedir" size="sm" onPress={() => pedir(c.titulo)} style={{ flex: 1, paddingHorizontal: 4 }} />
                    </View>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        </View>

        {/* Nosso impacto */}
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: 6 }}>
            <Eyebrow>METRIC ANALYSIS</Eyebrow>
            <Title>Nosso impacto</Title>
            <Text style={styles.fonte}>
              {IMPACTO_FONTE.atualizacao.toUpperCase()} • {IMPACTO_FONTE.fonte.toUpperCase()}
            </Text>
          </View>
          {IMPACTO.map((m) => (
            <Card key={m.rotulo} style={styles.metrica}>
              <View style={styles.metricaIcone}>
                <Ionicons name={m.icon} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.metricaValor}>{m.valor}</Text>
                <Text style={styles.metricaRotulo}>{m.rotulo.toUpperCase()}</Text>
                <Muted style={{ fontSize: 13 }}>{m.texto}</Muted>
              </View>
            </Card>
          ))}
        </View>

        {/* Páginas institucionais */}
        <View style={{ gap: spacing.sm }}>
          <Eyebrow color={colors.textMuted}>INSTITUCIONAL</Eyebrow>
          {EXPLORAR.map((e) => (
            <Pressable
              key={e.titulo}
              accessibilityRole="link"
              accessibilityLabel={e.titulo}
              onPress={() => router.push(e.rota)}
              style={({ pressed }) => [styles.link, pressed && { borderColor: colors.primaryBorder }]}
            >
              <Ionicons name={e.icon} size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.linkTitulo}>{e.titulo.toUpperCase()}</Text>
                <Text style={styles.linkDescricao}>{e.descricao}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.rodape}>{RODAPE.toUpperCase()}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingTop: spacing.sm, gap: spacing.xl, paddingBottom: spacing.xl },
  heroTitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 34, lineHeight: 38, letterSpacing: -0.5 },
  heroDestaque: { color: colors.primary, textShadowColor: 'rgba(59,130,246,0.6)', textShadowRadius: 18 },
  secaoTopo: { flexDirection: 'row', alignItems: 'flex-end' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  celula: { width: '50%', padding: spacing.xs },
  catContagem: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(3,7,18,0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  catContagemTexto: { color: colors.textSecondary, fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1 },
  catTitulo: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  fonte: { color: colors.textMuted, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 },
  metrica: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  metricaIcone: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    boxShadow: glow.soft,
  },
  metricaValor: { color: colors.text, fontFamily: fonts.bold, fontSize: 30, letterSpacing: -0.5 },
  metricaRotulo: { color: colors.accent, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  linkTitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.6 },
  linkDescricao: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
  rodape: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, textAlign: 'center' },
});

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { avisar } from '@/lib/dialogo';
import { colors, fonts, radius, spacing } from '@/theme/colors';

export type FotoSelecionada = { uri: string; mimeType?: string | null };

/** Abre a galeria do aparelho e devolve a foto escolhida (ou null se cancelar). */
export async function escolherFoto(opcoes: { quadrada?: boolean } = {}): Promise<FotoSelecionada | null> {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) {
    avisar('Permissão necessária', 'Permita o acesso às fotos nas configurações do aparelho para enviar uma imagem.');
    return null;
  }
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: opcoes.quadrada ? [1, 1] : [4, 3],
    quality: 0.7,
  });
  if (resultado.canceled || !resultado.assets?.[0]) return null;
  const asset = resultado.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType };
}

/** Campo de formulário "Foto do equipamento": escolher, ver a prévia, trocar ou remover. */
export function SeletorFoto({
  foto,
  onChange,
  rotulo = 'Foto do equipamento',
}: {
  foto: FotoSelecionada | null;
  onChange: (f: FotoSelecionada | null) => void;
  rotulo?: string;
}) {
  async function escolher() {
    const f = await escolherFoto();
    if (f) onChange(f);
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.rotulo}>{rotulo.toUpperCase()} (OPCIONAL)</Text>
      {foto ? (
        <View style={styles.previa}>
          <Image source={{ uri: foto.uri }} style={styles.imagem} resizeMode="cover" accessibilityLabel="Prévia da foto" />
          <View style={styles.acoes}>
            <Pressable accessibilityRole="button" accessibilityLabel="Trocar foto" onPress={escolher} style={styles.acao}>
              <Ionicons name="images-outline" size={16} color={colors.text} />
              <Text style={styles.acaoTexto}>TROCAR</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Remover foto" onPress={() => onChange(null)} style={styles.acao}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={[styles.acaoTexto, { color: colors.danger }]}>REMOVER</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher foto da galeria"
          onPress={escolher}
          style={({ pressed }) => [styles.vazio, pressed && { borderColor: colors.primary }]}
        >
          <View style={styles.icone}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.vazioTitulo}>ESCOLHER FOTO</Text>
          <Text style={styles.vazioTexto}>Mostre conectores, etiqueta do modelo e estado da peça.</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rotulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  vazio: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
  },
  icone: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.xs,
  },
  vazioTitulo: { color: colors.text, fontFamily: fonts.monoBold, fontSize: 13, letterSpacing: 1.4 },
  vazioTexto: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center' },
  previa: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  imagem: { width: '100%', aspectRatio: 4 / 3 },
  acoes: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  acao: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm + 4 },
  acaoTexto: { color: colors.text, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.2 },
});

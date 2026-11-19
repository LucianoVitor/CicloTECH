import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SeletorFoto, type FotoSelecionada } from '@/components/SeletorFoto';
import { Button, Eyebrow, Feedback, IconButton, Input, Screen } from '@/components/ui';
import { CATEGORIAS } from '@/lib/catalogo';
import { avisar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { fotosService, perfilService, trocasService } from '@/services';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

/** "Anunciar troca": grava na tabela trocas (visível para todos os usuários). */
export default function NovaTrocaScreen() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [querTrocarPor, setQuerTrocarPor] = useState('');
  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function publicar() {
    if (!titulo.trim() || !categoria || !descricao.trim() || !querTrocarPor.trim()) {
      setErro('Preencha todos os campos.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const [imagem_url, autor_nome] = await Promise.all([
        foto ? fotosService.enviar('equipamentos', foto.uri, foto.mimeType) : Promise.resolve(null),
        perfilService.nomeExibicao(),
      ]);
      await trocasService.publicar({
        titulo: titulo.trim(),
        categoria,
        descricao: descricao.trim(),
        quer_trocar_por: querTrocarPor.trim(),
        imagem_url,
        autor_nome,
      });
      avisar('Anúncio publicado', 'Sua troca já aparece na vitrine de Trocas para todos os usuários.');
      voltar('/trocas');
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível publicar a troca.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topo}>
        <View style={{ flex: 1, gap: 2 }}>
          <Eyebrow color={colors.textMuted}>PEER-TO-PEER EXCHANGE</Eyebrow>
          <Text style={styles.titulo}>ANUNCIAR TROCA</Text>
        </View>
        <IconButton icon="close" accessibilityLabel="Fechar" onPress={() => voltar('/trocas')} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
          <SeletorFoto foto={foto} onChange={setFoto} rotulo="Foto do item" />

          <Input label="Item que você oferece" icon="hardware-chip-outline" placeholder="Ex.: GPU GTX 1050 Ti 4GB" value={titulo} onChangeText={setTitulo} maxLength={120} />

          <View style={{ gap: spacing.sm }}>
            <Text style={styles.rotulo}>CATEGORIA</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} accessibilityRole="radiogroup">
              {CATEGORIAS.map((c) => {
                const sel = categoria === c;
                return (
                  <Pressable
                    key={c}
                    accessibilityRole="radio"
                    accessibilityLabel={c}
                    accessibilityState={{ checked: sel }}
                    onPress={() => setCategoria(c)}
                    style={[styles.opcao, sel && styles.opcaoAtiva]}
                  >
                    <Text style={[styles.opcaoTexto, sel && { color: colors.onPrimary }]}>{c.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Input
            label="Descrição do item"
            placeholder="Estado, especificações, tempo de uso..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            maxLength={400}
            hint={`RESTANTE: ${400 - descricao.length}`}
          />
          <Input label="O que você quer em troca" icon="swap-horizontal-outline" placeholder="Ex.: SSD 500GB ou superior" value={querTrocarPor} onChangeText={setQuerTrocarPor} maxLength={120} />

          {erro && <Feedback tipo="erro" mensagem={erro} />}
          <Button title="Publicar troca" icon="cloud-upload-outline" onPress={publicar} loading={salvando} />
          <Button title="Cancelar" variant="secondary" onPress={() => voltar('/trocas')} disabled={salvando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  titulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 24, letterSpacing: 0.5 },
  rotulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  opcao: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  opcaoAtiva: { backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: glow.soft },
  opcaoTexto: { color: colors.textSecondary, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1 },
});

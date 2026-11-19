import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SeletorFoto, type FotoSelecionada } from '@/components/SeletorFoto';
import { Button, Checkbox, Eyebrow, Feedback, IconButton, Input, Muted, Screen } from '@/components/ui';
import { CATEGORIAS, CONDICOES } from '@/lib/catalogo';
import { mensagemDeErro } from '@/lib/erros';
import { equipamentosService, fotosService } from '@/services';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

const LIMITE_DESCRICAO = 500;

function Opcao({ rotulo, selecionado, onPress }: { rotulo: string; selecionado: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={rotulo}
      accessibilityState={{ checked: selecionado }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.opcao,
        selecionado && styles.opcaoAtiva,
        pressed && !selecionado && { borderColor: colors.primaryBorder },
      ]}
    >
      <Text style={[styles.opcaoTexto, selecionado && { color: colors.onPrimary }]}>{rotulo.toUpperCase()}</Text>
    </Pressable>
  );
}

function Rotulo({ children }: { children: string }) {
  return <Text style={styles.rotulo}>{children.toUpperCase()}</Text>;
}

export default function NovoEquipamentoScreen() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [condicao, setCondicao] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [declarou, setDeclarou] = useState(false);
  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function fechar() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function salvar() {
    // Mesmos campos obrigatórios da Web.
    if (!titulo.trim()) return setErro('Informe o nome do componente / modelo.');
    if (!categoria) return setErro('Selecione a categoria técnica.');
    if (!condicao) return setErro('Selecione o estado de conservação.');
    if (!descricao.trim()) return setErro('Descreva o equipamento.');
    if (!declarou) return setErro('Confirme a declaração de procedência para publicar.');

    setErro(null);
    setSalvando(true);
    try {
      const imagem_url = foto ? await fotosService.enviar('equipamentos', foto.uri, foto.mimeType) : null;
      await equipamentosService.inserir({
        titulo: titulo.trim(),
        categoria,
        condicao,
        descricao: descricao.trim(),
        imagem_url,
      });
      fechar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar o equipamento.'));
    } finally {
      setSalvando(false);
    }
  }

  const restante = LIMITE_DESCRICAO - descricao.length;

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topo}>
        <View style={{ flex: 1, gap: 2 }}>
          <Eyebrow color={colors.textMuted}>CICLOTECH // HARDWARE LOGISTICS</Eyebrow>
          <Text style={styles.titulo}>CADASTRAR PEÇA</Text>
        </View>
        <IconButton icon="close" accessibilityLabel="Fechar" onPress={fechar} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.banner}>
            <View style={styles.bannerIcone}>
              <Ionicons name="hardware-chip-outline" size={20} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitulo}>IMPACTO ACADÊMICO ZL</Text>
              <Muted style={{ fontSize: 13 }}>Seu hardware reativa bancadas técnicas e estudos.</Muted>
            </View>
          </View>

          <SeletorFoto foto={foto} onChange={setFoto} />

          <Input
            label="Nome do componente / modelo"
            icon="hardware-chip-outline"
            placeholder="Ex.: Corsair Vengeance 16GB DDR4 3200MHz"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={120}
          />

          <View style={{ gap: spacing.sm }}>
            <Rotulo>Categoria técnica</Rotulo>
            <View style={styles.grade} accessibilityRole="radiogroup">
              {CATEGORIAS.map((c) => (
                <Opcao key={c} rotulo={c} selecionado={categoria === c} onPress={() => setCategoria(c)} />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Rotulo>Estado físico e operacional</Rotulo>
            <View style={styles.grade} accessibilityRole="radiogroup">
              {CONDICOES.map((c) => (
                <Opcao key={c} rotulo={c} selecionado={condicao === c} onPress={() => setCondicao(c)} />
              ))}
            </View>
          </View>

          <Input
            label="Descrição & detalhes técnicos"
            hint={`RESTANTE: ${restante}`}
            placeholder="Especificações, ano, testes feitos, acessórios que acompanham..."
            value={descricao}
            onChangeText={setDescricao}
            maxLength={LIMITE_DESCRICAO}
            multiline
          />

          <Checkbox
            checked={declarou}
            onChange={setDeclarou}
            label="Declaro que este componente é de procedência legal e que as informações prestadas são verdadeiras."
          />

          {erro && <Feedback tipo="erro" mensagem={erro} />}

          <Button title="Publicar componente" icon="cloud-upload-outline" onPress={salvar} loading={salvando} />
          <Text style={styles.rodape}>VALIDAÇÃO POR MODERAÇÃO ESTUDANTIL</Text>
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
    backgroundColor: colors.background,
  },
  titulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 24, letterSpacing: 0.5 },
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
  bannerIcone: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: glow.soft,
  },
  bannerTitulo: { color: colors.text, fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 1.4 },
  rotulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  rodape: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, textAlign: 'center' },
});

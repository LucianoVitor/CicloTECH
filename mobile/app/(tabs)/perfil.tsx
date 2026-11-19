import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { escolherFoto } from '@/components/SeletorFoto';
import {
  AppHeader,
  Badge,
  Button,
  Card,
  Eyebrow,
  Feedback,
  Input,
  Muted,
  Screen,
  type IconName,
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCicloStore } from '@/hooks/useCicloStore';
import { useFavoritos } from '@/hooks/useFavoritos';
import { avisar, confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { conversasService, doacoesService, fotosService, perfilService, trocasService, type Perfil } from '@/services';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

const TIPO: Record<string, string> = { donor: 'Doador', student: 'Estudante' };

type Atalho = { icon: IconName; titulo: string; descricao: string; acao: () => void; contador?: number };

function LinhaDado({ rotulo, valor, icon }: { rotulo: string; valor?: string | null; icon?: IconName }) {
  return (
    <View style={styles.dado}>
      <Text style={styles.dadoRotulo}>{rotulo}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon && <Ionicons name={icon} size={15} color={colors.textMuted} />}
        <Text style={[styles.dadoValor, !valor && { color: colors.placeholder }]}>{valor?.trim() || '—'}</Text>
      </View>
    </View>
  );
}

function ItemMenu({ icon, titulo, descricao, acao, contador }: Atalho) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={acao}
      style={({ pressed }) => [styles.menuItem, pressed && { borderColor: colors.primaryBorder }]}
    >
      <View style={styles.menuIcone}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.menuTitulo} numberOfLines={1}>
          {titulo.toUpperCase()}
        </Text>
        <Text style={styles.menuDescricao} numberOfLines={1}>
          {descricao}
        </Text>
      </View>
      {!!contador && <Badge label={String(contador)} />}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { session, sair } = useAuth();
  const { favoritos } = useFavoritos();
  const { solicitacoes, conversas: conversasDemo } = useCicloStore();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [totalDoacoes, setTotalDoacoes] = useState(0);
  const [contagens, setContagens] = useState({ conversas: 0, solicitacoes: 0, trocas: 0 });
  const [admin, setAdmin] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [p, doacoes] = await Promise.all([perfilService.meuPerfil(), doacoesService.buscar()]);
      setPerfil(p);
      setTotalDoacoes(doacoes.length);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar seu perfil.'));
    }
    // Papel de admin: consulta própria (user_roles), independente das tabelas novas de trocas/conversas.
    perfilService
      .souAdmin()
      .then(setAdmin)
      .catch((e) => console.warn('[CicloTECH] Papel de admin indisponível:', mensagemDeErro(e)));

    // Contadores: falhas aqui (ex.: migração ainda não aplicada) não devem esconder o perfil nem o painel.
    const uid = session?.user.id;
    Promise.all([conversasService.minhas(), trocasService.minhas()])
      .then(([cs, ts]) => {
        setContagens({
          conversas: cs.length,
          solicitacoes: cs.filter((c) => c.item_tipo === 'doacao' && c.interessado_id === uid).length,
          trocas: ts.filter((t) => t.status === 'Ativo').length + cs.filter((c) => c.item_tipo === 'troca').length,
        });
      })
      .catch((e) => console.warn('[CicloTECH] Contadores indisponíveis:', mensagemDeErro(e)));
  }, [session?.user.id]);

  async function alterarFoto() {
    const foto = await escolherFoto({ quadrada: true });
    if (!foto) return;
    setEnviandoFoto(true);
    setErro(null);
    try {
      const url = await fotosService.enviar('avatars', foto.uri, foto.mimeType);
      setPerfil(await perfilService.atualizar({ avatar_url: url }));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar a foto.'));
    } finally {
      setEnviandoFoto(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function iniciarEdicao() {
    setForm({ full_name: perfil?.full_name ?? '', phone: perfil?.phone ?? '', address: perfil?.address ?? '' });
    setErro(null);
    setEditando(true);
  }

  async function salvar() {
    if (form.full_name.trim().length < 2) {
      setErro('Informe seu nome completo.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const atualizado = await perfilService.atualizar({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });
      setPerfil(atualizado);
      setEditando(false);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar seus dados.'));
    } finally {
      setSalvando(false);
    }
  }

  async function encerrarSessao() {
    const ok = await confirmar('Sair da conta', 'Deseja encerrar sua sessão neste aparelho?', {
      textoConfirmar: 'Sair',
      destrutivo: true,
    });
    if (!ok) return;
    setSaindo(true);
    try {
      await sair(); // O _layout leva de volta ao login ao detectar o fim da sessão.
    } catch (e) {
      setSaindo(false);
      avisar('Erro ao sair', mensagemDeErro(e));
    }
  }

  const nome = perfil?.full_name?.trim() || 'Usuário';
  const atalhos: Atalho[] = [
    { icon: 'hardware-chip-outline', titulo: 'Meus equipamentos', descricao: 'Peças que você cadastrou', acao: () => router.push('/meus-equipamentos') },
    { icon: 'heart-outline', titulo: 'Minhas doações', descricao: 'Peças que você disponibilizou', acao: () => router.push('/minhas-doacoes') },
    {
      icon: 'bookmark-outline',
      titulo: 'Meus favoritos',
      descricao: favoritos.length ? `${favoritos.length} ${favoritos.length === 1 ? 'item monitorado' : 'itens monitorados'}` : 'Peças e kits monitorados',
      acao: () => router.push('/favoritos'),
    },
    {
      icon: 'clipboard-outline',
      titulo: 'Minhas solicitações',
      descricao: 'Pedidos de componentes de hardware',
      acao: () => router.push('/minhas-solicitacoes'),
      contador: contagens.solicitacoes + solicitacoes.filter((s) => s.status !== 'Cancelada').length,
    },
    {
      icon: 'swap-horizontal-outline',
      titulo: 'Minhas trocas',
      descricao: 'Negociações entre estudantes',
      acao: () => router.push('/minhas-trocas'),
      contador: contagens.trocas + conversasDemo.filter((c) => c.tipo === 'troca').length,
    },
    {
      icon: 'chatbubble-outline',
      titulo: 'Minhas conversas',
      descricao: 'Canal direto de alinhamento',
      acao: () => router.push('/conversas'),
      contador: contagens.conversas + conversasDemo.length,
    },
    ...(admin
      ? [{ icon: 'shield-checkmark-outline' as const, titulo: 'Painel de admin', descricao: 'Usuários, doações e trocas', acao: () => router.push('/admin') }]
      : []),
  ];

  return (
    <Screen>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.cartaoPerfil}>
          <View style={styles.avatar}>
            {perfil?.avatar_url ? (
              <Image
                source={{ uri: perfil.avatar_url }}
                resizeMode="cover"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                accessibilityLabel="Foto de perfil"
              />
            ) : (
              <Ionicons name="person-outline" size={40} color={colors.accent} />
            )}
            {enviandoFoto && (
              <View style={styles.avatarCarregando}>
                <ActivityIndicator color={colors.onPrimary} />
              </View>
            )}
          </View>
          <Button
            title={perfil?.avatar_url ? 'Alterar foto' : 'Adicionar foto'}
            icon="camera-outline"
            variant="outline"
            size="sm"
            onPress={alterarFoto}
            loading={enviandoFoto}
          />
          <Text style={styles.nome}>{nome.toUpperCase()}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
          {perfil?.user_type && <Badge label={TIPO[perfil.user_type] ?? perfil.user_type} dot />}
        </Card>

        <Card style={styles.impacto}>
          <View style={styles.impactoIcone}>
            <Ionicons name="leaf-outline" size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Eyebrow color={colors.accent}>IMPACTO ECOLÓGICO</Eyebrow>
            <Text style={styles.impactoTexto}>
              Você disponibilizou <Text style={{ color: colors.accent, fontFamily: fonts.bold }}>{totalDoacoes}</Text>{' '}
              {totalDoacoes === 1 ? 'peça' : 'peças'} para o ciclo de reuso.
            </Text>
          </View>
        </Card>

        <Card style={{ padding: spacing.md, gap: spacing.sm + 4 }}>
          <View style={styles.secaoTopo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="id-card-outline" size={18} color={colors.primary} />
              <Text style={styles.secaoTitulo}>DADOS PESSOAIS</Text>
            </View>
            {!editando && <Button title="Editar" icon="create-outline" variant="outline" size="sm" onPress={iniciarEdicao} />}
          </View>

          {editando ? (
            <View style={{ gap: spacing.sm + 4 }}>
              <Input
                label="Nome completo"
                icon="person-outline"
                value={form.full_name}
                onChangeText={(v) => setForm((f) => ({ ...f, full_name: v }))}
                autoComplete="name"
              />
              <Input
                label="Telefone"
                icon="call-outline"
                placeholder="(11) 90000-0000"
                value={form.phone}
                onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              <Input
                label="Endereço / campus"
                icon="location-outline"
                placeholder="Ex.: Fatec ZL • Av. Águia de Haia, 2633"
                value={form.address}
                onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              />
              {erro && <Feedback tipo="erro" mensagem={erro} />}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button title="Cancelar" variant="secondary" onPress={() => setEditando(false)} style={{ flex: 1 }} />
                <Button title="Salvar" icon="checkmark" onPress={salvar} loading={salvando} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <>
              <LinhaDado rotulo="NOME COMPLETO" valor={perfil?.full_name} />
              <LinhaDado rotulo="CONTATO TELEFÔNICO" valor={perfil?.phone} />
              <LinhaDado rotulo="ENDEREÇO / CAMPUS" valor={perfil?.address} icon="location-outline" />
              {erro && <Feedback tipo="erro" mensagem={erro} />}
            </>
          )}
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text style={styles.atalhosTitulo}>ATALHOS OPERACIONAIS</Text>
          {atalhos.map((a) => (
            <ItemMenu key={a.titulo} {...a} />
          ))}
        </View>

        <Button title="Sair da conta" icon="log-out-outline" variant="danger" onPress={encerrarSessao} loading={saindo} />
        <Muted style={{ textAlign: 'center', fontSize: 12 }}>CicloTECH // Fatec ZL — tecnologia circular</Muted>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: spacing.xl },
  cartaoPerfil: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  avatarCarregando: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3,7,18,0.6)',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.lg + 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    boxShadow: glow.strong,
    marginBottom: spacing.xs,
  },
  nome: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, letterSpacing: 1, textAlign: 'center' },
  email: { color: colors.textMuted, fontFamily: fonts.mono, fontSize: 13 },
  impacto: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  impactoIcone: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  impactoTexto: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  secaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secaoTitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, letterSpacing: 1 },
  dado: {
    gap: 4,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dadoRotulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 10, letterSpacing: 1.4 },
  dadoValor: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  atalhosTitulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1.6 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  menuIcone: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  menuTitulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.6 },
  menuDescricao: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
});

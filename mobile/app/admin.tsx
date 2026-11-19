import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HardwareImage } from '@/components/HardwareImage';
import { Badge, Button, Card, Chip, EmptyState, Eyebrow, Feedback, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { avisar, confirmar } from '@/lib/dialogo';
import { mensagemDeErro } from '@/lib/erros';
import { voltar } from '@/lib/navegacao';
import { adminService, perfilService, trocasService, type DoacaoComEquipamento, type Perfil, type Troca } from '@/services';
import { colors, fonts, radius, spacing } from '@/theme/colors';

type Aba = 'usuarios' | 'doacoes' | 'trocas';
const TIPO: Record<string, string> = { donor: 'Doador', student: 'Estudante' };

/** Painel de administração: a RLS do banco só libera estes dados para usuários com papel "admin". */
export default function AdminScreen() {
  const { session } = useAuth();
  const meuId = session?.user.id;
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [aba, setAba] = useState<Aba>('usuarios');
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [doacoes, setDoacoes] = useState<DoacaoComEquipamento[]>([]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const ehAdmin = await perfilService.souAdmin();
      setAutorizado(ehAdmin);
      if (!ehAdmin) return;
      const [u, a, d, t] = await Promise.all([adminService.usuarios(), adminService.idsAdmins(), adminService.todasDoacoes(), trocasService.todas()]);
      setUsuarios(u);
      setAdmins(a);
      setDoacoes(d);
      setTrocas(t);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível carregar o painel.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function excluirUsuario(u: Perfil) {
    const nome = u.full_name || 'este usuário';
    const ok = await confirmar(
      'Excluir usuário',
      `Excluir a conta de ${nome}? Os equipamentos, doações, trocas e conversas dessa pessoa também serão apagados. Isso não pode ser desfeito.`,
      { textoConfirmar: 'Excluir', destrutivo: true },
    );
    if (!ok) return;
    setOcupado(u.id);
    try {
      await adminService.excluirUsuario(u.id);
      await carregar();
    } catch (e) {
      avisar('Erro ao excluir usuário', mensagemDeErro(e));
    } finally {
      setOcupado(null);
    }
  }

  async function removerDoacao(d: DoacaoComEquipamento) {
    const ok = await confirmar('Remover doação', `Tirar "${d.equipamentos?.titulo ?? 'esta doação'}" da vitrine? O equipamento continua com o dono.`, {
      textoConfirmar: 'Remover',
      destrutivo: true,
    });
    if (!ok) return;
    setOcupado(d.id);
    try {
      await adminService.removerDoacao(d.id);
      setDoacoes((l) => l.filter((x) => x.id !== d.id));
    } catch (e) {
      avisar('Erro', mensagemDeErro(e));
    } finally {
      setOcupado(null);
    }
  }

  async function removerTroca(t: Troca) {
    const ok = await confirmar('Remover anúncio', `Excluir o anúncio "${t.titulo}" de ${t.autor_nome || 'usuário'}?`, { textoConfirmar: 'Excluir', destrutivo: true });
    if (!ok) return;
    setOcupado(t.id);
    try {
      await trocasService.remover(t.id);
      setTrocas((l) => l.filter((x) => x.id !== t.id));
    } catch (e) {
      avisar('Erro', mensagemDeErro(e));
    } finally {
      setOcupado(null);
    }
  }

  if (autorizado === false) {
    return (
      <Screen>
        <StackHeader title="Painel de admin" onBack={() => voltar('/perfil')} />
        <View style={{ padding: spacing.md }}>
          <EmptyState icon="lock-closed-outline" title="Acesso restrito" text="Somente administradores podem abrir este painel." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StackHeader title="Painel de admin" onBack={() => voltar('/perfil')} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>CONTROL CENTER</Eyebrow>
          <Title>Administração</Title>
          <Muted>Gerencie usuários e modere os anúncios da comunidade.</Muted>
        </View>

        <View style={styles.metricas}>
          {[
            { v: usuarios.length, r: 'USUÁRIOS' },
            { v: doacoes.filter((d) => d.status === 'Ativo').length, r: 'DOAÇÕES ATIVAS' },
            { v: trocas.filter((t) => t.status === 'Ativo').length, r: 'TROCAS ATIVAS' },
          ].map((m) => (
            <View key={m.r} style={styles.metrica}>
              <Text style={styles.metricaValor}>{m.v}</Text>
              <Text style={styles.metricaRotulo}>{m.r}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Chip label={`Usuários (${usuarios.length})`} selected={aba === 'usuarios'} onPress={() => setAba('usuarios')} />
          <Chip label={`Doações (${doacoes.length})`} selected={aba === 'doacoes'} onPress={() => setAba('doacoes')} />
          <Chip label={`Trocas (${trocas.length})`} selected={aba === 'trocas'} onPress={() => setAba('trocas')} />
        </View>

        {erro && <Feedback tipo="erro" mensagem={erro} />}

        {aba === 'usuarios' &&
          usuarios.map((u) => {
            const ehAdmin = admins.has(u.id);
            const souEu = u.id === meuId;
            return (
              <Card key={u.id} style={styles.linha}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.titulo}>{u.full_name || 'Sem nome'}{souEu ? ' (você)' : ''}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {u.user_type && <Badge label={TIPO[u.user_type] ?? u.user_type} tone="muted" />}
                    {ehAdmin && <Badge label="Admin" dot />}
                  </View>
                  <Text style={styles.sub}>Desde {new Date(u.created_at).toLocaleDateString('pt-BR')}</Text>
                </View>
                {!souEu && (
                  <Button
                    title="Excluir"
                    icon="trash-outline"
                    size="sm"
                    variant="danger"
                    loading={ocupado === u.id}
                    onPress={() => excluirUsuario(u)}
                  />
                )}
              </Card>
            );
          })}

        {aba === 'doacoes' &&
          (doacoes.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="Nenhuma doação no banco"
              text="Aparecem aqui as doações registradas no app (Perfil › Meus equipamentos › Registrar doação). Doações cadastradas pelo site ficam salvas só no navegador e não chegam ao banco."
            />
          ) : (
            doacoes.map((d) => (
              <Card key={d.id} style={styles.linha}>
                <HardwareImage uri={d.equipamentos?.imagem_url} categoria={d.equipamentos?.categoria ?? ''} height={56} vinheta={false} style={styles.miniatura} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.titulo} numberOfLines={1}>{d.equipamentos?.titulo ?? 'Equipamento'}</Text>
                  <Text style={styles.sub}>{d.autor_nome || 'Usuário'} · {d.status}</Text>
                </View>
                <Button title="Remover" size="sm" variant="danger" loading={ocupado === d.id} onPress={() => removerDoacao(d)} />
              </Card>
            ))
          ))}

        {aba === 'trocas' &&
          (trocas.length === 0 ? (
            <EmptyState icon="swap-horizontal-outline" title="Nenhuma troca" text="Os anúncios de troca aparecem aqui." />
          ) : (
            trocas.map((t) => (
              <Card key={t.id} style={styles.linha}>
                <HardwareImage uri={t.imagem_url} categoria={t.categoria} height={56} vinheta={false} style={styles.miniatura} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.titulo} numberOfLines={1}>{t.titulo}</Text>
                  <Text style={styles.sub}>{t.autor_nome || 'Usuário'} · {t.status}</Text>
                </View>
                <Button title="Excluir" size="sm" variant="danger" loading={ocupado === t.id} onPress={() => removerTroca(t)} />
              </Card>
            ))
          ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricas: { flexDirection: 'row', gap: spacing.sm },
  metrica: { flex: 1, gap: 2, padding: spacing.sm + 4, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  metricaValor: { color: colors.text, fontFamily: fonts.bold, fontSize: 24 },
  metricaRotulo: { color: colors.textMuted, fontFamily: fonts.monoMedium, fontSize: 9, letterSpacing: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4, padding: spacing.sm + 4 },
  miniatura: { width: 56, borderRadius: radius.md },
  titulo: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  sub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
});

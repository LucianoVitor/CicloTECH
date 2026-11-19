import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Checkbox, Feedback, Input, Muted, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { mensagemDeErro } from '@/lib/erros';
import { colors, fonts, glow, radius, spacing } from '@/theme/colors';

type Modo = 'login' | 'cadastro' | 'recuperar';
type Mensagem = { tipo: 'erro' | 'sucesso'; texto: string } | null;

// Mesmas regras de validação da Web (src/pages/Auth.tsx).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(modo: Modo, email: string, senha: string, nome: string): string | null {
  if (modo === 'cadastro' && (nome.trim().length < 2 || nome.trim().length > 100)) return 'Informe seu nome completo.';
  if (!EMAIL_REGEX.test(email.trim()) || email.trim().length > 255) return 'E-mail inválido.';
  if (modo !== 'recuperar' && (senha.length < 8 || senha.length > 72)) return 'A senha precisa ter no mínimo 8 caracteres.';
  return null;
}

export default function LoginScreen() {
  const { entrar, cadastrar, recuperarSenha } = useAuth();
  const [modo, setModo] = useState<Modo>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estudante, setEstudante] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem>(null);

  function trocarModo(novo: Modo) {
    setModo(novo);
    setMensagem(null);
  }

  async function enviar() {
    const invalido = validar(modo, email, senha, nome);
    if (invalido) {
      setMensagem({ tipo: 'erro', texto: invalido });
      return;
    }
    setEnviando(true);
    setMensagem(null);
    try {
      const emailLimpo = email.trim().toLowerCase();
      if (modo === 'login') {
        await entrar(emailLimpo, senha);
        // O _layout redireciona automaticamente ao detectar a sessão.
      } else if (modo === 'cadastro') {
        const precisaConfirmar = await cadastrar({
          email: emailLimpo,
          senha,
          nome: nome.trim(),
          tipo: estudante ? 'student' : 'donor',
        });
        if (precisaConfirmar) {
          setModo('login');
          setSenha('');
          setMensagem({ tipo: 'sucesso', texto: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.' });
        }
      } else {
        await recuperarSenha(emailLimpo);
        setModo('login');
        setMensagem({ tipo: 'sucesso', texto: 'Link de recuperação enviado para seu e-mail.' });
      }
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(e) });
    } finally {
      setEnviando(false);
    }
  }

  const tituloBotao = modo === 'login' ? 'Entrar' : modo === 'cadastro' ? 'Criar conta' : 'Enviar link';

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Badge label="Zona Leste // Rede ativa" dot />
            <Text style={styles.brand}>
              CICLO <Text style={{ color: colors.primary }}>TECH</Text>
            </Text>
            <Muted style={{ textAlign: 'center' }}>Hardware circular & autonomia digital acadêmica na Zona Leste</Muted>
          </View>

          <View style={styles.card}>
            {modo === 'recuperar' ? (
              <View style={{ gap: 4 }}>
                <Text style={styles.cardTitle}>RECUPERAR SENHA</Text>
                <Muted>Enviaremos um link de redefinição para o seu e-mail.</Muted>
              </View>
            ) : (
              <View style={styles.tabs} accessibilityRole="tablist">
                {(['login', 'cadastro'] as const).map((m) => {
                  const ativo = modo === m;
                  return (
                    <Pressable
                      key={m}
                      accessibilityRole="tab"
                      accessibilityLabel={m === 'login' ? 'Login' : 'Cadastro'}
                      aria-selected={ativo}
                      onPress={() => trocarModo(m)}
                      style={[styles.tab, ativo && styles.tabAtiva]}
                    >
                      <Text style={[styles.tabText, ativo && { color: colors.onPrimary }]}>
                        {m === 'login' ? 'LOGIN' : 'CADASTRO'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {modo === 'cadastro' && (
              <Input
                label="Nome completo"
                icon="person-outline"
                placeholder="Ex.: Amanda Silva"
                value={nome}
                onChangeText={setNome}
                autoComplete="name"
                textContentType="name"
              />
            )}

            <Input
              label="E-mail"
              icon="mail-outline"
              placeholder="estudante@fatec.sp.gov.br"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            {modo !== 'recuperar' && (
              <Input
                label="Senha"
                icon="lock-closed-outline"
                placeholder={modo === 'cadastro' ? 'Mínimo 8 caracteres' : 'Sua senha'}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
                textContentType={modo === 'cadastro' ? 'newPassword' : 'password'}
                onSubmitEditing={enviar}
                returnKeyType="go"
              />
            )}

            {modo === 'cadastro' && (
              <Checkbox
                checked={estudante}
                onChange={setEstudante}
                label="Sou estudante da rede pública / Fatec Zona Leste e desejo solicitar peças."
              />
            )}

            {mensagem && <Feedback tipo={mensagem.tipo} mensagem={mensagem.texto} />}

            <Button
              title={tituloBotao}
              icon={modo === 'cadastro' ? 'arrow-forward' : undefined}
              onPress={enviar}
              loading={enviando}
            />

            {modo === 'login' && (
              <Pressable onPress={() => trocarModo('recuperar')} hitSlop={8} style={{ alignSelf: 'center' }}>
                <Text style={styles.link}>Esqueceu a senha?</Text>
              </Pressable>
            )}
            {modo === 'recuperar' && (
              <Pressable onPress={() => trocarModo('login')} hitSlop={8} style={{ alignSelf: 'center' }}>
                <Text style={styles.link}>Voltar para o login</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.footer}>♻ Tecnologia circular para a Zona Leste</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.md, gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.sm },
  brand: { color: colors.text, fontFamily: fonts.bold, fontSize: 34, letterSpacing: 2 },
  card: {
    gap: spacing.md,
    padding: spacing.md + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: glow.soft,
  },
  cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, letterSpacing: 1 },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm + 2 },
  tabAtiva: { backgroundColor: colors.primary, boxShadow: glow.soft },
  tabText: { color: colors.textMuted, fontFamily: fonts.monoBold, fontSize: 12, letterSpacing: 2 },
  link: { color: colors.accent, fontFamily: fonts.medium, fontSize: 14 },
  footer: { color: colors.placeholder, fontFamily: fonts.mono, fontSize: 11, textAlign: 'center', letterSpacing: 1 },
});

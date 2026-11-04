import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Button, Input, Muted, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/theme/colors';

export default function LoginScreen() {
  const { entrar, cadastrar } = useAuth();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!email || !senha || (modoCadastro && !nome)) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }
    setEnviando(true);
    try {
      if (modoCadastro) {
        await cadastrar(email.trim(), senha, nome.trim());
        Alert.alert('Conta criada', 'Verifique seu e-mail para confirmar o cadastro.');
      } else {
        await entrar(email.trim(), senha);
      }
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível concluir.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen style={{ justifyContent: 'center' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ gap: spacing.md }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ color: colors.text, fontSize: 36, fontWeight: '800' }}>
            Ciclo<Text style={{ color: colors.primary }}>TECH</Text>
          </Text>
          <Muted>Doe e reaproveite hardware</Muted>
        </View>

        {modoCadastro && <Input label="Nome" value={nome} onChangeText={setNome} autoComplete="name" />}
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Input label="Senha" value={senha} onChangeText={setSenha} secureTextEntry autoComplete="password" />

        <Button title={modoCadastro ? 'Criar conta' : 'Entrar'} onPress={enviar} loading={enviando} />
        <Button
          title={modoCadastro ? 'Já tenho conta' : 'Criar uma conta'}
          variant="outline"
          onPress={() => setModoCadastro((v) => !v)}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

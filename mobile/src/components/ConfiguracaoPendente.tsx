import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { problemasSupabase } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme/colors';

const passos = [
  'Na pasta mobile, copie .env.example para .env',
  'Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'Pare o servidor e reinicie com: npx expo start -c',
];

/** Mostrada no lugar do app quando o Supabase não está configurado, em vez de quebrar a inicialização. */
export function ConfiguracaoPendente() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>
          Ciclo<Text style={{ color: colors.primary }}>TECH</Text>
        </Text>
        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>Supabase não configurado</Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: spacing.md,
            gap: spacing.sm,
          }}
        >
          {passos.map((passo, i) => (
            <Text key={passo} style={{ color: colors.text, fontSize: 15 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{i + 1}. </Text>
              {passo}
            </Text>
          ))}
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Detalhes: {problemasSupabase.join('; ')}.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

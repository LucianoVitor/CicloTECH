import { GeistMono_400Regular, GeistMono_500Medium, GeistMono_700Bold } from '@expo-google-fonts/geist-mono';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfiguracaoPendente } from '@/components/ConfiguracaoPendente';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { CicloStoreProvider } from '@/hooks/useCicloStore';
import { FavoritosProvider } from '@/hooks/useFavoritos';
import { colors } from '@/theme/colors';

// Tema de navegação escuro: impede flashes brancos entre telas e em transições de modal.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.borderStrong,
    notification: colors.primary,
  },
};

function TelaCarregando() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

function RootNavigator() {
  const { session, carregando, configurado } = useAuth();

  if (!configurado) return <ConfiguracaoPendente />;
  if (carregando) return <TelaCarregando />;

  const logado = !!session;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Protected guard={logado}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="equipamento/novo" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        {/* Toda rota precisa estar listada aqui: rotas fora do Protected ficariam acessíveis sem login. */}
        <Stack.Screen name="meus-equipamentos" />
        <Stack.Screen name="minhas-doacoes" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="como-doar" />
        <Stack.Screen name="impacto" />
        <Stack.Screen name="sobre" />
        <Stack.Screen name="faq" />
        <Stack.Screen name="minhas-solicitacoes" />
        <Stack.Screen name="minhas-trocas" />
        <Stack.Screen name="conversas" />
        <Stack.Screen name="conversa/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="troca/nova" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack.Protected>
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // Mesmas fontes da Web: Space Grotesk + Geist Mono (empacotadas no app, sem depender de internet).
  const [fontesCarregadas, erroFontes] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_700Bold,
  });

  useEffect(() => {
    if (erroFontes) console.warn('[CicloTECH] Fontes não carregadas; usando fontes do sistema.', erroFontes.message);
  }, [erroFontes]);

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <ThemeProvider value={navigationTheme}>
        <AuthProvider>
          <FavoritosProvider>
            <CicloStoreProvider>
              <StatusBar style="light" />
              {fontesCarregadas || erroFontes ? <RootNavigator /> : <TelaCarregando />}
            </CicloStoreProvider>
          </FavoritosProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

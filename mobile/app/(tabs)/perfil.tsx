import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button, Card, Muted, Screen, Title } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { perfilService, type Perfil } from '@/services';
import { colors } from '@/theme/colors';

const tipoUsuario: Record<string, string> = { donor: 'Doador', student: 'Estudante' };

export default function PerfilScreen() {
  const { session, sair } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useFocusEffect(
    useCallback(() => {
      perfilService
        .meuPerfil()
        .then(setPerfil)
        .catch((e) => Alert.alert('Erro', e instanceof Error ? e.message : String(e)));
    }, []),
  );

  return (
    <Screen>
      <Title>{perfil?.full_name || 'Meu perfil'}</Title>
      <Card>
        <Muted>E-mail</Muted>
        <Text style={{ color: colors.text }}>{session?.user.email}</Text>
        {perfil?.user_type && (
          <>
            <Muted>Tipo de conta</Muted>
            <Text style={{ color: colors.primary }}>{tipoUsuario[perfil.user_type] ?? perfil.user_type}</Text>
          </>
        )}
        {perfil?.phone && (
          <>
            <Muted>Telefone</Muted>
            <Text style={{ color: colors.text }}>{perfil.phone}</Text>
          </>
        )}
      </Card>
      <Button
        title="Sair"
        variant="outline"
        onPress={() => sair().catch((e) => Alert.alert('Erro', e instanceof Error ? e.message : String(e)))}
      />
    </Screen>
  );
}

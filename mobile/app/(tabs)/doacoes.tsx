import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text } from 'react-native';
import { Card, Muted, Screen } from '@/components/ui';
import { doacoesService, type DoacaoComEquipamento } from '@/services';
import { colors, spacing } from '@/theme/colors';

export default function DoacoesScreen() {
  const [itens, setItens] = useState<DoacaoComEquipamento[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setItens(await doacoesService.buscar());
    } catch (e) {
      Alert.alert('Erro ao carregar', e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <Screen>
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} />}
        ListEmptyComponent={
          !carregando ? <Muted>Nenhuma doação ainda. Toque em um equipamento para doá-lo.</Muted> : undefined
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
              {item.equipamentos?.titulo ?? 'Equipamento'}
            </Text>
            <Text style={{ color: colors.primary }}>{item.status}</Text>
            {!!item.observacoes && <Muted>{item.observacoes}</Muted>}
            <Muted>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Muted>
          </Card>
        )}
      />
    </Screen>
  );
}

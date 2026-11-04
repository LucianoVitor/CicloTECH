import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Button, Card, Muted, Screen } from '@/components/ui';
import { doacoesService, equipamentosService, type Equipamento } from '@/services';
import { colors, spacing } from '@/theme/colors';

export default function EquipamentosScreen() {
  const [itens, setItens] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setItens(await equipamentosService.buscar());
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

  function abrirAcoes(item: Equipamento) {
    Alert.alert(item.titulo, 'O que deseja fazer?', [
      {
        text: 'Doar',
        onPress: async () => {
          try {
            await doacoesService.inserir({ equipamento_id: item.id });
            Alert.alert('Pronto', 'Doação registrada.');
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : String(e));
          }
        },
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await equipamentosService.deletar(item.id);
            await carregar();
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : String(e));
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <Screen>
      <Button title="+ Cadastrar equipamento" onPress={() => router.push('/equipamento/novo')} />
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} />}
        ListEmptyComponent={!carregando ? <Muted>Nenhum equipamento cadastrado ainda.</Muted> : undefined}
        renderItem={({ item }) => (
          <Pressable onPress={() => abrirAcoes(item)}>
            <Card>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{item.titulo}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Text style={{ color: colors.primary }}>{item.categoria}</Text>
                <Muted>• {item.condicao}</Muted>
              </View>
              {!!item.descricao && <Muted>{item.descricao}</Muted>}
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

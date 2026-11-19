import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { ItemCard } from '@/components/ItemCard';
import { Button, EmptyState, Muted, Screen, StackHeader, Title } from '@/components/ui';
import { DOACOES_DISPONIVEIS, TROCAS } from '@/data/conteudo';
import { useFavoritos } from '@/hooks/useFavoritos';
import { imagemDaCategoria } from '@/lib/catalogo';
import { voltar } from '@/lib/navegacao';
import { spacing } from '@/theme/colors';

/** Peças e trocas marcadas com o coração nas vitrines. */
export default function FavoritosScreen() {
  const { favoritos, alternar } = useFavoritos();

  return (
    <Screen>
      <StackHeader title="Meu painel" onBack={() => voltar('/perfil')} />
      <FlatList
        data={favoritos}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
            <Title>Meus favoritos</Title>
            <Muted>Peças e kits monitorados. Toque no coração para remover.</Muted>
          </View>
        }
        ListEmptyComponent={
          <View style={{ gap: spacing.md }}>
            <EmptyState icon="heart-outline" title="Nenhum favorito" text="Toque no coração de uma peça em Doações ou Trocas." />
            <Button title="Ver doações" variant="outline" icon="grid-outline" onPress={() => router.navigate('/doacoes')} />
          </View>
        }
        renderItem={({ item }) => {
          const origem =
            item.tipo === 'doacao' ? DOACOES_DISPONIVEIS.find((d) => d.id === item.id) : TROCAS.find((t) => t.id === item.id);
          return (
            <ItemCard
              imagem={origem?.imagem ?? imagemDaCategoria(item.categoria)}
              categoria={item.categoria}
              titulo={item.titulo}
              selo={item.tipo === 'doacao' ? 'Doação' : 'Troca'}
              favorito={{ ativo: true, alternar: () => alternar(item) }}
              acao={{
                titulo: item.tipo === 'doacao' ? 'Ver em Doações' : 'Ver em Trocas',
                icon: 'open-outline',
                variant: 'secondary',
                onPress: () => router.navigate(item.tipo === 'doacao' ? '/doacoes' : '/trocas'),
              }}
            />
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
});

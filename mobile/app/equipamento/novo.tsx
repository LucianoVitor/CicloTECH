import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Button, Input, Screen } from '@/components/ui';
import { equipamentosService } from '@/services';
import { spacing } from '@/theme/colors';

export default function NovoEquipamentoScreen() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [condicao, setCondicao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!titulo.trim() || !categoria.trim() || !condicao.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe título, categoria e condição.');
      return;
    }
    setSalvando(true);
    try {
      await equipamentosService.inserir({
        titulo: titulo.trim(),
        categoria: categoria.trim(),
        condicao: condicao.trim(),
        descricao: descricao.trim(),
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro ao salvar', e instanceof Error ? e.message : String(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.md }} keyboardShouldPersistTaps="handled">
        <Input label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex.: Memória RAM 8GB DDR4" />
        <Input label="Categoria" value={categoria} onChangeText={setCategoria} placeholder="Ex.: RAM, GPU, Monitor" />
        <Input label="Condição" value={condicao} onChangeText={setCondicao} placeholder="Ex.: Novo, Usado" />
        <Input
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Button title="Salvar" onPress={salvar} loading={salvando} />
      </ScrollView>
    </Screen>
  );
}

import { Alert, Platform } from 'react-native';

/** Aviso simples que funciona em Android, iOS e Web (Alert.alert não faz nada no react-native-web). */
export function avisar(titulo: string, mensagem: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem);
}

/** Confirmação sim/não multiplataforma. Resolve true somente se o usuário confirmar. */
export function confirmar(
  titulo: string,
  mensagem: string,
  { textoConfirmar = 'Confirmar', destrutivo = false } = {},
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: textoConfirmar, style: destrutivo ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

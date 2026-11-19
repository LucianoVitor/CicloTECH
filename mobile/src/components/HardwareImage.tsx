import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ArteHardware } from '@/components/ArteHardware';
import { imagemDaCategoria } from '@/lib/catalogo';

/**
 * Foto do componente cadastrado. Usa imagem_url quando existir; se faltar ou falhar ao carregar,
 * usa a arte da categoria. A imagem nunca é cortada (ver ArteHardware).
 */
export function HardwareImage({
  uri,
  categoria,
  height,
  vinheta = true,
  style,
}: {
  uri?: string | null;
  categoria: string;
  /** Altura fixa (ex.: miniaturas). Sem ela, a moldura usa proporção 16:10. */
  height?: number;
  vinheta?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [falhou, setFalhou] = useState(false);
  const remota = !!uri && !falhou;

  return (
    <ArteHardware
      source={remota ? { uri: uri! } : imagemDaCategoria(categoria)}
      height={height}
      vinheta={vinheta}
      onError={() => setFalhou(true)}
      accessibilityLabel={`Foto: ${categoria}`}
      style={style}
    />
  );
}

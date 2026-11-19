import type { ImageSourcePropType } from 'react-native';

/** Mesmas categorias da Web (src/pages/DoarEquipamento.tsx), para os dados ficarem consistentes no banco. */
export const CATEGORIAS = [
  'Processadores (CPU)',
  'Memória RAM',
  'Armazenamento (SSD/HDD)',
  'Placas de Vídeo (GPU)',
  'Monitores',
  'Periféricos',
] as const;

/** Mesmos estados de conservação da Web. */
export const CONDICOES = ['Novo', 'Excelente', 'Bom estado', 'Funcional', 'Para peças'] as const;

export type TipoCategoria = 'cpu' | 'ram' | 'storage' | 'gpu' | 'monitor' | 'peripherals';

/** Classifica a categoria gravada; tolera textos livres antigos ("RAM", "GPU", "SSD"...). */
export function tipoDaCategoria(categoria: string): TipoCategoria {
  const c = categoria.toLowerCase();
  if (c.includes('ram') || c.includes('memória') || c.includes('memoria')) return 'ram';
  if (c.includes('gpu') || c.includes('vídeo') || c.includes('video')) return 'gpu';
  if (c.includes('ssd') || c.includes('hdd') || c.includes('armazen')) return 'storage';
  if (c.includes('monitor')) return 'monitor';
  if (c.includes('cpu') || c.includes('processador')) return 'cpu';
  return 'peripherals';
}

/** Chips de filtro da vitrine. */
export const FILTROS: { rotulo: string; tipo: TipoCategoria | null }[] = [
  { rotulo: 'Todos', tipo: null },
  { rotulo: 'Processadores', tipo: 'cpu' },
  { rotulo: 'Memória RAM', tipo: 'ram' },
  { rotulo: 'Armazenamento', tipo: 'storage' },
  { rotulo: 'Placas de Vídeo', tipo: 'gpu' },
  { rotulo: 'Monitores', tipo: 'monitor' },
  { rotulo: 'Periféricos', tipo: 'peripherals' },
];

// Imagens com iluminação azul copiadas da Web (src/assets/cat-*.png).
export const IMAGENS: Record<TipoCategoria, ImageSourcePropType> = {
  cpu: require('../../assets/images/categorias/cat-cpu.png'),
  ram: require('../../assets/images/categorias/cat-ram.png'),
  storage: require('../../assets/images/categorias/cat-storage.png'),
  gpu: require('../../assets/images/categorias/cat-gpu.png'),
  monitor: require('../../assets/images/categorias/cat-monitor.png'),
  peripherals: require('../../assets/images/categorias/cat-peripherals.png'),
};

export function imagemDaCategoria(categoria: string): ImageSourcePropType {
  return IMAGENS[tipoDaCategoria(categoria)];
}

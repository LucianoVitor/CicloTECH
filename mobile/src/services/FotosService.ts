import { ServicoAutenticado } from './ServicoAutenticado';

/** Tipo da foto. Todas ficam no bucket público "avatars" (o workspace do Lovable bloqueia novos buckets públicos). */
export type Bucket = 'equipamentos' | 'avatars';

const BUCKET_FISICO = 'avatars';

/**
 * Envio de fotos para o Supabase Storage. Cada arquivo vai para a pasta do próprio usuário
 * (exigência das políticas do banco) com nome único — não sobrescreve nada.
 */
export class FotosService extends ServicoAutenticado {
  /** Envia a imagem local (URI do seletor de imagens) e devolve a URL pública. */
  async enviar(tipoFoto: Bucket, uri: string, mimeType?: string | null): Promise<string> {
    const uid = await this.usuarioAtual();
    const tipo = mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
    const extensao = tipo.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const prefixo = tipoFoto === 'avatars' ? 'perfil' : 'equipamento';
    // A 1ª pasta precisa ser o id do usuário (regra de segurança do Storage).
    const caminho = `${uid}/${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

    // Método recomendado pelo Supabase para React Native: ler o arquivo como ArrayBuffer.
    const resposta = await fetch(uri);
    const conteudo = await resposta.arrayBuffer();
    if (conteudo.byteLength === 0) throw new Error('Não foi possível ler a imagem selecionada.');
    if (conteudo.byteLength > 8 * 1024 * 1024) throw new Error('A imagem é muito grande (máximo 8 MB).');

    const { error } = await this.client.storage
      .from(BUCKET_FISICO)
      .upload(caminho, conteudo, { contentType: tipo, upsert: false });
    if (error) throw error;
    return this.client.storage.from(BUCKET_FISICO).getPublicUrl(caminho).data.publicUrl;
  }
}

export const fotosService = new FotosService();

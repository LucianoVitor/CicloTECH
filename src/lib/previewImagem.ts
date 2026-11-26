/**
 * Pré-visualização segura de imagens escolhidas pelo usuário.
 * Só aceita tipos de imagem conhecidos e tamanho limitado, e só devolve URLs "blob:"
 * criadas pelo próprio navegador (nunca texto vindo do arquivo ou da página).
 */

export const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5 MB

/** ok = true quando a imagem pode ser usada; senão, erro traz a mensagem para o usuário. */
export type ResultadoValidacao = { ok: boolean; erro: string | null };

/** Confere tipo e tamanho do arquivo, com mensagem em português quando recusado. */
export function validarImagem(arquivo: File): ResultadoValidacao {
  if (!(TIPOS_IMAGEM_PERMITIDOS as readonly string[]).includes(arquivo.type)) {
    return { ok: false, erro: `"${arquivo.name}" não é uma imagem permitida. Use JPG, PNG ou WEBP.` };
  }
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
    return { ok: false, erro: `"${arquivo.name}" passa de 5 MB. Escolha uma imagem menor.` };
  }
  return { ok: true, erro: null };
}

/**
 * Cria a URL de pré-visualização (URL.createObjectURL) de uma imagem já validada.
 * Devolve null se o arquivo for recusado ou se a URL não começar com "blob:".
 */
export function criarUrlPreview(arquivo: File): string | null {
  if (!validarImagem(arquivo).ok) return null;
  const url = URL.createObjectURL(arquivo);
  if (typeof url !== "string" || !url.startsWith("blob:")) {
    if (typeof url === "string") URL.revokeObjectURL(url);
    return null;
  }
  return url;
}

/** Libera a memória de uma URL criada por criarUrlPreview. Ignora valores que não são "blob:". */
export function revogarUrlPreview(url: string | null | undefined): void {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}

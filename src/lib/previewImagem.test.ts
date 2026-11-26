import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TAMANHO_MAXIMO_IMAGEM,
  criarUrlPreview,
  revogarUrlPreview,
  validarImagem,
} from "./previewImagem";

/** Arquivo falso com tipo e tamanho escolhidos (o conteúdo não importa para a validação). */
function arquivo(nome: string, tipo: string, tamanho = 1024): File {
  const f = new File(["x"], nome, { type: tipo });
  Object.defineProperty(f, "size", { value: tamanho });
  return f;
}

const criar = vi.fn();
const revogar = vi.fn();

beforeEach(() => {
  criar.mockReset().mockReturnValue("blob:http://localhost/1234-abcd");
  revogar.mockReset();
  // jsdom não implementa createObjectURL/revokeObjectURL.
  Object.assign(URL, { createObjectURL: criar, revokeObjectURL: revogar });
});
afterEach(() => vi.restoreAllMocks());

describe("validarImagem", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("aceita %s", (tipo) => {
    expect(validarImagem(arquivo("foto", tipo)).ok).toBe(true);
  });

  it.each(["image/svg+xml", "text/html", "image/gif", "application/pdf", ""])("recusa o tipo '%s' com mensagem em português", (tipo) => {
    const r = validarImagem(arquivo("arquivo.x", tipo));
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("não é uma imagem permitida");
  });

  it("recusa arquivo maior que 5 MB", () => {
    const r = validarImagem(arquivo("grande.jpg", "image/jpeg", TAMANHO_MAXIMO_IMAGEM + 1));
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("passa de 5 MB");
  });

  it("aceita exatamente 5 MB", () => {
    expect(validarImagem(arquivo("limite.png", "image/png", TAMANHO_MAXIMO_IMAGEM)).ok).toBe(true);
  });
});

describe("criarUrlPreview", () => {
  it("devolve a URL quando começa com blob:", () => {
    expect(criarUrlPreview(arquivo("foto.png", "image/png"))).toBe("blob:http://localhost/1234-abcd");
    expect(criar).toHaveBeenCalledTimes(1);
  });

  it("não cria URL para tipo inválido nem para arquivo grande", () => {
    expect(criarUrlPreview(arquivo("pagina.html", "text/html"))).toBeNull();
    expect(criarUrlPreview(arquivo("grande.jpg", "image/jpeg", TAMANHO_MAXIMO_IMAGEM * 2))).toBeNull();
    expect(criar).not.toHaveBeenCalled();
  });

  it("recusa (e libera) uma URL que não começa com blob:", () => {
    criar.mockReturnValue("javascript:alert(1)");
    expect(criarUrlPreview(arquivo("foto.png", "image/png"))).toBeNull();
    expect(revogar).toHaveBeenCalledWith("javascript:alert(1)");
  });
});

describe("revogarUrlPreview", () => {
  it("revoga URLs blob:", () => {
    revogarUrlPreview("blob:http://localhost/1234-abcd");
    expect(revogar).toHaveBeenCalledWith("blob:http://localhost/1234-abcd");
  });

  it("ignora null, vazio e URLs que não são blob:", () => {
    revogarUrlPreview(null);
    revogarUrlPreview(undefined);
    revogarUrlPreview("");
    revogarUrlPreview("https://exemplo.com/a.png");
    expect(revogar).not.toHaveBeenCalled();
  });
});

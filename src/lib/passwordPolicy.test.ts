import { describe, expect, it } from "vitest";
import { forcaDaSenha, novaSenhaSchema, senhaForte } from "./passwordPolicy";

describe("senhaForte", () => {
  it.each(["Ciclo@2026", "Abcdef1!", "S3nh@Muito-Forte", "Zé.Lest3x"])("aceita senha forte: %s", (senha) => {
    expect(senhaForte.safeParse(senha).success).toBe(true);
  });

  it.each([
    ["Ab1!", "A senha deve ter pelo menos 8 caracteres"],
    ["ciclotech@2026", "A senha deve ter pelo menos uma letra maiúscula"],
    ["CICLOTECH@2026", "A senha deve ter pelo menos uma letra minúscula"],
    ["CicloTech@!", "A senha deve ter pelo menos um número"],
    ["CicloTech2026", "A senha deve ter pelo menos um caractere especial"],
  ])("recusa %s com a mensagem certa", (senha, mensagem) => {
    const r = senhaForte.safeParse(senha);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.message)).toContain(mensagem);
  });

  it("recusa senha acima de 72 caracteres (limite do bcrypt)", () => {
    expect(senhaForte.safeParse("Aa1!" + "x".repeat(70)).success).toBe(false);
  });
});

describe("novaSenhaSchema", () => {
  it("exige que a confirmação seja igual", () => {
    const r = novaSenhaSchema.safeParse({ senha: "Ciclo@2026", confirmacao: "Ciclo@2025" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["confirmacao"]);
  });

  it("aceita quando as duas senhas são iguais e fortes", () => {
    expect(novaSenhaSchema.safeParse({ senha: "Ciclo@2026", confirmacao: "Ciclo@2026" }).success).toBe(true);
  });
});

describe("forcaDaSenha", () => {
  it("classifica os níveis", () => {
    expect(forcaDaSenha("").nivel).toBe("vazia");
    expect(forcaDaSenha("abc").nivel).toBe("fraca");
    expect(forcaDaSenha("abcdefG1").nivel).toBe("media");
    expect(forcaDaSenha("Ciclo@2026")).toEqual({ pontos: 5, nivel: "forte", rotulo: "Forte" });
  });
});

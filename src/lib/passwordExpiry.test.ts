import { describe, expect, it } from "vitest";
import { diasParaVencer, senhaVencida } from "./passwordExpiry";

const agora = new Date("2026-11-25T12:00:00Z");
const diasAtras = (n: number) => new Date(agora.getTime() - n * 24 * 60 * 60 * 1000);

describe("senhaVencida", () => {
  it("senha trocada hoje não está vencida", () => {
    expect(senhaVencida(agora, agora)).toBe(false);
  });

  it("89 dias: ainda válida", () => {
    expect(senhaVencida(diasAtras(89), agora)).toBe(false);
  });

  it("exatamente 90 dias: ainda válida (vence só depois de 90)", () => {
    expect(senhaVencida(diasAtras(90), agora)).toBe(false);
  });

  it("90 dias e 1 minuto: vencida", () => {
    expect(senhaVencida(new Date(diasAtras(90).getTime() - 60_000), agora)).toBe(true);
  });

  it("aceita a data como texto ISO vinda do banco", () => {
    expect(senhaVencida("2026-01-01T00:00:00Z", agora)).toBe(true);
    expect(senhaVencida("2026-11-01T00:00:00Z", agora)).toBe(false);
  });

  it("data ausente ou inválida conta como vencida", () => {
    expect(senhaVencida(null, agora)).toBe(true);
    expect(senhaVencida(undefined, agora)).toBe(true);
    expect(senhaVencida("data-invalida", agora)).toBe(true);
  });
});

describe("diasParaVencer", () => {
  it("conta os dias restantes", () => {
    expect(diasParaVencer(diasAtras(80), agora)).toBe(10);
    expect(diasParaVencer(diasAtras(95), agora)).toBe(-5);
  });
});

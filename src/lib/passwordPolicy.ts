import { z } from "zod";

/** Regras da política de senha forte do CicloTECH, na ordem em que aparecem na tela. */
export const REGRAS_SENHA = [
  { id: "tamanho", rotulo: "Pelo menos 8 caracteres", teste: (s: string) => s.length >= 8 },
  { id: "maiuscula", rotulo: "Uma letra maiúscula", teste: (s: string) => /[A-Z]/.test(s) },
  { id: "minuscula", rotulo: "Uma letra minúscula", teste: (s: string) => /[a-z]/.test(s) },
  { id: "numero", rotulo: "Um número", teste: (s: string) => /\d/.test(s) },
  { id: "especial", rotulo: "Um caractere especial (ex.: ! @ # $ %)", teste: (s: string) => /[^A-Za-z0-9]/.test(s) },
] as const;

/** O Supabase Auth (bcrypt) considera só os primeiros 72 bytes da senha. */
export const TAMANHO_MAXIMO_SENHA = 72;

export const senhaForte = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(TAMANHO_MAXIMO_SENHA, `A senha deve ter no máximo ${TAMANHO_MAXIMO_SENHA} caracteres`)
  .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve ter pelo menos uma letra minúscula")
  .regex(/\d/, "A senha deve ter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve ter pelo menos um caractere especial");

/** Formulário de nova senha com confirmação (cadastro, redefinição e troca periódica). */
export const novaSenhaSchema = z
  .object({
    senha: senhaForte,
    confirmacao: z.string(),
  })
  .refine((v) => v.senha === v.confirmacao, {
    message: "As senhas não coincidem",
    path: ["confirmacao"],
  });

export type NovaSenha = z.infer<typeof novaSenhaSchema>;

export type NivelForca = "vazia" | "fraca" | "media" | "forte";

/** Força da senha: quantas regras ela cumpre (0 a 5) e um rótulo para o indicador. */
export function forcaDaSenha(senha: string): { pontos: number; nivel: NivelForca; rotulo: string } {
  if (!senha) return { pontos: 0, nivel: "vazia", rotulo: "" };
  const pontos = REGRAS_SENHA.filter((r) => r.teste(senha)).length;
  if (pontos === REGRAS_SENHA.length && senha.length <= TAMANHO_MAXIMO_SENHA) {
    return { pontos, nivel: "forte", rotulo: "Forte" };
  }
  if (pontos >= 3) return { pontos, nivel: "media", rotulo: "Média" };
  return { pontos, nivel: "fraca", rotulo: "Fraca" };
}

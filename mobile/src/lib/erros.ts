/** Traduções das mensagens mais comuns do Supabase (mesmas usadas na Web, quando existem). */
const TRADUCOES: [RegExp, string][] = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/already registered|already been registered|already exists/i, 'Este e-mail já está cadastrado.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar.'],
  [/password should be at least/i, 'A senha precisa ter no mínimo 8 caracteres.'],
  // A falha de rede não diz se o problema é a internet do aparelho ou o servidor (ex.: projeto Supabase pausado).
  [
    /network request failed|failed to fetch|fetch failed|ENOTFOUND/i,
    'Não foi possível conectar ao servidor. Verifique sua internet; se ela estiver funcionando, o servidor (projeto Supabase) pode estar fora do ar.',
  ],
  [/rate limit|too many requests/i, 'Muitas tentativas. Aguarde um pouco e tente novamente.'],
  [/jwt expired|invalid jwt/i, 'Sua sessão expirou. Entre novamente.'],
];

function traduzir(mensagem: string): string {
  const achada = TRADUCOES.find(([padrao]) => padrao.test(mensagem));
  return achada ? achada[1] : mensagem;
}

/**
 * Converte QUALQUER erro (Error, AuthError, PostgrestError, string, objeto) em texto legível.
 * Nunca devolve "[object Object]".
 */
export function mensagemDeErro(erro: unknown, padrao = 'Não foi possível concluir a operação.'): string {
  if (!erro) return padrao;
  if (typeof erro === 'string') return traduzir(erro) || padrao;
  if (typeof erro === 'object') {
    const { message, error_description, details } = erro as Record<string, unknown>;
    for (const candidato of [message, error_description, details]) {
      if (typeof candidato === 'string' && candidato.trim()) return traduzir(candidato.trim());
    }
  }
  return padrao;
}

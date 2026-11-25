import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * Cabeçalhos de segurança HTTP do CicloTECH.
 * Usados pelo servidor do Vite (dev e preview). Em produção, a HOSPEDAGEM precisa enviar os mesmos
 * cabeçalhos (ver evidencias/RESUMO.md), porque o Vite não serve o site publicado.
 */

// Origens externas que o site realmente usa.
const SUPABASE = ["https://*.supabase.co", "wss://*.supabase.co"];
// O plugin do VLibras carrega os arquivos do repositório oficial (spbgovbr-vlibras) via jsDelivr.
const VLIBRAS = ["https://vlibras.gov.br", "https://*.vlibras.gov.br", "https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/"];
const USERWAY = ["https://cdn.userway.org", "https://api.userway.org", "https://*.userway.org"];
const FONTES = { css: "https://fonts.googleapis.com", arquivos: "https://fonts.gstatic.com" };

/** Hash SHA-256 dos <script> inline do index.html (o script que evita o "piscar" do tema). */
function hashesDosScriptsInline(caminhoHtml: string): string[] {
  const html = readFileSync(caminhoHtml, "utf8");
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .filter((codigo) => codigo.trim().length > 0)
    .map((codigo) => `'sha256-${createHash("sha256").update(codigo).digest("base64")}'`);
}

export function montarCsp({ dev, indexHtml }: { dev: boolean; indexHtml: string }): string {
  const scriptSrc = [
    "'self'",
    // Em desenvolvimento o plugin React do Vite injeta um script inline (Fast Refresh).
    ...(dev ? ["'unsafe-inline'"] : hashesDosScriptsInline(indexHtml)),
    // O VLibras usa WebAssembly (Unity) para o avatar de Libras.
    "'wasm-unsafe-eval'",
    ...VLIBRAS,
    ...USERWAY,
  ];
  const diretivas: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'", FONTES.css, ...VLIBRAS, ...USERWAY],
    "font-src": ["'self'", "data:", FONTES.arquivos, ...USERWAY],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": ["'self'", ...SUPABASE, ...VLIBRAS, ...USERWAY, ...(dev ? ["ws://localhost:*"] : [])],
    "frame-src": ["'self'", ...VLIBRAS, ...USERWAY],
    "worker-src": ["'self'", "blob:"],
    "media-src": ["'self'", "blob:", ...VLIBRAS],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(diretivas)
    .map(([nome, valores]) => `${nome} ${valores.join(" ")}`)
    .join("; ");
}

export function cabecalhosDeSeguranca(opcoes: { dev: boolean; indexHtml: string }): Record<string, string> {
  return {
    "Content-Security-Policy": montarCsp(opcoes),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
}

// Gera PNGs das evidências (texto exato dos arquivos) para colar no relatório.
// Usa o Playwright com o Microsoft Edge já instalado no Windows (channel "msedge"), sem baixar navegador.
// Uso: node scripts/seguranca/gerar-imagens.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const SAIDA = join(RAIZ, "evidencias", "imagens");
const DATA = "25/11/2026";
const MAX_COLUNAS = 150;
mkdirSync(SAIDA, { recursive: true });

/** Oculta segredos e dados pessoais que porventura estejam no texto. */
function ocultar(texto) {
  return texto
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "eyJ<oculto>")
    .replace(/sb_(secret|publishable)_[A-Za-z0-9_-]+/g, "sb_$1_<oculto>")
    .replace(/[\w.+-]+@(?!example\.)[\w-]+\.[a-z]{2,}(\.[a-z]{2,})?/gi, "<email-oculto>")
    .replace(/(apikey:\s*)(?!<|chave-anon-local-indisponivel)\S+/gi, "$1<oculto>")
    .replace(/(password|senha|secret|token)(\s*[:=]\s*)["'][^"']{6,}["']/gi, '$1$2"<oculto>"');
}

/** Remove códigos de cor do terminal e corta linhas muito longas (sem resumir o conteúdo). */
function preparar(texto, cortar = true) {
  return ocultar(texto.replace(/\u001b\[[0-9;]*m/g, "").replace(/^﻿/, ""))
    .split(/\r?\n/)
    .map((l) => (cortar && l.length > MAX_COLUNAS ? l.slice(0, MAX_COLUNAS - 1) + "…" : l))
    .join("\n")
    .replace(/\n+$/, "");
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pagina(titulo, fonte, corpoHtml) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; width: 1200px; background: #0b1220; color: #e5e7eb; font-family: Consolas, "Cascadia Mono", "Courier New", monospace; }
    header { padding: 22px 28px 14px; border-bottom: 1px solid #1f2a44; background: #0f172a; }
    h1 { margin: 0 0 6px; font-size: 22px; color: #93c5fd; font-family: "Segoe UI", Arial, sans-serif; }
    .meta { font-size: 13px; color: #94a3b8; }
    pre { margin: 0; padding: 18px 28px 26px; font-size: 13px; line-height: 1.45; white-space: pre; }
    .ok { color: #4ade80; } .falha { color: #f87171; } .alerta { color: #fbbf24; }
    table { border-collapse: collapse; margin: 18px 28px 26px; font-size: 13px; width: calc(100% - 56px); }
    th, td { border: 1px solid #334155; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #1e293b; color: #bfdbfe; }
  </style></head><body>
  <header><h1>${esc(titulo)}</h1><div class="meta">CicloTECH · ${DATA} · fonte: ${esc(fonte)}</div></header>
  ${corpoHtml}</body></html>`;
}

/** Destaca PASSOU/FALHOU e "passed/failed" sem alterar o texto. */
function colorir(textoEscapado) {
  return textoEscapado
    .replace(/\[PASSOU\]/g, '<span class="ok">[PASSOU]</span>')
    .replace(/\[FALHOU\]/g, '<span class="falha">[FALHOU]</span>')
    .replace(/(\d+ passed)/g, '<span class="ok">$1</span>')
    .replace(/(\d+ failed)/g, '<span class="falha">$1</span>')
    .replace(/(\[CRITICAL\])/g, '<span class="alerta">$1</span>');
}

function deArquivo(titulo, rel, quebrarLinhas = false) {
  const texto = preparar(readFileSync(join(RAIZ, rel), "utf8"), !quebrarLinhas);
  const estilo = quebrarLinhas ? ' style="white-space: pre-wrap; word-break: break-all"' : "";
  return pagina(titulo, rel, `<pre${estilo}>${colorir(esc(texto))}</pre>`);
}

/** sqlmap: as linhas de cabeçalho, as de teste heurístico e o resultado final (texto exato, sem as centenas de "testing ..."). */
function deSqlmap(titulo, rel) {
  const linhas = preparar(readFileSync(join(RAIZ, rel), "utf8")).split("\n");
  const relevantes = linhas.filter((l) => /^###|\[(WARNING|CRITICAL|ERROR)\]|testing connection|starting @|ending @|legal disclaimer/.test(l));
  const corpo = relevantes.join("\n") + `\n\n(${linhas.length} linhas no arquivo; exibidas só as de aviso, erro e resultado. Saída completa em ${rel})`;
  return pagina(titulo, rel, `<pre>${colorir(esc(corpo))}</pre>`);
}

/** npm audit: contagem por gravidade (metadata do JSON) e a linha de resumo do texto, exatamente como o npm escreveu. */
function deAudit(titulo, relJson, relTxt) {
  const j = JSON.parse(readFileSync(join(RAIZ, relJson), "utf8").replace(/^[^{]*/, ""));
  const m = j.metadata.vulnerabilities;
  const resumo = readFileSync(join(RAIZ, relTxt), "utf8").split(/\r?\n/).filter((l) => /vulnerabilit(y|ies) \(|found 0 vulnerabilities/.test(l));
  const pacotes = Object.entries(j.vulnerabilities).map(([nome, v]) => {
    const via = v.via.map((x) => (typeof x === "string" ? x : x.title)).join("; ");
    const fix = v.fixAvailable === true ? "npm audit fix" : v.fixAvailable === false ? "sem correção" : `major: ${v.fixAvailable.name}@${v.fixAvailable.version}`;
    return `<tr><td>${esc(nome)}</td><td>${esc(v.severity)}</td><td>${v.isDirect ? "sim" : "não"}</td><td>${esc(fix)}</td><td>${esc(via.length > 110 ? via.slice(0, 109) + "…" : via)}</td></tr>`;
  });
  const corpo = `
    <table><tr><th>crítica</th><th>alta</th><th>moderada</th><th>baixa</th><th>info</th><th>total</th></tr>
    <tr><td>${m.critical}</td><td>${m.high}</td><td>${m.moderate}</td><td>${m.low}</td><td>${m.info}</td><td><b>${m.total}</b></td></tr></table>
    <pre>${esc(resumo.join("\n"))}</pre>
    <table><tr><th>pacote</th><th>gravidade</th><th>direta</th><th>correção</th><th>motivo (advisory)</th></tr>${pacotes.join("")}</table>`;
  return pagina(titulo, `${relJson} + ${relTxt}`, corpo);
}

/** Tabela do RESUMO.md convertida em HTML (mesmo texto das células). */
function deResumo(titulo, rel) {
  const linhas = readFileSync(join(RAIZ, rel), "utf8").split(/\r?\n/);
  const ini = linhas.findIndex((l) => l.startsWith("| #"));
  const tabela = [];
  for (let i = ini; i < linhas.length && linhas[i].startsWith("|"); i++) tabela.push(linhas[i]);
  const celulas = (l) => l.slice(1, -1).split(" | ").map((c) => c.trim());
  const md = (s) => esc(ocultar(s)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
  const [cab, , ...corpoLinhas] = tabela;
  const html = `<table><tr>${celulas(cab).map((c) => `<th>${md(c)}</th>`).join("")}</tr>${corpoLinhas
    .map((l) => `<tr>${celulas(l).map((c) => `<td>${md(c)}</td>`).join("")}</tr>`)
    .join("")}</table>`;
  return pagina(titulo, rel, html);
}

const navegador = await chromium.launch({ channel: "msedge" });
const contexto = await navegador.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
const geradas = [];

async function salvarHtml(arquivo, html, descricao) {
  const p = await contexto.newPage();
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: join(SAIDA, arquivo), fullPage: true });
  await p.close();
  geradas.push([arquivo, descricao]);
}

async function salvarRelatorioWapiti(arquivo, pasta, descricao) {
  // O relatório real é o arquivo com data (localhost_PORTA_DATA.html); report.html é só o modelo do Wapiti.
  const nome = readdirSync(join(RAIZ, pasta)).find((n) => /^localhost_\d+_.*\.html$/.test(n));
  const html = join(RAIZ, pasta, nome ?? "report.html");
  if (!existsSync(html)) throw new Error(`não encontrado: ${html}`);
  const p = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(pathToFileURL(resolve(html)).href, { waitUntil: "load" });
  await p.screenshot({ path: join(SAIDA, arquivo), fullPage: false });
  await p.close();
  geradas.push([arquivo, descricao]);
}

await salvarHtml("senha-forte-testes.png", deArquivo("Etapa 1 - Senha forte: npm test", "evidencias/depois/etapa1-npm-test.txt"), "Saída do npm test após a política de senha forte (13 testes novos; total do momento)");
await salvarHtml("esqueci-senha-testes.png", deArquivo("Etapa 2 - Esqueci a senha: npm test", "evidencias/depois/etapa2-npm-test.txt"), "Saída do npm test com os 5 testes do fluxo Esqueci/Redefinir senha");
await salvarHtml("troca-periodica-banco-local.png", deArquivo("Etapa 3 - Troca periódica (90 dias) no banco local", "evidencias/depois/etapa3-banco-local.txt"), "Teste da migration password_changed_at no PGlite (6 verificações)");
await salvarHtml("pgcrypto.png", deArquivo("Etapa 5 - pgcrypto (CPF criptografado) e hash bcrypt", "evidencias/depois/pgcrypto.txt"), "Valor bruto ilegível da coluna, ler_cpf() com CPF fictício e prefixo $2a$10$");
await salvarHtml("rls.png", deArquivo("Etapa 5 - RLS: usuário A x dados do usuário B", "evidencias/depois/rls.txt"), "Usuário A não lê, altera nem exclui dados do usuário B (10 verificações)");
await salvarHtml("npm-audit-antes.png", deAudit("npm audit - ANTES", "evidencias/antes/npm-audit.json", "evidencias/antes/npm-audit.txt"), "Contagem por gravidade e pacotes vulneráveis antes das correções");
await salvarHtml("npm-audit-depois.png", deAudit("npm audit - DEPOIS (branch seguranca)", "evidencias/pr/npm-audit.json", "evidencias/pr/npm-audit.txt"), "Contagem por gravidade e pacotes restantes na branch seguranca (base main)");
await salvarHtml("cabecalhos-preview.png", deArquivo("Etapa 4 - Cabeçalhos de segurança (npm run preview)", "evidencias/depois/etapa4-cabecalhos-preview.txt", true), "Cabeçalhos HTTP enviados pelo build: CSP, nosniff, X-Frame-Options, Referrer-Policy etc.");
await salvarHtml("sqlmap-antes.png", deSqlmap("sqlmap - ANTES (somente localhost)", "evidencias/antes/sqlmap-site.txt"), "sqlmap contra http://localhost:8080/doacoes?categoria=... antes: parâmetro não injetável");
await salvarHtml("sqlmap-depois.png", deSqlmap("sqlmap - DEPOIS (somente localhost)", "evidencias/depois/sqlmap-site.txt"), "sqlmap depois das correções: parâmetro não injetável");
await salvarHtml("sqlmap-supabase-local.png", deSqlmap("sqlmap - API do Supabase LOCAL (porta 54321)", "evidencias/depois/sqlmap-supabase-local.txt"), "Tentativa contra o Supabase local: sem conexão (Docker ausente)");
await salvarRelatorioWapiti("wapiti-antes.png", "evidencias/antes/wapiti", "Relatório do Wapiti antes (localhost:8080): resumo dos alertas");
await salvarRelatorioWapiti("wapiti-depois.png", "evidencias/depois/wapiti-preview", "Relatório do Wapiti depois, contra o build (localhost:4173): resumo dos alertas");
await salvarHtml("resumo-final.png", deResumo("Resumo das evidências (evidencias/RESUMO.md)", "evidencias/RESUMO.md"), "Tabela item / antes / depois / evidência / commit");

await navegador.close();
for (const [arq, desc] of geradas) console.log(`${arq}\t${desc}`);

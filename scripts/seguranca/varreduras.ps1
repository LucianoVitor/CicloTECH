# Roda Wapiti e sqlmap SOMENTE contra localhost e grava em evidencias/<etapa>.
# Uso: powershell -File scripts/seguranca/varreduras.ps1 -Etapa antes -Wapiti <wapiti.exe> -Sqlmap <sqlmap.exe>
param(
  [Parameter(Mandatory)][ValidateSet('antes', 'depois')][string]$Etapa,
  [Parameter(Mandatory)][string]$Wapiti,
  [Parameter(Mandatory)][string]$Sqlmap,
  [string]$Site = 'http://localhost:8080/'
)
if ($Site -notmatch '^http://(localhost|127\.0\.0\.1)(:\d+)?/') { throw 'Varredura permitida apenas em localhost.' }
$env:PYTHONIOENCODING = 'utf-8'
$dir = "evidencias\$Etapa"
New-Item -ItemType Directory -Force $dir | Out-Null
$saidaSqlmap = Join-Path $env:TEMP "sqlmap-ciclotech-$Etapa"

# Wapiti: varre o site local, sem sair da pasta (scope folder), no máximo 10 minutos.
& {
  "### comando: wapiti -u $Site --scope folder --flush-session --max-scan-time 600 -f html -o $dir\wapiti"
  & $Wapiti -u $Site --scope folder --flush-session --max-scan-time 600 -f html -o "$dir\wapiti" 2>&1
} *> "$dir\wapiti-console.txt"

# sqlmap 1: rota do site com parâmetro de consulta.
$alvoSite = "${Site}doacoes?categoria=notebook"
& {
  "### sqlmap contra o site local (Vite) - rota com parametro de consulta"
  "### comando: sqlmap -u `"$alvoSite`" --batch --level=3 --risk=2"
  & $Sqlmap -u $alvoSite --batch --level=3 --risk=2 --flush-session --output-dir $saidaSqlmap 2>&1
} *> "$dir\sqlmap-site.txt"

# sqlmap 2: API REST do Supabase LOCAL (supabase start). Registra o erro se não estiver rodando.
$alvoApi = 'http://localhost:54321/rest/v1/equipamentos?categoria=eq.notebook'
$chave = if ($env:SUPABASE_ANON_KEY_LOCAL) { $env:SUPABASE_ANON_KEY_LOCAL } else { 'chave-anon-local-indisponivel' }
& {
  "### sqlmap contra a API REST do Supabase LOCAL (porta 54321)"
  "### comando: sqlmap -u `"$alvoApi`" --headers=`"apikey: <chave anon LOCAL>`" --batch --level=3 --risk=2"
  & $Sqlmap -u $alvoApi --headers="apikey: $chave" --batch --level=3 --risk=2 --flush-session --output-dir $saidaSqlmap 2>&1
} *> "$dir\sqlmap-supabase-local.txt"

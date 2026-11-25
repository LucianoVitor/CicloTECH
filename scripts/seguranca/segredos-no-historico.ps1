# Procura possíveis segredos em TODO o histórico do git (linhas adicionadas) sem exibir os valores.
# Mostra só: commit, arquivo, tipo do achado e a variável/linha com o valor mascarado.
$padroes = [ordered]@{
  'JWT (chave Supabase anon/service_role)' = 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
  'service_role'                           = 'service_role'
  'Chave secreta Supabase (sb_secret_)'    = 'sb_secret_[A-Za-z0-9_-]+'
  'Chave publica Supabase (sb_publishable_)' = 'sb_publishable_[A-Za-z0-9_-]+'
  'Chave Stripe/OpenAI (sk_ / sk-)'        = '\bsk[_-](live|test|proj)?[_-]?[A-Za-z0-9]{16,}'
  'Senha atribuida no codigo'              = '(?i)(password|senha|passwd)\w*\s*[:=]\s*["''][^"'']{6,}["'']'
  'Segredo/token atribuido'                = '(?i)(secret|api_?key|token)\w*\s*[:=]\s*["''][^"'']{8,}["'']'
  'URL de banco com credencial'            = '(?i)postgres(ql)?://[^:\s]+:[^@\s]+@'
}
$commit = ''; $arquivo = ''
$achados = New-Object System.Collections.Generic.List[string]
git log -p --all --no-color --unified=0 | ForEach-Object {
  $l = $_
  if ($l -match '^commit ([0-9a-f]{40})') { $commit = $Matches[1].Substring(0, 7); return }
  if ($l -match '^\+\+\+ b/(.+)$') { $arquivo = $Matches[1]; return }
  if (-not $l.StartsWith('+') -or $l.StartsWith('+++')) { return }
  if ($arquivo -match '(^|/)(package-lock\.json|evidencias/|node_modules/)') { return }
  foreach ($tipo in $padroes.Keys) {
    if ($l -match $padroes[$tipo]) {
      $mascarada = $l.Substring(1).Trim() -replace 'eyJ[A-Za-z0-9_.-]+', 'eyJ<oculto>' -replace '(sb_(secret|publishable)_)[A-Za-z0-9_-]+', '$1<oculto>' -replace '(["''])[^"'']{4,}\1', '$1<oculto>$1' -replace '(=\s*)[^\s"'']{8,}', '$1<oculto>' -replace '://[^:\s]+:[^@\s]+@', '://<usuario>:<oculto>@'
      if ($mascarada.Length -gt 140) { $mascarada = $mascarada.Substring(0, 140) + '...' }
      $achados.Add("$commit | $arquivo | $tipo | $mascarada")
    }
  }
}
"Achados (commit | arquivo | tipo | linha com valor ocultado):"
$achados | Sort-Object -Unique
""
"Total de linhas suspeitas: $(($achados | Sort-Object -Unique).Count)"

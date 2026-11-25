# Remove dados pessoais das evidências de texto: caminho da pasta do usuário e e-mails.
param([string]$Pasta = "evidencias")
$pastaUsuario = $env:USERPROFILE
$barraInvertida = [regex]::Escape($pastaUsuario)
$barraNormal = [regex]::Escape($pastaUsuario.Replace('\', '/'))
$barraDupla = [regex]::Escape($pastaUsuario.Replace('\', '\\'))
Get-ChildItem $Pasta -Recurse -File -Include *.txt,*.json,*.md,*.tsx | ForEach-Object {
  $texto = [IO.File]::ReadAllText($_.FullName)
  if ([string]::IsNullOrEmpty($texto)) { return }
  $novo = $texto -replace $barraDupla, '<HOME>' -replace $barraInvertida, '<HOME>' -replace $barraNormal, '<HOME>'
  $novo = $novo -replace '[\w.+-]+@(?!example\.)[\w-]+\.[a-z]{2,}(\.[a-z]{2,})?', '<email-oculto>'
  # Nunca grava um arquivo vazio por engano.
  if (-not [string]::IsNullOrEmpty($novo) -and $novo -ne $texto) {
    [IO.File]::WriteAllText($_.FullName, $novo, (New-Object Text.UTF8Encoding $false))
    "mascarado: $($_.Name)"
  }
}

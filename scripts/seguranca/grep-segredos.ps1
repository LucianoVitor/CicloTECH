# Procura palavras ligadas a segredos em src/ e mascara os valores (texto entre aspas e após "=" ou ":").
# Uso: powershell -File scripts/seguranca/grep-segredos.ps1 > saida.txt
param([string]$Pasta = "src")
$padrao = 'password|senha|secret|apikey'
Get-ChildItem $Pasta -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx | ForEach-Object {
  $arquivo = Resolve-Path -Relative $_.FullName
  Select-String -Path $_.FullName -Pattern $padrao -AllMatches | ForEach-Object {
    $linha = $_.Line.Trim()
    # Mascara literais de texto e e-mails, preservando o nome da variável para o relatório.
    $linha = $linha -replace '"[^"]{3,}"', '"<oculto>"' -replace "'[^']{3,}'", "'<oculto>'" -replace '`[^`]{3,}`', '`<oculto>`'
    $linha = $linha -replace '[\w.+-]+@[\w-]+\.[\w.]+', '<email-oculto>'
    if ($linha.Length -gt 200) { $linha = $linha.Substring(0, 200) + '...' }
    "{0}:{1}: {2}" -f $arquivo, $_.LineNumber, $linha
  }
}

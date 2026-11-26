# Correção do alerta do CodeQL: js/xss-through-dom

- **Alerta:** "Texto DOM reinterpretado como HTML" (DOM text reinterpreted as HTML), gravidade **alta**
- **Local:** `src/pages/DoarEquipamento.tsx:234`
- **Branch:** `seguranca-codeql` (criada a partir de `origin/main` em 26/11/2026)

## Antes
```tsx
// O arquivo vindo do <input type="file"> virava URL dentro do JSX, a cada renderização,
// sem checar o tipo exato e sem nunca liberar a URL.
const imgs = Array.from(incoming).filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
...
<img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
```
Problemas: a URL era criada no JSX (uma nova a cada renderização, sem `revokeObjectURL`, vazando memória), `image/*` aceitava SVG (que pode conter script) e nada garantia que o valor usado em `src` fosse uma URL `blob:`.

## Depois
Helper `src/lib/previewImagem.ts`:
```ts
export const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024; // 5 MB

export function validarImagem(arquivo: File): ResultadoValidacao { /* tipo permitido + até 5 MB, mensagem em português */ }

export function criarUrlPreview(arquivo: File): string | null {
  if (!validarImagem(arquivo).ok) return null;
  const url = URL.createObjectURL(arquivo);
  if (typeof url !== "string" || !url.startsWith("blob:")) {
    if (typeof url === "string") URL.revokeObjectURL(url);
    return null;
  }
  return url;
}

export function revogarUrlPreview(url: string | null | undefined): void {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}
```
`src/pages/DoarEquipamento.tsx`:
```tsx
type Foto = { arquivo: File; url: string };            // URL criada UMA vez, quando o arquivo entra
const [fotos, setFotos] = useState<Foto[]>([]);
useEffect(() => () => fotosRef.current.forEach((f) => revogarUrlPreview(f.url)), []); // limpa ao desmontar

// addFiles: validarImagem -> toast com o motivo; criarUrlPreview -> guarda { arquivo, url }
// removeFile e reset: revogarUrlPreview(url)
<input type="file" accept="image/jpeg,image/png,image/webp" ... />
<img src={foto.url} alt={foto.arquivo.name} ... />    // nenhum createObjectURL no JSX
```
Para o usuário, nada muda: a escolha, o arrastar e soltar, as miniaturas, o botão de remover e o limite de 6 fotos funcionam igual. Diferenças pequenas: GIF e SVG agora são recusados com uma mensagem explicando o motivo, e o texto de ajuda passou a citar WEBP.

## Outros usos no projeto (procurados e não alterados)
| Arquivo | Uso | Situação |
|---|---|---|
| `src/components/ui/chart.tsx:70` | `dangerouslySetInnerHTML` em `<style>` | Componente padrão do shadcn/ui. O CSS é montado a partir do `config` definido no código, sem entrada do usuário, e o componente **não é usado** em nenhuma página. Seguro, não alterado. |
| `src/pages/Admin.tsx:120` | `URL.createObjectURL(blob)` | Exportação de CSV pelo admin: o blob é gerado pelo próprio código, baixado com `<a download>` e revogado logo em seguida. Não vai para HTML. Seguro, não alterado. (Observação: os campos do CSV não são protegidos contra fórmulas do Excel, como `=...`. É um tema separado, que fica como sugestão.) |
| `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` | nenhum uso em `src/` nem no `index.html` | — |

## Testes (Vitest)
`src/lib/previewImagem.test.ts` (15) e `src/pages/DoarEquipamento.test.tsx` (3):
```
✓ src/lib/previewImagem.test.ts > validarImagem > aceita image/jpeg 2ms
✓ src/lib/previewImagem.test.ts > validarImagem > aceita image/png 0ms
✓ src/lib/previewImagem.test.ts > validarImagem > aceita image/webp 0ms
✓ src/lib/previewImagem.test.ts > validarImagem > recusa o tipo 'image/svg+xml' com mensagem em português 1ms
✓ src/lib/previewImagem.test.ts > validarImagem > recusa o tipo 'text/html' com mensagem em português 0ms
✓ src/lib/previewImagem.test.ts > validarImagem > recusa o tipo 'image/gif' com mensagem em português 0ms
✓ src/lib/previewImagem.test.ts > validarImagem > recusa o tipo 'application/pdf' com mensagem em português 0ms
✓ src/lib/previewImagem.test.ts > validarImagem > recusa o tipo '' com mensagem em português 0ms
✓ src/lib/previewImagem.test.ts > validarImagem > recusa arquivo maior que 5 MB 1ms
✓ src/lib/previewImagem.test.ts > validarImagem > aceita exatamente 5 MB 0ms
✓ src/lib/previewImagem.test.ts > criarUrlPreview > devolve a URL quando começa com blob: 1ms
✓ src/lib/previewImagem.test.ts > criarUrlPreview > não cria URL para tipo inválido nem para arquivo grande 1ms
✓ src/lib/previewImagem.test.ts > criarUrlPreview > recusa (e libera) uma URL que não começa com blob: 1ms
✓ src/lib/previewImagem.test.ts > revogarUrlPreview > revoga URLs blob: 0ms
✓ src/lib/previewImagem.test.ts > revogarUrlPreview > ignora null, vazio e URLs que não são blob: 0ms
✓ src/pages/DoarEquipamento.test.tsx > DoarEquipamento - pré-visualização das fotos > mostra a miniatura com URL blob: criada uma única vez por arquivo 70ms
✓ src/pages/DoarEquipamento.test.tsx > DoarEquipamento - pré-visualização das fotos > recusa tipo não permitido com mensagem e sem criar URL 14ms
✓ src/pages/DoarEquipamento.test.tsx > DoarEquipamento - pré-visualização das fotos > revoga a URL ao remover a foto e as restantes ao desmontar 19ms
Test Files  2 passed (2)
Tests  18 passed (18)
Duration  2.51s (transform 163ms, setup 406ms, import 1.04s, tests 116ms, environment 1.83s)
```

## Saídas
**npm test (projeto inteiro)**
```
Test Files  9 passed (9)
Tests  63 passed (63)
Duration  5.71s (transform 1.11s, setup 3.30s, import 6.29s, tests 844ms, environment 17.39s)
```
**npm run lint (arquivos alterados: previewImagem.ts, previewImagem.test.ts, DoarEquipamento.tsx, DoarEquipamento.test.tsx)**
```
(sem saída: 0 erros e 0 avisos nos 4 arquivos)
```
**npm run build**
```
dist/index.html                               1.85 kB │ gzip:   0.86 kB
✓ built in 3.06s
+ FullyQualifiedErrorId : NativeCommandError
```
Saídas completas em `evidencias/codeql/`.

## Depois do merge
O CodeQL roda de novo na `main`. Se o alerta continuar aberto, **não dispensar sem análise** (veja o motivo provável na resposta do PR).
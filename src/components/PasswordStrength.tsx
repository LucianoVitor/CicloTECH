import { Check, X } from "lucide-react";
import { forcaDaSenha, REGRAS_SENHA } from "@/lib/passwordPolicy";

const COR_NIVEL = {
  vazia: "bg-border",
  fraca: "bg-destructive",
  media: "bg-yellow-500",
  forte: "bg-emerald-500",
} as const;

/** Barra de força + lista das regras da política de senha, atualizada a cada tecla. */
export function PasswordStrength({ senha }: { senha: string }) {
  const { pontos, nivel, rotulo } = forcaDaSenha(senha);
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" role="meter" aria-label="Força da senha" aria-valuemin={0} aria-valuemax={REGRAS_SENHA.length} aria-valuenow={pontos}>
          {REGRAS_SENHA.map((r, i) => (
            <span key={r.id} className={`h-1.5 flex-1 transition-colors ${i < pontos ? COR_NIVEL[nivel] : "bg-border"}`} />
          ))}
        </div>
        <span className="w-14 text-right text-[10px] font-data uppercase tracking-wider text-foreground/80">
          {rotulo}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {REGRAS_SENHA.map((r) => {
          const ok = r.teste(senha);
          return (
            <li key={r.id} className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-emerald-400" : "text-foreground/60"}`}>
              {ok ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
              <span>{r.rotulo}</span>
              <span className="sr-only">{ok ? "(cumprida)" : "(pendente)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
